
import AuthLayout from '@/components/auth/AuthLayout';
import LoginForm from '@/components/auth/LoginForm';

const Login = () => {
  return (
    <AuthLayout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 text-center">Sign in to your account</h2>
        <p className="mt-2 text-sm text-gray-600 text-center">
          Access your secure dashboard
        </p>
      </div>
      <LoginForm />
    </AuthLayout>
  );
};

export default Login;
