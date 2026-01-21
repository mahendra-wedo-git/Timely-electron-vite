import React from "react";

// Local Skeleton component
function Skeleton({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`animate-pulse rounded-md bg-gray-200 ${className}`}
      style={style}
    />
  );
}

// Chat message skeleton
export const ChatMessageSkeleton = () => {
  return (
    <div className="flex flex-col gap-4 p-4">
      {/* LEFT */}
      <div className={`flex items-start gap-3 flex-row`}>
        <Skeleton className="h-10 w-10" style={{ borderRadius: "50%" }} />

        <div className="flex flex-col gap-2">
          <Skeleton className={`h-2 w-32 rounded-xl`} />
          <Skeleton
            className={`h-8 w-80 rounded-xl rounded-tl-none rounded-tl-none`}
          />
        </div>
      </div>

      {/* RIGHT */}
      <div className={`flex items-start gap-3 flex-row-reverse`}>
        <div className="flex flex-col gap-2 items-end">
          <Skeleton className={`h-2 w-32 rounded-xl`} />
          <Skeleton className={`h-8 w-24 rounded-xl rounded-tr-none`} />
          <Skeleton className={`h-8 w-64 rounded-xl rounded-tr-none`} />
        </div>
      </div>

      {/* LEFT */}
      <div className={`flex items-start gap-3 flex-row`}>
        <Skeleton className="h-10 w-10" style={{ borderRadius: "50%" }} />

        <div className="flex flex-col gap-2">
          <Skeleton className={`h-2 w-32 rounded-xl`} />
          <Skeleton className={`h-8 w-48 rounded-xl rounded-tl-none`} />
        </div>
      </div>

      {/* RIGHT */}
      <div className={`flex items-start gap-3 flex-row-reverse`}>
        <div className="flex flex-col gap-2 items-end">
          <Skeleton className={`h-2 w-32 rounded-xl`} />
          <Skeleton className={`h-8 w-80 rounded-xl rounded-tr-none`} />
        </div>
      </div>

      {/* LEFT */}
      <div className={`flex items-start gap-3 flex-row`}>
        <Skeleton className="h-10 w-10" style={{ borderRadius: "50%" }} />

        <div className="flex flex-col gap-2">
          <Skeleton className={`h-2 w-32 rounded-xl`} />
          <Skeleton className={`h-8 w-64 rounded-xl rounded-tl-none`} />
        </div>
      </div>

      {/* RIGHT */}
      <div className={`flex items-start gap-3 flex-row-reverse`}>
        <div className="flex flex-col gap-2 items-end">
          <Skeleton className={`h-2 w-32 rounded-xl`} />
          <Skeleton className="h-8 w-64 rounded-xl rounded-tr-none" />
        </div>
      </div>
      {/* LEFT */}
      <div className={`flex items-start gap-3 flex-row`}>
        <Skeleton className="h-10 w-10" style={{ borderRadius: "50%" }} />

        <div className="flex flex-col gap-2">
          <Skeleton className={`h-2 w-32 rounded-xl`} />
          <Skeleton className={`h-8 w-64 rounded-xl rounded-tl-none`} />
        </div>
      </div>

      {/* RIGHT */}
      <div className={`flex items-start gap-3 flex-row-reverse`}>
        <div className="flex flex-col gap-2 items-end">
          <Skeleton className={`h-2 w-32 rounded-xl`} />
          <Skeleton className="h-8 w-64 rounded-xl rounded-tr-none" />
        </div>
      </div>
      {/* LEFT */}
      <div className={`flex items-start gap-3 flex-row`}>
        <Skeleton className="h-10 w-10" style={{ borderRadius: "50%" }} />

        <div className="flex flex-col gap-2">
          <Skeleton className={`h-2 w-32 rounded-xl`} />
          <Skeleton className={`h-8 w-64 rounded-xl rounded-tl-none`} />
        </div>
      </div>

      {/* RIGHT */}
      <div className={`flex items-start gap-3 flex-row-reverse`}>
        <div className="flex flex-col gap-2 items-end">
          <Skeleton className={`h-2 w-32 rounded-xl`} />
          <Skeleton className="h-8 w-64 rounded-xl rounded-tr-none" />
        </div>
      </div>
      {/* LEFT */}
      <div className={`flex items-start gap-3 flex-row`}>
        <Skeleton className="h-10 w-10" style={{ borderRadius: "50%" }} />

        <div className="flex flex-col gap-2">
          <Skeleton className={`h-2 w-32 rounded-xl`} />
          <Skeleton className={`h-8 w-64 rounded-xl rounded-tl-none`} />
        </div>
      </div>

      {/* RIGHT */}
      <div className={`flex items-start gap-3 flex-row-reverse`}>
        <div className="flex flex-col gap-2 items-end">
          <Skeleton className={`h-2 w-32 rounded-xl`} />
          <Skeleton className="h-8 w-64 rounded-xl rounded-tr-none" />
        </div>
      </div>
    </div>
  );
};
