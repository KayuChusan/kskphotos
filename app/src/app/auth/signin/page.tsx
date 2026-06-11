import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth, emailSignInEnabled } from "@/lib/auth";
import { SignInForm } from "./signin-form";

export const metadata: Metadata = {
  title: "Sign In",
  description: "管理画面へのサインイン",
};

interface Props {
  searchParams: Promise<{ callbackUrl?: string }>;
}

export default async function SignInPage({ searchParams }: Props) {
  const session = await auth();
  const { callbackUrl } = await searchParams;
  if (session) redirect(callbackUrl ?? "/admin");

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Admin Sign In</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            管理画面にアクセスするにはサインインが必要です
          </p>
        </div>
        <SignInForm
          callbackUrl={callbackUrl}
          emailSignInEnabled={emailSignInEnabled}
        />
      </div>
    </div>
  );
}
