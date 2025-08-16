import { Tool } from 'langchain/tools';
import { ChatPromptTemplate } from '@langchain/core/prompts';

class DocumentSearchTool extends Tool {
  constructor(getVectorStore, llm, conversationHistoryRef) {
    super();
    this.name = 'document_search';
    this.description = `Answer questions about the currently uploaded financial document.\nAlways supply the raw user question as input. Uses semantic retrieval over the document.`;
    this.getVectorStore = getVectorStore;
    this.llm = llm;
    this.conversationHistoryRef = conversationHistoryRef;
  }

  async _call(query) {
    try {
      const vectorStore = this.getVectorStore();
      if (!vectorStore) return 'Error: No document loaded. Upload a PDF first.';

      const relevant = await vectorStore.similaritySearch(query, 4);
      const context = relevant.map((c, i) => `Source ${i + 1}:\n${c.pageContent}`).join('\n\n');
      const convo = this.conversationHistoryRef.slice(-3).map(h => `Q: ${h.query}\nA: ${h.answer}`).join('\n');

      const prompt = ChatPromptTemplate.fromTemplate(
`You are a strict grounded QA assistant.
ONLY answer using the provided context.
If the answer is not contained, reply exactly: "I cannot find this information in the provided document."

{conversationSection}Context:
{context}

Question: {question}

Answer:`);

      const filled = await prompt.format({
        context,
        question: query,
        conversationSection: convo ? `Previous conversation:\n${convo}\n\n` : ''
      });

      const aiMsg = await this.llm.invoke(filled);
      const answer = normalizeAiContent(aiMsg).trim();

      this.conversationHistoryRef.push({ query, answer });
      if (this.conversationHistoryRef.length > 10) {
        this.conversationHistoryRef.splice(0, this.conversationHistoryRef.length - 10);
      }

      const sourcesSection = relevant.map((c, i) => {
        const preview = c.pageContent.slice(0, 200).replace(/\s+/g, ' ').trim();
        return `Source ${i + 1} preview: ${preview}${c.pageContent.length > 200 ? '...' : ''}`;
      }).join('\n');

      return `${answer}\n\nSOURCES:\n${sourcesSection}`;
    } catch (e) {
      return `Error: ${e.message || String(e)}`;
    }
  }
}

function normalizeAiContent(aiMsg) {
  if (!aiMsg) return '';
  if (typeof aiMsg === 'string') return aiMsg;
  const c = aiMsg.content;
  if (Array.isArray(c)) return c.map(p => (typeof p === 'string' ? p : (p.text || p.content || ''))).join('');
  if (typeof c === 'string') return c;
  return aiMsg.text || '';
}

export { DocumentSearchTool };
