import { SkeletonBlock } from '@/components/ui/skeleton';

export default function AdminLoading() {
  return (
    <div style={{ padding: '32px' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4,1fr)',
          gap: 12,
          marginBottom: 24,
        }}
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonBlock key={i} width="100%" height="88px" />
        ))}
      </div>
      <SkeletonBlock
        width="100%"
        height="220px"
        style={{ marginBottom: 16 }}
      />
      <SkeletonBlock width="100%" height="320px" />
    </div>
  );
}
