#!/bin/bash

# Hive Posting Bot - Quick Start Script
# This script helps you set up and run the Hive posting bot

echo "🤖 Hive Posting Bot Setup"
echo "========================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if credentials are set
if [ -z "$HIVE_USERNAME" ] || [ -z "$HIVE_POSTING_KEY" ]; then
    echo "⚠️ Environment variables not set."
    echo ""
    echo "Please set your Hive credentials:"
    echo "export HIVE_USERNAME=\"your-hive-username\""
    echo "export HIVE_POSTING_KEY=\"your-posting-private-key\""
    echo ""
    echo "Then run this script again."
    exit 1
fi

echo "✅ Credentials found for @$HIVE_USERNAME"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Compile TypeScript
echo "🔨 Compiling TypeScript..."
npx tsc

# Check if compilation was successful
if [ $? -eq 0 ]; then
    echo "✅ Compilation successful"
else
    echo "❌ Compilation failed"
    exit 1
fi

# Run the bot
echo "🚀 Starting Hive Posting Bot..."
echo "Press Ctrl+C to stop the bot"
echo ""

node dist/examples/simple-bot-example.js