
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { CheckCircle2, AlertTriangle, User, KeyRound } from "lucide-react";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const StatusScreen = ({ status }: { status: 'approved' | 'declined' }) => {
    const isApproved = status === 'approved';
    const [showFallback, setShowFallback] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowFallback(true);
        }, 5000); // Show fallback after 5 seconds

        return () => clearTimeout(timer);
    }, []);

    const handleClose = () => {
        window.close();
    }
    
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <style>
                {`
                    @keyframes draw-circle { to { stroke-dashoffset: 0; } }
                    @keyframes draw-icon { to { stroke-dashoffset: 0; } }
                    .status-icon-circle { stroke-dasharray: 283; stroke-dashoffset: 283; animation: draw-circle 0.6s ease-out forwards; }
                    .status-icon-mark { stroke-dasharray: 50; stroke-dashoffset: 50; animation: draw-icon 0.4s ease-out forwards 0.5s; }
                `}
            </style>
            <div className="flex flex-col items-center justify-center text-center text-foreground">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 100 100"
                    className="h-24 w-24"
                >
                    <circle 
                        className={cn("status-icon-circle stroke-[5]", isApproved ? "stroke-primary" : "stroke-destructive")} 
                        cx="50" cy="50" r="45" fill="none"
                    />
                    {isApproved ? (
                         <path 
                            className="status-icon-mark"
                            d="M31 52 l16 16 l22 -22" 
                            fill="none" 
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            stroke="hsl(var(--primary))"
                            strokeWidth="6"
                        />
                    ) : (
                        <g 
                             className="status-icon-mark stroke-[6]"
                             stroke="hsl(var(--destructive))"
                             strokeLinecap="round"
                        >
                            <line x1="35" y1="35" x2="65" y2="65" />
                            <line x1="65" y1="35" x2="35" y2="65" />
                        </g>
                    )}
                </svg>
                <h2 className="mt-6 text-2xl font-bold">
                    {isApproved ? "Approved!" : "Declined"}
                </h2>
                <p className="mt-2 text-muted-foreground">Redirecting you back to the site, don't close this window...</p>
                 {showFallback && (
                    <div className="mt-6">
                        <p className="text-sm text-muted-foreground mb-2">Redirect not working?</p>
                        <Button onClick={handleClose}>Return to Site</Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default function FastPassSsoDemoPage() {
    const [finalStatus, setFinalStatus] = useState<'approved' | 'declined' | null>(null);

    const clientApp = {
        name: "Demo SSO App",
        verified: true,
    }

    const userProfile = {
        name: "Demo User",
        email: "demo.user@example.com",
    }
    
    const sendPopupMessage = (status: "approved" | "declined" | "canceled") => {
        const data = status === 'approved' 
            ? { 
                name: userProfile.name, 
                email: userProfile.email,
                ssoPassword: "fp_example_secure_password_string_12345", // Example password
                LOS: "Signup" // Simulate a first-time login
              } 
            : null;
        
        setTimeout(() => {
            if (window.opener) {
                window.opener.postMessage({ status, data }, "*");
            }
            window.close();
        }, 1500);
    }

    useEffect(() => {
      const handleBeforeUnload = () => {
        if (!finalStatus) {
          sendPopupMessage('canceled');
        }
      };
      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [finalStatus]);

    const handleApprove = () => {
        setFinalStatus('approved');
        sendPopupMessage("approved");
    };

    const handleDecline = () => {
        setFinalStatus('declined');
        sendPopupMessage("declined");
    };

    if (finalStatus) {
        return <StatusScreen status={finalStatus} />;
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                       <User className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <CardTitle className="flex items-center justify-center gap-2">
                        {clientApp.name}
                        <Badge variant="outline">DEMO</Badge>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <CheckCircle2 className="h-5 w-5 text-primary" />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Verified Application</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </CardTitle>
                    <CardDescription>{`is using FastPass for sign-in.`}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="rounded-lg border p-4 space-y-4">
                        <Alert>
                            <KeyRound className="h-4 w-4" />
                            <AlertTitle>{clientApp.name} will create an account with FastPass</AlertTitle>
                            <AlertDescription>
                                A unique, secure password will be created for you, allowing you to sign in without remembering another password.
                            </AlertDescription>
                        </Alert>
                         <div>
                            <p className="text-sm font-medium text-muted-foreground mb-2">This app will also receive:</p>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <Label className="text-muted-foreground">Full Name</Label>
                                    <span className="font-medium text-right break-all">{userProfile.name}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <Label className="text-muted-foreground">Email Address</Label>
                                    <span className="font-medium text-right break-all">{userProfile.email}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Button variant="outline" type="button" onClick={handleDecline}>Decline</Button>
                        <Button type="button" onClick={handleApprove}>Approve</Button>
                    </div>
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>SSO is a Demo Feature</AlertTitle>
                        <AlertDescription>
                            FastPass SSO simplifies login by securely managing an email and password for you. It is <strong>not</strong> a traditional SSO provider like Google or Apple and does not provide cryptographic identity verification.
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        </div>
    );
}

    