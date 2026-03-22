function Pulse({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-[14px] bg-[#d9ddd9] ${className}`} />;
}

export function DashboardSkeleton() {
  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6">
      <div className="rounded-[24px] bg-[#e8ede8] p-4 sm:p-5 lg:p-6">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[190px_minmax(0,1fr)_220px]">
          <div className="hidden lg:block rounded-[20px] bg-[#e8ede8] p-4">
            <Pulse className="h-10 w-28" />
            <Pulse className="mt-6 h-16 w-16 rounded-full" />
            <Pulse className="mt-4 h-4 w-24" />
            <Pulse className="mt-2 h-3 w-20" />
            <div className="mt-8 space-y-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <Pulse key={index} className="h-10 w-full" />
              ))}
            </div>
          </div>

          <div className="space-y-4 ">
            <div className="flex items-center justify-between">
              <div>
                <Pulse className="h-8 w-48" />
                <Pulse className="mt-2 h-3 w-32" />
              </div>
              <div className="flex gap-2">
                <Pulse className="h-9 w-9" />
                <Pulse className="h-9 w-9" />
                <Pulse className="h-9 w-9" />
              </div>
            </div>

            <Pulse className="h-48 w-full rounded-[22px]" />

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <Pulse className="h-32 w-full" />
              <Pulse className="h-32 w-full" />
              <Pulse className="h-32 w-full" />
            </div>

            <Pulse className="h-40 w-full rounded-[18px]" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Pulse className="h-16 w-full" />
              <Pulse className="h-16 w-full" />
              <Pulse className="h-16 w-full" />
              <Pulse className="h-16 w-full" />
            </div>
          </div>

          <div className="space-y-4">
            <Pulse className="h-32 w-full rounded-[18px]" />
            <Pulse className="h-48 w-full rounded-[18px]" />
            <Pulse className="h-24 w-full rounded-[18px]" />
            <Pulse className="h-24 w-full rounded-[18px]" />
            <Pulse className="h-24 w-full rounded-[18px]" />
          </div>
        </div>
      </div>
    </div>
  );
}
