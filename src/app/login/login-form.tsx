
"use client";

import {
  GoogleAuthProvider,
  signInWithPopup,
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { useAuth } from "@/firebase/provider";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { sendLoginEmail } from "@/app/actions/email";
import { Badge } from "@/components/ui/badge";

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <title>Google Logo</title>
      <clipPath id="g">
        <path d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z" />
      </clipPath>
      <g clipPath="url(#g)">
        <path fill="#FBBC05" d="M0 37V11l17 13z" />
        <path fill="#EA4335" d="M0 11l17 13 7-6.1L48 14V0H0z" />
        <path fill="#34A853" d="M0 37l30-23 7.9 1L48 0v48H0z" />
        <path fill="#4285F4" d="M48 48L17 24l-4-3 35-10z" />
      </g>
    </svg>
  );
}

export default function LoginForm() {
  const auth = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);

  const handleLoginSuccess = (user: { email: string | null, displayName: string | null }) => {
    if (user.email && user.displayName) {
        sendLoginEmail({ email: user.email, name: user.displayName });
    }
    router.push(redirect || "/dev");
  };

  const handleGoogleSignIn = async () => {
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      handleLoginSuccess(result.user);
    } catch (error: any) {
      console.error("Error signing in with Google: ", error);
      toast({ variant: 'destructive', title: "Sign in failed", description: error.message });
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      handleLoginSuccess(result.user);
    } catch (error: any) {
      console.error("Error signing in: ", error);
      toast({ variant: 'destructive', title: "Sign in failed", description: error.message });
    }
  }

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(result.user, { displayName: name });
      handleLoginSuccess({ email: result.user.email, displayName: name });
    } catch (error: any) {
        console.error("Error signing up: ", error);
        toast({ variant: 'destructive', title: "Sign up failed", description: error.message });
    }
  };


  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">Welcome to FastPass <Badge variant="outline">BETA</Badge></CardTitle>
          <CardDescription>{isSignUp ? 'Create your account' : 'Sign in to your account'}</CardDescription>
        </CardHeader>
        <form onSubmit={isSignUp ? handleEmailSignUp : handleEmailSignIn}>
            <CardContent className="space-y-4">
               {isSignUp && (
                 <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" type="text" placeholder="John Doe" required value={name} onChange={(e) => setName(e.target.value)} />
                </div>
               )}
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="m@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <Button type="submit" className="w-full">{isSignUp ? 'Sign Up' : 'Sign In'}</Button>
                 <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                    </div>
                </div>
                <Button
                    variant="outline"
                    className="w-full"
                    type="button"
                    onClick={handleGoogleSignIn}
                >
                    <GoogleIcon className="mr-2 h-4 w-4" />
                    Sign in with Google
                </Button>
            </CardContent>
        </form>
        <CardFooter className="flex flex-col gap-2">
           <p className="text-xs text-muted-foreground">
             {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            </p>
            <Button variant="link" className="p-0 h-auto" onClick={() => setIsSignUp(!isSignUp)}>
                {isSignUp ? 'Sign In' : 'Sign up with Email'}
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

    