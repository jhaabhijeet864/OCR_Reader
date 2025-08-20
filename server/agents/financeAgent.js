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
      // Order matters: put document search first to bias selection
      new DocumentSearchTool(getVectorStore, llm, conversationHistoryRef),
      new CurrencyConverterTool()
    ];

    // Create the agent using LangChain's agent framework
    const executor = await initializeAgentExecutorWithOptions(
      tools,
      llm,
      {
        agentType: "chat-zero-shot-react-description",
        verbose: true,
        maxIterations: 5,
        returnIntermediateSteps: true,
        agentArgs: {
          // Strong steering message for Gemini -> ReAct tool usage
       systemMessage: `You are a financial document analysis assistant.
Tool usage policy:
1. For ANY question about the document contents (figures, line items, taxes, totals, descriptions) you MUST FIRST call: document_search with the EXACT raw user question.
2. If the user asks to convert, understand INR, rupees, ₹, or says they can't understand USD, you MUST call: currency_converter.
  - Pass either the explicit numeric amount(s) or the raw phrase containing amounts so the tool can extract multiple values.
  - NEVER claim you lack conversion capability; you DO have it.
3. After tool calls, synthesize a concise final answer. Include converted values when requested (both original USD and INR).
4. If document_search returns no relevant context, reply exactly: "I cannot find this information in the provided document." (still perform conversion if that part was requested and amounts are explicit).
5. Do NOT hallucinate missing numbers. Only report what appears.
6. Never ask for re-upload unless the system indicates no document loaded.
Return precise, well‑structured answers.`
        }
      }
    );

    return executor;
  } catch (error) {
    console.error("[Agent Creation Error]", error);
    throw new Error(`Failed to create agent: ${error.message}`);
  }
}
