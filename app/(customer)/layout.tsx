import { ProtectedRoute } from '@/app/components/auth/ProtectedRoute';

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      {children}
    </ProtectedRoute>
  );
}
