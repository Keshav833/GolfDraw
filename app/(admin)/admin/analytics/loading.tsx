import { SkeletonBlock } from '@/components/ui/skeleton';

export default function AnalyticsRouteLoading() {
  return (
    <div style={{ padding: '32px' }}>
      <SkeletonBlock
        width="240px"
        height="32px"
        style={{ marginBottom: 32 }}
      />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4,1fr)',
          gap: 16,
          marginBottom: 24,
        }}
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonBlock key={i} width="100%" height="100px" />
        ))}
      </div>
      <SkeletonBlock width="100%" height="280px" />
    </div>
  );
}
