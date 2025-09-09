
'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { FormControl } from '@/components/ui/form';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { useLocale } from '@/contexts/locale-provider';

interface PasswordInputProps {
    field: any;
    placeholder?: string;
}

export function PasswordInput({ field, placeholder }: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const { t } = useLocale();

  return (
    <div className="relative">
      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <FormControl>
        <Input 
          type={showPassword ? "text" : "password"} 
          placeholder={placeholder || "••••••••"} 
          {...field} 
          className="pl-10 pr-10" 
        />
      </FormControl>
      <button
        type="button"
        onClick={() => setShowPassword((prev) => !prev)}
        className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
        aria-label={showPassword ? t('login.hidePassword') : t('login.showPassword')}
      >
        {showPassword ? (
          <EyeOff className="h-5 w-5" />
        ) : (
          <Eye className="h-5 w-5" />
        )}
      </button>
    </div>
  );
}
