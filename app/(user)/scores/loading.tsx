import { SkeletonBlock } from '@/components/ui/skeleton';

export default function ScoresLoading() {
  return (
    <div style={{ padding: '32px', fontFamily: 'DM Sans, sans-serif' }}>
      <SkeletonBlock width="160px" height="28px" style={{ marginBottom: 24 }} />
      <SkeletonBlock width="100%" height="80px" style={{ marginBottom: 16 }} />
      <SkeletonBlock width="100%" height="220px" />
    </div>
  );
}
