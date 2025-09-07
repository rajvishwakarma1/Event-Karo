import { Link, useNavigate } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';

export default function Login() {
  const navigate = useNavigate();
  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-6 text-2xl font-bold">Login</h1>
  <LoginForm onSuccess={() => navigate('/events')} />
      <p className="mt-4 text-sm text-gray-600">
        No account? <Link to="/register" className="text-primary-700 underline">Register</Link>
      </p>
    </div>
  );
}
