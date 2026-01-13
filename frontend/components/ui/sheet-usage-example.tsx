/**
 * Sheet Component Usage Examples
 * 
 * The Sheet component is a flexible drawer/slide-over that can be used
 * for forms, details panels, filters, and more.
 */

'use client';

import { useState } from 'react';
import { Button } from './button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetBody,
  SheetFooter,
} from './sheet';

// Example 1: Basic Right-Side Drawer
export function BasicSheetExample() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Sheet</Button>
      
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Sheet Title</SheetTitle>
            <SheetDescription>
              This is a description of what this sheet is for.
            </SheetDescription>
          </SheetHeader>
          
          <SheetBody>
            <p>Your content goes here...</p>
          </SheetBody>
          
          <SheetFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setOpen(false)}>
              Save
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}

// Example 2: Left-Side Drawer (for navigation or filters)
export function LeftSheetExample() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Left Sheet</Button>
      
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
            <SheetDescription>
              Filter and sort your data
            </SheetDescription>
          </SheetHeader>
          
          <SheetBody>
            {/* Filter controls */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Status</label>
                <select className="w-full mt-1 p-2 border rounded">
                  <option>All</option>
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
              </div>
            </div>
          </SheetBody>
          
          <SheetFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Clear
            </Button>
            <Button onClick={() => setOpen(false)}>
              Apply Filters
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}

// Example 3: Form with Controlled State
export function FormSheetExample() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Submit logic here
    console.log('Submitting:', formData);
    setOpen(false);
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>Add User</Button>
      
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Add New User</SheetTitle>
            <SheetDescription>
              Enter the user's information below.
            </SheetDescription>
          </SheetHeader>
          
          <SheetBody>
            <form id="user-form" onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  className="w-full p-2 border rounded"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
            </form>
          </SheetBody>
          
          <SheetFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="user-form">
              Save User
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}

// Example 4: Details Panel (View-only)
export function DetailsPanelExample() {
  const [open, setOpen] = useState(false);
  const [selectedItem] = useState({
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
  });

  return (
    <>
      <Button onClick={() => setOpen(true)}>View Details</Button>
      
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" showCloseButton={true}>
          <SheetHeader>
            <SheetTitle>{selectedItem.name}</SheetTitle>
            <SheetDescription>User Details</SheetDescription>
          </SheetHeader>
          
          <SheetBody>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">ID</p>
                <p className="font-medium">{selectedItem.id}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{selectedItem.email}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">{selectedItem.phone}</p>
              </div>
            </div>
          </SheetBody>
          
          <SheetFooter>
            <Button onClick={() => setOpen(false)}>Close</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}

// Example 5: Without Footer (Simple Content)
export function SimpleSheetExample() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Simple Sheet</Button>
      
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Information</SheetTitle>
            <SheetDescription>Important details</SheetDescription>
          </SheetHeader>
          
          <SheetBody>
            <div className="prose">
              <p>This is a simple sheet without a footer.</p>
              <p>The close button in the header is enough for dismissal.</p>
            </div>
          </SheetBody>
        </SheetContent>
      </Sheet>
    </>
  );
}

/**
 * Props Reference:
 * 
 * Sheet:
 * - open: boolean - Controls visibility
 * - onOpenChange: (open: boolean) => void - Callback when state changes
 * 
 * SheetContent:
 * - side: 'left' | 'right' - Which side to slide from (default: 'right')
 * - showCloseButton: boolean - Show/hide close button (default: true)
 * - onClose: () => void - Additional callback when closed
 * - className: string - Additional styles
 * 
 * SheetHeader, SheetTitle, SheetDescription, SheetBody, SheetFooter:
 * - All accept standard HTML div/heading/p props
 * - className prop for custom styling
 */
