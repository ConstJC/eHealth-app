import * as React from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

interface FormContextValue {
  errors?: Record<string, string[]>;
}

const FormContext = React.createContext<FormContextValue | undefined>(undefined);

interface FormProps {
  children: React.ReactNode;
  errors?: Record<string, string[]>;
  className?: string;
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
}

const Form = ({ children, errors, className, onSubmit, ...props }: FormProps) => {
  return (
    <FormContext.Provider value={{ errors }}>
      <form className={cn("space-y-4", className)} onSubmit={onSubmit} {...props}>
        {children}
      </form>
    </FormContext.Provider>
  );
};

interface FormFieldProps {
  children: React.ReactNode;
  name?: string;
  className?: string;
}

const FormField = ({ children, name, className }: FormFieldProps) => {
  const context = React.useContext(FormContext);
  const fieldErrors = name && context?.errors?.[name];

  return (
    <div className={cn("space-y-2", className)}>
      {children}
      {fieldErrors && fieldErrors.length > 0 && (
        <div className="text-sm text-red-600">
          {fieldErrors.map((error, index) => (
            <div key={index}>{error}</div>
          ))}
        </div>
      )}
    </div>
  );
};

interface FormItemProps {
  children: React.ReactNode;
  className?: string;
}

const FormItem = ({ children, className }: FormItemProps) => {
  return <div className={cn("space-y-2", className)}>{children}</div>;
};

interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

const FormLabel = React.forwardRef<HTMLLabelElement, FormLabelProps>(
  ({ className, required, children, ...props }, ref) => {
    return (
      <Label
        ref={ref}
        className={cn(className)}
        {...props}
      >
        {children}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
    );
  }
);
FormLabel.displayName = "FormLabel";

interface FormMessageProps {
  children?: React.ReactNode;
  className?: string;
}

const FormMessage = ({ children, className }: FormMessageProps) => {
  if (!children) return null;
  return (
    <p className={cn("text-sm text-red-600", className)}>{children}</p>
  );
};

export { Form, FormField, FormItem, FormLabel, FormMessage };

