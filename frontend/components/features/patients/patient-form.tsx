'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem, RadioGroupLabel } from '@/components/ui/radio-group';
import { Form, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Gender, PatientStatus, type Patient, type CreatePatientInput, type UpdatePatientInput } from '@/types/patient.types';
import { Loader2 } from 'lucide-react';

const patientSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  middleName: z.string().optional(),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.nativeEnum(Gender),
  phone: z.string().regex(/^\+?[\d\s-]+$/, 'Invalid phone number format'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  address: z.string().optional(),
  photoUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  // Emergency Contact
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().regex(/^\+?[\d\s-]+$/, 'Invalid phone number format').optional().or(z.literal('')),
  emergencyContactRelation: z.string().optional(),
  // Medical Information
  bloodType: z.string().optional(),
  allergies: z.string().optional(),
  chronicConditions: z.string().optional(),
  currentMedications: z.string().optional(),
  familyHistory: z.string().optional(),
  // Insurance
  insuranceProvider: z.string().optional(),
  insuranceNumber: z.string().optional(),
  insurancePolicyExpiry: z.string().optional(),
  // Additional
  notes: z.string().optional(),
  status: z.nativeEnum(PatientStatus).optional(),
});

type PatientFormValues = z.infer<typeof patientSchema>;

interface PatientFormProps {
  patient?: Patient;
  onSubmit: (data: CreatePatientInput | UpdatePatientInput) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function PatientForm({ patient, onSubmit, onCancel, isLoading = false }: PatientFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: patient
      ? {
          firstName: patient.firstName,
          middleName: patient.middleName || '',
          lastName: patient.lastName,
          dateOfBirth: patient.dateOfBirth
            ? new Date(patient.dateOfBirth).toISOString().split('T')[0]
            : '',
          gender: patient.gender,
          phone: patient.phone,
          email: patient.email || '',
          address: patient.address || '',
          photoUrl: patient.photoUrl || '',
          emergencyContactName: patient.emergencyContactName || '',
          emergencyContactPhone: patient.emergencyContactPhone || '',
          emergencyContactRelation: patient.emergencyContactRelation || '',
          bloodType: patient.bloodType || '',
          allergies: patient.allergies?.join(', ') || '',
          chronicConditions: patient.chronicConditions?.join(', ') || '',
          currentMedications: patient.currentMedications?.join(', ') || '',
          familyHistory: patient.familyHistory || '',
          insuranceProvider: patient.insuranceProvider || '',
          insuranceNumber: patient.insuranceNumber || '',
          insurancePolicyExpiry: patient.insurancePolicyExpiry
            ? new Date(patient.insurancePolicyExpiry).toISOString().split('T')[0]
            : '',
          notes: patient.notes || '',
          status: patient.status,
        }
      : {
          gender: Gender.MALE,
          status: PatientStatus.ACTIVE,
        },
  });

  const handleSubmit = async (data: PatientFormValues) => {
    setIsSubmitting(true);
    try {
      // Convert comma-separated strings to arrays
      const allergies = data.allergies
        ? data.allergies.split(',').map((a) => a.trim()).filter(Boolean)
        : [];
      const chronicConditions = data.chronicConditions
        ? data.chronicConditions.split(',').map((c) => c.trim()).filter(Boolean)
        : [];
      const currentMedications = data.currentMedications
        ? data.currentMedications.split(',').map((m) => m.trim()).filter(Boolean)
        : [];

      const submitData: CreatePatientInput | UpdatePatientInput = {
        firstName: data.firstName,
        middleName: data.middleName || undefined,
        lastName: data.lastName,
        dateOfBirth: new Date(data.dateOfBirth),
        gender: data.gender,
        phone: data.phone,
        email: data.email || undefined,
        address: data.address || undefined,
        photoUrl: data.photoUrl || undefined,
        emergencyContactName: data.emergencyContactName || undefined,
        emergencyContactPhone: data.emergencyContactPhone || undefined,
        emergencyContactRelation: data.emergencyContactRelation || undefined,
        bloodType: data.bloodType || undefined,
        allergies: allergies.length > 0 ? allergies : undefined,
        chronicConditions: chronicConditions.length > 0 ? chronicConditions : undefined,
        currentMedications: currentMedications.length > 0 ? currentMedications : undefined,
        familyHistory: data.familyHistory || undefined,
        insuranceProvider: data.insuranceProvider || undefined,
        insuranceNumber: data.insuranceNumber || undefined,
        insurancePolicyExpiry: data.insurancePolicyExpiry
          ? new Date(data.insurancePolicyExpiry)
          : undefined,
        notes: data.notes || undefined,
        ...(patient && { status: data.status }),
      };

      await onSubmit(submitData);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form onSubmit={form.handleSubmit(handleSubmit)}>
      <div className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField name="firstName">
                <FormLabel required>First Name</FormLabel>
                <Input
                  {...form.register('firstName')}
                  placeholder="John"
                />
                <FormMessage>{form.formState.errors.firstName?.message}</FormMessage>
              </FormField>

              <FormField name="middleName">
                <FormLabel>Middle Name</FormLabel>
                <Input
                  {...form.register('middleName')}
                  placeholder="Michael (optional)"
                />
                <FormMessage>{form.formState.errors.middleName?.message}</FormMessage>
              </FormField>

              <FormField name="lastName">
                <FormLabel required>Last Name</FormLabel>
                <Input
                  {...form.register('lastName')}
                  placeholder="Doe"
                />
                <FormMessage>{form.formState.errors.lastName?.message}</FormMessage>
              </FormField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField name="dateOfBirth">
                <FormLabel required>Date of Birth</FormLabel>
                <Input
                  type="date"
                  {...form.register('dateOfBirth')}
                  max={new Date().toISOString().split('T')[0]}
                />
                <FormMessage>{form.formState.errors.dateOfBirth?.message}</FormMessage>
              </FormField>

              <FormField name="gender">
                <FormLabel required>Gender</FormLabel>
                <RadioGroup
                  value={form.watch('gender')}
                  onValueChange={(value) => form.setValue('gender', value as Gender)}
                  className="flex gap-6"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value={Gender.MALE} id="gender-male" />
                    <RadioGroupLabel htmlFor="gender-male">Male</RadioGroupLabel>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value={Gender.FEMALE} id="gender-female" />
                    <RadioGroupLabel htmlFor="gender-female">Female</RadioGroupLabel>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value={Gender.OTHER} id="gender-other" />
                    <RadioGroupLabel htmlFor="gender-other">Other</RadioGroupLabel>
                  </div>
                </RadioGroup>
                <FormMessage>{form.formState.errors.gender?.message}</FormMessage>
              </FormField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField name="phone">
                <FormLabel required>Phone Number</FormLabel>
                <Input
                  {...form.register('phone')}
                  placeholder="+1234567890"
                />
                <FormMessage>{form.formState.errors.phone?.message}</FormMessage>
              </FormField>

              <FormField name="email">
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  {...form.register('email')}
                  placeholder="john.doe@example.com"
                />
                <FormMessage>{form.formState.errors.email?.message}</FormMessage>
              </FormField>
            </div>

            <FormField name="address">
              <FormLabel>Address</FormLabel>
              <Textarea
                {...form.register('address')}
                placeholder="Street address, City, State, ZIP"
                rows={2}
              />
              <FormMessage>{form.formState.errors.address?.message}</FormMessage>
            </FormField>

            <FormField name="photoUrl">
              <FormLabel>Photo URL (optional)</FormLabel>
              <Input
                type="url"
                {...form.register('photoUrl')}
                placeholder="https://example.com/photo.jpg"
              />
              <FormMessage>{form.formState.errors.photoUrl?.message}</FormMessage>
            </FormField>

            {patient && (
              <FormField name="status">
                <FormLabel className="text-sm md:text-base">Status</FormLabel>
                <Select
                  value={form.watch('status')}
                  onValueChange={(value) => form.setValue('status', value as PatientStatus)}
                >
                  <SelectTrigger className="w-full h-10 text-sm md:text-base">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={PatientStatus.ACTIVE}>Active</SelectItem>
                    <SelectItem value={PatientStatus.INACTIVE}>Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage className="text-xs md:text-sm">{form.formState.errors.status?.message}</FormMessage>
              </FormField>
            )}
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        <Card>
          <CardHeader>
            <CardTitle>Emergency Contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField name="emergencyContactName">
                <FormLabel>Contact Name</FormLabel>
                <Input
                  {...form.register('emergencyContactName')}
                  placeholder="Jane Doe"
                />
                <FormMessage>{form.formState.errors.emergencyContactName?.message}</FormMessage>
              </FormField>

              <FormField name="emergencyContactPhone">
                <FormLabel>Contact Phone</FormLabel>
                <Input
                  {...form.register('emergencyContactPhone')}
                  placeholder="+1234567890"
                />
                <FormMessage>{form.formState.errors.emergencyContactPhone?.message}</FormMessage>
              </FormField>

              <FormField name="emergencyContactRelation">
                <FormLabel>Relationship</FormLabel>
                <Input
                  {...form.register('emergencyContactRelation')}
                  placeholder="Spouse, Parent, etc."
                />
                <FormMessage>{form.formState.errors.emergencyContactRelation?.message}</FormMessage>
              </FormField>
            </div>
          </CardContent>
        </Card>

        {/* Medical Information */}
        <Card>
          <CardHeader>
            <CardTitle>Medical Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField name="bloodType">
              <FormLabel className="text-sm md:text-base">Blood Type</FormLabel>
              <Select
                value={form.watch('bloodType') || ''}
                onValueChange={(value) => form.setValue('bloodType', value || undefined)}
              >
                <SelectTrigger className="w-full h-10 text-sm md:text-base">
                  <SelectValue placeholder="Select blood type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A+">A+</SelectItem>
                  <SelectItem value="A-">A-</SelectItem>
                  <SelectItem value="B+">B+</SelectItem>
                  <SelectItem value="B-">B-</SelectItem>
                  <SelectItem value="AB+">AB+</SelectItem>
                  <SelectItem value="AB-">AB-</SelectItem>
                  <SelectItem value="O+">O+</SelectItem>
                  <SelectItem value="O-">O-</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage className="text-xs md:text-sm">{form.formState.errors.bloodType?.message}</FormMessage>
            </FormField>

            <FormField name="allergies">
              <FormLabel>Allergies</FormLabel>
              <Textarea
                {...form.register('allergies')}
                placeholder="Enter allergies separated by commas (e.g., Penicillin, Peanuts, Latex)"
                rows={2}
              />
              <p className="text-xs text-gray-500 mt-1">Separate multiple allergies with commas</p>
              <FormMessage>{form.formState.errors.allergies?.message}</FormMessage>
            </FormField>

            <FormField name="chronicConditions">
              <FormLabel>Chronic Conditions</FormLabel>
              <Textarea
                {...form.register('chronicConditions')}
                placeholder="Enter conditions separated by commas (e.g., Diabetes, Hypertension, Asthma)"
                rows={2}
              />
              <p className="text-xs text-gray-500 mt-1">Separate multiple conditions with commas</p>
              <FormMessage>{form.formState.errors.chronicConditions?.message}</FormMessage>
            </FormField>

            <FormField name="currentMedications">
              <FormLabel>Current Medications</FormLabel>
              <Textarea
                {...form.register('currentMedications')}
                placeholder="Enter medications separated by commas"
                rows={2}
              />
              <p className="text-xs text-gray-500 mt-1">Separate multiple medications with commas</p>
              <FormMessage>{form.formState.errors.currentMedications?.message}</FormMessage>
            </FormField>

            <FormField name="familyHistory">
              <FormLabel>Family Medical History</FormLabel>
              <Textarea
                {...form.register('familyHistory')}
                placeholder="Enter relevant family medical history"
                rows={3}
              />
              <FormMessage>{form.formState.errors.familyHistory?.message}</FormMessage>
            </FormField>
          </CardContent>
        </Card>

        {/* Insurance Information */}
        <Card>
          <CardHeader>
            <CardTitle>Insurance Information (Optional)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField name="insuranceProvider">
                <FormLabel>Insurance Provider</FormLabel>
                <Input
                  {...form.register('insuranceProvider')}
                  placeholder="Insurance Company Name"
                />
                <FormMessage>{form.formState.errors.insuranceProvider?.message}</FormMessage>
              </FormField>

              <FormField name="insuranceNumber">
                <FormLabel>Insurance Number</FormLabel>
                <Input
                  {...form.register('insuranceNumber')}
                  placeholder="Policy Number"
                />
                <FormMessage>{form.formState.errors.insuranceNumber?.message}</FormMessage>
              </FormField>
            </div>

            <FormField name="insurancePolicyExpiry">
              <FormLabel>Policy Expiry Date</FormLabel>
              <Input
                type="date"
                {...form.register('insurancePolicyExpiry')}
              />
              <FormMessage>{form.formState.errors.insurancePolicyExpiry?.message}</FormMessage>
            </FormField>
          </CardContent>
        </Card>

        {/* Additional Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField name="notes">
              <FormLabel>Notes</FormLabel>
              <Textarea
                {...form.register('notes')}
                placeholder="Any additional notes about the patient"
                rows={4}
              />
              <FormMessage>{form.formState.errors.notes?.message}</FormMessage>
            </FormField>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end gap-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting || isLoading}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting || isLoading}>
            {(isSubmitting || isLoading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {patient ? 'Update Patient' : 'Register Patient'}
          </Button>
        </div>
      </div>
    </Form>
  );
}

