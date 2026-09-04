import { cn } from "@/lib/utils";

export function VehicleSilhouette({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cn("relative mx-auto h-60 w-full max-w-5xl md:h-80", className)}>
      <div className="absolute inset-x-[7%] bottom-16 h-24 rounded-[52%] bg-slate-300/45 blur-3xl" />
      <div className="absolute inset-x-[10%] bottom-[86px] h-20 rounded-t-[90px] border border-slate-300/70 bg-gradient-to-r from-slate-200 via-white to-slate-100 shadow-[0_35px_80px_rgba(15,23,42,0.18)]" />
      <div className="absolute left-[26%] right-[28%] bottom-[138px] h-20 rounded-t-[120px] border border-slate-300/70 bg-gradient-to-r from-slate-100 via-white to-sky-100" />
      <div className="absolute left-[34%] right-[39%] bottom-[150px] h-10 rounded-t-[80px] bg-slate-900/12 backdrop-blur-sm" />
      <div className="absolute left-[49%] right-[31%] bottom-[150px] h-10 rounded-t-[80px] bg-slate-900/12 backdrop-blur-sm" />
      <div className="absolute inset-x-[13%] bottom-[84px] h-4 rounded-full bg-gradient-to-r from-slate-400 via-slate-100 to-slate-400" />
      <div className="absolute left-[18%] bottom-[58px] size-24 rounded-full border-[14px] border-slate-900 bg-slate-200 shadow-xl" />
      <div className="absolute right-[18%] bottom-[58px] size-24 rounded-full border-[14px] border-slate-900 bg-slate-200 shadow-xl" />
      <div className="absolute left-[12%] bottom-[104px] h-3 w-16 rounded-full bg-cyan-300/80 shadow-glow" />
      <div className="absolute right-[12%] bottom-[104px] h-3 w-12 rounded-full bg-red-300/70" />
      <div className="absolute inset-x-[4%] bottom-10 h-px bg-gradient-to-r from-transparent via-slate-400/70 to-transparent" />
    </div>
  );
}
