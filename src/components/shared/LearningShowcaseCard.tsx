import React, { ReactNode, useState } from 'react';
import { cn } from '@/lib/utils';

interface LearningShowcaseCardProps {
  imageSrc: string;
  imageAlt: string;
  children: ReactNode;
  onClick?: () => void;
  topLeftOverlay?: ReactNode;
  topRightOverlay?: ReactNode;
  className?: string;
  bodyClassName?: string;
  imageClassName?: string;
  disabled?: boolean;
}

const LearningShowcaseCard: React.FC<LearningShowcaseCardProps> = ({
  imageSrc,
  imageAlt,
  children,
  onClick,
  topLeftOverlay,
  topRightOverlay,
  className,
  bodyClassName,
  imageClassName,
  disabled = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const clickable = !!onClick && !disabled;

  return (
    <div
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-300',
        clickable ? 'cursor-pointer' : 'cursor-default',
        isHovered && clickable ? 'shadow-2xl ring-1 ring-blue-100' : 'shadow-sm hover:shadow-lg',
        disabled && 'opacity-60 pointer-events-none',
        className,
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={clickable ? onClick : undefined}
    >
      <div className={cn('relative h-40 overflow-hidden', imageClassName)}>
        <img
          src={imageSrc}
          alt={imageAlt}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {topLeftOverlay && <div className="pointer-events-none absolute left-3 top-3">{topLeftOverlay}</div>}
        {topRightOverlay && <div className="pointer-events-none absolute right-3 top-3">{topRightOverlay}</div>}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/20 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      </div>
      <div className={cn('flex h-full flex-col gap-4 p-4', bodyClassName)}>{children}</div>
    </div>
  );
};

export default LearningShowcaseCard;
