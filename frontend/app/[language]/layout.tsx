import { ReactNode } from 'react';

export default function LanguageLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { language: string };
}) {
  return <>{children}</>;
}

