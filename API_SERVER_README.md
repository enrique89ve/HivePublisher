# Hive API Server - REST API for Hive Blockchain Publishing

A complete REST API server for automated Hive blockchain operations. Handles all posting, editing, and credential management server-side with queue management and automatic retry logic.

## Features

- **Complete Server-Side Management**: All credentials and operations handled securely on server
- **REST API Interface**: Simple HTTP endpoints for easy integration
- **Automatic Queue Management**: Respects Hive's 5-minute posting limits automatically
- **Retry Logic**: Automatic retries on network failures
- **Job Tracking**: Track operation status with unique job IDs
- **Multiple Users**: Support for multiple API keys and users
- **Edit Operations**: Replace, append, or prepend content to existing posts

## Quick Start

### 1. Start the Server

```bash
# Install dependencies
npm install

# Compile TypeScript
npx tsc

# Start server
node dist/examples/api-server-runner.js
```

Server runs on port 3000 by default (set PORT environment variable to change).

### 2. Register API Key

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "your-hive-username",
    "postingKey": "your-posting-private-key"
  }'
```

Response:
```json
{
  "success": true,
  "apiKey": "uuid-generated-key",
  "username": "your-hive-username",
  "message": "API key registered successfully"
}
```

### 3. Create Posts

```bash
curl -X POST http://localhost:3000/api/hive/post \
  -H "Content-Type: application/json" \
  -d '{
    "apiKey": "your-api-key",
    "content": {
      "title": "My Post Title",
      "body": "Post content here...",
      "tags": ["tag1", "tag2"],
      "description": "Optional description",
      "image": "https://example.com/image.jpg"
    }
  }'
