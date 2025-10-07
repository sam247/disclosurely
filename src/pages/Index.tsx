
import ProtectedLanding from '@/components/ProtectedLanding';
import { useLanguageFromUrl } from '@/hooks/useLanguageFromUrl';

const Index = () => {
  useLanguageFromUrl();
  return <ProtectedLanding />;
};

export default Index;
