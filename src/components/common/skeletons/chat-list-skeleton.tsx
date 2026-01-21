export const ChatListSkeleton = () => {
  const SkeletonItem = () => (
    <div className="flex items-center justify-between gap-3 p-2 rounded-md animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-200" />
        <div className="flex flex-col gap-2">
          <div className="h-3 w-24 bg-gray-200 rounded" />
          <div className="h-3 w-16 bg-gray-100 rounded" />
        </div>
      </div>
      <div className="h-3 w-6 bg-gray-200 rounded" />
    </div>
  );

  return (
    <div className="flex flex-col gap-3">
      {/* Pinned Section */}
      <div>
        <div className="text-xs font-medium text-custom-text-400 mb-1">
          Pinned
        </div>
        <div className="flex flex-col gap-2">
          <SkeletonItem />
        </div>
      </div>

      {/* Recent Section */}
      <div>
        <div className="text-xs font-medium text-custom-text-400 mb-1">
          Recent
        </div>
        <div className="flex flex-col gap-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <SkeletonItem key={i} />
          ))}
        </div>
      </div>
    </div>
  );
};
