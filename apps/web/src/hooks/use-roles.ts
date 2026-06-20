'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { SessionUser } from '@/types';

export function useRoles() {
  const session = useQuery({
    queryKey: ['session'],
    queryFn: () => api<SessionUser>('/auth/me'),
  });
  const roles = (session.data?.roles ?? []).map((role) =>
    typeof role === 'string' ? role : role.role.code,
  );
  return {
    roles,
    hasAny: (...required: string[]) => required.some((role) => roles.includes(role)),
  };
}
