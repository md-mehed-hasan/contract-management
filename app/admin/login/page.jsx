'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { FileSignature } from 'lucide-react';
import Link from 'next/link';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get('registered');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await signIn('credentials', {
        redirect: false,
        email,
        password
      });

      if (res?.error) {
        setError(res.error);
      } else {
        router.push('/admin/dashboard');
      }
    } catch (err) {
      setError('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {registered && <div className="mb-4 rounded-md border border-green-100 bg-green-50 p-3 text-sm text-green-700">Registration successful! Please login.</div>}
      {error && <div className="mb-4 rounded-md border border-rose-100 bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-brand-500"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-brand-500"
          required
        />
        <button disabled={loading} className="w-full rounded-md bg-brand-600 px-4 py-2 font-medium text-white hover:bg-brand-700 disabled:opacity-60">
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <div className="mt-4 text-center text-sm text-slate-500">
        Don&apos;t have an account?{' '}
        <Link href="/admin/signup" className="text-brand-600 hover:underline">
          Sign Up
        </Link>
      </div>
    </>
  );
}

export default function AdminLogin() {
  return (
    <div className="grid min-h-screen place-items-center bg-mist px-4">
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-8 shadow-panel">
        <div className="mb-7 text-center">
          <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-md bg-brand-600 text-white">
            <FileSignature size={24} />
          </div>
          <h1 className="text-2xl font-semibold text-ink">SOAS Admin Login</h1>
        </div>
        <Suspense fallback={<div className="text-center text-slate-500 text-sm">Loading...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
