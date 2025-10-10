import AuthLayout from '@/components/auth/AuthLayout';
import LoginForm from '@/components/auth/LoginForm';
import { useTranslation } from 'react-i18next';
import { useLanguageFromUrl } from '@/hooks/useLanguageFromUrl';

const Login = () => {
  useLanguageFromUrl();
  const { t } = useTranslation();
  
  return (
    <AuthLayout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 text-center">{t('auth.signin.title')}</h2>
        <p className="mt-2 text-sm text-gray-600 text-center">
          {t('auth.signin.subtitle')}
        </p>
      </div>
      <LoginForm />
    </AuthLayout>
  );
};

export default Login;
