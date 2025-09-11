import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Send, 
  Sparkles, 
  User, 
  Loader2,
  MessageSquare,
  Lightbulb
} from "lucide-react";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface ChatInterfaceProps {
  workspaceId?: string;
  onCreateWorkspace: (prompt: string) => Promise<void>;
  onRefineWorkspace: (refinementPrompt: string) => Promise<void>;
  isCreating: boolean;
  isRefining: boolean;
  hasWorkspace: boolean;
}

const suggestedPrompts = [
  "Create a CRM system for my startup with lead tracking and sales pipeline",
  "I need a project management workspace for my marketing team",
  "Build a content calendar for social media planning",
  "Design a personal productivity system with habit tracking",
  "Create an e-commerce operations dashboard with inventory management"
];

export function ChatInterface({
  workspaceId,
  onCreateWorkspace,
  onRefineWorkspace,
  isCreating,
  isRefining,
  hasWorkspace
}: ChatInterfaceProps) {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest("POST", "/api/chat", {
        messages: [...messages, { role: "user", content: message, timestamp: new Date().toISOString() }],
        workspaceId
      });
      return response.json();
    },
    onSuccess: (data) => {
      const assistantMessage: Message = {
        role: "assistant",
        content: data.response,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    },
    onError: (error) => {
      setIsLoading(false);
      toast({
        title: "Chat Error",
        description: error.message || "Failed to get response",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading || isCreating || isRefining) return;

    const userMessage: Message = {
      role: "user",
      content: inputValue.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // If this is the first message and no workspace exists, create one
    if (!hasWorkspace && messages.length === 0) {
      try {
        await onCreateWorkspace(inputValue.trim());
      } catch (error) {
        setIsLoading(false);
        return;
      }
    } else if (hasWorkspace) {
      // If workspace exists, this is a refinement
      try {
        await onRefineWorkspace(inputValue.trim());
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        return;
      }
    } else {
      // Regular chat
      chatMutation.mutate(inputValue.trim());
    }

    setInputValue("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestedPrompt = (prompt: string) => {
    setInputValue(prompt);
  };

  const isDisabled = isLoading || isCreating || isRefining;

  return (
    <Card className="h-[600px] flex flex-col">
      <CardContent className="p-4 flex flex-col h-full">
        {/* Messages Area */}
        <ScrollArea className="flex-1 mb-4">
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">
                  {hasWorkspace ? "Refine Your Workspace" : "Describe Your Workspace"}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {hasWorkspace 
                    ? "Tell me what you'd like to change or improve about your workspace."
                    : "Tell me what kind of Notion workspace you need and I'll create it for you."
                  }
                </p>
                
                {/* Suggested Prompts */}
                {!hasWorkspace && (
                  <div>
                    <div className="flex items-center justify-center space-x-2 mb-4">
                      <Lightbulb className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Try these examples:</span>
                    </div>
                    <div className="space-y-2 max-w-md mx-auto">
                      {suggestedPrompts.slice(0, 3).map((prompt, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => handleSuggestedPrompt(prompt)}
                          className="w-full text-left justify-start h-auto py-2 px-3"
                          data-testid={`button-suggested-prompt-${index}`}
                        >
                          <span className="text-xs">{prompt}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start space-x-3 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    message.role === 'user' ? 'bg-primary' : 'bg-accent'
                  }`}>
                    {message.role === 'user' ? (
                      <User className="w-4 h-4 text-primary-foreground" />
                    ) : (
                      <Sparkles className="w-4 h-4 text-accent-foreground" />
                    )}
                  </div>
                  <Card className={message.role === 'user' ? 'bg-primary text-primary-foreground' : ''}>
                    <CardContent className="p-3">
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <span className="text-xs opacity-70 mt-2 block">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </span>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ))}
            
            {(isLoading || isCreating || isRefining) && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-3 max-w-[80%]">
                  <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                    <Loader2 className="w-4 h-4 text-accent-foreground animate-spin" />
                  </div>
                  <Card>
                    <CardContent className="p-3">
                      <p className="text-sm text-muted-foreground">
                        {isCreating 
                          ? "Creating your workspace..." 
                          : isRefining 
                          ? "Refining your workspace..." 
                          : "Thinking..."
                        }
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="flex space-x-2">
          <div className="flex-1">
            <Textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={hasWorkspace 
                ? "Describe what you'd like to change..." 
                : "Describe your workspace needs..."
              }
              className="min-h-[50px] max-h-[120px] resize-none"
              disabled={isDisabled}
              data-testid="textarea-chat-input"
            />
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isDisabled}
            data-testid="button-send-message"
          >
            {isDisabled ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Status Messages */}
        {isCreating && (
          <div className="mt-2 text-center text-sm text-muted-foreground">
            🎨 Generating your workspace with AI...
          </div>
        )}
        {isRefining && (
          <div className="mt-2 text-center text-sm text-muted-foreground">
            ✨ Refining your workspace...
          </div>
        )}
      </CardContent>
    </Card>
  );
}
