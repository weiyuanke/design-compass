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
    contextId?: string; // Optional: maintain conversation context
  };
}

export interface SendMessageResponse {
  jsonrpc: "2.0";
  id: string;
  result?: {
    // Format 1: K8s agent format with artifacts
    artifacts?: Array<{
      artifactId: string;
      parts: Array<{ kind: "text"; text: string }>;
    }>;
    // Context ID for maintaining conversation
    contextId?: string;
    // Message history (optional)
    history?: Array<{
      contextId: string;
      kind: string;
      messageId: string;
      parts: Array<{ kind: "text"; text: string }>;
      role: "user" | "assistant";
      taskId?: string;
    }>;
    // Format 2: Standard format with message
    message?: AgentMessage;
    // Format 3: Direct format with parts
    parts?: Array<{ kind: "text"; text: string }>;
    // Format 4: Simple format with text
    text?: string;
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
 * Send a message to a specific agent with optional context ID
 * @param agentId - The ID of the agent to send message to
 * @param userMessage - The message content
 * @param contextId - Optional context ID to maintain conversation continuity
 * @returns Promise with the response text and the new context ID
 */
export async function sendMessageToAgent(
  agentId: string,
  userMessage: string,
  contextId?: string
): Promise<{ text: string; contextId?: string }> {
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
      // Include contextId to maintain conversation continuity
      ...(contextId && { contextId }),
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

    // Extract response text - handle multiple possible formats
    let responseText = "";
    // Format 1: result.artifacts[0].parts[0].text (K8s agent format)
    if (data.result?.artifacts && data.result.artifacts.length > 0) {
      const firstArtifact = data.result.artifacts[0];
      if (firstArtifact?.parts && firstArtifact.parts.length > 0) {
        responseText = firstArtifact.parts[0].text;
      }
    }

    // Format 2: result.message.parts[0].text (standard format)
    if (!responseText && data.result?.message?.parts && data.result.message.parts.length > 0) {
      responseText = data.result.message.parts[0].text;
    }

    // Format 3: result.parts[0].text (direct format)
    if (!responseText && data.result?.parts && data.result.parts.length > 0) {
      responseText = data.result.parts[0].text;
    }

    // Format 4: result.text (simple format)
    if (!responseText && data.result?.text) {
      responseText = data.result.text;
    }

    // If we reach here, log the full response for debugging
    if (!responseText) {
      console.error(`[Agent API] Unexpected response format:`, JSON.stringify(data, null, 2));
      throw new Error("Invalid response format from agent API");
    }

    // Return both the response text and the context ID from the response
    return {
      text: responseText,
      contextId: data.result?.contextId,
    };
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
