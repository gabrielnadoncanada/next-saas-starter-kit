'use client';
import { Input } from '@/lib/components/ui/input';
import { Label } from '@/lib/components/ui/label';
import { CopyToClipboardButton } from '@/components/shared';

interface InputWithCopyButtonProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  description?: string;
}

const InputWithCopyButton = (props: InputWithCopyButtonProps) => {
  const { label, value, description, ...rest } = props;

  const id = label.replace(/ /g, '');

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
        </Label>
        <CopyToClipboardButton value={value?.toString() || ''} />
      </div>
      <Input id={id} className="text-sm" {...rest} value={value} />
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
};

export default InputWithCopyButton;
