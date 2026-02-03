'use client';

import * as React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface SheetProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

interface SheetContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SheetContext = React.createContext<SheetContextValue | undefined>(undefined);

function useSheetContext() {
  const context = React.useContext(SheetContext);
  if (!context) {
    throw new Error('Sheet components must be used within Sheet');
  }
  return context;
}

const Sheet = ({ open = false, onOpenChange, children }: SheetProps) => {
  const [internalOpen, setInternalOpen] = React.useState(open);
  const [mounted, setMounted] = React.useState(false);
  const isControlled = onOpenChange !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  const setIsOpen = isControlled ? onOpenChange : setInternalOpen;

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (isControlled) {
      setInternalOpen(open);
    }
  }, [open, isControlled]);

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <SheetContext.Provider value={{ open: isOpen, onOpenChange: setIsOpen }}>
      {children}
    </SheetContext.Provider>,
    document.body
  );
};

interface SheetContentProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: 'left' | 'right';
  onClose?: () => void;
  showCloseButton?: boolean;
}

const SheetContent = React.forwardRef<HTMLDivElement, SheetContentProps>(
  ({ className, children, side = 'right', onClose, showCloseButton = true, ...props }, ref) => {
    const { onOpenChange } = useSheetContext();
    const contentRef = React.useRef<HTMLDivElement>(null);

    const handleClose = React.useCallback(() => {
      onOpenChange(false);
      onClose?.();
    }, [onOpenChange, onClose]);

    // Animation classes based on side
    const slideAnimation = side === 'right' 
      ? 'animate-in slide-in-from-right' 
      : 'animate-in slide-in-from-left';

    return (
      <div 
        className="fixed inset-0 z-80 flex items-stretch"
      >
        {/* Backdrop - Covers entire viewport including sidebar. 
            Note: Click outside is disabled to prevent accidental form data loss.
            Dialog only closes via close button, cancel button, or successful save. */}
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 z-80" />

        {/* Sheet Container with positioning */}
        <div 
          className={cn(
            "fixed inset-y-0 flex z-100 top-2",
            side === 'right' ? 'right-0' : 'left-0'
          )}
        >
          {/* Close button positioned outside the sheet on the left edge */}
          {showCloseButton && side === 'right' && (
            <div className="relative flex items-start pt-6 z-101">
              <Button
                variant="ghost"
                size="icon"
                className="absolute -left-12 top-1 h-10 w-10 rounded-full bg-white shadow-lg hover:bg-gray-100 transition-colors"
                onClick={handleClose}
              >
                <X className="h-5 w-5 text-gray-700" />
                <span className="sr-only">Close</span>
              </Button>
            </div>
          )}

          {/* Sheet Content - Increased width and fixed background bleed */}
          <div
            ref={contentRef}
            className={cn(
              "relative z-101 flex flex-col bg-white shadow-2xl overflow-hidden",
              // Increased widths optimized for tablets and laptops
              "w-[95vw] sm:w-[90vw] md:w-[75vw] md:max-w-[650px] lg:w-[65vw] lg:max-w-[750px] xl:w-[900px] 2xl:w-[1200px]",
              // Rounded corners with overflow hidden to prevent white background bleed
              side === 'right' ? 'rounded-l-3xl' : 'rounded-r-3xl',
              slideAnimation,
              "duration-300 ease-out",
              // Performance optimization
              "will-change-transform transform-gpu",
              className
            )}
            style={{
              // Hardware acceleration for smooth animations
              transform: 'translateZ(0)',
              backfaceVisibility: 'hidden',
              WebkitFontSmoothing: 'antialiased',
            }}
            {...props}
          >
            {children}
          </div>

          {/* Close button for left side */}
          {showCloseButton && side === 'left' && (
            <div className="relative flex items-start pt-6 z-101">
              <Button
                variant="ghost"
                size="icon"
                className="absolute -right-12 h-10 w-10 rounded-full bg-white shadow-lg hover:bg-gray-100 transition-colors"
                onClick={handleClose}
              >
                <X className="h-5 w-5 text-gray-700" />
                <span className="sr-only">Close</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }
);
SheetContent.displayName = "SheetContent";

const SheetHeader = React.memo(({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-2 px-6 py-4 border-b border-gray-200 bg-gray-50/50",
      className
    )}
    {...props}
  />
));
SheetHeader.displayName = "SheetHeader";

const SheetTitle = React.memo(React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn(
      "text-xl font-bold leading-none tracking-tight text-gray-900",
      className
    )}
    {...props}
  />
)));
SheetTitle.displayName = "SheetTitle";

const SheetDescription = React.memo(React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-gray-600", className)}
    {...props}
  />
)));
SheetDescription.displayName = "SheetDescription";

const SheetBody = React.memo(({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex-1 overflow-y-auto px-6 py-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent",
      className
    )}
    {...props}
  />
));
SheetBody.displayName = "SheetBody";

const SheetFooter = React.memo(({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end gap-3 px-6 py-5 border-t border-gray-200 bg-gray-50/30 sticky bottom-0 backdrop-blur-sm",
      className
    )}
    {...props}
  />
));
SheetFooter.displayName = "SheetFooter";

export {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetBody,
  SheetFooter,
};
