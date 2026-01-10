import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, description, action, actionLabel, onAction }: EmptyStateProps) {
  const handleAction = action?.onClick || onAction;
  const label = action?.label || actionLabel;

  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12 px-4">
        {icon && <div className="mb-4 text-gray-400">{icon}</div>}
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        {description && (
          <p className="text-sm text-gray-500 text-center max-w-sm mb-4">
            {description}
          </p>
        )}
        {handleAction && label && (
          <Button onClick={handleAction}>{label}</Button>
        )}
      </CardContent>
    </Card>
  );
}

