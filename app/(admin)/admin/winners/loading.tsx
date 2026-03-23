import { SkeletonBlock } from '@/components/ui/skeleton';

export default function WinnersLoading() {
  return (
    <div style={{ padding: '32px' }}>
      <SkeletonBlock width="200px" height="28px" style={{ marginBottom: 24 }} />
      {Array.from({ length: 6 }).map((_, i) => (
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
