import { PrismaClient, Role, Gender, PatientStatus, VisitStatus, PrescriptionStatus, InvoiceStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // ============================================
  // CREATE USERS
  // ============================================

  // Create admin user
  const adminPassword = await bcrypt.hash('password', 12);
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
  const doctorPassword = await bcrypt.hash('password!', 12);
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
  const doctor2Password = await bcrypt.hash('password!', 12);
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
  const nursePassword = await bcrypt.hash('password!', 12);
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
  const receptionistPassword = await bcrypt.hash('password!', 12);
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
      middleName: 'Robert',
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
      middleName: 'Elena',
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
      middleName: 'James',
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
      middleName: 'Grace',
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
