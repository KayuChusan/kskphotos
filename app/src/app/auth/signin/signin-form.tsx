"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export function SignInForm({ callbackUrl }: { callbackUrl?: string }) {
  const [email, setEmail] = useState("");
  const isDev = process.env.NODE_ENV === "development";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center text-base">Sign in to continue</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          className="w-full"
          onClick={() => signIn("google", { callbackUrl: callbackUrl ?? "/admin" })}
        >
          Sign in with Google
        </Button>

        {isDev && (
          <>
            <div className="flex items-center gap-2">
              <Separator className="flex-1" />
              <span className="text-xs text-muted-foreground">DEV ONLY</span>
              <Separator className="flex-1" />
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                signIn("credentials", {
                  email,
                  callbackUrl: callbackUrl ?? "/admin",
                });
              }}
              className="space-y-3"
            >
              <div className="space-y-2">
                <Label htmlFor="dev-email">Email</Label>
                <Input
                  id="dev-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  required
                />
              </div>
              <Button type="submit" variant="outline" className="w-full">
                Dev Sign In
              </Button>
            </form>
          </>
        )}
      </CardContent>
    </Card>
  );
}
