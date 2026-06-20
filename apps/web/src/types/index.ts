export type SessionUser = {
  id: string;
  name: string;
  email: string;
  roles: Array<{ role: { code: string; name: string } }> | string[];
};

export type ApiList<T> = {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};
