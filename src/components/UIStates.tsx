import React from "react";
import { AlertCircle, RefreshCw, Inbox, LucideIcon } from "lucide-react";

/**
 * 1. Loading Skeleton matching geometry
 */
export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm animate-pulse space-y-4">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-1/3" />
          <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-1/4" />
        </div>
      </div>
      <div className="space-y-2 pt-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded"
            style={{ width: `${85 - i * 15}%` }}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * 2. Empty State with CTA
 */
export function EmptyState({
  title,
  description,
  actionText,
  onAction,
  icon: Icon = Inbox,
}: {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  icon?: LucideIcon;
}) {
  return (
    <div className="border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 text-center flex flex-col items-center justify-center space-y-3 bg-white/50 dark:bg-zinc-900/50">
      <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
        <Icon className="w-6 h-6" />
      </div>
      <div className="space-y-1">
        <h4 className="font-semibold text-zinc-800 dark:text-zinc-200">{title}</h4>
        <p className="text-xs text-zinc-500 max-w-sm">{description}</p>
      </div>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-2 text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition active:scale-[0.98]"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}

/**
 * 3. Error State with Retry
 */
export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/80 rounded-xl p-5 text-red-700 dark:text-red-300 flex items-start space-x-3">
      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <div className="flex-1 text-xs space-y-2">
        <p className="font-semibold">เกิดข้อผิดพลาดในการโหลดข้อมูล</p>
        <p className="opacity-90">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center space-x-1.5 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>ลองใหม่อีกครั้ง</span>
          </button>
        )}
      </div>
    </div>
  );
}
