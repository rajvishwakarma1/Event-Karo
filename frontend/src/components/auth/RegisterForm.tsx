import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '@/services/api';
import toast from 'react-hot-toast';

const RegisterSchema = z.object({
  name: z.string().min(2, 'Enter your name'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['organizer', 'attendee']).default('attendee'),
  terms: z.literal(true, { errorMap: () => ({ message: 'You must accept the terms' }) }),
});

type RegisterValues = z.infer<typeof RegisterSchema>;

export default function RegisterForm({ onSuccess }: { onSuccess?: () => void }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterValues>({ resolver: zodResolver(RegisterSchema), defaultValues: { role: 'attendee' } });

  const onSubmit = async (values: RegisterValues) => {
    try {
      await api.auth.register({ name: values.name, email: values.email, password: values.password, role: values.role });
      toast.success('Account created. Please login.');
      onSuccess?.();
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <input className="input" placeholder="Name" {...register('name')} />
        {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
      </div>
      <div>
        <input className="input" placeholder="Email" type="email" {...register('email')} />
        {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
      </div>
      <div>
        <input className="input" placeholder="Password" type="password" {...register('password')} />
        {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
      </div>
      <div>
        <select className="input" {...register('role')}>
          <option value="attendee">Attendee</option>
          <option value="organizer">Organizer</option>
        </select>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" className="h-4 w-4" {...register('terms')} /> I accept the Terms & Privacy Policy
      </label>
      {errors.terms && <p className="mt-1 text-xs text-red-600">{errors.terms.message}</p>}
      <button className="btn btn-primary w-full" disabled={isSubmitting}>{isSubmitting ? 'Creating...' : 'Create account'}</button>
    </form>
  );
}
