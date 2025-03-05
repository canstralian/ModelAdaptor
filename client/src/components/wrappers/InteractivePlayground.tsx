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
    <div className="lg:w-2/3 flex flex-col h-[calc(100vh-200px)] md:h-[600px] shadow-md rounded-xl overflow-hidden">
      {/* Playground Header */}
      <div className="border-b border-gray-200 bg-gray-50 p-3 md:p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.5 3a1.5 1.5 0 0 1 3 0v1.5a1.5 1.5 0 0 1-3 0V3zM15 8a1 1 0 0 1 1 1v4.5a1.5 1.5 0 0 1-3 0V9a1 1 0 0 1 1-1h1zM1 8a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v6.5a1.5 1.5 0 0 1-3 0V8zm4-3.5A1.5 1.5 0 0 1 6.5 3h1A1.5 1.5 0 0 1 9 4.5v10a1.5 1.5 0 0 1-3 0v-10z"/>
            </svg>
            <h2 className="text-lg font-medium text-gray-900">Test Your Wrapper</h2>
          </div>
          <div className="flex space-x-1 md:space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleReset}
              className="inline-flex items-center text-xs md:text-sm px-2 md:px-3"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="hidden sm:inline">Reset</span>
            </Button>
            <Button 
              size="sm" 
              onClick={handleSubmit} 
              disabled={!input.trim() || chatMutation.isPending}
              className="inline-flex items-center text-xs md:text-sm px-2 md:px-3"
            >
              {chatMutation.isPending ? (
                <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              )}
              <span className="hidden sm:inline">Run Test</span>
              <span className="sm:hidden">Run</span>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Conversation Display */}
      <div className="flex-1 p-3 md:p-4 overflow-y-auto bg-white" style={{ minHeight: '300px' }}>
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <h3 className="text-lg font-medium mb-2">Test your AI wrapper</h3>
            <p className="max-w-sm">Ask a question below to see how your configured wrapper responds. Test different prompts to fine-tune the behavior.</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div key={index} className={`mb-4 flex ${message.role === 'user' ? 'justify-end' : ''}`}>
              {message.role !== 'user' && (
                <div className="flex-shrink-0 mr-2 md:mr-3 mt-1">
                  <div className="h-6 w-6 md:h-8 md:w-8 rounded-full bg-primary flex items-center justify-center text-white shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                </div>
              )}
              <div className={`flex-1 ${message.role === 'user' ? 'ml-12 sm:ml-24' : 'mr-12 sm:mr-24'}`}>
                <div 
                  className={`${
                    message.role === 'user' 
                      ? 'bg-primary text-white ml-auto rounded-2xl rounded-tr-sm' 
                      : 'bg-gray-100 border border-gray-200 mr-auto rounded-2xl rounded-tl-sm'
                  } p-3 inline-block max-w-full shadow-sm`}
                >
                  <p className="text-sm whitespace-pre-line">{message.content}</p>
                </div>
                
                {/* Time and debug toggle */}
                <div className={`flex mt-1 text-xs text-gray-500 ${message.role === 'user' ? 'justify-end' : ''}`}>
                  <span className="px-2">
                    {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                  
                  {/* Debug Info (only for assistant messages) */}
                  {message.role === 'assistant' && (
                    <button 
                      className="flex items-center hover:text-primary focus:outline-none transition-colors px-1"
                      onClick={() => toggleDebugInfo(index)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                      </svg>
                      {debugInfo[index] ? 'Hide details' : 'View details'}
                    </button>
                  )}
                </div>
                
                {/* Debug info expanded */}
                {message.role === 'assistant' && debugInfo[index] && (
                  <div className="mt-2 bg-gray-800 text-gray-200 p-3 rounded-md text-xs overflow-auto font-mono" style={{ maxHeight: '200px' }}>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <p className="text-gray-400">Context retrieval:</p>
                        <p>KB-1245 "Payment Error Codes"</p>
                        <p className="text-gray-400">Matched:</p>
                        <p>E-4032 with "Payment Processing Failures"</p>
                        <p className="text-gray-400">Conversation:</p>
                        <p>New (no previous context)</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-gray-400">Confidence:</p>
                        <p>0.92</p>
                        <p className="text-gray-400">Processing:</p>
                        <p>1.2s</p>
                        <p className="text-gray-400">Tokens:</p>
                        <p>142 prompt / 256 completion</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {message.role === 'user' && (
                <div className="flex-shrink-0 ml-2 md:ml-3 mt-1">
                  <div className="h-6 w-6 md:h-8 md:w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input Area */}
      <div className="border-t border-gray-200 p-3 md:p-4 bg-gray-50">
        <div className="relative">
          <Textarea 
            rows={2} 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask something to test the wrapper..." 
            className="block w-full rounded-xl shadow-sm resize-none border-gray-200 pr-20 focus:border-primary/50 focus:ring-primary/50"
          />
          <div className="absolute bottom-2 right-2 flex space-x-1">
            <Button 
              size="icon" 
              variant="ghost" 
              className="rounded-full text-gray-500 hover:bg-gray-100 hidden sm:flex"
              title="Attach file"
            >
              <PaperclipIcon className="h-4 w-4 md:h-5 md:w-5" />
            </Button>
            <Button 
              size="icon" 
              onClick={handleSubmit}
              disabled={!input.trim() || chatMutation.isPending}
              className="rounded-full bg-primary hover:bg-primary/90 transition-colors"
              title="Send message"
            >
              {chatMutation.isPending ? (
                <Loader2 className="h-4 w-4 md:h-5 md:w-5 animate-spin" />
              ) : (
                <CornerDownLeft className="h-4 w-4 md:h-5 md:w-5" />
              )}
            </Button>
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-500 flex justify-between items-center px-1">
          <span>Powered by Google's Gemini API</span>
          <span className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Press Enter to send, Shift+Enter for new line
          </span>
        </div>
      </div>
    </div>
  );
};

export default InteractivePlayground;