```

Response:
```json
{
  "success": true,
  "jobId": "job-uuid",
  "status": "queued",
  "estimatedPublishTime": "2024-01-01T10:05:00Z",
  "timestamp": "2024-01-01T10:00:00Z"
}
```

## API Endpoints

### Authentication

#### Register API Key
```
POST /api/auth/register
```

Request:
```json
{
  "username": "hive-username",
  "postingKey": "posting-private-key"
}
```

#### Revoke API Key
```
DELETE /api/auth/revoke
```

Request:
```json
{
  "apiKey": "api-key-to-revoke"
}
```

### Post Operations

#### Create Post
```
POST /api/hive/post
```

Request:
```json
{
  "apiKey": "your-api-key",
  "content": {
    "title": "Post Title",
    "body": "Post content",
    "tags": ["tag1", "tag2"],
    "description": "Optional description",
    "image": "Optional image URL"
  }
}
```

#### Edit Post
```
PUT /api/hive/post/:permlink
```

Request:
```json
{
  "apiKey": "your-api-key",
  "edit": {
    "mode": "replace|append|prepend",
    "content": "New or additional content",
    "title": "Optional new title"
  }
}
```

Edit Modes:
- **replace**: Replace entire post content
- **append**: Add content to the end
- **prepend**: Add content to the beginning

### Status and Queue

#### Get Job Status
```
GET /api/hive/status/:jobId
```

Response:
```json
{
  "success": true,
  "jobId": "job-uuid",
  "status": "completed",
  "txId": "blockchain-transaction-id",
  "permlink": "post-permlink",
  "timestamp": "2024-01-01T10:00:00Z",
  "username": "hive-username"
}
```

#### Get Queue Status
```
GET /api/hive/queue
```

Response:
```json
{
  "success": true,
  "queue": [
    {
      "jobId": "job-uuid",
      "type": "post",
      "username": "user1",
      "scheduledFor": "2024-01-01T10:05:00Z",
      "retryCount": 0
    }
  ],
  "totalJobs": 1,
  "processing": false
}
```

#### Cancel Job
```
DELETE /api/hive/queue/:jobId
```

### Utility

#### Health Check
```
GET /api/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T10:00:00Z",
  "version": "1.0.0",
  "activeJobs": 2,
  "registeredApiKeys": 3,
  "queueProcessing": false
}
```

#### Get Account Info
```
GET /api/hive/account/:username
```

Response:
```json
{
  "success": true,
  "account": {
    "username": "hive-user",
    "reputation": "79.65",
    "totalPosts": "1250",
    "followers": "500",
    "created": "2021-01-01T00:00:00Z"
  }
}
```

## Integration Examples

### JavaScript/Node.js

```javascript
class HiveApiClient {
  constructor(baseUrl, apiKey) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  async createPost(title, body, tags) {
    const response = await fetch(`${this.baseUrl}/api/hive/post`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey: this.apiKey,
        content: { title, body, tags }
      })
    });
    
    return await response.json();
  }

  async editPost(permlink, content, mode = 'replace') {
    const response = await fetch(`${this.baseUrl}/api/hive/post/${permlink}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey: this.apiKey,
        edit: { content, mode }
      })
    });
    
    return await response.json();
  }

  async getJobStatus(jobId) {
    const response = await fetch(`${this.baseUrl}/api/hive/status/${jobId}`);
    return await response.json();
  }
}

// Usage
const client = new HiveApiClient('http://localhost:3000', 'your-api-key');

const result = await client.createPost(
  'My Blog Post',
  'This is the content of my blog post.',
  ['blog', 'hive']
);

console.log('Job ID:', result.jobId);

// Check status
const status = await client.getJobStatus(result.jobId);
console.log('Status:', status.status);
```

### Python

```python
import requests
import json

class HiveApiClient:
    def __init__(self, base_url, api_key):
        self.base_url = base_url
        self.api_key = api_key

    def create_post(self, title, body, tags):
        response = requests.post(f'{self.base_url}/api/hive/post', 
            json={
                'apiKey': self.api_key,
                'content': {
                    'title': title,
                    'body': body,
                    'tags': tags
                }
            })
        return response.json()

    def edit_post(self, permlink, content, mode='replace'):
        response = requests.put(f'{self.base_url}/api/hive/post/{permlink}',
            json={
                'apiKey': self.api_key,
                'edit': {
                    'content': content,
                    'mode': mode
                }
            })
        return response.json()

    def get_job_status(self, job_id):
        response = requests.get(f'{self.base_url}/api/hive/status/{job_id}')
        return response.json()

# Usage
client = HiveApiClient('http://localhost:3000', 'your-api-key')

result = client.create_post(
    'My Python Post',
    'This post was created using Python.',
    ['python', 'automation']
)

print(f"Job ID: {result['jobId']}")
```

### PHP

```php
class HiveApiClient {
    private $baseUrl;
    private $apiKey;
    
    public function __construct($baseUrl, $apiKey) {
        $this->baseUrl = $baseUrl;
        $this->apiKey = $apiKey;
    }
    
    public function createPost($title, $body, $tags) {
        $data = [
            'apiKey' => $this->apiKey,
            'content' => [
                'title' => $title,
                'body' => $body,
                'tags' => $tags
            ]
        ];
        
        return $this->makeRequest('POST', '/api/hive/post', $data);
    }
    
    public function editPost($permlink, $content, $mode = 'replace') {
        $data = [
            'apiKey' => $this->apiKey,
            'edit' => [
                'content' => $content,
                'mode' => $mode
            ]
        ];
        
        return $this->makeRequest('PUT', "/api/hive/post/$permlink", $data);
    }
    
    private function makeRequest($method, $endpoint, $data = null) {
        $curl = curl_init();
        
        curl_setopt_array($curl, [
            CURLOPT_URL => $this->baseUrl . $endpoint,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_CUSTOMREQUEST => $method,
            CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
            CURLOPT_POSTFIELDS => $data ? json_encode($data) : null
        ]);
        
        $response = curl_exec($curl);
        curl_close($curl);
        
        return json_decode($response, true);
    }
}

// Usage
$client = new HiveApiClient('http://localhost:3000', 'your-api-key');
$result = $client->createPost('PHP Post', 'Content from PHP', ['php', 'web']);
echo "Job ID: " . $result['jobId'];
```

## Advanced Configuration

### Environment Variables

```bash
PORT=3000                    # Server port
NODE_ENV=production         # Environment mode
HIVE_NETWORK=mainnet        # mainnet or testnet
```

### Custom Hive Client

The server can be configured with custom Hive client settings by modifying the constructor in `hive-api-server.ts`:

```typescript
this.client = new HiveClient({
  apiNode: 'https://api.hive.blog',
  fallbackNodes: ['https://anyx.io', 'https://api.openhive.network'],
  timeout: 15000,
  maxRetries: 5,
  mainnet: true
});
```

## Production Deployment

### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx tsc

EXPOSE 3000
CMD ["node", "dist/examples/api-server-runner.js"]
```

### PM2 Process Manager

```json
{
  "name": "hive-api-server",
  "script": "dist/examples/api-server-runner.js",
  "instances": 1,
  "env": {
    "NODE_ENV": "production",
    "PORT": 3000
  }
}
```

### Nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Security Considerations

### API Key Management
- Store API keys securely in environment variables or encrypted database
- Implement API key rotation
- Rate limiting per API key
- Monitor API key usage

### Network Security
- Use HTTPS in production
- Implement CORS properly for web applications
- Consider API versioning for backward compatibility

### Credential Security
- Private keys are stored server-side only
- No credentials transmitted in requests
- Consider encrypting stored private keys
- Implement secure key backup

## Monitoring and Logging

### Health Monitoring
```bash
# Check server health
curl http://localhost:3000/api/health

# Monitor queue status
curl http://localhost:3000/api/hive/queue
```

### Log Analysis
The server logs all operations with timestamps for debugging and monitoring.

## Troubleshooting

### Common Issues

**Server won't start:**
- Check port availability
- Verify dependencies are installed
- Check TypeScript compilation

**Posts fail to publish:**
- Verify account credentials
- Check Hive network connectivity
- Monitor rate limiting (5-minute intervals)

**High queue backlog:**
- Check Hive network status
- Verify node connectivity
- Consider scaling with multiple instances

### Debug Mode

Set environment variable for detailed logging:
```bash
DEBUG=hive-api:* node dist/examples/api-server-runner.js
```

## License

MIT License - see LICENSE file for details.