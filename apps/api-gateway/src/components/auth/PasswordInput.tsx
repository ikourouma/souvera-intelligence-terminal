'use client';

import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

type PasswordInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  disabled?: boolean;
  autoComplete?: string;
  id?: string;
  inputClassName?: string;
};

export function PasswordInput({
  value,
  onChange,
  placeholder = '••••••••••••',
  required,
  minLength,
  disabled,
  autoComplete = 'current-password',
  id,
  inputClassName = 'px-4 py-3.5',
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <input
        id={id}
        type={showPassword ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        minLength={minLength}
        disabled={disabled}
        autoComplete={autoComplete}
        className={`w-full bg-zinc-900/50 border border-zinc-800 rounded-sm pr-12 text-white text-sm focus:border-blue-600 focus:outline-none transition-all placeholder:text-zinc-700 disabled:opacity-50 ${inputClassName}`}
      />
      <button
        type="button"
        onClick={() => setShowPassword((prev) => !prev)}
        disabled={disabled}
        aria-label={showPassword ? 'Hide password' : 'Show password'}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors disabled:opacity-50"
      >
        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}
