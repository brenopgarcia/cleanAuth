import React from 'react';

interface LogoProps {
  className?: string;
  height?: number | string;
  collapsed?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className, height = 32, collapsed = false }) => {
  return (
    <div className={`flex items-center ${collapsed ? 'justify-center gap-0' : 'justify-start gap-1.5'} ${className}`} style={{ height }}>
      <svg
        viewBox="0 0 100 100"
        className="h-full w-auto shrink-0"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Left Shape (Blue) */}
        <path
          d="M5 10C27.076 10 45 27.9086 45 50C45 72.0914 27.076 90 5 90V10Z"
          fill="#1a5f96"
        />
        {/* Right Shape (Lime) */}
        <path
          d="M95 10C72.924 10 55 27.9086 55 50C55 72.0914 72.924 90 95 90V10Z"
          fill="#c1d82f"
        />

      </svg>
      <div className={`flex flex-col justify-center leading-[0.9] overflow-hidden transition-all duration-200 ${collapsed ? 'w-0 opacity-0 max-md:w-auto max-md:opacity-100' : 'w-auto opacity-100'}`}>
        <span
          className="text-[1.1em] font-light tracking-wider whitespace-nowrap"
          style={{ color: 'var(--text-h)', fontFamily: 'var(--heading)' }}
        >
          DUSCHNER
        </span>
        <span
          className="text-[0.65em] font-normal tracking-[0.4em] uppercase whitespace-nowrap"
          style={{ color: 'var(--text)', fontFamily: 'var(--sans)' }}
        >
          CONSULTING
        </span>
      </div>
    </div>
  );
};
