import { SkeletonBlock } from '@/components/ui/skeleton';

export default function AdminDrawsLoading() {
  return (
    <div style={{ padding: '32px' }}>
      <SkeletonBlock
        width="180px"
        height="28px"
        style={{ marginBottom: 24 }}
      />
      {Array.from({ length: 5 }).map((_, i) => (
        <SkeletonBlock
          key={i}
          width="100%"
          height="72px"
          style={{ marginBottom: 12 }}
        />
      ))}
    </div>
  );
}
