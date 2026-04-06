import React from 'react';

interface LogoProps {
  className?: string;
  height?: number | string;
  collapsed?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className, height = 32, collapsed = false }) => {
  return (
    <div className={`flex items-center ${collapsed ? 'justify-center gap-0' : 'justify-start gap-3'} ${className}`} style={{ height }}>
      <svg
        viewBox="0 0 100 100"
        className="h-full w-auto shrink-0"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Left Shape (Blue) */}
        <path
          d="M40 10C17.9086 10 0 27.9086 0 50C0 72.0914 17.9086 90 40 90V10Z"
          fill="#1a5f96"
        />
        {/* Right Shape (Lime) */}
        <path
          d="M60 10C82.0914 10 100 27.9086 100 50C100 72.0914 82.0914 90 60 90V10Z"
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
