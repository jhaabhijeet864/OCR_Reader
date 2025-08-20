import { useState } from "react";
import { Send, Bot, User, Loader2, Brain, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQueryAgent, useSearchDocument, handleApiError } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useRef, useEffect } from "react";

interface Message {
  id: string;
  type: "user" | "ai";
  content: string;          // Clean answer (no reasoning noise)
  timestamp: Date;
  sources?: { id: number; preview: string }[];
  reasoning?: string[];     // Extracted reasoning / tool steps
  raw?: string;             // Original raw text (optional)
}

const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "ai",
      content: "Hello! I'm your financial document assistant. Upload your financial documents and ask me any questions about them. I can help you analyze reports, extract key metrics, and provide insights.",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const { toast } = useToast();
  
  // Use both API methods (standard search and agent)
  const { mutate: searchDocument, isPending: isSearching } = useSearchDocument();
  const { mutate: queryAgent, isPending: isAgentQuerying } = useQueryAgent();
  
  const isLoading = isSearching || isAgentQuerying;

  function extractAnswerAndReasoning(raw: string): { answer: string; reasoning: string[] } {
    if (!raw) return { answer: '', reasoning: [] };

    const lines = raw.split(/\r?\n/);
    const reasoning: string[] = [];
    const answerLines: string[] = [];
    let inCode = false;
    let codeBuffer: string[] = [];

    const flushCode = () => {
      if (codeBuffer.length) {
        reasoning.push(codeBuffer.join('\n'));
        codeBuffer = [];
      }
    };

    for (let rawLine of lines) {
      const line = rawLine.trimEnd();
      const fenceStart = /^```/.test(line);
      if (fenceStart) {
        if (!inCode) {
          // starting code fence
          inCode = true;
          codeBuffer.push(line);
          continue;
        } else {
          // ending code fence
            codeBuffer.push(line);
          flushCode();
          inCode = false;
          continue;
        }
      }
      if (inCode) {
        codeBuffer.push(line);
        continue;
      }

      // Classify reasoning indicators
      const isQuestionLine = /^Question:/i.test(line);
      const isActionJson = /"action"\s*:/i.test(line) || /"action_input"\s*:/i.test(line);
      const isToolMarker = /^(Thought|Action|Observation|Tool|Intermediate|Step)[:\s]/i.test(line);
      if (!line.trim()) continue;
      if (isQuestionLine || isActionJson || isToolMarker) {
        reasoning.push(line.trim());
        continue;
      }
      answerLines.push(line.trim());
    }
    flushCode();

    // Remove duplicated 'Final Answer:' prefix for cleanliness
    let answer = answerLines.join('\n').trim();
    const finalIdx = answer.toLowerCase().indexOf('final answer:');
    if (finalIdx !== -1) {
      // Keep only segment after the last 'Final Answer:' occurrence
      const parts = answer.split(/final answer:/i);
      answer = parts[parts.length - 1].trim();
    }
    // Strip any trailing "SOURCES:" section accidentally left
    answer = answer.replace(/\n+SOURCES:\n[\s\S]*$/i, '').trim();
    return { answer, reasoning };
  }

  const handleSendMessage = () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    // Try the agent first (more capable)
    queryAgent(inputValue, {
      onSuccess: (data: any) => {
        const { answer, agentSteps } = data;
        // Derive reasoning array from agentSteps if present
        const reasoning: string[] = Array.isArray(agentSteps)
          ? agentSteps.map((s: any, i: number) => `Step ${i + 1}: tool=${s.action} input=${JSON.stringify(s.input)} -> ${s.output}`)
          : [];
        const parsed = extractAnswerAndReasoning(answer || '');
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: "ai",
            content: parsed.answer,
          timestamp: new Date(),
          reasoning: reasoning.length ? reasoning : (parsed.reasoning.length ? parsed.reasoning : undefined),
          raw: answer
        };
        setMessages((prev) => [...prev, aiMessage]);
      },
      onError: (error) => {
        // Fall back to regular search if agent fails
        searchDocument(inputValue, {
          onSuccess: (data) => {
            const aiMessage: Message = {
              id: (Date.now() + 1).toString(),
              type: "ai",
              content: data.answer,
              timestamp: new Date(),
              sources: data.sources,
              raw: data.answer
            };
            setMessages((prev) => [...prev, aiMessage]);
          },
          onError: (searchError) => {
            // Both methods failed
            const errorMessage: Message = {
              id: (Date.now() + 1).toString(),
              type: "ai",
              content: `I'm having trouble processing your request. ${handleApiError(error)}`,
              timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMessage]);
            
            toast({
              title: "Error",
              description: "Failed to get a response. Please try uploading a document first.",
              variant: "destructive",
            });
          }
        });
      }
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const [expandedReasoning, setExpandedReasoning] = useState<Record<string, boolean>>({});
  const toggleReasoning = (id: string) => {
    setExpandedReasoning(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Reference for auto-scrolling to bottom
  const messageEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to newest messages
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  return (
    <Card className={`p-6 shadow-elegant h-[500px] flex flex-col transition-all duration-300 ${isLoading ? 'thinking-animation' : 'border'}`}>
      <h3 className="text-lg font-semibold mb-4 text-foreground">AI Assistant</h3>
      
      <ScrollArea className="flex-1 pr-4 custom-scrollbar">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start space-x-3 ${
                message.type === "user" ? "flex-row-reverse space-x-reverse" : ""
              }`}
            >
              <div
                className={`p-2 rounded-full ${
                  message.type === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground"
                }`}
              >
                {message.type === "user" ? (
                  <User className="h-4 w-4" />
                ) : (
                  <Bot className="h-4 w-4" />
                )}
              </div>
              <div className={`max-w-[80%] space-y-2`}> 
                <div
                  className={`p-3 rounded-lg ${
                    message.type === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                {message.sources && message.sources.length > 0 && (
                  <div className="mt-2 border-t border-border pt-2">
                    <p className="text-xs font-medium">Sources:</p>
                    <ul className="text-xs list-disc list-inside">
                      {message.sources.map((source) => (
                        <li key={source.id} className="truncate">
                          {source.preview}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                  <p className={`text-xs mt-1 ${message.type === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground/70'}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {message.type === 'ai' && message.reasoning && message.reasoning.length > 0 && (
                  <div className="rounded-md border border-border/60 bg-secondary/30 backdrop-blur-sm">
                    <button
                      type="button"
                      onClick={() => toggleReasoning(message.id)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-foreground/80 hover:text-foreground transition-colors"
                    >
                      {expandedReasoning[message.id] ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                      <Brain className="h-3 w-3 text-accent" />
                      <span>Model reasoning ({message.reasoning.length} step{message.reasoning.length>1?'s':''})</span>
                      <span className="ml-auto text-[10px] uppercase tracking-wide text-muted-foreground/70">debug</span>
                    </button>
                    {expandedReasoning[message.id] && (
                      <div className="px-3 pb-3 space-y-1">
                        {message.reasoning.map((r, i) => (
                          <div key={i} className="text-[11px] font-mono leading-snug text-muted-foreground/90 border-l border-border/40 pl-2">
                            {r}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start space-x-3">
              <div className="p-2 rounded-full bg-secondary text-secondary-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
              <div className="max-w-[80%] p-3 rounded-lg bg-muted text-muted-foreground">
                <p className="text-sm">Thinking...</p>
              </div>
            </div>
          )}
          <div ref={messageEndRef} />
        </div>
      </ScrollArea>

      <div className="flex items-center space-x-2 mt-4 border-t pt-4 border-border/40">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask about your financial documents..."
          className="flex-1"
          disabled={isLoading}
        />
        <Button 
          onClick={handleSendMessage} 
          size="sm"
          disabled={isLoading || !inputValue.trim()}
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>
    </Card>
  );
};

export default ChatInterface;