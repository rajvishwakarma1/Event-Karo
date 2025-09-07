import { Link, useNavigate } from 'react-router-dom';
import RegisterForm from '../components/auth/RegisterForm';

export default function Register() {
  const navigate = useNavigate();
  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-6 text-2xl font-bold">Register</h1>
  <RegisterForm onSuccess={() => navigate('/events')} />
      <p className="mt-4 text-sm text-gray-600">
        Already have an account? <Link to="/login" className="text-primary-700 underline">Login</Link>
      </p>
    </div>
  );
}
