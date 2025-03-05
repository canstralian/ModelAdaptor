import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import WrapperPlatform from '@/components/wrappers/WrapperPlatform';
import { useQuery } from '@tanstack/react-query';
import { Wrapper } from '@shared/schema';

const Home = () => {
  // Fetch user's wrappers
  const { data: wrappers, isLoading } = useQuery<Wrapper[]>({
    queryKey: ['/api/wrappers'],
  });

  return (
    <>
      {/* Page header */}
      <div className="bg-white shadow">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">AI Model Wrapper</h1>
            <div>
              <Link href="/wrappers/new">
                <Button className="inline-flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  New Wrapper
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Default wrapper platform for demo */}
      <WrapperPlatform wrapperId={wrappers && wrappers.length > 0 ? wrappers[0].id : undefined} />
    </>
  );
};

export default Home;
