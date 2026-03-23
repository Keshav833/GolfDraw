import { SkeletonBlock } from '@/components/ui/skeleton';

export default function UsersLoading() {
  return (
    <div style={{ padding: '32px' }}>
      <SkeletonBlock width="100%" height="48px" style={{ marginBottom: 16 }} />
      {Array.from({ length: 8 }).map((_, i) => (
        <SkeletonBlock
          key={i}
          width="100%"
          height="56px"
          style={{ marginBottom: 8 }}
        />
      ))}
    </div>
  );
}
