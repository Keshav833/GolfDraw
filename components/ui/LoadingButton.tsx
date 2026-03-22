'use client';

import { ReactNode, CSSProperties, ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type LoadingButtonProps = {
  loading: boolean;
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'danger' | 'ghost' | 'green';
  fullWidth?: boolean;
  style?: CSSProperties;
  className?: string;
  type?: ButtonHTMLAttributes<HTMLButtonElement>['type'];
};

export function Spinner({ color = '#fff' }: { color?: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      style={{ animation: 'nm-spin 0.7s linear infinite', flexShrink: 0 }}
      aria-hidden
    >
      <style>{`@keyframes nm-spin { to { transform: rotate(360deg) } }`}</style>
      <circle
        cx="7"
        cy="7"
        r="5.5"
        stroke={color}
        strokeWidth="1.5"
        strokeOpacity="0.3"
      />
      <path
        d="M7 1.5A5.5 5.5 0 0 1 12.5 7"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

const variants: Record<string, CSSProperties> = {
  primary: {
    background: '#e8ede8',
    boxShadow: '3px 3px 7px #c2c7c2, -3px -3px 7px #fff',
    color: '#2a3a2a',
    border: 'none',
  },
  green: {
    background: '#1a5e38',
    boxShadow:
      '3px 3px 8px rgba(10,40,20,0.3), -2px -2px 5px rgba(60,140,80,0.2)',
    color: '#fff',
    border: 'none',
  },
  danger: {
    background: '#e8ede8',
    boxShadow: '3px 3px 7px #c2c7c2, -3px -3px 7px #fff',
    color: '#a32d2d',
    border: 'none',
  },
  ghost: {
    background: 'transparent',
    boxShadow: 'inset 2px 2px 5px #c2c7c2, inset -2px -2px 5px #fff',
    color: '#6a7a6a',
    border: 'none',
  },
};

export function LoadingButton({
  loading,
  children,
  onClick,
  disabled,
  variant = 'primary',
  fullWidth = false,
  style,
  className,
  type = 'button',
}: LoadingButtonProps) {
  const isDisabled = loading || disabled;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={cn(className)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: '11px 20px',
        borderRadius: 12,
        fontSize: 13,
        fontWeight: 500,
        fontFamily: 'DM Sans, sans-serif',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled && !loading ? 0.5 : 1,
        transition: 'all 0.2s',
        ...(fullWidth ? { width: '100%' } : {}),
        ...variants[variant],
        ...style,
      }}
    >
      {loading && (
        <Spinner color={variant === 'green' ? '#7de0aa' : '#6a7a6a'} />
      )}
      {loading ? loadingLabel(children) : children}
    </button>
  );
}

function loadingLabel(children: ReactNode): string {
  const text =
    typeof children === 'string' ? children : 'Loading';

  const map: Record<string, string> = {
    'Submit score': 'Saving...',
    Save: 'Saving...',
    'Sign in': 'Signing in...',
    'Sign In to Dashboard': 'Signing in...',
    'Publish draw': 'Publishing...',
    'Confirm publish': 'Publishing...',
    Confirm: 'Publishing...',
    'Upload proof': 'Uploading...',
    Approve: 'Approving...',
    'Approve ✓': 'Approving...',
    Reject: 'Rejecting...',
    'Reject ✗': 'Rejecting...',
    'Mark as paid': 'Updating...',
    'Save configuration': 'Saving...',
    'Simulate draw': 'Simulating...',
    'Cancel subscription': 'Cancelling...',
    'Cancel Subscription': 'Cancelling...',
    'Save charity selection': 'Saving...',
    'Confirm rejection': 'Rejecting...',
    'Run Simulation': 'Simulating...',
    'Re-run Simulation': 'Simulating...',
    'Start Simulation': 'Simulating...',
    Simulate: 'Simulating...',
  };
  return map[text] ?? `${String(text).replace(/\.\.\.$/, '')}...`;
}
