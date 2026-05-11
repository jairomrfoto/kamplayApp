import React from 'react';

const SIZES = {
  xs:  'w-12 h-12',
  sm:  'w-20 h-20',
  md:  'w-28 h-28',
  lg:  'w-40 h-40',
  xl:  'w-56 h-56',
  '2xl': 'w-72 h-72',
} as const;

interface Props {
  message?: string;
  size?: keyof typeof SIZES;
  flip?: boolean;       // mirror horizontally
  animate?: boolean;
  bubbleSide?: 'left' | 'right' | 'top';
  className?: string;
}

export default function Kiko({
  message,
  size = 'md',
  flip = false,
  animate = true,
  bubbleSide = 'right',
  className = '',
}: Props) {
  const bubbleStyles: Record<string, string> = {
    right: 'left-full ml-3 top-2',
    left:  'right-full mr-3 top-2',
    top:   'bottom-full mb-3 left-1/2 -translate-x-1/2',
  };

  const tailStyles: Record<string, string> = {
    right: 'absolute -left-2 top-4 w-4 h-4 bg-white border-l-2 border-b-2 border-orange-300 rotate-45',
    left:  'absolute -right-2 top-4 w-4 h-4 bg-white border-r-2 border-t-2 border-orange-300 rotate-45',
    top:   'absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-r-2 border-b-2 border-orange-300 rotate-45',
  };

  return (
    <div className={`relative inline-flex items-start ${className}`}>
      <img
        src="/kiko.png"
        alt="Kiko, la mascota de Kamplay"
        loading="lazy"
        className={`${SIZES[size]} object-contain flex-shrink-0 ${animate ? 'kiko-float' : ''} ${flip ? '-scale-x-100' : ''}`}
      />
      {message && (
        <div className={`absolute ${bubbleStyles[bubbleSide]} z-10 min-w-[160px] max-w-[220px] bg-white border-2 border-orange-300 rounded-2xl px-4 py-2.5 shadow-lg`}>
          <div className={tailStyles[bubbleSide]} />
          <p className="text-sm text-gray-700 font-semibold leading-snug">{message}</p>
        </div>
      )}
    </div>
  );
}
