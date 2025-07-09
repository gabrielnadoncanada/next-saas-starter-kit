'use client';

import React from 'react';
import { Checkbox } from '@/lib/components/ui/checkbox';

const CheckboxComponent = ({
  onChange,
  name,
  value,
  label,
  defaultChecked,
  className,
}: {
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  name: string;
  value: string;
  label: string;
  defaultChecked: boolean;
  className?: string;
}) => {
  return (
    <div className={`flex items-center ${className || ''}`} key={value}>
      <label className="flex items-center gap-2 text-sm">
        <Checkbox
          name={name}
          value={value}
          onCheckedChange={(checked) => {
            // Create a synthetic event to match the expected signature
            const syntheticEvent = {
              target: {
                name,
                value,
                checked: Boolean(checked),
              },
            } as React.ChangeEvent<HTMLInputElement>;
            onChange(syntheticEvent);
          }}
          defaultChecked={Boolean(defaultChecked)}
        />
        <span className="text-gray-700">{label}</span>
      </label>
    </div>
  );
};

export default CheckboxComponent;
