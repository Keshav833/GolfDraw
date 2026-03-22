import { SkeletonBlock } from '@/components/ui/skeleton';

export default function AdminCharitiesLoading() {
  return (
    <div style={{ padding: '32px' }}>
      <SkeletonBlock
        width="220px"
        height="28px"
        style={{ marginBottom: 24 }}
      />
      <SkeletonBlock width="100%" height="320px" />
    </div>
  );
}
