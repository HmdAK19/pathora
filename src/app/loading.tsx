export default function Loading() {
  return (
    <div className="mx-auto min-h-dvh w-full max-w-[100rem] animate-pulse p-3 sm:p-5">
      <div className="min-h-[calc(100dvh-2.5rem)] rounded-[1.75rem] border border-white/8 bg-surface" />
      <span className="sr-only">Loading Pathora</span>
    </div>
  );
}
