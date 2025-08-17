import { initializeAgentExecutorWithOptions } from 'langchain/agents';
import { CurrencyConverterTool, DocumentSearchTool } from '../tools/index.js';

/**
 * Creates a Finance Document Assistant agent that can use multiple tools
 * to answer user queries about financial documents and perform calculations
 * 
 * @param {Object} llm - Language model instance to use for reasoning
 * @param {Function} getVectorStore - Function that returns the current vectorStore
 * @param {Array} conversationHistoryRef - Reference to conversation history array
 * @returns {Object} The agent executor instance
 */
export async function createFinanceAgent(llm, getVectorStore, conversationHistoryRef) {
  try {
    // Initialize our tools
    const tools = [
      new DocumentSearchTool(getVectorStore, llm, conversationHistoryRef),
      new CurrencyConverterTool()
    ];

    // Create the agent using LangChain's agent framework
    const executor = await initializeAgentExecutorWithOptions(
      tools, // DocumentSearchTool + CurrencyConverterTool
      llm,
      {
        agentType: "chat-zero-shot-react-description",
        verbose: true, // Shows thought process
        maxIterations: 5,
        returnIntermediateSteps: true
      }
    );

    return executor;
  } catch (error) {
    console.error("[Agent Creation Error]", error);
    throw new Error(`Failed to create agent: ${error.message}`);
  }
}
