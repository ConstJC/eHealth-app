'use client';

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

interface DropdownMenuContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.MutableRefObject<HTMLElement | null>;
}

const DropdownMenuContext = React.createContext<DropdownMenuContextValue | undefined>(undefined);

const DropdownMenu = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    if (open) {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        if (!target.closest('[data-dropdown-menu]')) {
          setOpen(false);
        }
      };

      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          setOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [open]);

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen, triggerRef }}>
      <div className="relative" data-dropdown-menu>
        {children}
      </div>
    </DropdownMenuContext.Provider>
  );
};

const DropdownMenuTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }
>(({ className, children, asChild, ...props }, ref) => {
  const { setOpen, triggerRef } = React.useContext(DropdownMenuContext)!;
  const internalRef = React.useRef<HTMLButtonElement>(null);

  // Combine refs
  React.useImperativeHandle(ref, () => internalRef.current as HTMLButtonElement);
  
  // Store trigger ref for positioning
  React.useEffect(() => {
    if (internalRef.current) {
      triggerRef.current = internalRef.current;
    }
  }, []);

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...props,
      onClick: (e: React.MouseEvent<Element, MouseEvent>) => {
        setOpen(true);
        // Store ref after click
        const target = e.currentTarget as HTMLElement;
        if (target) {
          triggerRef.current = target;
        }
        props.onClick?.(e as React.MouseEvent<HTMLButtonElement, MouseEvent>);
      },
    } as React.HTMLAttributes<HTMLElement>);
  }

  return (
    <button
      ref={internalRef}
      className={className}
      onClick={() => setOpen(true)}
      {...props}
    >
      {children}
    </button>
  );
});
DropdownMenuTrigger.displayName = "DropdownMenuTrigger";

const DropdownMenuContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { align?: 'start' | 'end'; mobileFullScreen?: boolean; useFixed?: boolean }
>(({ className, align = 'start', mobileFullScreen = false, useFixed = false, children, ...props }, ref) => {
  const { open, setOpen, triggerRef } = React.useContext(DropdownMenuContext)!;
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [position, setPosition] = React.useState<{ left?: number; right?: number; top?: number }>({});
  const [isMobile, setIsMobile] = React.useState(false);

  // Combine refs
  React.useImperativeHandle(ref, () => contentRef.current as HTMLDivElement);

  // Check if mobile
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Calculate viewport-aware positioning
  React.useEffect(() => {
    if (open && !isMobile) {
      const calculatePosition = () => {
        if (useFixed && triggerRef.current) {
          // Use fixed positioning relative to trigger
          const triggerRect = triggerRef.current.getBoundingClientRect();
          const viewportWidth = window.innerWidth;
          const viewportHeight = window.innerHeight;
          const dropdownWidth = 224; // min-w-56 = 224px
          const newPosition: { left?: number; right?: number; top?: number } = {};

          if (align === 'start') {
            // Position to the right of trigger
            const leftPos = triggerRect.right + 8;
            if (leftPos + dropdownWidth > viewportWidth - 16) {
              // Would overflow, position to the left instead
              newPosition.right = viewportWidth - triggerRect.left + 8;
              newPosition.left = undefined;
            } else {
              newPosition.left = leftPos;
              newPosition.right = undefined;
            }
          } else {
            // Position to the left of trigger
            const rightPos = viewportWidth - triggerRect.left + 8;
            if (triggerRect.left - dropdownWidth < 16) {
              // Would overflow, position to the right instead
              newPosition.left = triggerRect.right + 8;
              newPosition.right = undefined;
            } else {
              newPosition.right = rightPos;
              newPosition.left = undefined;
            }
          }

          // Vertical positioning
          newPosition.top = triggerRect.top;
          
          // Check vertical overflow
          if (contentRef.current) {
            const estimatedHeight = contentRef.current.scrollHeight || 200;
            if (triggerRect.top + estimatedHeight > viewportHeight - 16) {
              newPosition.top = Math.max(16, viewportHeight - estimatedHeight - 16);
            }
          }

          setPosition(newPosition);
        } else if (contentRef.current) {
          // Use absolute positioning with overflow detection
          const rect = contentRef.current.getBoundingClientRect();
          const viewportWidth = window.innerWidth;
          const viewportHeight = window.innerHeight;
          const newPosition: { left?: number; right?: number; top?: number } = {};

          // Check horizontal overflow
          if (align === 'start') {
            const rightEdge = rect.right;
            if (rightEdge > viewportWidth - 16) {
              newPosition.right = 0;
              newPosition.left = undefined;
            } else {
              newPosition.left = undefined;
              newPosition.right = undefined;
            }
          } else {
            const leftEdge = rect.left;
            if (leftEdge < 16) {
              newPosition.left = 0;
              newPosition.right = undefined;
            } else {
              newPosition.left = undefined;
              newPosition.right = undefined;
            }
          }

          // Check vertical overflow
          const bottomEdge = rect.bottom;
          if (bottomEdge > viewportHeight - 16) {
            const overflow = bottomEdge - viewportHeight + 16;
            newPosition.top = -overflow;
          }

          setPosition(newPosition);
        }
      };

      const timer = setTimeout(calculatePosition, 0);
      requestAnimationFrame(calculatePosition);
      
      return () => clearTimeout(timer);
    } else {
      setPosition({});
    }
  }, [open, align, isMobile, useFixed]);

  if (!open) return null;

  const isMobileFullScreen = isMobile && mobileFullScreen;

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileFullScreen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}
      <div
        ref={contentRef}
        className={cn(
          "z-[60] min-w-32 overflow-hidden bg-white text-gray-950",
          "shadow-xl",
          "transition-all duration-200 ease-out",
          open ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-[-4px]",
          isMobileFullScreen
            ? "fixed inset-x-4 top-1/2 -translate-y-1/2 max-h-[80vh] overflow-y-auto rounded-xl border border-gray-200"
            : useFixed
            ? "fixed rounded-lg border border-gray-200"
            : cn(
                "absolute rounded-lg border border-gray-200",
                align === 'end' ? 'right-0' : 'left-0',
                "mt-2"
              ),
          className
        )}
        style={{
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          ...position,
        }}
        role="menu"
        aria-orientation="vertical"
        {...props}
      >
        {children}
      </div>
    </>
  );
});
DropdownMenuContent.displayName = "DropdownMenuContent";

const DropdownMenuItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { index?: number }
>(({ className, children, onClick, index = 0, ...props }, ref) => {
  const { setOpen, open } = React.useContext(DropdownMenuContext)!;
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      // Stagger animation delay
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, index * 30);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [open, index]);

  return (
    <div
      ref={ref}
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-lg px-3 py-2.5 text-sm outline-none min-h-[44px]",
        "transition-all duration-150 ease-in-out",
        "hover:bg-blue-50 hover:text-blue-700",
        "focus:bg-blue-50 focus:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1",
        "active:bg-blue-100 active:scale-[0.98]",
        "data-disabled:pointer-events-none data-disabled:opacity-50",
        isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2",
        className
      )}
      role="menuitem"
      tabIndex={0}
      onClick={(e) => {
        onClick?.(e);
        setOpen(false);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.(e as any);
          setOpen(false);
        }
      }}
      {...props}
    >
      {children}
    </div>
  );
});
DropdownMenuItem.displayName = "DropdownMenuItem";

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
};

