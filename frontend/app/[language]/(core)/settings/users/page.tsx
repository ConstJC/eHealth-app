import { UsersContent } from './components/users-content';
import { SettingsProvider } from '../settings-context';
import { AdminGuard } from '@/components/auth/admin-guard';

export default function UsersPage() {
  return (
    <AdminGuard>
      <SettingsProvider>
        <UsersContent />
      </SettingsProvider>
    </AdminGuard>
  );
}

