import { Alert, AlertDescription } from '@/components/ui/alert';

interface ErrorMessageProps {
  message: string;
  className?: string;
}

export function ErrorMessage({ message, className }: ErrorMessageProps) {
  if (!message) return null;

  return (
    <Alert variant="error" className={className}>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}

