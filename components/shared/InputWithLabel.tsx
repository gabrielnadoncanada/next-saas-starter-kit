'use client';
import { Input } from '@/lib/components/ui/input';
import { Label } from '@/lib/components/ui/label';
import { cn } from '@/lib/lib/utils';

interface InputWithLabelProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string | React.ReactNode;
  error?: string;
  descriptionText?: string;
}

const InputWithLabel = (props: InputWithLabelProps) => {
  const { label, error, descriptionText, className, ...rest } = props;

  return (
    <div className="space-y-2">
      {typeof label === 'string' ? (
        <Label className="text-sm font-medium">{label}</Label>
      ) : (
        label
      )}
      <Input
        className={cn(
          className,
          error && 'border-destructive focus-visible:ring-destructive'
        )}
        {...rest}
      />
      {(error || descriptionText) && (
        <p
          className={cn(
            'text-sm',
            error ? 'text-destructive' : 'text-muted-foreground'
          )}
        >
          {error || descriptionText}
        </p>
      )}
    </div>
  );
};

export default InputWithLabel;
