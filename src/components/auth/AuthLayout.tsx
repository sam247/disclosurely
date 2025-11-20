import { ReactNode } from 'react';
import { Home } from 'lucide-react';
interface AuthLayoutProps {
  children: ReactNode;
}
const AuthLayout = ({
  children
}: AuthLayoutProps) => {
  const handleHomeClick = () => {
    // Always redirect to main domain from auth pages
    window.location.href = 'https://disclosurely.com';
  };
  return <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Home icon in top left of the page */}
      <button onClick={handleHomeClick} className="absolute top-4 left-4 sm:top-6 sm:left-6 p-2 text-gray-400 hover:text-gray-600 transition-colors bg-white rounded-lg shadow-sm z-10" title="Back to Home">
        <Home className="h-5 w-5 sm:h-6 sm:w-6" />
      </button>

      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <img src="/lovable-uploads/c46ace0e-df58-4119-b5e3-8dcfa075ea2f.png" alt="Disclosurely" className="h-5 sm:h-7 w-auto" />
          </div>
          <p className="mt-1 text-xs sm:text-sm text-gray-600">Secure Whistleblowing Platform</p>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-6 px-4 shadow-lg sm:rounded-lg sm:px-8 border border-gray-100">
          {children}
        </div>
      </div>
    </div>;
};
export default AuthLayout;