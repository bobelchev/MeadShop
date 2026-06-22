'use client';

import { useActionState } from 'react';
import { login } from './actions';

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(login, null);

  return (
    <div className="max-w-sm mx-auto mt-20">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Admin Login</h1>
      <form action={formAction} className="space-y-4">
        {state?.error && (
          <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded px-3 py-2">
            {state.error}
          </p>
        )}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoFocus
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="w-full bg-gray-800 text-white rounded px-4 py-2 text-sm font-medium hover:bg-gray-700 disabled:opacity-50"
        >
          {pending ? 'Logging in...' : 'Log in'}
        </button>
      </form>
    </div>
  );
}
