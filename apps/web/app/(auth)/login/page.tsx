import { signIn } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <main className="mx-auto grid min-h-[calc(100vh-72px)] max-w-md content-center px-6">
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Sign in</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Admin and saved comparison access for NordicDrive.
        </p>
        <form
          className="mt-6"
          action={async () => {
            "use server";
            await signIn("github", { redirectTo: "/" });
          }}
        >
          <Button className="w-full" type="submit">
            Continue with GitHub
          </Button>
        </form>
      </div>
    </main>
  );
}
