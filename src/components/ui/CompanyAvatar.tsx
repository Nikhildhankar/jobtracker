import React from 'react';
import { clsx } from 'clsx';

export interface CompanyAvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const GRADIENTS = [
  'from-blue-600 to-indigo-700 text-white',
  'from-violet-600 to-purple-700 text-white',
  'from-emerald-500 to-teal-700 text-white',
  'from-amber-500 to-orange-600 text-white',
  'from-rose-500 to-red-700 text-white',
  'from-cyan-500 to-blue-600 text-white',
  'from-fuchsia-600 to-pink-700 text-white',
  'from-slate-700 to-slate-900 text-white',
];

function getGradientForName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % GRADIENTS.length;
  return GRADIENTS[index];
}

export const CompanyAvatar: React.FC<CompanyAvatarProps> = ({
  name,
  size = 'md',
  className,
}) => {
  const initial = name ? name.trim().charAt(0).toUpperCase() : 'J';
  const gradient = getGradientForName(name || 'Company');

  const sizeClasses = {
    sm: 'w-7 h-7 text-xs rounded-lg shadow-xs',
    md: 'w-9 h-9 text-sm rounded-xl shadow-sm',
    lg: 'w-12 h-12 text-base rounded-2xl shadow-md',
  };

  return (
    <div
      className={clsx(
        'bg-gradient-to-br flex items-center justify-center font-bold flex-shrink-0 select-none border border-white/20',
        gradient,
        sizeClasses[size],
        className
      )}
      title={name}
    >
      {initial}
    </div>
  );
};
