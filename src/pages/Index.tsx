import ProtectedLanding from '@/components/ProtectedLanding';
import { useLanguageFromUrl } from '@/hooks/useLanguageFromUrl';
import { useGeographicalLanguage } from '@/hooks/useGeographicalLanguage';

const Index = () => {
  useLanguageFromUrl();
  useGeographicalLanguage();
  return <ProtectedLanding />;
};

export default Index;
