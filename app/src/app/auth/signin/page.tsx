import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | kskphotos",
  description: "サインイン - 管理画面へのログインページです。",
};

export default function SignInPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">サインイン</h1>
      <p className="text-muted-foreground">
        管理画面にアクセスするにはサインインが必要です。
      </p>
    </main>
  );
}
