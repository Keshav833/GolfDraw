import { SkeletonBlock } from '@/components/ui/skeleton';

export default function CharityLoading() {
  return (
    <div style={{ padding: '32px' }}>
      <SkeletonBlock
        width="200px"
        height="28px"
        style={{ marginBottom: 24 }}
      />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3,1fr)',
          gap: 12,
        }}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonBlock key={i} width="100%" height="140px" />
        ))}
      </div>
    </div>
  );
}
