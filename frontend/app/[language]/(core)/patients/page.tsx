import { PatientsContent } from './patients-content';
import { PatientsProvider } from './patients-context';

export default function PatientsPage() {
  return (
    <PatientsProvider>
      <PatientsContent />
    </PatientsProvider>
  );
}

