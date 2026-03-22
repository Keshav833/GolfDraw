import { SkeletonBlock } from '@/components/ui/skeleton';

export default function DrawDetailLoading() {
  return (
    <div style={{ padding: '32px' }}>
      <SkeletonBlock
        width="140px"
        height="20px"
        style={{ marginBottom: 24 }}
      />
      <SkeletonBlock
        width="60%"
        height="36px"
        style={{ marginBottom: 16 }}
      />
      <SkeletonBlock width="100%" height="280px" style={{ marginBottom: 24 }} />
      <SkeletonBlock width="100%" height="120px" />
    </div>
  );
}
