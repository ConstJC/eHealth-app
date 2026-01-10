import { MenusContent } from './components/menus-content';
import { SettingsProvider } from '../settings-context';
import { AdminGuard } from '@/components/auth/admin-guard';

export default function MenusPage() {
  return (
    <AdminGuard>
      <SettingsProvider>
        <MenusContent />
      </SettingsProvider>
    </AdminGuard>
  );
}

