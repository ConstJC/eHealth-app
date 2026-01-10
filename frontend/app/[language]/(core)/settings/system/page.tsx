import { SystemContent } from './components/system-content';
import { SettingsProvider } from '../settings-context';
import { AdminGuard } from '@/components/auth/admin-guard';

export default function SystemPage() {
  return (
    <AdminGuard>
      <SettingsProvider>
        <SystemContent />
      </SettingsProvider>
    </AdminGuard>
  );
}

