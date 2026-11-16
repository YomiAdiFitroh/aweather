'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FiCloud } from 'react-icons/fi';
import { useAuth } from '@/lib/auth-context';

export default function AuthForm({ mode }) {
  const isRegister = mode === 'register';
  const { user, loading, login, register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace('/dashboard');
  }, [loading, user, router]);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (isRegister) await register(form.name, form.email, form.password);
      else await login(form.email, form.password);
      router.replace('/dashboard');
    } catch (err) {
      setError(err.details?.[0]?.message || err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <form onSubmit={onSubmit} className="card w-full max-w-sm space-y-4 p-8">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-xl text-blue-600">
            <FiCloud />
          </span>
          <div>
            <h1 className="text-xl font-semibold">{isRegister ? 'Create account' : 'Welcome back'}</h1>
            <p className="text-sm text-slate-500">Aweather</p>
          </div>
        </div>

        {isRegister && (
          <input className="input" placeholder="Name" value={form.name} onChange={update('name')} required />
        )}
        <input className="input" type="email" placeholder="Email" value={form.email} onChange={update('email')} required />
        <input
          className="input"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={update('password')}
          required
          minLength={isRegister ? 8 : undefined}
        />

        {error && (
          <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}

        <button
          disabled={submitting}
          className="w-full rounded-xl bg-blue-600 py-2.5 font-medium text-white transition hover:bg-blue-700 disabled:opacity-60"
        >
          {submitting ? 'Please wait…' : isRegister ? 'Sign up' : 'Sign in'}
        </button>

        <p className="text-center text-sm text-slate-500">
          {isRegister ? 'Already have an account? ' : 'No account yet? '}
          <Link href={isRegister ? '/login' : '/register'} className="font-medium text-blue-600 hover:underline">
            {isRegister ? 'Sign in' : 'Sign up'}
          </Link>
        </p>
      </form>
    </main>
  );
}
