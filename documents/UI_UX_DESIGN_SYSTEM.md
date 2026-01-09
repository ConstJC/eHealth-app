# 🎨 UI/UX Design System - eHealth EMR

**Designer:** UI/UX Expert  
**Created:** January 9, 2026  
**Status:** Design System Specification  
**Version:** 1.0

---

## 📋 Table of Contents

1. [Design Philosophy](#design-philosophy)
2. [Color System](#color-system)
3. [Typography](#typography)
4. [Component Library](#component-library)
5. [Layout Patterns](#layout-patterns)
6. [Healthcare-Specific UI](#healthcare-specific-ui)
7. [Accessibility](#accessibility)
8. [Responsive Design](#responsive-design)
9. [Implementation Guide](#implementation-guide)
10. [Design Tokens](#design-tokens)

---

## 🎯 Design Philosophy

### Core Principles

#### 1. **Clarity Over Creativity**
- **Healthcare Context:** Medical professionals need clear, unambiguous interfaces
- **No Ambiguity:** Every action should be obvious
- **Information Hierarchy:** Critical information must be immediately visible
- **Minimal Cognitive Load:** Reduce mental effort required to use the system

#### 2. **Efficiency First**
- **Speed Matters:** Every click saved = more time for patient care
- **Keyboard Navigation:** Power users should work without mouse
- **Quick Actions:** Common tasks accessible in 1-2 clicks
- **Smart Defaults:** Pre-fill forms with likely values

#### 3. **Trust & Reliability**
- **Consistent Patterns:** Same actions work the same way everywhere
- **Visual Feedback:** Always show what's happening (loading, saving, errors)
- **Error Prevention:** Prevent mistakes before they happen
- **Data Integrity:** Clear indication of saved vs. unsaved changes

#### 4. **Accessibility for All**
- **WCAG 2.1 AA Compliance:** Minimum standard
- **Keyboard Accessible:** All features usable without mouse
- **Screen Reader Friendly:** Proper ARIA labels
- **High Contrast:** Readable in all lighting conditions

#### 5. **Professional Medical Aesthetic**
- **Clean & Clinical:** Professional appearance builds trust
- **Calming Colors:** Reduce stress in high-pressure situations
- **Readable Typography:** Medical data must be crystal clear
- **Print-Ready:** Reports and prescriptions look professional when printed

---

## 🎨 Color System

### Primary Palette

#### Healthcare Blue (Primary)
```css
--primary-50: #eff6ff;   /* Lightest - backgrounds */
--primary-100: #dbeafe;
--primary-200: #bfdbfe;
--primary-300: #93c5fd;
--primary-400: #60a5fa;
--primary-500: #3b82f6;  /* Main brand color */
--primary-600: #2563eb;  /* Hover states */
--primary-700: #1d4ed8;  /* Active states */
--primary-800: #1e40af;
--primary-900: #1e3a8a;  /* Darkest */
```

**Usage:**
- Primary buttons
- Links
- Active navigation items
- Important highlights
- Brand elements

#### Medical Green (Success/Positive)
```css
--success-50: #f0fdf4;
--success-100: #dcfce7;
--success-500: #22c55e;  /* Success messages */
--success-600: #16a34a;  /* Completed status */
--success-700: #15803d;
```

**Usage:**
- Success messages
- Completed status indicators
- Positive actions
- Healthy vital signs

#### Alert Red (Danger/Warning)
```css
--danger-50: #fef2f2;
--danger-100: #fee2e2;
--danger-500: #ef4444;  /* Error messages */
--danger-600: #dc2626;  /* Critical alerts */
--danger-700: #b91c1c;
```

**Usage:**
- Error messages
- Critical alerts
- Abnormal vital signs
- Delete actions
- Required field indicators

#### Warning Amber (Caution)
```css
--warning-50: #fffbeb;
--warning-100: #fef3c7;
--warning-500: #f59e0b;  /* Warnings */
--warning-600: #d97706;  /* Attention needed */
```

**Usage:**
- Warning messages
- Pending actions
- Attention-required items
- Incomplete forms

### Neutral Palette

```css
--gray-50: #f9fafb;   /* Light backgrounds */
--gray-100: #f3f4f6;
--gray-200: #e5e7eb;  /* Borders */
--gray-300: #d1d5db;
--gray-400: #9ca3af;
--gray-500: #6b7280;  /* Secondary text */
--gray-600: #4b5563;  /* Body text */
--gray-700: #374151;  /* Headings */
--gray-800: #1f2937;  /* Dark text */
--gray-900: #111827;  /* Darkest text */
```

### Semantic Colors

```css
/* Status Colors */
--status-active: var(--success-500);
--status-inactive: var(--gray-400);
--status-pending: var(--warning-500);
--status-completed: var(--success-600);
--status-cancelled: var(--gray-500);

/* Vital Signs */
--vital-normal: var(--success-500);
--vital-elevated: var(--warning-500);
--vital-critical: var(--danger-500);

/* Visit Status */
--visit-in-progress: var(--primary-500);
--visit-completed: var(--success-600);
--visit-cancelled: var(--gray-500);
```

### Dark Mode Support

```css
/* Dark mode palette */
[data-theme="dark"] {
  --background: #0f172a;
  --foreground: #f1f5f9;
  --card: #1e293b;
  --card-foreground: #f1f5f9;
  --border: #334155;
  --input: #1e293b;
  --muted: #334155;
  --muted-foreground: #94a3b8;
}
```

**Recommendation:** Support dark mode but default to light mode for medical environments (better for reading printed materials).

---

## 📝 Typography

### Font System

#### Primary Font: Inter (or System Font Stack)
```css
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 
             'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
```

**Why Inter:**
- Excellent readability at all sizes
- Medical data clarity
- Professional appearance
- Good for both screen and print

#### Monospace Font: JetBrains Mono (for codes/IDs)
```css
--font-mono: 'JetBrains Mono', 'Courier New', monospace;
```

**Usage:**
- Patient IDs
- Invoice numbers
- Medical codes (ICD-10)
- Prescription numbers

### Type Scale

```css
/* Headings */
--text-4xl: 2.25rem;    /* 36px - Page titles */
--text-3xl: 1.875rem;   /* 30px - Section headers */
--text-2xl: 1.5rem;     /* 24px - Card titles */
--text-xl: 1.25rem;      /* 20px - Subsection headers */
--text-lg: 1.125rem;     /* 18px - Emphasized text */

/* Body */
--text-base: 1rem;      /* 16px - Default body text */
--text-sm: 0.875rem;    /* 14px - Secondary text */
--text-xs: 0.75rem;     /* 12px - Labels, captions */

/* Line Heights */
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.75;
```

### Typography Usage

#### Headings
- **H1 (text-4xl):** Page titles, dashboard headers
- **H2 (text-3xl):** Section headers, modal titles
- **H3 (text-2xl):** Card titles, form section headers
- **H4 (text-xl):** Subsection headers
- **H5 (text-lg):** Emphasized content

#### Body Text
- **Default (text-base):** All body content, forms, tables
- **Small (text-sm):** Helper text, metadata, timestamps
- **Extra Small (text-xs):** Labels, badges, captions

#### Medical Data Display
- **Vital Signs:** Use larger, bold numbers (text-2xl, font-semibold)
- **Patient Names:** text-lg, font-semibold
- **Medical Codes:** text-sm, font-mono
- **Dates/Times:** text-sm, font-mono

---

## 🧩 Component Library

### Base Components (shadcn/ui)

We'll use **shadcn/ui** as our base component library. Install these components:

#### Essential Components
```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add card
npx shadcn-ui@latest add table
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add select
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add skeleton
npx shadcn-ui@latest add form
npx shadcn-ui@latest add textarea
npx shadcn-ui@latest add checkbox
npx shadcn-ui@latest add radio-group
npx shadcn-ui@latest add switch
npx shadcn-ui@latest add separator
npx shadcn-ui@latest add alert
npx shadcn-ui@latest add progress
npx shadcn-ui@latest add calendar
npx shadcn-ui@latest add popover
```

### Healthcare-Specific Components

#### 1. Patient Card
```typescript
// components/features/patients/patient-card.tsx
- Patient photo/avatar
- Name (large, bold)
- Patient ID (monospace)
- Age, Gender
- Last visit date
- Quick actions (View, Edit, New Visit)
- Status badge
```

#### 2. Vital Signs Display
```typescript
// components/features/visits/vital-signs-display.tsx
- Grid layout (2-3 columns)
- Each vital: Label + Value + Unit
- Color coding (normal/elevated/critical)
- Trend indicators (↑ ↓ →)
- Timestamp
- Recorded by
```

#### 3. SOAP Notes Editor
```typescript
// components/features/visits/soap-note-editor.tsx
- Tabbed interface (S-O-A-P)
- Rich text editor (with formatting)
- Auto-save indicator
- Character count
- Template buttons
- Lock/unlock functionality
```

#### 4. Prescription Form
```typescript
// components/features/prescriptions/prescription-form.tsx
- Medication search (autocomplete)
- Dosage inputs
- Frequency selector
- Duration picker
- Allergy warnings (prominent alert)
- Drug interaction warnings
- Save/Print buttons
```

#### 5. Invoice/Payment Form
```typescript
// components/features/billing/invoice-form.tsx
- Service items table
- Add item button
- Discount input
- Tax calculation
- Payment method selector
- Receipt preview
- Print button
```

#### 6. Search Bar (Patient Search)
```typescript
// components/common/patient-search.tsx
- Large, prominent search input
- Autocomplete dropdown
- Recent searches
- Keyboard navigation (↑↓ Enter)
- Clear button
- Advanced filters toggle
```

#### 7. Data Table (Enhanced)
```typescript
// components/common/data-table.tsx
- Sortable columns
- Filterable rows
- Pagination
- Row selection
- Export button
- Print button
- Responsive (mobile cards)
```

#### 8. Status Badge
```typescript
// components/common/status-badge.tsx
- Color-coded status
- Icons (optional)
- Size variants
- Pulse animation for active status
```

#### 9. Loading States
```typescript
// components/common/loading-spinner.tsx
// components/common/skeleton-loader.tsx
- Full page loader
- Inline spinner
- Skeleton screens (better UX)
- Progress bars
```

#### 10. Error States
```typescript
// components/common/error-message.tsx
// components/common/empty-state.tsx
- Clear error messages
- Actionable error states
- Empty states with CTAs
- Retry buttons
```

---

## 📐 Layout Patterns

### 1. Dashboard Layout

```
┌─────────────────────────────────────────────────────────┐
│ Header (Logo, User Menu, Notifications)                 │
├──────────┬───────────────────────────────────────────────┤
│          │                                               │
│ Sidebar  │  Main Content Area                            │
│          │                                               │
│ - Nav    │  - Dashboard Cards                          │
│   Items  │  - Statistics                                │
│          │  - Recent Activity                           │
│ - Quick  │  - Quick Actions                             │
│   Actions│                                               │
│          │                                               │
└──────────┴───────────────────────────────────────────────┘
```

**Sidebar Width:** 256px (collapsible to 64px)  
**Header Height:** 64px  
**Content Padding:** 24px

### 2. Patient Detail Layout

```
┌─────────────────────────────────────────────────────────┐
│ Patient Header (Photo, Name, ID, Quick Actions)        │
├─────────────────────────────────────────────────────────┤
│ Tabs: Overview | Visits | Prescriptions | Billing     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Tab Content Area                                       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 3. Visit Documentation Layout

```
┌─────────────────────────────────────────────────────────┐
│ Visit Header (Patient Info, Visit Date, Status)          │
├──────────┬───────────────────────────────────────────────┤
│          │                                               │
│ Patient  │  Visit Documentation                         │
│ History  │                                               │
│ Sidebar  │  - Vital Signs                               │
│          │  - SOAP Notes (Tabs)                        │
│ - Recent │  - Prescriptions                            │
│   Visits │  - Diagnosis                                 │
│          │  - Attachments                              │
│ - Active │                                               │
│   Meds   │                                               │
│          │                                               │
└──────────┴───────────────────────────────────────────────┘
```

**Sidebar Width:** 320px (patient context)  
**Main Content:** Flexible width

### 4. Form Layout

```
┌─────────────────────────────────────────────────────────┐
│ Form Title                                              │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Section 1: Basic Information                           │
│  ┌─────────────────────────────────────┐               │
│  │ Field 1        │ Field 2           │               │
│  │ Field 3        │ Field 4           │               │
│  └─────────────────────────────────────┘               │
│                                                         │
│  Section 2: Additional Details                          │
│  ┌─────────────────────────────────────┐               │
│  │ Full-width field                    │               │
│  └─────────────────────────────────────┘               │
│                                                         │
│  [Cancel]                    [Save] [Save & Continue]   │
└─────────────────────────────────────────────────────────┘
```

**Form Width:** Max 800px (centered)  
**Section Spacing:** 32px  
**Field Spacing:** 16px

---

## 🏥 Healthcare-Specific UI

### 1. Vital Signs Display

**Design Requirements:**
- **Large Numbers:** Vital values must be easily readable
- **Color Coding:**
  - Green: Normal range
  - Yellow: Elevated/Abnormal
  - Red: Critical
- **Trend Indicators:** Show if improving/worsening
- **Comparison:** Show previous visit values

**Example:**
```
┌─────────────────────────────────────┐
│ Blood Pressure                       │
│ 120/80 mmHg    [Normal] ↑            │
│ Previous: 125/85 (3 days ago)       │
└─────────────────────────────────────┘
```

### 2. Allergy Warnings

**Design Requirements:**
- **Highly Visible:** Red background, white text
- **Persistent:** Show on prescription forms
- **Icon:** Warning icon
- **Action Required:** Cannot proceed without acknowledgment

**Example:**
```
┌─────────────────────────────────────┐
│ ⚠️ ALLERGY ALERT                     │
│ Patient is allergic to: Penicillin  │
│ [Acknowledge]                        │
└─────────────────────────────────────┘
```

### 3. Drug Interaction Warnings

**Design Requirements:**
- **Moderate Alert:** Yellow/amber background
- **Informative:** Explain the interaction
- **Actionable:** Suggest alternatives
- **Dismissible:** Can be overridden with reason

### 4. Patient Search

**Design Requirements:**
- **Fast:** Results appear as you type
- **Keyboard Navigation:** Arrow keys, Enter to select
- **Recent Patients:** Quick access
- **Multiple Search Methods:** Name, ID, Phone

### 5. SOAP Notes Interface

**Design Requirements:**
- **Tabbed Interface:** S-O-A-P tabs
- **Rich Text:** Formatting for clarity
- **Templates:** Quick insert common phrases
- **Auto-save:** Save every 30 seconds
- **Lock Indicator:** Show when notes are locked
- **Character Count:** For each section

### 6. Prescription Form

**Design Requirements:**
- **Medication Search:** Autocomplete with drug database
- **Dosage Calculator:** Help calculate correct dosage
- **Allergy Check:** Automatic cross-reference
- **Interaction Check:** Warn about interactions
- **Print Preview:** Show how prescription will look

### 7. Invoice/Payment

**Design Requirements:**
- **Clear Totals:** Large, bold final amount
- **Itemized List:** Easy to read
- **Payment Methods:** Clear selection
- **Receipt Preview:** Before printing
- **Print Optimized:** Clean layout for printing

---

## ♿ Accessibility

### WCAG 2.1 AA Compliance

#### 1. Color Contrast
- **Text:** Minimum 4.5:1 contrast ratio
- **Large Text:** Minimum 3:1 contrast ratio
- **Interactive Elements:** Minimum 3:1 contrast ratio

#### 2. Keyboard Navigation
- **Tab Order:** Logical flow
- **Focus Indicators:** Visible focus rings
- **Skip Links:** Skip to main content
- **Keyboard Shortcuts:** Documented and consistent

#### 3. Screen Readers
- **ARIA Labels:** All interactive elements
- **Alt Text:** All images
- **Form Labels:** Associated with inputs
- **Error Messages:** Linked to form fields
- **Live Regions:** For dynamic content

#### 4. Visual Accessibility
- **Font Size:** Minimum 16px for body text
- **Line Height:** Minimum 1.5
- **Spacing:** Adequate whitespace
- **Icons:** Always paired with text labels

#### 5. Focus Management
- **Focus Trapping:** In modals
- **Focus Restoration:** After closing modals
- **Focus Indicators:** High contrast

### Implementation Checklist

- [ ] All images have alt text
- [ ] All forms have labels
- [ ] All buttons have accessible names
- [ ] Color is not the only indicator
- [ ] Keyboard navigation works everywhere
- [ ] Screen reader testing completed
- [ ] Focus indicators visible
- [ ] Error messages accessible
- [ ] Skip links implemented
- [ ] ARIA landmarks used

---

## 📱 Responsive Design

### Breakpoints

```css
--breakpoint-sm: 640px;   /* Mobile */
--breakpoint-md: 768px;   /* Tablet */
--breakpoint-lg: 1024px;  /* Desktop */
--breakpoint-xl: 1280px;  /* Large Desktop */
--breakpoint-2xl: 1536px; /* Extra Large */
```

### Mobile (< 768px)

**Adaptations:**
- **Sidebar:** Hidden, accessible via hamburger menu
- **Tables:** Convert to cards
- **Forms:** Single column
- **Touch Targets:** Minimum 44x44px
- **Navigation:** Bottom navigation bar
- **Search:** Full-width, prominent

### Tablet (768px - 1024px)

**Adaptations:**
- **Sidebar:** Collapsible
- **Tables:** Horizontal scroll or cards
- **Forms:** 2 columns where appropriate
- **Touch-Friendly:** Larger buttons
- **Split View:** Patient history sidebar

### Desktop (> 1024px)

**Adaptations:**
- **Full Sidebar:** Always visible
- **Multi-column Layouts:** Optimal use of space
- **Hover States:** Full interaction
- **Keyboard Shortcuts:** Full support

---

## 🚀 Implementation Guide

### Step 1: Set Up Design System (Day 1)

1. **Install shadcn/ui**
   ```bash
   cd apps/frontend
   npx shadcn-ui@latest init
   ```

2. **Configure Tailwind with Design Tokens**
   Create `tailwind.config.ts`:
   ```typescript
   import type { Config } from "tailwindcss";

   const config: Config = {
     theme: {
       extend: {
         colors: {
           primary: {
             50: '#eff6ff',
             500: '#3b82f6',
             600: '#2563eb',
             // ... full palette
           },
           // ... other colors
         },
         fontFamily: {
           sans: ['Inter', 'system-ui', 'sans-serif'],
           mono: ['JetBrains Mono', 'monospace'],
         },
       },
     },
   };
   ```

3. **Create Design Tokens File**
   Create `lib/design-tokens.ts`:
   ```typescript
   export const designTokens = {
     colors: { /* ... */ },
     typography: { /* ... */ },
     spacing: { /* ... */ },
     // ...
   };
   ```

### Step 2: Create Base Components (Days 2-3)

1. **Install shadcn/ui Components**
   ```bash
   # Install all essential components
   npx shadcn-ui@latest add button input card table dialog
   # ... (see component list above)
   ```

2. **Customize Components**
   - Update colors to match design system
   - Adjust spacing and typography
   - Add healthcare-specific variants

3. **Create Healthcare Components**
   - Patient Card
   - Vital Signs Display
   - SOAP Notes Editor
   - Prescription Form
   - etc.

### Step 3: Create Layout Components (Days 4-5)

1. **Dashboard Layout**
   - Sidebar navigation
   - Header with user menu
   - Main content area
   - Responsive behavior

2. **Auth Layout**
   - Centered form layout
   - Branding
   - Simple, clean design

3. **Page Layouts**
   - Patient detail layout
   - Visit documentation layout
   - Form layouts

### Step 4: Implement Pages (Weeks 2-4)

Follow the implementation roadmap, using the design system consistently.

---

## 🎨 Design Tokens

### Complete Token System

```typescript
// lib/design-tokens.ts
export const tokens = {
  colors: {
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      // ... full scale
    },
    // ... all color scales
  },
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'monospace'],
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      // ... full scale
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
  spacing: {
    0: '0',
    1: '0.25rem',
    2: '0.5rem',
    // ... full scale
  },
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    md: '0.375rem',
    lg: '0.5rem',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
  },
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
};
```

---

## 📐 Component Specifications

### Button Variants

```typescript
// Primary: Main actions (Save, Submit)
<Button variant="default">Save</Button>

// Secondary: Secondary actions (Cancel, Back)
<Button variant="secondary">Cancel</Button>

// Destructive: Delete, Remove
<Button variant="destructive">Delete</Button>

// Outline: Less prominent actions
<Button variant="outline">Export</Button>

// Ghost: Subtle actions
<Button variant="ghost">View</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
```

### Form Input States

```typescript
// Normal
<Input placeholder="Enter text" />

// Error
<Input error="This field is required" />

// Disabled
<Input disabled />

// With Label
<Label>Patient Name</Label>
<Input />
```

### Status Badges

```typescript
<Badge variant="success">Active</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="danger">Critical</Badge>
<Badge variant="info">In Progress</Badge>
```

---

## 🎯 Design Principles in Practice

### 1. Information Hierarchy

**Example: Patient Card**
```
┌─────────────────────────────────────┐
│ [Photo]  John Doe          [Actions]│ ← Primary info
│          P2024-00001                │ ← Secondary info
│          Age: 45 | Male             │ ← Tertiary info
│          Last Visit: 3 days ago     │ ← Metadata
└─────────────────────────────────────┘
```

### 2. Progressive Disclosure

**Example: Patient Form**
- **Step 1:** Basic Information (Name, DOB, Contact)
- **Step 2:** Medical History (Allergies, Conditions)
- **Step 3:** Insurance (Optional)
- **Step 4:** Photo Upload (Optional)

### 3. Contextual Actions

**Example: Visit Page**
- **Top:** Primary actions (Save, Complete Visit)
- **Inline:** Contextual actions (Add Prescription, Add Note)
- **Bottom:** Secondary actions (Print, Export)

### 4. Feedback & Status

**Example: Save Action**
- **Before:** Button shows "Save"
- **During:** Button shows "Saving..." with spinner
- **After:** Toast notification "Saved successfully"
- **Error:** Toast notification "Error saving" with retry

---

## 🖼️ Visual Examples

### Login Page
- **Centered card** (max-width: 400px)
- **Logo** at top
- **Form fields** with labels
- **Primary button** for login
- **Link** for forgot password
- **Clean, minimal** design

### Dashboard
- **Statistics cards** (4-column grid on desktop)
- **Recent patients** list
- **Quick actions** buttons
- **Activity feed** (optional)

### Patient List
- **Search bar** at top (prominent)
- **Filter buttons** (Status, Date, etc.)
- **Patient cards** in grid (3 columns desktop)
- **Pagination** at bottom

### Patient Detail
- **Header** with photo, name, ID, quick actions
- **Tabs** for different sections
- **Content area** with relevant information
- **Sidebar** with related info (optional)

---

## ✅ Design Checklist

### Visual Design
- [ ] Color system defined and implemented
- [ ] Typography scale established
- [ ] Spacing system consistent
- [ ] Icon system chosen (Lucide React)
- [ ] Component library set up (shadcn/ui)
- [ ] Design tokens created

### Components
- [ ] All base components installed
- [ ] Healthcare-specific components created
- [ ] Components documented
- [ ] Components tested for accessibility
- [ ] Components responsive

### Layouts
- [ ] Dashboard layout designed
- [ ] Patient detail layout designed
- [ ] Visit documentation layout designed
- [ ] Form layouts designed
- [ ] Auth layouts designed

### Responsive
- [ ] Mobile breakpoints tested
- [ ] Tablet breakpoints tested
- [ ] Desktop layouts optimized
- [ ] Touch targets appropriate size

### Accessibility
- [ ] Color contrast checked
- [ ] Keyboard navigation works
- [ ] Screen reader tested
- [ ] ARIA labels added
- [ ] Focus management implemented

---

## 📚 Resources

### Design Tools
- **Figma:** For design mockups (optional)
- **Storybook:** For component documentation (recommended)
- **Chromatic:** For visual regression testing (optional)

### Icon Library
- **Lucide React:** Primary icon library
- **Usage:** `<Icon name="user" size={20} />`

### Font Loading
- **Next.js Font Optimization:** Use `next/font` for Inter
- **Google Fonts:** For additional fonts if needed

---

## 🎓 Design Guidelines Summary

1. **Clarity:** Every element should have a clear purpose
2. **Consistency:** Use the same patterns throughout
3. **Efficiency:** Minimize clicks and cognitive load
4. **Accessibility:** Design for all users
5. **Professional:** Maintain medical/clinical aesthetic
6. **Responsive:** Work on all devices
7. **Feedback:** Always show what's happening
8. **Error Prevention:** Prevent mistakes before they happen

---

**Design System Version:** 1.0  
**Last Updated:** January 9, 2026  
**Next Review:** After Phase 1 implementation

---

## 🚀 Quick Start Implementation

1. **Install shadcn/ui:**
   ```bash
   npx shadcn-ui@latest init
   ```

2. **Install all components:**
   ```bash
   npx shadcn-ui@latest add button input card table dialog
   # ... (see component list)
   ```

3. **Configure Tailwind:**
   - Update `tailwind.config.ts` with design tokens

4. **Create design tokens file:**
   - `lib/design-tokens.ts`

5. **Start building:**
   - Follow component specifications
   - Use layout patterns
   - Maintain consistency

---

**Ready to build a beautiful, accessible, and efficient healthcare EMR interface!** 🏥✨

