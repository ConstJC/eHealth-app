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

// Phone number validation: Maximum 11 digits
const phoneRegex = /^\d{1,11}$/;

// Email validation: Standard email format
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Name validation: Letters, spaces, hyphens, apostrophes only (2-50 characters)
const nameRegex = /^[a-zA-Z\s'-]{2,50}$/;

const patientSchema = z.object({
  firstName: z
    .string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must not exceed 50 characters')
    .regex(nameRegex, 'First name can only contain letters, spaces, hyphens, and apostrophes'),
  middleName: z
    .string()
    .max(50, 'Middle name must not exceed 50 characters')
    .refine(
      (name) => {
        if (!name || name === '') return true; // Optional field
        return nameRegex.test(name);
      },
      {
        message: 'Middle name can only contain letters, spaces, hyphens, and apostrophes (min 2 characters if provided)',
      }
    )
    .optional()
    .or(z.literal('')),
  lastName: z
    .string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must not exceed 50 characters')
    .regex(nameRegex, 'Last name can only contain letters, spaces, hyphens, and apostrophes'),
  dateOfBirth: z
    .string()
    .min(1, 'Date of birth is required')
    .refine(
      (date) => {
        const birthDate = new Date(date);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) 
          ? age - 1 
          : age;
        return birthDate <= today && actualAge >= 0 && actualAge <= 150;
      },
      {
        message: 'Date of birth must be a valid date in the past (age must be 0-150 years)',
      }
    ),
  gender: z.nativeEnum(Gender, {
    errorMap: () => ({ message: 'Please select a gender' }),
  }),
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .regex(phoneRegex, 'Phone number must be numeric and maximum 11 digits')
    .refine(
      (phone) => {
        const digits = phone.replace(/\D/g, '');
        return digits.length <= 11;
      },
      {
        message: 'Phone number must be maximum 11 digits',
      }
    ),
  email: z
    .string()
    .optional()
    .refine(
      (email) => {
        if (!email || email === '') return true; // Optional field
        return emailRegex.test(email) && email.length <= 255;
      },
      {
        message: 'Please enter a valid email address (max 255 characters)',
      }
    )
    .or(z.literal('')),
  address: z
    .string()
    .max(500, 'Address must not exceed 500 characters')
    .optional()
    .or(z.literal('')),
  // Emergency Contact
  emergencyContactName: z
    .string()
    .max(100, 'Emergency contact name must not exceed 100 characters')
    .regex(nameRegex, 'Name can only contain letters, spaces, hyphens, and apostrophes')
    .optional()
    .or(z.literal('')),
  emergencyContactPhone: z
    .string()
    .optional()
    .refine(
      (phone) => {
        if (!phone || phone === '') return true; // Optional field
        const digits = phone.replace(/\D/g, '');
        return digits.length <= 11;
      },
      {
        message: 'Emergency contact phone must be maximum 11 digits',
      }
    )
    .or(z.literal('')),
  emergencyContactRelation: z
    .string()
    .max(50, 'Relationship must not exceed 50 characters')
    .optional()
    .or(z.literal('')),
  // Medical Information
  bloodType: z
    .string()
    .optional()
    .or(z.literal('')),
  allergies: z
    .string()
    .max(1000, 'Allergies must not exceed 1000 characters')
    .optional()
    .or(z.literal('')),
  chronicConditions: z
    .string()
    .max(1000, 'Chronic conditions must not exceed 1000 characters')
    .optional()
    .or(z.literal('')),
  currentMedications: z
    .string()
    .max(1000, 'Current medications must not exceed 1000 characters')
    .optional()
    .or(z.literal('')),
  familyHistory: z
    .string()
    .max(2000, 'Family history must not exceed 2000 characters')
    .optional()
    .or(z.literal('')),
  // Insurance
  insuranceProvider: z
    .string()
    .max(200, 'Insurance provider must not exceed 200 characters')
    .optional()
    .or(z.literal('')),
  insuranceNumber: z
    .string()
    .max(100, 'Insurance number must not exceed 100 characters')
    .optional()
    .or(z.literal('')),
  insurancePolicyExpiry: z
    .string()
    .optional()
    .refine(
      (date) => {
        if (!date || date === '') return true; // Optional field
        const expiryDate = new Date(date);
        return !isNaN(expiryDate.getTime());
      },
      {
        message: 'Please enter a valid expiry date',
      }
    )
    .or(z.literal('')),
  // Additional
  notes: z
    .string()
    .max(5000, 'Notes must not exceed 5000 characters')
    .optional()
    .or(z.literal('')),
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField name="firstName">
                <FormLabel required>First Name</FormLabel>
                <Input
                  {...form.register('firstName')}
                  placeholder="John"
                />
                <FormMessage>{form.formState.errors.firstName?.message}</FormMessage>
              </FormField>

              <FormField name="middleName">
                <FormLabel>Middle Name (Optional)</FormLabel>
                <Input
                  {...form.register('middleName')}
                  placeholder="Michael"
                  maxLength={50}
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
                  placeholder="12345678901"
                  type="tel"
                  maxLength={11}
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
              <FormLabel>Address (Optional)</FormLabel>
              <Textarea
                {...form.register('address')}
                placeholder="Street address, City, State, ZIP"
                rows={2}
                maxLength={500}
              />
              <FormMessage>{form.formState.errors.address?.message}</FormMessage>
            </FormField>

            {patient && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>
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
                <FormLabel>Contact Phone (Optional)</FormLabel>
                <Input
                  {...form.register('emergencyContactPhone')}
                  placeholder="12345678901"
                  type="tel"
                  maxLength={11}
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            </div>

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
              <FormField name="insurancePolicyExpiry">
                <FormLabel>Policy Expiry Date</FormLabel>
                <Input
                  type="date"
                  {...form.register('insurancePolicyExpiry')}
                />
                <FormMessage>{form.formState.errors.insurancePolicyExpiry?.message}</FormMessage>
              </FormField>
            </div>
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

        {/* Form Actions - Fixed at bottom in drawer */}
        <div className="sticky bottom-0 -mx-6 -mb-6 mt-8 px-6 py-5 bg-gray-50/80 backdrop-blur-sm border-t border-gray-200 flex justify-end gap-3">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting || isLoading} className="min-w-[100px]">
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting || isLoading} className="min-w-[120px]">
            {(isSubmitting || isLoading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {patient ? 'Update Patient' : 'Register Patient'}
          </Button>
        </div>
      </div>
    </Form>
  );
}

