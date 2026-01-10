import { AuditLogsContent } from './components/audit-logs-content';
import { SettingsProvider } from '../settings-context';
import { AdminGuard } from '@/components/auth/admin-guard';

export default function AuditLogsPage() {
  return (
    <AdminGuard>
      <SettingsProvider>
        <AuditLogsContent />
      </SettingsProvider>
    </AdminGuard>
  );
}

