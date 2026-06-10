import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { clearSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default function ForbiddenPage() {
  async function logout() {
    "use server";
    await clearSession();
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,var(--accent),transparent_34%),var(--background)] p-4">
      <div className="mx-auto flex w-full max-w-md flex-col items-center justify-center space-y-6 rounded-lg border bg-card/95 p-8 text-center shadow-xl">
        <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-destructive/20 bg-destructive/10">
          <ShieldAlert className="h-8 w-8 text-destructive" aria-hidden="true" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">Access Forbidden</h1>
          <p className="text-muted-foreground">
            You do not have admin access. Your account lacks the required ROLE_ADMIN permissions to view this console.
          </p>
        </div>
        <form action={logout}>
          <Button type="submit" variant="default">
            Return to Login
          </Button>
        </form>
      </div>
    </div>
  );
}
