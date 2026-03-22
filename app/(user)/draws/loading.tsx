import { SkeletonBlock } from '@/components/ui/skeleton';

export default function DrawsLoading() {
  return (
    <div style={{ padding: '32px' }}>
      <SkeletonBlock
        width="140px"
        height="28px"
        style={{ marginBottom: 24 }}
      />
      {Array.from({ length: 5 }).map((_, i) => (
        <SkeletonBlock
          key={i}
          width="100%"
          height="64px"
          style={{ marginBottom: 10 }}
        />
      ))}
    </div>
  );
}
