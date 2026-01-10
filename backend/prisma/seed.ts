import { PrismaClient, Role, Gender, PatientStatus, VisitType, VisitStatus, PrescriptionStatus, InvoiceStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // ============================================
  // CREATE USERS
  // ============================================

  // Create admin user
  const adminPassword = await bcrypt.hash('AdminPassword123!', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: Role.ADMIN,
      isEmailVerified: true,
      isActive: true,
    },
  });
  console.log('✅ Admin user created:', { id: admin.id, email: admin.email });

  // Create doctor
  const doctorPassword = await bcrypt.hash('DoctorPassword123!', 12);
  const doctor = await prisma.user.upsert({
    where: { email: 'dr.smith@example.com' },
    update: {},
    create: {
      email: 'dr.smith@example.com',
      password: doctorPassword,
      firstName: 'John',
      lastName: 'Smith',
      role: Role.DOCTOR,
      isEmailVerified: true,
      isActive: true,
    },
  });
  console.log('✅ Doctor created:', { id: doctor.id, email: doctor.email });

  // Create another doctor
  const doctor2Password = await bcrypt.hash('DoctorPassword123!', 12);
  const doctor2 = await prisma.user.upsert({
    where: { email: 'dr.johnson@example.com' },
    update: {},
    create: {
      email: 'dr.johnson@example.com',
      password: doctor2Password,
      firstName: 'Sarah',
      lastName: 'Johnson',
      role: Role.DOCTOR,
      isEmailVerified: true,
      isActive: true,
    },
  });
  console.log('✅ Doctor 2 created:', { id: doctor2.id, email: doctor2.email });

  // Create nurse
  const nursePassword = await bcrypt.hash('NursePassword123!', 12);
  const nurse = await prisma.user.upsert({
    where: { email: 'nurse.williams@example.com' },
    update: {},
    create: {
      email: 'nurse.williams@example.com',
      password: nursePassword,
      firstName: 'Mary',
      lastName: 'Williams',
      role: Role.NURSE,
      isEmailVerified: true,
      isActive: true,
    },
  });
  console.log('✅ Nurse created:', { id: nurse.id, email: nurse.email });

  // Create receptionist
  const receptionistPassword = await bcrypt.hash('ReceptionistPassword123!', 12);
  const receptionist = await prisma.user.upsert({
    where: { email: 'receptionist@example.com' },
    update: {},
    create: {
      email: 'receptionist@example.com',
      password: receptionistPassword,
      firstName: 'Emma',
      lastName: 'Davis',
      role: Role.RECEPTIONIST,
      isEmailVerified: true,
      isActive: true,
    },
  });
  console.log('✅ Receptionist created:', { id: receptionist.id, email: receptionist.email });

  // ============================================
  // CREATE MENU ITEMS
  // ============================================

  // Top-level menu items
  const topLevelMenuItems = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: 'LayoutDashboard',
      order: 0,
      roles: [Role.ADMIN, Role.DOCTOR, Role.NURSE, Role.RECEPTIONIST],
    },
    {
      label: 'Patients',
      href: '/patients',
      icon: 'Users',
      order: 1,
      roles: [Role.ADMIN, Role.DOCTOR, Role.NURSE, Role.RECEPTIONIST],
    },
    {
      label: 'Visits',
      href: '/visits',
      icon: 'FileText',
      order: 2,
      roles: [Role.ADMIN, Role.DOCTOR, Role.NURSE],
    },
    {
      label: 'Prescriptions',
      href: '/prescriptions',
      icon: 'Pill',
      order: 3,
      roles: [Role.ADMIN, Role.DOCTOR, Role.PHARMACIST],
    },
    {
      label: 'Billing',
      href: '/billing',
      icon: 'Receipt',
      order: 4,
      roles: [Role.ADMIN, Role.RECEPTIONIST],
    },
    {
      label: 'Reports',
      href: '/reports',
      icon: 'BarChart3',
      order: 5,
      roles: [Role.ADMIN, Role.DOCTOR],
    },
  ];

  // Settings sub-menu items (children of Settings)
  const settingsSubMenuItems = [
    {
      label: 'Users',
      href: '/settings/users',
      icon: 'Users',
      order: 0,
      roles: [Role.ADMIN],
    },
    {
      label: 'Menus',
      href: '/settings/menus',
      icon: 'Menu',
      order: 1,
      roles: [Role.ADMIN],
    },
    {
      label: 'Roles',
      href: '/settings/roles',
      icon: 'Shield',
      order: 2,
      roles: [Role.ADMIN],
    },
    {
      label: 'System',
      href: '/settings/system',
      icon: 'Settings',
      order: 3,
      roles: [Role.ADMIN],
    },
    {
      label: 'Audit Logs',
      href: '/settings/audit-logs',
      icon: 'FileText',
      order: 4,
      roles: [Role.ADMIN],
    },
  ];

  console.log('\n📋 Creating top-level menu items...');
  for (const menuItemData of topLevelMenuItems) {
    // Check if menu item already exists
    const existing = await prisma.menuItem.findFirst({
      where: {
        href: menuItemData.href,
        deletedAt: null,
      },
    });

    if (existing) {
      console.log(`⏭️  Menu item "${menuItemData.label}" already exists, skipping...`);
      continue;
    }

    // Create menu item
    const menuItem = await prisma.menuItem.create({
      data: {
        label: menuItemData.label,
        href: menuItemData.href,
        icon: menuItemData.icon,
        order: menuItemData.order,
        isActive: true,
      },
    });

    // Assign to roles
    for (const role of menuItemData.roles) {
      await prisma.roleMenu.create({
        data: {
          role,
          menuItemId: menuItem.id,
          isVisible: true,
        },
      });
    }

    console.log(`✅ Menu item "${menuItemData.label}" created and assigned to ${menuItemData.roles.length} role(s)`);
  }

  // Create Settings parent menu item
  console.log('\n📋 Creating Settings menu item...');
  let settingsMenuItem = await prisma.menuItem.findFirst({
    where: {
      href: '/settings',
      deletedAt: null,
    },
  });

  if (!settingsMenuItem) {
    settingsMenuItem = await prisma.menuItem.create({
      data: {
        label: 'Settings',
        href: '/settings',
        icon: 'Settings',
        order: 6,
        isActive: true,
      },
    });

    // Assign Settings to ADMIN role
    await prisma.roleMenu.create({
      data: {
        role: Role.ADMIN,
        menuItemId: settingsMenuItem.id,
        isVisible: true,
      },
    });

    console.log(`✅ Settings menu item created and assigned to ADMIN role`);
  } else {
    console.log(`⏭️  Settings menu item already exists, using existing...`);
  }

  // Create Settings sub-menu items
  console.log('\n📋 Creating Settings sub-menu items...');
  for (const subMenuItemData of settingsSubMenuItems) {
    // Check if sub-menu item already exists
    const existing = await prisma.menuItem.findFirst({
      where: {
        href: subMenuItemData.href,
        deletedAt: null,
      },
    });

    if (existing) {
      console.log(`⏭️  Sub-menu item "${subMenuItemData.label}" already exists, skipping...`);
      continue;
    }

    // Create sub-menu item with parentId
    const subMenuItem = await prisma.menuItem.create({
      data: {
        label: subMenuItemData.label,
        href: subMenuItemData.href,
        icon: subMenuItemData.icon,
        order: subMenuItemData.order,
        isActive: true,
        parentId: settingsMenuItem.id,
      },
    });

    // Assign to roles
    for (const role of subMenuItemData.roles) {
      await prisma.roleMenu.create({
        data: {
          role,
          menuItemId: subMenuItem.id,
          isVisible: true,
        },
      });
    }

    console.log(`✅ Sub-menu item "${subMenuItemData.label}" created under Settings and assigned to ${subMenuItemData.roles.length} role(s)`);
  }

  console.log('✅ Menu items seeding completed');

  // ============================================
  // CREATE PATIENTS
  // ============================================

  const currentYear = new Date().getFullYear();

  const patient1 = await prisma.patient.upsert({
    where: { patientId: `P${currentYear}00001` },
    update: {},
    create: {
      patientId: `P${currentYear}00001`,
      firstName: 'James',
      lastName: 'Anderson',
      dateOfBirth: new Date('1985-05-15'),
      gender: Gender.MALE,
      phone: '+1234567890',
      email: 'james.anderson@email.com',
      address: '123 Main Street, Springfield, IL 62701',
      emergencyContactName: 'Linda Anderson',
      emergencyContactPhone: '+1234567891',
      emergencyContactRelation: 'Spouse',
      bloodType: 'O+',
      allergies: ['Penicillin', 'Peanuts'],
      chronicConditions: ['Hypertension'],
      currentMedications: ['Lisinopril 10mg'],
      status: PatientStatus.ACTIVE,
    },
  });
  console.log('✅ Patient 1 created:', { id: patient1.id, patientId: patient1.patientId });

  const patient2 = await prisma.patient.upsert({
    where: { patientId: `P${currentYear}00002` },
    update: {},
    create: {
      patientId: `P${currentYear}00002`,
      firstName: 'Maria',
      lastName: 'Garcia',
      dateOfBirth: new Date('1992-08-22'),
      gender: Gender.FEMALE,
      phone: '+1234567892',
      email: 'maria.garcia@email.com',
      address: '456 Oak Avenue, Springfield, IL 62702',
      emergencyContactName: 'Carlos Garcia',
      emergencyContactPhone: '+1234567893',
      emergencyContactRelation: 'Father',
      bloodType: 'A+',
      allergies: [],
      chronicConditions: [],
      currentMedications: [],
      insuranceProvider: 'BlueCross BlueShield',
      insuranceNumber: 'BC123456789',
      status: PatientStatus.ACTIVE,
    },
  });
  console.log('✅ Patient 2 created:', { id: patient2.id, patientId: patient2.patientId });

  const patient3 = await prisma.patient.upsert({
    where: { patientId: `P${currentYear}00003` },
    update: {},
    create: {
      patientId: `P${currentYear}00003`,
      firstName: 'Robert',
      lastName: 'Thompson',
      dateOfBirth: new Date('1968-03-10'),
      gender: Gender.MALE,
      phone: '+1234567894',
      email: 'robert.thompson@email.com',
      address: '789 Elm Street, Springfield, IL 62703',
      emergencyContactName: 'Susan Thompson',
      emergencyContactPhone: '+1234567895',
      emergencyContactRelation: 'Spouse',
      bloodType: 'B+',
      allergies: ['Sulfa drugs'],
      chronicConditions: ['Type 2 Diabetes', 'Hypertension', 'High Cholesterol'],
      currentMedications: ['Metformin 500mg', 'Atorvastatin 20mg', 'Amlodipine 5mg'],
      insuranceProvider: 'Medicare',
      insuranceNumber: 'MED987654321',
      status: PatientStatus.ACTIVE,
    },
  });
  console.log('✅ Patient 3 created:', { id: patient3.id, patientId: patient3.patientId });

  const patient4 = await prisma.patient.upsert({
    where: { patientId: `P${currentYear}00004` },
    update: {},
    create: {
      patientId: `P${currentYear}00004`,
      firstName: 'Emily',
      lastName: 'Chen',
      dateOfBirth: new Date('2000-11-05'),
      gender: Gender.FEMALE,
      phone: '+1234567896',
      email: 'emily.chen@email.com',
      address: '321 Pine Road, Springfield, IL 62704',
      emergencyContactName: 'David Chen',
      emergencyContactPhone: '+1234567897',
      emergencyContactRelation: 'Father',
      bloodType: 'AB+',
      allergies: [],
      chronicConditions: [],
      currentMedications: [],
      status: PatientStatus.ACTIVE,
    },
  });
  console.log('✅ Patient 4 created:', { id: patient4.id, patientId: patient4.patientId });

  // ============================================
  // CREATE VISITS
  // ============================================

  // Visit 1 - Completed visit for Patient 1
  const visit1 = await prisma.visit.create({
    data: {
      patientId: patient1.id,
      doctorId: doctor.id,
      visitDate: new Date('2024-01-15T10:00:00'),
      visitType: VisitType.ROUTINE,
      status: VisitStatus.COMPLETED,
      bloodPressureSystolic: 140,
      bloodPressureDiastolic: 90,
      heartRate: 75,
      respiratoryRate: 16,
      temperature: 36.8,
      oxygenSaturation: 98,
      weight: 82.5,
      height: 175,
      bmi: 26.9,
      painScale: 2,
      vitalSignsRecordedBy: nurse.id,
      vitalSignsRecordedAt: new Date('2024-01-15T09:45:00'),
      chiefComplaint: 'Follow-up for hypertension',
      subjective: 'Patient reports occasional headaches. Taking medications regularly. No chest pain or shortness of breath.',
      objective: 'BP slightly elevated at 140/90. Heart sounds normal. Lungs clear bilaterally.',
      assessment: 'Hypertension, not optimally controlled',
      plan: 'Increase Lisinopril to 20mg daily. Follow-up in 4 weeks. Continue monitoring BP at home.',
      primaryDiagnosis: 'Essential Hypertension',
      secondaryDiagnoses: [],
      isLocked: true,
      lockedAt: new Date('2024-01-15T10:30:00'),
      lockedBy: doctor.id,
    },
  });
  console.log('✅ Visit 1 created:', { id: visit1.id });

  // Visit 2 - In progress visit for Patient 2
  const visit2 = await prisma.visit.create({
    data: {
      patientId: patient2.id,
      doctorId: doctor.id,
      visitDate: new Date(),
      visitType: VisitType.ROUTINE,
      status: VisitStatus.IN_PROGRESS,
      bloodPressureSystolic: 118,
      bloodPressureDiastolic: 76,
      heartRate: 72,
      respiratoryRate: 14,
      temperature: 36.6,
      oxygenSaturation: 99,
      weight: 62.0,
      height: 165,
      bmi: 22.8,
      painScale: 0,
      vitalSignsRecordedBy: nurse.id,
      vitalSignsRecordedAt: new Date(),
      chiefComplaint: 'Annual checkup',
      subjective: 'Patient feels well. No complaints. Maintaining healthy lifestyle.',
    },
  });
  console.log('✅ Visit 2 created:', { id: visit2.id });

  // Visit 3 - Completed visit for Patient 3
  const visit3 = await prisma.visit.create({
    data: {
      patientId: patient3.id,
      doctorId: doctor2.id,
      visitDate: new Date('2024-01-20T14:00:00'),
      visitType: VisitType.FOLLOWUP,
      status: VisitStatus.COMPLETED,
      bloodPressureSystolic: 135,
      bloodPressureDiastolic: 85,
      heartRate: 78,
      respiratoryRate: 15,
      temperature: 36.7,
      oxygenSaturation: 97,
      weight: 95.5,
      height: 178,
      bmi: 30.1,
      painScale: 1,
      vitalSignsRecordedBy: nurse.id,
      vitalSignsRecordedAt: new Date('2024-01-20T13:45:00'),
      chiefComplaint: 'Diabetes follow-up and medication review',
      subjective: 'Patient reports good blood sugar control. Checking levels twice daily. No hypoglycemic episodes.',
      objective: 'BP 135/85, slightly elevated. Weight stable. HbA1c results from last week show 7.2%.',
      assessment: 'Type 2 Diabetes Mellitus - adequately controlled. Hypertension - stable.',
      plan: 'Continue current medications. Encourage weight loss. Lab work in 3 months. Follow-up in 3 months.',
      primaryDiagnosis: 'Type 2 Diabetes Mellitus',
      secondaryDiagnoses: ['Essential Hypertension', 'Hyperlipidemia'],
      followUpDate: new Date('2024-04-20'),
      followUpReason: 'Diabetes management and lab review',
      isLocked: true,
      lockedAt: new Date('2024-01-20T14:45:00'),
      lockedBy: doctor2.id,
    },
  });
  console.log('✅ Visit 3 created:', { id: visit3.id });

  // ============================================
  // CREATE PRESCRIPTIONS
  // ============================================

  const prescription1 = await prisma.prescription.create({
    data: {
      patientId: patient1.id,
      visitId: visit1.id,
      doctorId: doctor.id,
      medicationName: 'Lisinopril',
      genericName: 'Lisinopril',
      brandName: 'Prinivil',
      dosage: '20mg',
      frequency: 'Once daily',
      route: 'Oral',
      duration: '90 days',
      quantity: '90 tablets',
      refills: 3,
      instructions: 'Take one tablet by mouth once daily in the morning',
      status: PrescriptionStatus.ACTIVE,
    },
  });
  console.log('✅ Prescription 1 created:', { id: prescription1.id });

  const prescription2 = await prisma.prescription.create({
    data: {
      patientId: patient3.id,
      visitId: visit3.id,
      doctorId: doctor2.id,
      medicationName: 'Metformin',
      genericName: 'Metformin HCl',
      brandName: 'Glucophage',
      dosage: '500mg',
      frequency: 'Twice daily',
      route: 'Oral',
      duration: '90 days',
      quantity: '180 tablets',
      refills: 3,
      instructions: 'Take one tablet by mouth twice daily with meals',
      status: PrescriptionStatus.ACTIVE,
    },
  });
  console.log('✅ Prescription 2 created:', { id: prescription2.id });

  const prescription3 = await prisma.prescription.create({
    data: {
      patientId: patient3.id,
      visitId: visit3.id,
      doctorId: doctor2.id,
      medicationName: 'Atorvastatin',
      genericName: 'Atorvastatin',
      brandName: 'Lipitor',
      dosage: '20mg',
      frequency: 'Once daily',
      route: 'Oral',
      duration: '90 days',
      quantity: '90 tablets',
      refills: 3,
      instructions: 'Take one tablet by mouth once daily at bedtime',
      status: PrescriptionStatus.ACTIVE,
    },
  });
  console.log('✅ Prescription 3 created:', { id: prescription3.id });

  // ============================================
  // CREATE INVOICES
  // ============================================

  const invoice1 = await prisma.invoice.upsert({
    where: { invoiceNumber: `INV-${currentYear}-00001` },
    update: {},
    create: {
      invoiceNumber: `INV-${currentYear}-00001`,
      patientId: patient1.id,
      visitId: visit1.id,
      items: [
        {
          description: 'General Consultation',
          quantity: 1,
          unitPrice: 100.00,
          total: 100.00,
        },
      ],
      subtotal: 100.00,
      discount: 0,
      tax: 0,
      total: 100.00,
      amountPaid: 100.00,
      balance: 0,
      status: InvoiceStatus.PAID,
      payments: [
        {
          date: new Date('2024-01-15T10:45:00').toISOString(),
          amount: 100.00,
          method: 'Credit Card',
          receiptNo: 'REC-001',
          recordedBy: receptionist.id,
        },
      ],
      billedBy: receptionist.id,
      billedAt: new Date('2024-01-15T10:35:00'),
    },
  });
  console.log('✅ Invoice 1 created:', { id: invoice1.id, invoiceNumber: invoice1.invoiceNumber });

  const invoice2 = await prisma.invoice.upsert({
    where: { invoiceNumber: `INV-${currentYear}-00002` },
    update: {},
    create: {
      invoiceNumber: `INV-${currentYear}-00002`,
      patientId: patient3.id,
      visitId: visit3.id,
      items: [
        {
          description: 'Follow-up Consultation',
          quantity: 1,
          unitPrice: 80.00,
          total: 80.00,
        },
        {
          description: 'Medication Review',
          quantity: 1,
          unitPrice: 30.00,
          total: 30.00,
        },
      ],
      subtotal: 110.00,
      discount: 10.00,
      discountReason: 'Senior citizen discount',
      tax: 0,
      total: 100.00,
      amountPaid: 50.00,
      balance: 50.00,
      status: InvoiceStatus.PARTIAL,
      payments: [
        {
          date: new Date('2024-01-20T15:00:00').toISOString(),
          amount: 50.00,
          method: 'Cash',
          receiptNo: 'REC-002',
          recordedBy: receptionist.id,
        },
      ],
      billedBy: receptionist.id,
      billedAt: new Date('2024-01-20T14:50:00'),
    },
  });
  console.log('✅ Invoice 2 created:', { id: invoice2.id, invoiceNumber: invoice2.invoiceNumber });

  const invoice3 = await prisma.invoice.upsert({
    where: { invoiceNumber: `INV-${currentYear}-00003` },
    update: {},
    create: {
      invoiceNumber: `INV-${currentYear}-00003`,
      patientId: patient2.id,
      visitId: visit2.id,
      items: [
        {
          description: 'Annual Physical Examination',
          quantity: 1,
          unitPrice: 150.00,
          total: 150.00,
        },
      ],
      subtotal: 150.00,
      discount: 0,
      tax: 0,
      total: 150.00,
      amountPaid: 0,
      balance: 150.00,
      status: InvoiceStatus.UNPAID,
      payments: [],
      billedBy: receptionist.id,
      billedAt: new Date(),
    },
  });
  console.log('✅ Invoice 3 created:', { id: invoice3.id, invoiceNumber: invoice3.invoiceNumber });

  console.log('\n🎉 Database seeding completed successfully!');
  console.log('\n📋 Test Accounts:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Admin:        admin@example.com / AdminPassword123!');
  console.log('Doctor 1:     dr.smith@example.com / DoctorPassword123!');
  console.log('Doctor 2:     dr.johnson@example.com / DoctorPassword123!');
  console.log('Nurse:        nurse.williams@example.com / NursePassword123!');
  console.log('Receptionist: receptionist@example.com / ReceptionistPassword123!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n📊 Sample Data Created:');
  console.log(`- 5 Users (1 Admin, 2 Doctors, 1 Nurse, 1 Receptionist)`);
  console.log(`- ${topLevelMenuItems.length} Top-level Menu Items (with role assignments)`);
  console.log(`- 1 Settings Menu Item (parent)`);
  console.log(`- ${settingsSubMenuItems.length} Settings Sub-menu Items (Users, Menus, Roles, System, Audit Logs)`);
  console.log(`- 4 Patients`);
  console.log(`- 3 Visits (2 completed, 1 in progress)`);
  console.log(`- 3 Prescriptions`);
  console.log(`- 3 Invoices (1 paid, 1 partial, 1 unpaid)`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
