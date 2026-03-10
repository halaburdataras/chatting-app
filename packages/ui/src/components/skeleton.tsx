import { cn } from "@repo/shared/utils";

export default function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "h-5 w-full animate-pulse rounded-sm bg-gray-200",
        className
      )}
    />
  );
}
