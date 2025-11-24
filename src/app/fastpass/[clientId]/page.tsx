
"use client";

import { useEffect, useState, FormEvent, useMemo, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@/firebase/auth/use-user";
import { useDatabase } from "@/firebase/provider";
import { ref, onValue, update, increment, serverTimestamp, push, set, get } from "firebase/database";
import type { ClientApp, UserProfile } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Lock, AlertTriangle, Pencil, RefreshCw, KeyRound } from "lucide-react";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { integrationDetails } from "@/lib/integrations-data";
import Link from "next/link";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { sendApprovalEmail } from "@/app/actions/email";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

// -------------------------------
// FASTPASS POPUP DEBUG LOGGING
// -------------------------------
function fpDebug(...args: any[]) {
    console.log("%c[FastPass Popup]", "color: #10B981; font-weight: bold;", ...args);
}

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


export default function FastPassApprovalPage() {
  const { user, isLoading: userLoading } = useUser();
  const db = useDatabase();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const clientId = params.clientId as string;
  const isPopup = searchParams.get('popup') === 'true';
  const isTest = searchParams.get('test') === 'true';
  const openerOrigin = searchParams.get('openerOrigin');


  const [clientApp, setClientApp] = useState<ClientApp | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [sharedData, setSharedData] = useState<{ [key: string]: any }>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [pinInput, setPinInput] = useState("");
  const [pinVerified, setPinVerified] = useState(false);
  const [finalStatus, setFinalStatus] = useState<'approved' | 'declined' | null>(null);
  
  useEffect(() => {
    fpDebug("Popup loaded");
    fpDebug("Is popup detected:", isPopup);
    fpDebug("Is test mode:", isTest);
    fpDebug("Opener origin:", openerOrigin);
  }, [isPopup, isTest, openerOrigin]);
  
  const fetchUserProfile = useCallback(async () => {
    if (!db || !user) return;
    const userRef = ref(db, `users/${user.uid}`);
    try {
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
            const profileData = snapshot.val() as UserProfile;
            setUserProfile(profileData);
            toast({
                title: "Profile Reloaded",
                description: "Your latest information has been loaded.",
            });
        } else {
            const newUserProfile: Partial<UserProfile> = {
                uid: user.uid,
                name: user.displayName || "",
                email: user.email || "",
                pfp: user.photoURL || "",
                ageGroup: "" as any,
            };
            await set(userRef, newUserProfile);
            setUserProfile(newUserProfile as UserProfile);
        }
    } catch (err) {
        console.error(err);
        setError("Could not retrieve user profile.");
    }
  }, [db, user, toast]);


  useEffect(() => {
    if (userLoading) return;
    
    const currentPath = `/fastpass/${clientId}?popup=true${isTest ? '&test=true': ''}${openerOrigin ? `&openerOrigin=${openerOrigin}` : ''}`;

    if (!user) {
        router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
        return;
    }
    
    if (!clientId || clientId.includes('.') || clientId.includes('#') || clientId.includes('$') || clientId.includes('[') || clientId.includes(']')) {
        setError("Invalid Client ID format.");
        setLoading(false);
        return;
    }

    if (!db) {
      setLoading(false);
      return;
    }

    const appRef = ref(db, `clients/${clientId}`);
    onValue(appRef, (snapshot) => {
      if (snapshot.exists()) {
        const appData = snapshot.val();
        setClientApp({ id: clientId, ...appData });
      } else {
        setError("Invalid Client ID: This application is not registered with FastPass.");
      }
      setLoading(false);
    }, (err) => {
        console.error(err);
        setError("Could not retrieve app details.");
        setLoading(false);
    });

    // Initial fetch without toast
    const initialFetch = async () => {
        if (!db || !user) return;
        const userRef = ref(db, `users/${user.uid}`);
        try {
            const snapshot = await get(userRef);
            if (snapshot.exists()) {
                setUserProfile(snapshot.val());
            } else {
                 const newUserProfile: Partial<UserProfile> = {
                    uid: user.uid,
                    name: user.displayName || "",
                    email: user.email || "",
                    pfp: user.photoURL || "",
                    ageGroup: "" as any,
                };
                await set(userRef, newUserProfile);
                setUserProfile(newUserProfile as UserProfile);
            }
        } catch (err) {
            console.error(err);
            setError("Could not retrieve user profile.");
        }
    }
    initialFetch();

  }, [db, clientId, user, userLoading, router, isPopup, isTest, openerOrigin]);
  
  useEffect(() => {
    if (clientApp && userProfile) {
        // Age restriction check
        const appMinAge = clientApp.minAgeGroup || 'All ages';
        const userAge = userProfile.ageGroup;
        if (appMinAge === '18+' && userAge === 'Under 18') {
             setError(`This app requires users to be 18 or older. Your current age group does not meet this requirement.`);
             return;
        }
    }
  }, [clientApp, userProfile]);

  useEffect(() => {
    if (userProfile && clientApp?.requestedIntegrations) {
        const missing: string[] = [];
        const initialShared: { [key: string]: any } = {};

        if (!userProfile.ageGroup) {
            missing.push('ageGroup');
        }

        for (const key in clientApp.requestedIntegrations) {
            if (!clientApp.requestedIntegrations[key]) continue;

            const detail = integrationDetails[key];
            const isMinor = userProfile.ageGroup === 'Under 18';

            if (isMinor && detail?.restricted) {
                continue;
            }

            const value = userProfile[key as keyof UserProfile];
            initialShared[key] = value;

            if (value === undefined || value === '') {
                if (key !== 'uid' && key !== 'pfp' && key !== 'name' && key !== 'email' && key !== 'ssoPassword') {
                    missing.push(key);
                }
            }
        }
        
        setMissingFields(missing);
        setSharedData(initialShared);
    }
}, [userProfile, clientApp]);
  
  const pinRequired = useMemo(() => {
    if (!userProfile || !clientApp || !userProfile.pin || userProfile.pinSecurityLevel === 'Off') {
      return false;
    }
    
    const securityLevel = userProfile.pinSecurityLevel;
    const requestedKeys = Object.keys(clientApp.requestedIntegrations || {});
    
    if (securityLevel === 'Full') return true;

    return requestedKeys.some(key => {
        if (!clientApp.requestedIntegrations?.[key]) {
            return false;
        }

        const detail = integrationDetails[key];
        if (!detail) return false;

        const protectedCategories = securityCategories[securityLevel as keyof typeof securityCategories] || [];

        if (securityLevel === 'High' && highSecurityExemptions.includes(key)) {
            return false;
        }

        if (securityLevel === 'Medium' && detail.category === 'Identity') {
            return false;
        }

        return protectedCategories.includes(detail.category);
    });
  }, [userProfile, clientApp]);


  const logAction = async (action: 'Approved' | 'Declined') => {
      if (!db || !user || !clientApp) return;
      const logRef = ref(db, `logs/${user.uid}`);
      const newLogRef = push(logRef);
      await set(newLogRef, {
        timestamp: serverTimestamp(),
        action: action,
        clientId: clientApp.id
      });
  }

  const sendPopupMessage = (status: "approved" | "declined" | "canceled", data: any) => {
    if (!clientApp) return;

    let targetOrigin = "*";
    if (openerOrigin) {
        targetOrigin = openerOrigin;
    } else if (!isTest) {
        try {
            targetOrigin = new URL(clientApp.redirectUri).origin;
        } catch (e) {
            console.error("Invalid redirectUri, falling back to '*':", clientApp.redirectUri);
            targetOrigin = "*";
        }
    }
    
    fpDebug("Preparing postMessage...");
    fpDebug("Status:", status, "Data:", data);
    fpDebug("Target Origin:", targetOrigin);

    setTimeout(() => {
         try {
            if (window.opener) {
                window.opener.postMessage({ status, data }, targetOrigin);
                fpDebug("Message SENT successfully!");
            } else {
                fpDebug("❌ ERROR: window.opener is not available.");
            }
        } catch (err) {
            fpDebug("❌ ERROR sending message:", err);
        }
        
        fpDebug("Closing popup...");
        window.close();
    }, 1500); // Wait for animation to finish
  }

  const handlePinInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 6) {
        setPinInput(value);
        if (userProfile?.pin === value && (value.length >= 4 && value.length <=6)) {
            setPinVerified(true);
             toast({
                title: "PIN Verified",
                description: "You can now approve.",
            });
        } else {
            setPinVerified(false);
        }
    }
  }

  const generateSecurePassword = () => {
    const array = new Uint32Array(8);
    window.crypto.getRandomValues(array);
    return 'fp_' + Array.from(array, dec => ('0' + dec.toString(36)).slice(-2)).join('');
  };


  const handleApprove = async () => {
    fpDebug("Approve clicked!");
    if (!userProfile || !db || !user || !clientApp) return;

    if (pinRequired && !pinVerified) {
         toast({
            variant: 'destructive',
            title: 'PIN Required',
            description: 'Please enter your correct PIN to approve.'
        });
        return;
    }
    
    setFinalStatus('approved');
    await logAction('Approved');

    const appConnectionRef = ref(db, `users/${user.uid}/apps/${clientApp.id}`);
    update(appConnectionRef, {
      approvedCount: increment(1),
      lastUsed: serverTimestamp()
    });
    update(ref(db, `clients/${clientApp.id}`), {
        approvals: increment(1)
    });

    const isSSORequest = clientApp.requestedIntegrations?.ssoPassword;
    const finalSharedDataObject: { [key: string]: any } = {};

    // Populate with standard requested data first
    const requestedIntegrations = clientApp.requestedIntegrations || {};
    const isMinor = userProfile.ageGroup === 'Under 18';

    for (const key in requestedIntegrations) {
        if (!requestedIntegrations[key] || key === 'ssoPassword') continue;
        const detail = integrationDetails[key];
        if (isMinor && detail?.restricted) continue;
        const value = sharedData[key];
        if (value !== undefined && value !== null && value !== '') {
            finalSharedDataObject[key] = value;
        }
    }
    
    // If it's an SSO request, add the special SSO fields
    if (isSSORequest) {
        const appPasswordRef = ref(db, `users/${user.uid}/apps/${clientApp.id}/ssoPassword`);
        const snapshot = await get(appPasswordRef);
        let ssoPassword = snapshot.val();
        let losStatus = "Login";

        if (!ssoPassword) {
            ssoPassword = generateSecurePassword();
            await set(appPasswordRef, ssoPassword);
            losStatus = "Signup";
        }
        finalSharedDataObject.email = user.email; // Always include email for SSO
        finalSharedDataObject.ssoPassword = ssoPassword;
        finalSharedDataObject.LOS = losStatus;
    }
    
    // Send email notification
    if (user.email && user.displayName && !userProfile.hideEmail) {
        const sharedDataForEmail = Object.keys(finalSharedDataObject)
            .filter(key => key !== 'ssoPassword' && key !== 'LOS')
            .map(key => ({ label: integrationDetails[key]?.label || key, value: finalSharedDataObject[key] }));
        if(sharedDataForEmail.length > 0) {
           sendApprovalEmail({email: user.email, name: user.displayName}, clientApp, sharedDataForEmail, userProfile);
        }
    }

    sendPopupMessage("approved", finalSharedDataObject);
  };

  const handleDecline = async () => {
    fpDebug("Decline clicked!");
    if (!clientApp) return;
    setFinalStatus('declined');
    await logAction('Declined');
    sendPopupMessage("declined", null);
  };
  
  const getInitials = (name?: string | null) => {
    if (!name) return "";
    const names = name.split(" ");
    let initials = names[0].substring(0, 1).toUpperCase();
    if (names.length > 1) {
      initials += names[names.length - 1].substring(0, 1).toUpperCase();
    }
    return initials;
  };
  
 const renderValue = (value: any) => {
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    if (value === null || value === undefined || value === '') {
      return <span className="text-destructive">Not Set</span>;
    }
    return String(value);
  };


  if (finalStatus) {
    return <StatusScreen status={finalStatus} />;
  }

  if (loading || userLoading || !userProfile) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
             <div className="flex items-center space-x-2">
                <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
                <span className="text-muted-foreground">Loading...</span>
            </div>
        </div>
    );
  }

  if (error) {
       return (
        <div className="flex h-screen items-center justify-center p-4">
             <Card className="w-full max-w-sm text-center">
                <CardHeader>
                    <CardTitle className="text-destructive">Error</CardTitle>
                    <CardDescription>{error}</CardDescription>
                </CardHeader>
                 <CardFooter>
                    <Button onClick={() => router.push('/')} className="w-full">Go Home</Button>
                 </CardFooter>
            </Card>
        </div>
       )
  }

  if (!clientApp) {
    return null;
  }

  const isMinor = userProfile?.ageGroup === 'Under 18';
  const ageGroupNotSet = !userProfile.ageGroup;
  
  const mainButtonDisabled = ageGroupNotSet || (pinRequired && !pinVerified);
  const isSSORequest = !!clientApp.requestedIntegrations?.ssoPassword;
  const requestedKeys = Object.keys(clientApp.requestedIntegrations || {});


  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
       <form onSubmit={(e) => { e.preventDefault(); handleApprove(); }}>
        <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                {clientApp.logo ? (
                     <Avatar className="h-16 w-16">
                        <AvatarImage src={clientApp.logo} alt={clientApp.name} />
                        <AvatarFallback>{getInitials(clientApp.name)}</AvatarFallback>
                    </Avatar>
                ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-muted text-2xl font-bold text-muted-foreground">
                        {getInitials(clientApp.name)}
                    </div>
                )}
            </div>
          <CardTitle className="flex items-center justify-center gap-2">
            {clientApp.name}
            {clientApp.verified && (
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
            )}
          </CardTitle>
           <CardDescription>
            {isSSORequest 
                ? `is using FastPass for sign-in.` 
                : (clientApp.description || `wants to use FastPass to pre-fill your info.`)}
            </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg border p-4 space-y-4">
             {isSSORequest && (
                 <Alert>
                    <KeyRound className="h-4 w-4" />
                    <AlertTitle>{clientApp.name} will create an account with FastPass</AlertTitle>
                    <AlertDescription>
                        This app uses FastPass for logins. A unique, secure password will be created for you, allowing you to sign in without remembering another password.
                    </AlertDescription>
                </Alert>
            )}

            <div>
                <div className="flex justify-between items-center mb-2">
                    <p className="text-sm font-medium text-muted-foreground">{isSSORequest ? 'This app will also receive:' : 'This app will receive:'}</p>
                    <div className="flex items-center gap-2">
                         <Button variant="ghost" size="sm" type="button" asChild>
                           <Link href="/dashboard/profile" target="_blank">
                             <Pencil className="h-3 w-3 mr-2" /> Edit
                           </Link>
                         </Button>
                         <Button variant="ghost" size="sm" type="button" onClick={fetchUserProfile}>
                             <RefreshCw className="h-3 w-3 mr-2" /> Reload
                         </Button>
                    </div>
                </div>
                <div className="space-y-3">
                    {requestedKeys.map(key => {
                         if (key === 'ssoPassword' && isSSORequest) {
                            return null;
                         }
                         if (!clientApp.requestedIntegrations?.[key]) return null;

                         const detail = integrationDetails[key];
                         const value = sharedData[key];

                         if (key === 'email' && userProfile.hideEmail) {
                              return (
                                 <div key={key} className="flex items-center justify-between text-sm">
                                    <Label className="text-muted-foreground">{detail?.label || key}</Label>
                                    <span className="font-medium text-right break-all">Will not be shared</span>
                                </div>
                              )
                          }

                         if (isMinor && detail?.restricted) {
                             return (
                                 <div key={key} className="flex items-center justify-between text-sm opacity-50">
                                    <Label className="text-muted-foreground line-through">{detail?.label || key}</Label>
                                    <span className="font-medium text-right break-all">Unavailable for minors</span>
                                </div>
                             )
                         }
                        
                        return (
                            <div key={key} className="flex items-center justify-between text-sm">
                                <Label className="text-muted-foreground">{detail?.label || key}</Label>
                                {key === 'pfp' && value ? (
                                     <Avatar className="h-6 w-6">
                                        <AvatarImage src={value as string} />
                                        <AvatarFallback>{getInitials(userProfile.name)}</AvatarFallback>
                                    </Avatar>
                                ) : (
                                   <span className="font-medium text-right break-all">{renderValue(value)}</span>
                                )}
                           </div>
                        )
                    })}
                     {requestedKeys.length === 1 && isSSORequest && (
                        <p className="text-sm text-muted-foreground">Only sign-in credentials will be created.</p>
                     )}
                </div>
            </div>
            
            {pinRequired && (
                 <div className="space-y-4 border-t pt-4">
                     <p className="text-sm font-medium text-destructive flex items-center gap-2"><Lock className="h-4 w-4"/> PIN Required</p>
                     <div className="space-y-2">
                        <Label htmlFor="pin">Enter your PIN to approve this request.</Label>
                        <Input
                            id="pin"
                            type="password"
                            maxLength={6}
                            value={pinInput}
                            onChange={handlePinInputChange}
                            placeholder="******"
                            className="w-[120px] text-center"
                        />
                     </div>
                </div>
            )}

          </div>

        {ageGroupNotSet && (
                <Alert variant="destructive">
                    <AlertTitle>Age Group Required</AlertTitle>
                    <AlertDescription>
                        You must select your age group before you can approve this request. Go to your <Link href="/dashboard/profile" className="underline">profile</Link>.
                    </AlertDescription>
                </Alert>
            )}

          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" type="button" onClick={handleDecline}>Decline</Button>
            <Button type="submit" disabled={mainButtonDisabled}>
               {pinRequired && !pinVerified ? 'Enter PIN to Approve' : 'Approve'}
            </Button>
          </div>
            
            {!isSSORequest && (
                 <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Important: This is a Profile Filler, Not a Login Service</AlertTitle>
                    <AlertDescription>
                        FastPass is a quick pass for pre-filling profiles; it is <strong>not</strong> a Single Sign-On (SSO) service like Google or Apple.
                        FastPass does not verify user identity. Developers: do not use this as a sole authentication method, as it can be easily impersonated. FastPass is not responsible for the creation or security of accounts on third-party sites.
                    </AlertDescription>
                </Alert>
            )}
        </CardContent>
        </form>
      </Card>
    </div>
  );
}

const securityCategories = {
    Low: ["Professional", "E-Commerce"],
    Medium: ["Contact", "Social", "Professional", "Gaming", "Security", "E-Commerce", "Interests", "Preferences"],
    High: ["Identity", "Contact", "Social", "Professional", "Gaming", "Security", "E-Commerce", "Interests", "Preferences"],
    Full: Object.keys(integrationDetails).map(k => integrationDetails[k].category)
};

const highSecurityExemptions = ['name', 'email', 'pfp'];


    

    

    