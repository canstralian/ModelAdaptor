import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Wrapper } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Edit, Trash2 } from 'lucide-react';
import WrapperPlatform from '@/components/wrappers/WrapperPlatform';

const Wrappers = () => {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedWrapperId, setSelectedWrapperId] = useState<number | null>(null);

  // Parse the path to see if we're creating a new wrapper
  const isNewWrapper = location === '/wrappers/new';

  // Fetch user's wrappers
  const { data: wrappers, isLoading } = useQuery<Wrapper[]>({
    queryKey: ['/api/wrappers'],
  });

  // Delete wrapper mutation
  const deleteWrapperMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/wrappers/${id}`);
    },
    onSuccess: () => {
      toast({
        title: 'Wrapper deleted',
        description: 'The wrapper has been deleted successfully.',
        variant: 'default',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/wrappers'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to delete wrapper: ${error.message}`,
        variant: 'destructive',
      });
    }
  });

  const handleDeleteWrapper = (id: number) => {
    if (confirm('Are you sure you want to delete this wrapper? This action cannot be undone.')) {
      deleteWrapperMutation.mutate(id);
    }
  };

  if (isNewWrapper) {
    return (
      <>
        {/* Page header */}
        <div className="bg-white shadow">
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={() => setLocation('/wrappers')}
                className="mr-4"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Button>
              <h1 className="text-2xl font-semibold text-gray-900">Create New Wrapper</h1>
            </div>
          </div>
        </div>

        {/* Wrapper platform for creation */}
        <WrapperPlatform />
      </>
    );
  }

  if (selectedWrapperId) {
    return (
      <>
        {/* Page header */}
        <div className="bg-white shadow">
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={() => setSelectedWrapperId(null)}
                className="mr-4"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Button>
              <h1 className="text-2xl font-semibold text-gray-900">Edit Wrapper</h1>
            </div>
          </div>
        </div>

        {/* Wrapper platform for editing */}
        <WrapperPlatform wrapperId={selectedWrapperId} />
      </>
    );
  }

  return (
    <>
      {/* Page header */}
      <div className="bg-white shadow">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">My Wrappers</h1>
            <div>
              <Link href="/wrappers/new">
                <Button className="inline-flex items-center">
                  <Plus className="mr-2 h-5 w-5" />
                  New Wrapper
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Wrappers list */}
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {wrappers && wrappers.length > 0 ? (
                wrappers.map((wrapper) => (
                  <Card key={wrapper.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <CardTitle>{wrapper.name}</CardTitle>
                      <CardDescription className="line-clamp-2">{wrapper.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex space-x-2 text-sm mb-2">
                        <span className="bg-blue-100 text-blue-800 rounded-full px-2 py-0.5">
                          {wrapper.baseModel}
                        </span>
                        {wrapper.enableMemory && (
                          <span className="bg-green-100 text-green-800 rounded-full px-2 py-0.5">
                            Memory
                          </span>
                        )}
                        {wrapper.knowledgeBaseIntegration && (
                          <span className="bg-purple-100 text-purple-800 rounded-full px-2 py-0.5">
                            KB
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 line-clamp-3 mt-2">
                        {wrapper.systemPrompt}
                      </p>
                    </CardContent>
                    <CardFooter className="border-t pt-4 flex justify-between">
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteWrapper(wrapper.id)}
                        disabled={deleteWrapperMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => setSelectedWrapperId(wrapper.id)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center bg-gray-50 rounded-lg p-12">
                  <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">No wrappers found</h3>
                  <p className="mt-2 text-sm text-gray-500">Get started by creating a new AI model wrapper.</p>
                  <Link href="/wrappers/new">
                    <Button className="mt-6">
                      <Plus className="mr-2 h-5 w-5" />
                      Create Wrapper
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Wrappers;
