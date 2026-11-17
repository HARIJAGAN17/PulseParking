import React from 'react';

interface CarAnimationProps {
  action?: 'park-in' | 'park-out' | 'idle';
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isOwn?: boolean;
}

export const CarAnimation: React.FC<CarAnimationProps> = ({
  action = 'idle',
  className = '',
  size = 'md',
  isOwn = false,
}) => {
  const dimensions = {
    xs: { width: 24, height: 40 },
    sm: { width: 32, height: 54 },
    md: { width: 48, height: 80 },
    lg: { width: 64, height: 104 },
  }[size];

  const animationClass =
    action === 'park-in'
      ? 'animate-car-in'
      : action === 'park-out'
      ? 'animate-car-out'
      : '';

  return (
    <div
      className={`inline-flex items-center justify-center select-none ${animationClass} ${className}`}
      aria-label="Vehicle graphic"
      role="img"
    >
      <svg
        width={dimensions.width}
        height={dimensions.height}
        viewBox="0 0 48 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-tactile"
      >
        {/* Shadow */}
        <rect x="6" y="8" width="36" height="66" rx="10" fill="rgba(18,20,23,0.18)" />

        {/* Outer Body (Modern Industrial Sedan) */}
        <rect
          x="7"
          y="6"
          width="34"
          height="68"
          rx="9"
          fill={isOwn ? '#0E1F36' : '#142D4E'}
          stroke={isOwn ? '#0D9488' : '#334155'}
          strokeWidth={isOwn ? '2' : '1.5'}
        />

        {/* Windshield Front */}
        <path
          d="M12 24 C14 21, 34 21, 36 24 L34 33 C33 34, 15 34, 14 33 Z"
          fill="#0F172A"
          stroke="#1E293B"
          strokeWidth="1"
        />

        {/* Roof Panel */}
        <rect
          x="13"
          y="32"
          width="22"
          height="20"
          rx="3"
          fill={isOwn ? '#0D9488' : '#1E293B'}
        />

        {/* Rear Windshield */}
        <path
          d="M13 54 C15 53, 33 53, 35 54 L36 61 C34 62, 14 62, 12 61 Z"
          fill="#0F172A"
          stroke="#1E293B"
          strokeWidth="1"
        />

        {/* Headlights (Crisp LED Amber/White) */}
        <rect x="9" y="8" width="6" height="2.5" rx="1" fill="#FEF3C7" />
        <rect x="33" y="8" width="6" height="2.5" rx="1" fill="#FEF3C7" />

        {/* Tail Lights (Precision Red) */}
        <rect x="9" y="70" width="7" height="2.5" rx="1" fill="#DC2626" />
        <rect x="32" y="70" width="7" height="2.5" rx="1" fill="#DC2626" />

        {/* Side Mirrors */}
        <rect x="3" y="24" width="4" height="6" rx="2" fill={isOwn ? '#0D9488' : '#142D4E'} />
        <rect x="41" y="24" width="4" height="6" rx="2" fill={isOwn ? '#0D9488' : '#142D4E'} />
      </svg>
    </div>
  );
};

