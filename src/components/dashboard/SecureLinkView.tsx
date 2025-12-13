import LinkGenerator from '@/components/LinkGenerator';
import { useTranslation } from 'react-i18next';

const SecureLinkView = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Secure Report Link</h2>
        <p className="text-muted-foreground mt-2">
          Manage your secure submission portal and share it with your stakeholders
        </p>
      </div>

      <LinkGenerator />
    </div>
  );
};

export default SecureLinkView;
