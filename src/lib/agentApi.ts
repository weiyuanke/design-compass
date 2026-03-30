// API service for agent communication

export interface AgentMessage {
  kind: "message";
  role: "user" | "assistant";
  parts: Array<{ kind: "text"; text: string }>;
}

export interface SendMessageRequest {
  jsonrpc: "2.0";
  id: string;
  method: "message/send";
  params: {
    message: AgentMessage;
  };
}

export interface SendMessageResponse {
  jsonrpc: "2.0";
  id: string;
  result?: {
    message?: AgentMessage;
    // Add other fields as needed based on actual API response
  };
  error?: {
    code: number;
    message: string;
  };
}

// Agent endpoint configuration
const AGENT_ENDPOINTS: Record<string, string> = {
  "k8s-ops": "http://localhost:8083/api/a2a/kagent/k8s-agent/",
  // Add more agent endpoints here as they become available
};

/**
 * Send a message to a specific agent
 */
export async function sendMessageToAgent(
  agentId: string,
  userMessage: string
): Promise<string> {
  const endpoint = AGENT_ENDPOINTS[agentId];
  
  if (!endpoint) {
    throw new Error(`No endpoint configured for agent: ${agentId}`);
  }

  const requestBody: SendMessageRequest = {
    jsonrpc: "2.0",
    id: Date.now().toString(),
    method: "message/send",
    params: {
      message: {
        kind: "message",
        role: "user",
        parts: [{ kind: "text", text: userMessage }],
      },
    },
  };

  try {
    console.log(`[Agent API] Sending request to ${agentId}:`, requestBody);
    
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    console.log(`[Agent API] Response status:`, response.status, response.statusText);

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data: SendMessageResponse = await response.json();
    console.log(`[Agent API] Response data:`, data);

    if (data.error) {
      throw new Error(`Agent API error: ${data.error.message}`);
    }

    // Try to extract response message text - handle multiple possible formats
    // Format 1: result.artifacts[0].parts[0].text (K8s agent format)
    if (data.result?.artifacts && data.result.artifacts.length > 0) {
      const firstArtifact = data.result.artifacts[0];
      if (firstArtifact?.parts && firstArtifact.parts.length > 0) {
        return firstArtifact.parts[0].text;
      }
    }

    // Format 2: result.message.parts[0].text (standard format)
    if (data.result?.message?.parts && data.result.message.parts.length > 0) {
      return data.result.message.parts[0].text;
    }

    // Format 3: result.parts[0].text (direct format)
    if (data.result?.parts && data.result.parts.length > 0) {
      return data.result.parts[0].text;
    }

    // Format 4: result.text (simple format)
    if (data.result?.text) {
      return data.result.text;
    }

    // If we reach here, log the full response for debugging
    console.error(`[Agent API] Unexpected response format:`, JSON.stringify(data, null, 2));
    throw new Error("Invalid response format from agent API");
  } catch (error) {
    console.error(`[Agent API] Error calling agent ${agentId}:`, error);
    throw error;
  }
}

/**
 * Check if an agent has a real API endpoint configured
 */
export function hasRealAgentEndpoint(agentId: string): boolean {
  return !!AGENT_ENDPOINTS[agentId];
}
