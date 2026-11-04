import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router';
import { useRegister } from '@finance-os/api-client';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Field,
  Input,
} from '@finance-os/ui';
import { useAuth } from '../auth/auth-context';
import { FormError } from '../components/forms/form-error';

const schema = z.object({
  name: z.string().trim().min(1, 'Enter your name'),
  email: z.email('Enter a valid email address'),
  password: z.string().min(8, 'Use at least 8 characters'),
  orgName: z.string().trim().min(1, 'Enter your business name'),
});
type Values = z.infer<typeof schema>;

export function RegisterPage() {
  const { signIn } = useAuth();
  const registerAccount = useRegister();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit((values) =>
    registerAccount.mutate(values, {
      onSuccess: (session) => {
        signIn(session);
        navigate('/', { replace: true });
      },
    }),
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Create your account</CardTitle>
        <CardDescription>
          Set up your business to send invoices and pay vendors in USDC.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} noValidate className="grid gap-4">
          <FormError error={registerAccount.error} />
          <Field label="Your name" htmlFor="name" error={errors.name?.message}>
            <Input
              id="name"
              autoComplete="name"
              aria-invalid={!!errors.name}
              {...register('name')}
            />
          </Field>
          <Field label="Business name" htmlFor="orgName" error={errors.orgName?.message}>
            <Input
              id="orgName"
              autoComplete="organization"
              aria-invalid={!!errors.orgName}
              {...register('orgName')}
            />
          </Field>
          <Field label="Work email" htmlFor="email" error={errors.email?.message}>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              aria-invalid={!!errors.email}
              {...register('email')}
            />
          </Field>
          <Field
            label="Password"
            htmlFor="password"
            error={errors.password?.message}
            hint="At least 8 characters."
          >
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              aria-invalid={!!errors.password}
              {...register('password')}
            />
          </Field>
          <Button type="submit" disabled={registerAccount.isPending}>
            {registerAccount.isPending ? 'Creating account…' : 'Create account'}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Log in
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
