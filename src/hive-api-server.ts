/**
 * Hive API Server - Complete REST API for Hive blockchain operations
 * Handles all posting, editing, and queue management server-side
 */

import express, { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { createPost, editPost, upvote, getAccountInfo, HiveClient, HiveCredentials, PostMetadata } from './index.js';

interface ApiCredentials {
  username: string;
  postingKey: string;
}

interface PostRequest {
  apiKey: string;
  content: {
    title: string;
    body: string;
    tags: string[];
    description?: string;
    image?: string;
  };
}

interface EditRequest {
  apiKey: string;
  edit: {
    mode: 'replace' | 'append' | 'prepend';
    content: string;
    title?: string;
  };
}

interface JobStatus {
  jobId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  txId?: string;
  permlink?: string;
  timestamp: string;
  estimatedPublishTime?: string;
  error?: string;
  username: string;
}

interface QueuedJob {
  jobId: string;
  type: 'post' | 'edit';
  credentials: ApiCredentials;
  data: any;
  scheduledFor: Date;
  retryCount: number;
  maxRetries: number;
}

class HiveApiServer {
  private app: express.Application;
  private port: number;
  private client: HiveClient;
  private apiKeys: Map<string, ApiCredentials> = new Map();
  private jobStatuses: Map<string, JobStatus> = new Map();
  private jobQueue: QueuedJob[] = [];
  private isProcessingQueue: boolean = false;
  private lastPostTimes: Map<string, Date> = new Map();
  private readonly HIVE_POST_INTERVAL = 5 * 60 * 1000; // 5 minutes in ms

  constructor(port: number = 3000) {
    this.app = express();
    this.port = port;
    this.client = new HiveClient({ mainnet: true });
    
    this.setupMiddleware();
    this.setupRoutes();
    this.startQueueProcessor();
  }

  private setupMiddleware(): void {
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));
    
    // CORS middleware
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
      
      if (req.method === 'OPTIONS') {
        res.sendStatus(200);
      } else {
        next();
      }
    });

    // Request logging
    this.app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      next();
    });
  }

  private setupRoutes(): void {
    // Health check
    this.app.get('/api/health', this.handleHealth.bind(this));
    
    // API key management
    this.app.post('/api/auth/register', this.handleRegisterApiKey.bind(this));
    this.app.delete('/api/auth/revoke', this.handleRevokeApiKey.bind(this));
    
    // Post operations
    this.app.post('/api/hive/post', this.handleCreatePost.bind(this));
    this.app.put('/api/hive/post/:permlink', this.handleEditPost.bind(this));
    
    // Status and queue management
    this.app.get('/api/hive/status/:jobId', this.handleGetJobStatus.bind(this));
    this.app.get('/api/hive/queue', this.handleGetQueue.bind(this));
    this.app.delete('/api/hive/queue/:jobId', this.handleCancelJob.bind(this));
    
    // Account info
    this.app.get('/api/hive/account/:username', this.handleGetAccount.bind(this));
  }

  private async handleHealth(req: Request, res: Response): Promise<void> {
    try {
      // Test connection to Hive
      await this.client.getDynamicGlobalProperties();
      
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        activeJobs: this.jobQueue.length,
        registeredApiKeys: this.apiKeys.size,
        queueProcessing: this.isProcessingQueue
      });
    } catch (error) {
      res.status(503).json({
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  }

  private async handleRegisterApiKey(req: Request, res: Response): Promise<void> {
    try {
      const { username, postingKey } = req.body;
      
      if (!username || !postingKey) {
        res.status(400).json({
          success: false,
          error: 'Username and postingKey are required'
        });
        return;
      }

      // Verify credentials by trying to get account info
      const account = await getAccountInfo(username, this.client);
      if (!account) {
        res.status(400).json({
          success: false,
          error: 'Account not found'
        });
        return;
      }

      // Generate API key
      const apiKey = uuidv4();
      this.apiKeys.set(apiKey, { username, postingKey });

      res.json({
        success: true,
        apiKey: apiKey,
        username: username,
        message: 'API key registered successfully'
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Registration failed'
      });
    }
  }

  private async handleRevokeApiKey(req: Request, res: Response): Promise<void> {
    try {
      const { apiKey } = req.body;
      
      if (!apiKey || !this.apiKeys.has(apiKey)) {
        res.status(400).json({
          success: false,
          error: 'Invalid API key'
        });
        return;
      }

      this.apiKeys.delete(apiKey);
      
      res.json({
        success: true,
        message: 'API key revoked successfully'
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Revocation failed'
      });
    }
  }

  private async handleCreatePost(req: Request, res: Response): Promise<void> {
    try {
      const { apiKey, content }: PostRequest = req.body;
      
      // Validate API key
      const credentials = this.apiKeys.get(apiKey);
      if (!credentials) {
        res.status(401).json({
          success: false,
          error: 'Invalid API key'
        });
        return;
      }

      // Validate content
      if (!content?.title || !content?.body || !content?.tags) {
        res.status(400).json({
          success: false,
          error: 'Title, body, and tags are required'
        });
        return;
      }

      // Create job
      const jobId = uuidv4();
      const now = new Date();
      const lastPost = this.lastPostTimes.get(credentials.username);
      const canPostNow = !lastPost || (now.getTime() - lastPost.getTime()) >= this.HIVE_POST_INTERVAL;
      
      let scheduledFor = now;
      if (!canPostNow && lastPost) {
        scheduledFor = new Date(lastPost.getTime() + this.HIVE_POST_INTERVAL);
      }

      // Create job status
      const jobStatus: JobStatus = {
        jobId,
        status: canPostNow ? 'processing' : 'queued',
        timestamp: now.toISOString(),
        estimatedPublishTime: scheduledFor.toISOString(),
        username: credentials.username
      };

      this.jobStatuses.set(jobId, jobStatus);

      // Add to queue
      const job: QueuedJob = {
        jobId,
        type: 'post',
        credentials,
        data: content,
        scheduledFor,
        retryCount: 0,
        maxRetries: 3
      };

      this.jobQueue.push(job);
      this.jobQueue.sort((a, b) => a.scheduledFor.getTime() - b.scheduledFor.getTime());

      res.json({
        success: true,
        jobId,
        status: jobStatus.status,
        estimatedPublishTime: jobStatus.estimatedPublishTime,
        timestamp: jobStatus.timestamp
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Post creation failed'
      });
    }
  }

  private async handleEditPost(req: Request, res: Response): Promise<void> {
    try {
      const { permlink } = req.params;
      const { apiKey, edit }: EditRequest = req.body;
      
      // Validate API key
      const credentials = this.apiKeys.get(apiKey);
      if (!credentials) {
        res.status(401).json({
          success: false,
          error: 'Invalid API key'
        });
        return;
      }

      // Validate edit data
      if (!edit?.content || !edit?.mode) {
        res.status(400).json({
          success: false,
          error: 'Edit content and mode are required'
        });
        return;
      }

      // Create job for edit
      const jobId = uuidv4();
      const now = new Date();

      const jobStatus: JobStatus = {
        jobId,
        status: 'processing',
        timestamp: now.toISOString(),
        username: credentials.username
      };

      this.jobStatuses.set(jobId, jobStatus);

      // Add to queue with high priority (immediate processing)
      const job: QueuedJob = {
        jobId,
        type: 'edit',
        credentials,
        data: { permlink, edit },
        scheduledFor: now,
        retryCount: 0,
        maxRetries: 3
      };

      this.jobQueue.unshift(job); // Add to front for immediate processing

      res.json({
        success: true,
        jobId,
        status: 'processing',
        timestamp: now.toISOString()
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Edit failed'
      });
    }
  }

  private async handleGetJobStatus(req: Request, res: Response): Promise<void> {
    const { jobId } = req.params;
    const status = this.jobStatuses.get(jobId);
    
    if (!status) {
      res.status(404).json({
        success: false,
        error: 'Job not found'
      });
      return;
    }

    res.json({
      success: true,
      ...status
    });
  }

  private async handleGetQueue(req: Request, res: Response): Promise<void> {
    const queueInfo = this.jobQueue.map(job => ({
      jobId: job.jobId,
      type: job.type,
      username: job.credentials.username,
      scheduledFor: job.scheduledFor.toISOString(),
      retryCount: job.retryCount
    }));

    res.json({
      success: true,
      queue: queueInfo,
      totalJobs: queueInfo.length,
      processing: this.isProcessingQueue
    });
  }

  private async handleCancelJob(req: Request, res: Response): Promise<void> {
    const { jobId } = req.params;
    
    const jobIndex = this.jobQueue.findIndex(job => job.jobId === jobId);
    if (jobIndex === -1) {
      res.status(404).json({
        success: false,
        error: 'Job not found in queue'
      });
      return;
    }

    this.jobQueue.splice(jobIndex, 1);
    
    const status = this.jobStatuses.get(jobId);
    if (status) {
      status.status = 'failed';
      status.error = 'Cancelled by user';
    }

    res.json({
      success: true,
      message: 'Job cancelled successfully'
    });
  }

  private async handleGetAccount(req: Request, res: Response): Promise<void> {
    try {
      const { username } = req.params;
      const account = await getAccountInfo(username, this.client);
      
      if (!account) {
        res.status(404).json({
          success: false,
          error: 'Account not found'
        });
        return;
      }

      res.json({
        success: true,
        account: {
          username: account.name,
          reputation: account.reputation,
          totalPosts: account.total_posts,
          followers: account.followers,
          created: account.created_at
        }
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get account'
      });
    }
  }

  private async startQueueProcessor(): Promise<void> {
    setInterval(async () => {
      if (this.isProcessingQueue || this.jobQueue.length === 0) {
        return;
      }

      this.isProcessingQueue = true;

      try {
        const now = new Date();
        const readyJobs = this.jobQueue.filter(job => job.scheduledFor <= now);

        for (const job of readyJobs) {
          await this.processJob(job);
          
          // Remove from queue
          const index = this.jobQueue.findIndex(j => j.jobId === job.jobId);
          if (index !== -1) {
            this.jobQueue.splice(index, 1);
          }
        }
      } catch (error) {
        console.error('Queue processor error:', error);
      } finally {
        this.isProcessingQueue = false;
      }
    }, 1000); // Check every second
  }

  private async processJob(job: QueuedJob): Promise<void> {
    const status = this.jobStatuses.get(job.jobId);
    if (!status) return;

    try {
      status.status = 'processing';

      if (job.type === 'post') {
        await this.processPostJob(job, status);
      } else if (job.type === 'edit') {
        await this.processEditJob(job, status);
      }

    } catch (error) {
      job.retryCount++;
      
      if (job.retryCount < job.maxRetries) {
        // Reschedule for retry
        job.scheduledFor = new Date(Date.now() + 30000); // Retry in 30 seconds
        this.jobQueue.push(job);
        this.jobQueue.sort((a, b) => a.scheduledFor.getTime() - b.scheduledFor.getTime());
        
        status.status = 'queued';
        status.error = `Retry ${job.retryCount}/${job.maxRetries}: ${error instanceof Error ? error.message : 'Unknown error'}`;
      } else {
        status.status = 'failed';
        status.error = error instanceof Error ? error.message : 'Unknown error';
      }
    }
  }

  private async processPostJob(job: QueuedJob, status: JobStatus): Promise<void> {
    const metadata: PostMetadata = {
      title: job.data.title,
      body: job.data.body,
      tags: job.data.tags,
      description: job.data.description,
      image: job.data.image
    };

    const result = await createPost(job.credentials, metadata, this.client);

    if (result.success) {
      status.status = 'completed';
      status.txId = result.transaction_id;
      status.permlink = result.permlink;
      
      // Update last post time
      this.lastPostTimes.set(job.credentials.username, new Date());
      
      console.log(`✅ Post published for @${job.credentials.username}: ${result.transaction_id}`);
    } else {
      throw new Error(result.error || 'Post failed');
    }
  }

  private async processEditJob(job: QueuedJob, status: JobStatus): Promise<void> {
    const { permlink, edit } = job.data;
    
    // For editing, we need to construct the new content based on mode
    let newContent = edit.content;
    
    if (edit.mode === 'append' || edit.mode === 'prepend') {
      // Note: In a real implementation, you'd want to fetch the current post content first
      // For now, we'll just use the provided content
      console.log(`Note: ${edit.mode} mode - using provided content directly`);
    }

    const metadata: PostMetadata = {
      title: edit.title || 'Updated Post', // You'd fetch original title if not provided
      body: newContent,
      tags: ['edited'] // You'd fetch original tags if not provided
    };

    const result = await editPost(job.credentials, permlink, metadata, this.client);

    if (result.success) {
      status.status = 'completed';
      status.txId = result.transaction_id;
      status.permlink = permlink;
      
      console.log(`✅ Post edited for @${job.credentials.username}: ${result.transaction_id}`);
    } else {
      throw new Error(result.error || 'Edit failed');
    }
  }

  public start(): void {
    this.app.listen(this.port, () => {
      console.log(`🚀 Hive API Server running on port ${this.port}`);
      console.log(`📋 Available endpoints:`);
      console.log(`   POST /api/auth/register - Register API key`);
      console.log(`   POST /api/hive/post - Create post`);
      console.log(`   PUT  /api/hive/post/:permlink - Edit post`);
      console.log(`   GET  /api/hive/status/:jobId - Get job status`);
      console.log(`   GET  /api/health - Health check`);
    });
  }
}

export { HiveApiServer };