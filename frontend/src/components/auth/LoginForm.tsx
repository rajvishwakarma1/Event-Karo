import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

const LoginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  remember: z.boolean().optional(),
});

type LoginValues = z.infer<typeof LoginSchema>;

export default function LoginForm({ onSuccess }: { onSuccess?: () => void }) {
  const { login } = useAuth();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginValues>({ resolver: zodResolver(LoginSchema) });

  const onSubmit = async (values: LoginValues) => {
    try {
      await login(values.email, values.password);
      toast.success('Welcome back!');
      onSuccess?.();
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'Login failed');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <input className="input" placeholder="Email" type="email" {...register('email')} />
        {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
      </div>
      <div>
        <input className="input" placeholder="Password" type="password" {...register('password')} />
        {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
      </div>
      <div className="flex items-center justify-between text-sm">
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" className="h-4 w-4" {...register('remember')} /> Remember me
        </label>
        <a className="text-primary-700 hover:underline" href="#">Forgot password?</a>
      </div>
      <button className="btn btn-primary w-full" disabled={isSubmitting}>{isSubmitting ? 'Signing in...' : 'Login'}</button>
    </form>
  );
}
