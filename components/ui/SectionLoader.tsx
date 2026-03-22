export default function SectionLoader({ label = 'Loading...' }: { label?: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        padding: '32px',
        color: '#6a7a6a',
        fontSize: 13,
        fontFamily: 'DM Sans, sans-serif',
      }}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 18 18"
        fill="none"
        style={{ animation: 'nm-section-spin 0.8s linear infinite' }}
        aria-hidden
      >
        <style>{`@keyframes nm-section-spin{to{transform:rotate(360deg)}}`}</style>
        <circle cx="9" cy="9" r="7" stroke="#c2c7c2" strokeWidth="2" />
        <path
          d="M9 2A7 7 0 0 1 16 9"
          stroke="#1a5e38"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      {label}
    </div>
  );
}
