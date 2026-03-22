import { cn } from '@/lib/utils';
import { CSSProperties } from 'react';

const shimmer = `
  @keyframes nm-shimmer {
    0%   { opacity: 0.5; }
    50%  { opacity: 1; }
    100% { opacity: 0.5; }
  }
`;

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-muted/50', className)}
      {...props}
    />
  );
}

type SkeletonBlockProps = {
  width?: string | number;
  height?: string | number;
  radius?: string | number;
  style?: CSSProperties;
};

export function SkeletonBlock({
  width = '100%',
  height = '16px',
  radius = '10px',
  style,
}: SkeletonBlockProps) {
  return (
    <>
      <style>{shimmer}</style>
      <div
        style={{
          width,
          height,
          borderRadius: radius,
          background: '#e8ede8',
          boxShadow: 'inset 2px 2px 5px #c2c7c2, inset -2px -2px 5px #fff',
          animation: 'nm-shimmer 1.5s ease-in-out infinite',
          flexShrink: 0,
          ...style,
        }}
      />
    </>
  );
}

export function SkeletonText({
  lines = 3,
  style,
}: {
  lines?: number;
  style?: CSSProperties;
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        ...style,
      }}
    >
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonBlock
          key={i}
          width={i === lines - 1 ? '60%' : '100%'}
          height="13px"
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ style }: { style?: CSSProperties }) {
  return (
    <div
      style={{
        background: '#e8ede8',
        borderRadius: 16,
        boxShadow: '3px 3px 7px #c2c7c2, -3px -3px 7px #fff',
        padding: 16,
        ...style,
      }}
    >
      <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
        <SkeletonBlock width="40px" height="40px" radius="50%" />
        <div style={{ flex: 1 }}>
          <SkeletonBlock
            width="60%"
            height="14px"
            style={{ marginBottom: 6 }}
          />
          <SkeletonBlock width="40%" height="11px" />
        </div>
      </div>
      <SkeletonText lines={2} />
    </div>
  );
}

export function SkeletonPills({ count = 5 }: { count?: number }) {
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonBlock key={i} width="36px" height="36px" radius="10px" />
      ))}
    </div>
  );
}

export { Skeleton };
