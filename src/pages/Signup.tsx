import AuthLayout from '@/components/auth/AuthLayout';
import SignupForm from '@/components/auth/SignupForm';
import { useTranslation } from 'react-i18next';
import { useLanguageFromUrl } from '@/hooks/useLanguageFromUrl';

const Signup = () => {
  useLanguageFromUrl();
  const { t } = useTranslation();
  
  return (
    <AuthLayout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 text-center">{t('auth.signup.title')}</h2>
        <p className="mt-2 text-sm text-gray-600 text-center">
          {t('auth.signup.subtitle')}
        </p>
      </div>
      <SignupForm />
    </AuthLayout>
  );
};

export default Signup;
