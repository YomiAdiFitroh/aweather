'use client';

import { useEffect, useState } from 'react';
import { api } from './api';

// Fetches `path` (skips while it is null) and keeps the previous data visible while a new path loads.
export function useApi(path) {
  const [state, setState] = useState({ data: null, error: '', loading: Boolean(path) });

  useEffect(() => {
    if (!path) return undefined;
    let active = true;
    setState((s) => ({ ...s, loading: true }));
    api(path)
      .then((data) => active && setState({ data, error: '', loading: false }))
      .catch((e) => active && setState((s) => ({ ...s, error: e.message, loading: false })));
    return () => {
      active = false;
    };
  }, [path]);

  return state;
}