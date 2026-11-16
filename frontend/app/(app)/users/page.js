'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function UsersPage() {
  const [users, setUsers] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    api('/users')
      .then((d) => active && setUsers(d.users))
      .catch((e) => active && setError(e.message));
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="card overflow-hidden">
      <div className="border-b border-slate-100 p-6">
        <h2 className="text-lg font-semibold">Users</h2>
        <p className="text-sm text-slate-500">Loaded from a JWT-protected endpoint.</p>
      </div>

      {error && (
        <p role="alert" className="p-6 text-red-600">
          {error}
        </p>
      )}
      {!users && !error && <p className="p-6 text-slate-500">Loading users…</p>}

      {users && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Email</th>
                <th className="px-6 py-3 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-slate-100">
                  <td className="px-6 py-3 font-medium">{u.name}</td>
                  <td className="px-6 py-3 text-slate-600">{u.email}</td>
                  <td className="px-6 py-3 text-slate-600">{new Date(u.createdAt).toLocaleDateString('en-GB')}</td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-6 text-center text-slate-500">
                    No users yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
