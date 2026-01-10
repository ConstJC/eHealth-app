'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSettings } from '../../hooks/use-settings';
import { SettingsNavigation } from '../../components/settings-navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Alert } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { TIMEZONE_OPTIONS, DATE_FORMAT_OPTIONS, TIME_FORMAT_OPTIONS, CURRENCY_OPTIONS, BACKUP_FREQUENCY_OPTIONS } from '../../settings-constants';
import type { SystemConfig } from '../../settings-types';

const systemConfigSchema = z.object({
  clinicName: z.string().optional(),
  clinicAddress: z.string().optional(),
  clinicPhone: z.string().optional(),
  clinicEmail: z.string().email('Invalid email address').optional().or(z.literal('')),
  timezone: z.string().optional(),
  dateFormat: z.string().optional(),
  timeFormat: z.string().optional(),
  currency: z.string().optional(),
  backupEnabled: z.boolean().optional(),
  backupFrequency: z.string().optional(),
  sessionTimeout: z.number().min(5).max(480).optional(),
});

type SystemConfigFormData = z.infer<typeof systemConfigSchema>;

export function SystemContent() {
  const { getSystemConfig, updateSystemConfig, isLoading, error } = useSettings();
  const [success, setSuccess] = useState<string | null>(null);
  const [config, setConfig] = useState<SystemConfig | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<SystemConfigFormData>({
    resolver: zodResolver(systemConfigSchema),
    defaultValues: config || undefined,
  });

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const data = await getSystemConfig();
        setConfig(data);
        reset(data);
      } catch (err) {
        console.error('Failed to load system config:', err);
      }
    };

    loadConfig();
  }, [getSystemConfig, reset]);

  const onSubmit = async (data: SystemConfigFormData) => {
    setSuccess(null);
    try {
      await updateSystemConfig(data);
      setSuccess('System configuration updated successfully');
    } catch (err) {
      console.error('Failed to update system config:', err);
    }
  };

  if (isLoading && !config) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">System Configuration</h1>
        <p className="text-gray-600 mt-1">Configure system-wide settings (Admin only)</p>
      </div>

      <div className="max-w-4xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Clinic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Clinic Information</CardTitle>
                <CardDescription>
                  Basic information about your clinic
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="clinicName">Clinic Name</Label>
                  <Input
                    id="clinicName"
                    {...register('clinicName')}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clinicAddress">Address</Label>
                  <Input
                    id="clinicAddress"
                    {...register('clinicAddress')}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="clinicPhone">Phone</Label>
                    <Input
                      id="clinicPhone"
                      {...register('clinicPhone')}
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="clinicEmail">Email</Label>
                    <Input
                      id="clinicEmail"
                      type="email"
                      {...register('clinicEmail')}
                      disabled={isSubmitting}
                    />
                    {errors.clinicEmail && (
                      <p className="text-sm text-red-600">{errors.clinicEmail.message}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Regional Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Regional Settings</CardTitle>
                <CardDescription>
                  Configure date, time, and currency formats
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select
                      id="timezone"
                      {...register('timezone')}
                      disabled={isSubmitting}
                    >
                      {TIMEZONE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select
                      id="currency"
                      {...register('currency')}
                      disabled={isSubmitting}
                    >
                      {CURRENCY_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="dateFormat">Date Format</Label>
                    <Select
                      id="dateFormat"
                      {...register('dateFormat')}
                      disabled={isSubmitting}
                    >
                      {DATE_FORMAT_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timeFormat">Time Format</Label>
                    <Select
                      id="timeFormat"
                      {...register('timeFormat')}
                      disabled={isSubmitting}
                    >
                      {TIME_FORMAT_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Configure security and session settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    min={5}
                    max={480}
                    {...register('sessionTimeout', { valueAsNumber: true })}
                    disabled={isSubmitting}
                  />
                  {errors.sessionTimeout && (
                    <p className="text-sm text-red-600">{errors.sessionTimeout.message}</p>
                  )}
                  <p className="text-sm text-gray-500">
                    Automatically log out users after inactivity (5-480 minutes)
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Backup Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Backup Settings</CardTitle>
                <CardDescription>
                  Configure automated backup settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="backupEnabled"
                    {...register('backupEnabled')}
                    disabled={isSubmitting}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="backupEnabled">Enable Automated Backups</Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="backupFrequency">Backup Frequency</Label>
                  <Select
                    id="backupFrequency"
                    {...register('backupFrequency')}
                    disabled={isSubmitting}
                  >
                    {BACKUP_FREQUENCY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </div>
              </CardContent>
            </Card>

            {error && (
              <Alert variant="error">
                {error}
              </Alert>
            )}

            {success && (
              <Alert className="bg-green-50 text-green-800 border-green-200">
                {success}
              </Alert>
            )}

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSubmitting ? 'Saving...' : 'Save Configuration'}
              </Button>
            </div>
          </form>
      </div>
    </div>
  );
}

