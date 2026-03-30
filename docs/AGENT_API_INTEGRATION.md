# Agent API Integration Guide

This document explains how to integrate real agent APIs into the Design Compass platform.

## Overview

The chat page now supports real API integration for platform agents. Currently, the "Kubernetes 运维专家" (k8s-ops) agent is connected to a live API endpoint.

## Architecture

### Files Changed
- `src/lib/agentApi.ts` - New API service layer for agent communication
- `src/pages/ChatPage.tsx` - Updated to use real API when available
- `src/lib/agentApi.test.ts` - Unit tests for API service

### How It Works

1. **Agent Endpoint Configuration**: The `AGENT_ENDPOINTS` object in `agentApi.ts` maps agent IDs to their API endpoints.

2. **Message Flow**:
   - User sends a message in the chat
   - ChatPage checks if the agent has a real API endpoint
   - If yes: calls `sendMessageToAgent()` with the user message
   - If no: falls back to simulated response
   - Response is displayed in the chat interface

3. **Loading State**: Shows a "正在思考..." indicator while waiting for API response

## Adding New Agent Endpoints

To integrate a new agent API:

### Step 1: Add the Endpoint Configuration

Edit `src/lib/agentApi.ts`:

```typescript
const AGENT_ENDPOINTS: Record<string, string> = {
  "k8s-ops": "http://localhost:8083/api/a2a/kagent/k8s-agent/",
  "your-agent-id": "http://your-agent-endpoint/path/",
  // Add more agents here
};
```

### Step 2: Test the Integration

```bash
# Test with curl
curl -i -X POST http://your-agent-endpoint/path/ \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": "1",
    "method": "message/send",
    "params": {
      "message": {
        "kind": "message",
        "role": "user",
        "parts": [{"kind": "text", "text": "Your test message"}]
      }
    }
  }'
```

### Step 3: Verify in Chat Interface

1. Navigate to `/chat`
2. Select your agent from the dropdown
3. Send a test message
4. Verify the response appears correctly

## API Request Format

The chat page sends JSON-RPC 2.0 formatted requests:

```json
{
  "jsonrpc": "2.0",
  "id": "unique-request-id",
  "method": "message/send",
  "params": {
    "message": {
      "kind": "message",
      "role": "user",
      "parts": [
        {
          "kind": "text",
          "text": "user message content"
        }
      ]
    }
  }
}
```

## Expected API Response Format

The agent API should respond in this format:

```json
{
  "jsonrpc": "2.0",
  "id": "same-as-request",
  "result": {
    "message": {
      "kind": "message",
      "role": "assistant",
      "parts": [
        {
          "kind": "text",
          "text": "agent response text"
        }
      ]
    }
  }
}
```

### Error Response Format

```json
{
  "jsonrpc": "2.0",
  "id": "same-as-request",
  "error": {
    "code": 123,
    "message": "Error description"
  }
}
```

## Current Integration

### Kubernetes 运维专家 (k8s-ops)
- **Endpoint**: `http://localhost:8083/api/a2a/kagent/k8s-agent/`
- **Status**: ✅ Connected and tested
- **Quick Commands**:
  - 诊断集群问题
  - 查看 Pod 状态
  - 生成运维报告
  - 节点资源分析

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure your agent server allows requests from your frontend domain
2. **Timeout**: If the agent takes too long to respond, consider increasing timeout in fetch
3. **Wrong Response Format**: The API must return the expected JSON-RPC format

### Debug Mode

To debug API calls:
1. Open browser DevTools → Network tab
2. Filter by XHR/Fetch requests
3. Look for requests to your agent endpoints
4. Check request payload and response

## Future Enhancements

- Add streaming response support for long-running tasks
- Implement message history/context management
- Add retry logic for failed requests
- Support for different authentication methods
- Add rate limiting to prevent API abuse
