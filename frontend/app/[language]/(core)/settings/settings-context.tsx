'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { User, UserSearchParams, AuditLog, AuditLogSearchParams } from './settings-types';

interface SettingsContextType {
  // User management
  users: User[];
  selectedUser: User | null;
  userSearchParams: UserSearchParams;
  setUsers: (users: User[]) => void;
  setSelectedUser: (user: User | null) => void;
  setUserSearchParams: (params: UserSearchParams) => void;
  
  // Audit logs
  auditLogs: AuditLog[];
  auditLogSearchParams: AuditLogSearchParams;
  setAuditLogs: (logs: AuditLog[]) => void;
  setAuditLogSearchParams: (params: AuditLogSearchParams) => void;
  
  // Loading states
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  
  // Error state
  error: string | null;
  setError: (error: string | null) => void;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userSearchParams, setUserSearchParams] = useState<UserSearchParams>({
    page: 1,
    limit: 20,
  });
  
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [auditLogSearchParams, setAuditLogSearchParams] = useState<AuditLogSearchParams>({
    page: 1,
    limit: 20,
  });
  
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <SettingsContext.Provider
      value={{
        users,
        selectedUser,
        userSearchParams,
        setUsers,
        setSelectedUser,
        setUserSearchParams,
        auditLogs,
        auditLogSearchParams,
        setAuditLogs,
        setAuditLogSearchParams,
        isLoading,
        setLoading,
        error,
        setError,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettingsContext() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettingsContext must be used within SettingsProvider');
  }
  return context;
}

