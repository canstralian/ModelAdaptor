import { useState } from 'react';
import ConfigurationPanel from './ConfigurationPanel';
import InteractivePlayground from './InteractivePlayground';
import StatCard from '../dashboard/StatCard';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Wrapper } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

interface WrapperPlatformProps {
  wrapperId?: number;
}

type TabType = 'configuration' | 'prompts' | 'integrations' | 'deployment';

const WrapperPlatform = ({ wrapperId }: WrapperPlatformProps) => {
  const [activeTab, setActiveTab] = useState<TabType>('configuration');
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch wrapper data if wrapperId is provided
  const { data: wrapper, isLoading } = useQuery({
    queryKey: wrapperId ? [`/api/wrappers/${wrapperId}`] : null,
    enabled: !!wrapperId
  });

  // Default wrapper if none is provided or still loading
  const defaultWrapper: Partial<Wrapper> = {
    name: 'Customer Support Assistant',
    description: 'AI assistant that helps customer support agents respond to inquiries with accurate information from the knowledge base.',
    baseModel: 'GPT-4',
    systemPrompt: 'You are a customer support assistant for a software company. You should be helpful, friendly, and knowledgeable. When you don\'t know the answer, refer to the knowledge base or suggest escalating to a human agent.',
    temperature: 70,
    maxTokens: 2048,
    topP: 90,
    enableMemory: true,
    knowledgeBaseIntegration: true,
    webSearchAccess: false,
  };

  const currentWrapper = wrapper || defaultWrapper;

  // Save wrapper mutation
  const saveWrapperMutation = useMutation({
    mutationFn: async (updatedWrapper: Partial<Wrapper>) => {
      if (wrapperId) {
        // Update existing wrapper
        return apiRequest('PUT', `/api/wrappers/${wrapperId}`, updatedWrapper);
      } else {
        // Create new wrapper
        return apiRequest('POST', '/api/wrappers', updatedWrapper);
      }
    },
    onSuccess: () => {
      toast({
        title: wrapperId ? 'Wrapper updated' : 'Wrapper created',
        description: wrapperId ? 'Your wrapper has been updated successfully.' : 'Your new wrapper has been created successfully.',
        variant: 'default',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/wrappers'] });
      if (wrapperId) {
        queryClient.invalidateQueries({ queryKey: [`/api/wrappers/${wrapperId}`] });
      }
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to save wrapper: ${error.message}`,
        variant: 'destructive',
      });
    }
  });

  const handleSaveWrapper = (updatedWrapper: Partial<Wrapper>) => {
    saveWrapperMutation.mutate(updatedWrapper);
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          {/* Wrapper Configuration Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('configuration')}
                className={`px-6 py-4 border-b-2 font-medium text-sm ${
                  activeTab === 'configuration'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Configuration
              </button>
              <button
                onClick={() => setActiveTab('prompts')}
                className={`px-6 py-4 border-b-2 font-medium text-sm ${
                  activeTab === 'prompts'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Prompt Library
              </button>
              <button
                onClick={() => setActiveTab('integrations')}
                className={`px-6 py-4 border-b-2 font-medium text-sm ${
                  activeTab === 'integrations'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Integrations
              </button>
              <button
                onClick={() => setActiveTab('deployment')}
                className={`px-6 py-4 border-b-2 font-medium text-sm ${
                  activeTab === 'deployment'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Deployment
              </button>
            </nav>
          </div>

          {/* Main Content Area - Split Layout */}
          <div className="flex flex-col lg:flex-row">
            {/* Left Panel: Configuration */}
            <ConfigurationPanel 
              wrapper={currentWrapper}
              onSave={handleSaveWrapper}
              isSaving={saveWrapperMutation.isPending}
            />

            {/* Right Panel: Interactive Playground */}
            <InteractivePlayground 
              wrapper={currentWrapper}
              conversationId={currentConversationId}
              onConversationUpdate={setCurrentConversationId}
            />
          </div>
        </div>
        
        {/* Additional Cards */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Total API Calls"
            value="12,457"
            icon={(
              <svg className="h-6 w-6 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            )}
            linkText="View usage details"
            linkHref="#"
            bgColor="bg-primary/10"
            iconColor="text-primary"
          />
          
          <StatCard
            title="Success Rate"
            value="98.7%"
            icon={(
              <svg className="h-6 w-6 text-success" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            linkText="View error logs"
            linkHref="#"
            bgColor="bg-green-100"
            iconColor="text-success"
          />
          
          <StatCard
            title="Avg. Response Time"
            value="1.2s"
            icon={(
              <svg className="h-6 w-6 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            linkText="Performance metrics"
            linkHref="#"
            bgColor="bg-blue-100"
            iconColor="text-primary"
          />
        </div>
      </div>
    </div>
  );
};

export default WrapperPlatform;
