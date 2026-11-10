import React from 'react';
import { Lock } from 'lucide-react';

interface LicensePlateProps {
  plate: string | null | undefined;
  isMasked?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LicensePlate: React.FC<LicensePlateProps> = ({
  plate,
  isMasked = false,
  size = 'md',
  className = '',
}) => {
  if (isMasked || !plate || plate === '[OCCUPIED]') {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 bg-concrete-200 border border-concrete-300 text-asphalt-700 font-mono text-xs uppercase tracking-wider rounded font-medium ${className}`}
        title="Vehicle plate masked for privacy"
      >
        <Lock className="w-3 h-3 text-asphalt-500" />
        <span>OCCUPIED</span>
      </div>
    );
  }

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 border',
    md: 'text-xs px-2.5 py-1 border-[1.5px]',
    lg: 'text-sm px-3.5 py-1.5 border-2',
  }[size];

  return (
    <div
      className={`inline-flex items-center font-mono font-bold tracking-widest text-asphalt-900 bg-white border-asphalt-800 rounded shadow-sm stamped-plate select-all ${sizeClasses} ${className}`}
    >
      <span className="text-[9px] font-sans font-extrabold text-blue-700 mr-1.5 border-r border-concrete-300 pr-1 select-none">
        IND
      </span>
      <span>{plate.toUpperCase()}</span>
    </div>
  );
};

