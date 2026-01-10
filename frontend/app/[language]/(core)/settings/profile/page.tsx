import { ProfileContent } from './component/profile-content';
import { SettingsProvider } from '../settings-context';

export default function ProfilePage() {
  return (
    <SettingsProvider>
      <ProfileContent />
    </SettingsProvider>
  );
}

