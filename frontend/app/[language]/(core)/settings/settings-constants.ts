/**
 * Settings Module Constants
 */

import { UserRole } from './settings-types';

export const SETTINGS_PAGE_SIZE = 20;
export const SETTINGS_DEFAULT_PAGE = 1;

export const USER_ROLE_OPTIONS = [
  { value: UserRole.ADMIN, label: 'Administrator', description: 'Full system access' },
  { value: UserRole.DOCTOR, label: 'Doctor', description: 'Patient management, consultations' },
  { value: UserRole.NURSE, label: 'Nurse', description: 'Vital signs, patient registration' },
  { value: UserRole.RECEPTIONIST, label: 'Receptionist', description: 'Registration, billing' },
  { value: UserRole.USER, label: 'User', description: 'Basic access' },
] as const;

export const USER_STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'deleted', label: 'Deleted' },
] as const;

export const AUDIT_LOG_ACTIONS = [
  'CREATE',
  'UPDATE',
  'DELETE',
  'LOGIN',
  'LOGOUT',
  'PASSWORD_CHANGE',
  'ROLE_CHANGE',
  'ACTIVATE',
  'DEACTIVATE',
  'RESTORE',
] as const;

export const AUDIT_LOG_ENTITY_TYPES = [
  'USER',
  'PATIENT',
  'VISIT',
  'PRESCRIPTION',
  'INVOICE',
  'SYSTEM',
] as const;

export const TIMEZONE_OPTIONS = [
  { value: 'UTC', label: 'UTC' },
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
] as const;

export const DATE_FORMAT_OPTIONS = [
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
] as const;

export const TIME_FORMAT_OPTIONS = [
  { value: '12h', label: '12 Hour (AM/PM)' },
  { value: '24h', label: '24 Hour' },
] as const;

export const CURRENCY_OPTIONS = [
  { value: 'USD', label: 'US Dollar ($)' },
  { value: 'EUR', label: 'Euro (€)' },
  { value: 'GBP', label: 'British Pound (£)' },
] as const;

export const BACKUP_FREQUENCY_OPTIONS = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
] as const;

