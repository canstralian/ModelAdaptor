import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Wrapper } from '@shared/schema';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PaperclipIcon, CornerDownLeft } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatResponse {
  message: string;
  conversationId: number;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  model?: string;
}

interface InteractivePlaygroundProps {
  wrapper: Partial<Wrapper>;
  conversationId: number | null;
  onConversationUpdate: (id: number) => void;
}

const InteractivePlayground = ({ 
  wrapper, 
  conversationId, 
  onConversationUpdate 
}: InteractivePlaygroundProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [debugInfo, setDebugInfo] = useState<{ [key: number]: boolean }>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Initial message for demo
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          role: 'user',
          content: "I'm trying to upgrade my subscription but keep getting an error code E-4032. Can you help me understand what this means?"
        },
        {
          role: 'assistant',
          content: "I'd be happy to help with that error code. Error E-4032 typically indicates a payment processing issue. According to our knowledge base, this can happen for a few reasons:\n\n1. Your payment method may have expired\n2. There might be insufficient funds in your account\n3. Your bank might be blocking the transaction\n\nI recommend trying the following steps:\n\n1. Check that your payment details are up to date\n2. Try a different payment method if available\n3. Contact your bank to ensure they're not blocking transactions to our service\n\nWould you like me to guide you through updating your payment information?"
        }
      ]);
    }
  }, []);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Chat mutation
  const chatMutation = useMutation({
    mutationFn: async (message: string): Promise<ChatResponse> => {
      const response = await apiRequest('POST', '/api/chat', { 
        wrapperId: wrapper.id || 1, 
        message,
        conversationId 
      });
      const data = await response.json();
      return data;
    },
    onSuccess: (data) => {
      // Add the assistant response to messages
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.message
      }]);
      
      // Update conversation ID if this is the first message
      if (data.conversationId && !conversationId) {
        onConversationUpdate(data.conversationId);
      }
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to send message: ${error.message}`,
        variant: 'destructive',
      });
    }
  });

  const handleSubmit = () => {
    if (!input.trim()) return;
    
    // Add the user message to messages
    setMessages(prev => [...prev, {
      role: 'user',
      content: input
    }]);
    
    // Send the message to the API
    chatMutation.mutate(input);
    
    // Clear the input
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const toggleDebugInfo = (index: number) => {
    setDebugInfo(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleReset = () => {
    setMessages([]);
    onConversationUpdate(0);
    toast({
      title: 'Conversation Reset',
      description: 'The conversation has been reset.',
    });
  };

  return (
    <div className="lg:w-2/3 flex flex-col">
      {/* Playground Header */}
      <div className="border-b border-gray-200 bg-gray-50 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">Test Your Wrapper</h2>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleReset}
              className="inline-flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reset
            </Button>
            <Button 
              size="sm" 
              onClick={handleSubmit} 
              disabled={!input.trim() || chatMutation.isPending}
              className="inline-flex items-center"
            >
              {chatMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              )}
              Run Test
            </Button>
          </div>
        </div>
      </div>
      
      {/* Conversation Display */}
      <div className="flex-1 p-4 overflow-y-auto bg-white" style={{ minHeight: '300px' }}>
        {messages.map((message, index) => (
          <div key={index} className="mb-4 flex">
            <div className="flex-shrink-0 mr-3">
              {message.role === 'user' ? (
                <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-700">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              ) : (
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className={`${message.role === 'user' ? 'bg-gray-100' : 'bg-blue-50 border border-blue-100'} p-3 rounded-lg inline-block max-w-full`}>
                <p className="text-sm text-gray-800 whitespace-pre-line">{message.content}</p>
              </div>
              
              {/* Debug Info (only for assistant messages) */}
              {message.role === 'assistant' && (
                <div className="mt-1">
                  <button 
                    className="text-xs text-gray-500 flex items-center hover:text-primary focus:outline-none" 
                    onClick={() => toggleDebugInfo(index)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                    {debugInfo[index] ? 'Hide' : 'Show'} context and processing details
                  </button>
                  {debugInfo[index] && (
                    <div className="mt-2 bg-gray-800 text-gray-200 p-3 rounded-md code-font text-xs overflow-auto" style={{ maxHeight: '200px' }}>
                      <p>Context retrieval: Knowledge base article KB-1245 "Payment Error Codes"</p>
                      <p>Matched error code E-4032 with "Payment Processing Failures"</p>
                      <p>Previous conversation context: None (new conversation)</p>
                      <p>Confidence score: 0.92</p>
                      <p>
                        processing_time: 1.2s<br/>
                        prompt_tokens: 142<br/>
                        completion_tokens: 256<br/>
                        total_tokens: 398
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input Area */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <div className="relative">
          <Textarea 
            rows={3} 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message here..." 
            className="block w-full rounded-md resize-none pr-20"
          />
          <div className="absolute bottom-2 right-2 flex space-x-1">
            <Button 
              size="icon" 
              variant="ghost" 
              className="rounded-full text-gray-500 hover:bg-gray-100"
            >
              <PaperclipIcon className="h-5 w-5" />
            </Button>
            <Button 
              size="icon" 
              onClick={handleSubmit}
              disabled={!input.trim() || chatMutation.isPending}
              className="rounded-full bg-primary hover:bg-primary/90"
            >
              {chatMutation.isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <CornerDownLeft className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractivePlayground;
