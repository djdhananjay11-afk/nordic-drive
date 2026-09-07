import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { githubAuthConfigured, signIn } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <main className="mx-auto grid min-h-[calc(100vh-72px)] max-w-md content-center px-6">
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Sign in</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Admin and saved comparison access for NordicDrive.
        </p>
        {!githubAuthConfigured ? (
          <p role="status" className="mt-6 text-sm text-muted-foreground">
            Administrator sign-in is not configured yet. Please contact the site owner.
          </p>
        ) : <form
          className="mt-6"
          action={async () => {
            "use server";
            try {
              await signIn("github", { redirectTo: "/admin" });
            } catch (error) {
              if (error instanceof AuthError) {
                redirect("/login?error=SignInFailed");
              }
              throw error;
            }
          }}
        >
          <Button className="w-full" type="submit">
            Continue with GitHub
          </Button>
        </form>}
        {error && githubAuthConfigured ? (
          <p role="alert" className="mt-4 text-sm text-muted-foreground">
            Sign-in could not be completed. Please try again or contact the site owner.
          </p>
        ) : null}
      </div>
    </main>
  );
}
