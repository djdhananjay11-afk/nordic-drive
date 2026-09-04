import { Button } from "@/components/ui/button";
import { VehicleSilhouette } from "@/components/design-system/vehicle-silhouette";

export function TeslaPageShell({
  eyebrow,
  title,
  description,
  primaryAction,
  secondaryAction,
}: {
  eyebrow: string;
  title: string;
  description: string;
  primaryAction: string;
  secondaryAction: string;
}) {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef3f7_58%,#ffffff_100%)] px-5 pt-24 text-center">
      <section className="mx-auto flex min-h-[calc(100vh-96px)] max-w-6xl flex-col items-center justify-between pb-10">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-foreground/55">
            {eyebrow}
          </p>
          <h1 className="mt-4 text-5xl font-semibold tracking-normal md:text-7xl">{title}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg font-medium leading-8 text-foreground/62">
            {description}
          </p>
        </div>
        <VehicleSilhouette className="my-10" />
        <div className="flex w-full max-w-lg flex-col gap-3 sm:flex-row">
          <Button className="flex-1 rounded-md bg-slate-900 text-white hover:bg-slate-800" size="lg">
            {primaryAction}
          </Button>
          <Button className="flex-1 rounded-md bg-white/75 text-slate-900 hover:bg-white" size="lg" variant="glass">
            {secondaryAction}
          </Button>
        </div>
      </section>
    </main>
  );
}
