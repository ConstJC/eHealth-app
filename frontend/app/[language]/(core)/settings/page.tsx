import { SettingsContent } from './settings-content';
import { SettingsProvider } from './settings-context';

export default function SettingsPage() {
  return (
    <SettingsProvider>
      <SettingsContent />
    </SettingsProvider>
  );
}

