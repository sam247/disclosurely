
import AuthLayout from '@/components/auth/AuthLayout';
import SignupForm from '@/components/auth/SignupForm';

const Signup = () => {
  return (
    <AuthLayout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 text-center">Create your account</h2>
        <p className="mt-2 text-sm text-gray-600 text-center">
          Join the secure disclosure platform
        </p>
      </div>
      <SignupForm />
    </AuthLayout>
  );
};

export default Signup;
