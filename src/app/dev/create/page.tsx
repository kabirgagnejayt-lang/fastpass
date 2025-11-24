
'use client';
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser } from "@/firebase/auth/use-user";
import { useDatabase } from "@/firebase/provider";
import { useToast } from "@/hooks/use-toast";
import { push, ref, serverTimestamp, set, onValue } from "firebase/database";
import { useRouter } from "next/navigation";
import { useState, useMemo, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Search, Lock, AlertTriangle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { allIntegrations, allIntegrationsList } from "@/lib/integrations-data";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { UserProfile } from "@/lib/types";
import { Textarea } from "@/components/ui/textarea";

const ageGroups = ["All ages", "18+"];


export default function CreateAppPage() {
    const db = useDatabase();
    const { user, isLoading: isUserLoading } = useUser();
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [appName, setAppName] = useState('');
    const [redirectUri, setRedirectUri] = useState('');
    const [logoUrl, setLogoUrl] = useState('');
    const [description, setDescription] = useState('');
    const [buttonDescription, setButtonDescription] = useState('');
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [isProfileLoading, setIsProfileLoading] = useState(true);
    const [minAgeGroup, setMinAgeGroup] = useState<string>('All ages');
    const [acknowledged, setAcknowledged] = useState(false);
    
    const [requestedIntegrations, setRequestedIntegrations] = useState<{ [key: string]: boolean }>(() => {
        const defaults: { [key: string]: boolean } = {};
        allIntegrationsList.forEach(i => {
            if (i.defaultChecked) {
                defaults[i.id] = true;
            }
        });
        return defaults;
    });

     useEffect(() => {
        if (!user) {
            if (!isUserLoading) {
                 router.push(`/login?redirect=/dev/create`);
            }
            return;
        }
        if (!db) {
            setIsProfileLoading(false);
            return;
        }

        setIsProfileLoading(true);
        const userRef = ref(db, `users/${user.uid}`);
        const unsubscribe = onValue(userRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                setUserProfile(data);
                if (data.ageGroup === 'Under 18' || data.ageGroup === 'Prefer not to say') {
                    setMinAgeGroup('All ages');
                }
            }
            setIsProfileLoading(false);
        });

        return () => unsubscribe();
    }, [db, user, isUserLoading, router]);

    const isDevMinor = userProfile?.ageGroup === 'Under 18' || userProfile?.ageGroup === 'Prefer not to say';
    const isAppForAllAges = minAgeGroup === 'All ages';
    const isSSOEnabled = !!requestedIntegrations.ssoPassword;

    const handleIntegrationChange = (integrationId: string, checked: boolean) => {
        setRequestedIntegrations(prev => {
            const newIntegrations = { ...prev };
            if (checked) {
                newIntegrations[integrationId] = true;
                if (integrationId === 'ssoPassword') {
                    newIntegrations['name'] = true; // Force-enable name
                }
            } else {
                 if (integrationId === 'ssoPassword') {
                    // Do not allow unchecking ssoPassword if it's the trigger
                } else {
                    delete newIntegrations[integrationId];
                }
            }
            return newIntegrations;
        });
    };

    const filteredIntegrationCategories = useMemo(() => {
        if (!searchTerm) {
            return allIntegrations;
        }
        return allIntegrations
            .map(category => ({
                ...category,
                integrations: category.integrations.filter(
                    integ =>
                        integ.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        integ.description.toLowerCase().includes(searchTerm.toLowerCase())
                ),
            }))
            .filter(category => category.integrations.length > 0);
    }, [searchTerm]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!db || !user) {
            toast({ variant: "destructive", title: "Error", description: "You must be logged in to create an app." });
            return;
        }
        if (!userProfile?.ageGroup) {
             toast({ variant: "destructive", title: "Profile Incomplete", description: "Please set your age group on your profile before creating an app." });
            return;
        }

        setLoading(true);

        if (!appName || !redirectUri) {
            toast({ variant: "destructive", title: "Error", description: "App Name and Redirect URI are required." });
            setLoading(false);
            return;
        }
        
        try {
            const clientsRef = ref(db, 'clients');
            const newClientRef = push(clientsRef);

            const finalIntegrations = { ...requestedIntegrations, name: true };

            await set(newClientRef, {
                name: appName,
                redirectUri,
                logo: logoUrl,
                description,
                buttonDescription,
                ownerUid: user.uid,
                createdAt: serverTimestamp(),
                id: newClientRef.key,
                verified: false,
                requestedIntegrations: finalIntegrations,
                minAgeGroup: isDevMinor ? 'All ages' : minAgeGroup,
                buttonStyle: {
                    mainText: 'Continue with FastPass',
                    hideAppName: false,
                }
            });

            toast({ title: "Success!", description: "Your app has been created." });
            router.push(`/dev/${newClientRef.key}`);

        } catch (error) {
            console.error("Error creating app:", error);
            toast({ variant: "destructive", title: "Error", description: "Could not create the app. Please try again." });
        } finally {
            setLoading(false);
        }
    }
    
    const requestedIntegrationIds = Object.keys(requestedIntegrations || {});
    
    if (isUserLoading || isProfileLoading) {
        return <Card>
            <CardHeader><Skeleton className="h-8 w-48" /><Skeleton className="h-4 w-64" /></CardHeader>
            <CardContent><Skeleton className="h-48 w-full" /></CardContent>
            <CardFooter><Skeleton className="h-10 w-32" /></CardFooter>
        </Card>
    }

    if (!user) return null;

    if (!userProfile?.ageGroup) {
         return (
            <Card>
                <CardHeader>
                    <CardTitle>Profile Incomplete</CardTitle>
                    <CardDescription>You need to set your age group before you can create an app.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Alert>
                        <AlertTitle>Action Required</AlertTitle>
                        <AlertDescription>
                            Please go to your profile and select an age group to continue. This is required to ensure compliance with our platform rules.
                        </AlertDescription>
                    </Alert>
                </CardContent>
                <CardFooter>
                    <Button asChild>
                        <Link href="/dashboard/profile">Go to Profile</Link>
                    </Button>
                </CardFooter>
            </Card>
        );
    }

    return (
        <Card>
            <form onSubmit={handleSubmit}>
                <CardHeader>
                <CardTitle>Create New App</CardTitle>
                <CardDescription>Register a new application to get a Client ID for FastPass.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="app-name">App Name</Label>
                        <Input id="app-name" name="app-name" placeholder="My Awesome App" value={appName} onChange={(e) => setAppName(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="redirect-uri">Redirect URI</Label>
                        <Input id="redirect-uri" name="redirect-uri" placeholder="https://myapp.com/callback" value={redirectUri} onChange={(e) => setRedirectUri(e.target.value)} required />
                        <p className="text-xs text-muted-foreground">For security, this must be the domain where your parent application is hosted.</p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="logo">Logo URL (Optional)</Label>
                        <Input id="logo" name="logo" placeholder="https://myapp.com/logo.png" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="description">App Description (Optional)</Label>
                        <Textarea id="description" name="description" placeholder="A brief summary of what your app does, shown on the approval screen." value={description} onChange={(e) => setDescription(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="buttonDescription">Button Description (Optional)</Label>
                        <Input id="buttonDescription" name="buttonDescription" placeholder="e.g., Get Started Fast" value={buttonDescription} onChange={(e) => setButtonDescription(e.target.value)} maxLength={30} />
                        <p className="text-xs text-muted-foreground">A few words to show on the button itself. If left blank, the app name will be used.</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="minAgeGroup">Minimum Age Group</Label>
                        <Select value={minAgeGroup} onValueChange={setMinAgeGroup} disabled={isDevMinor}>
                            <SelectTrigger id="minAgeGroup" className="w-[180px]">
                                <SelectValue placeholder="Select age group" />
                            </SelectTrigger>
                            <SelectContent>
                                {ageGroups.map(group => (
                                    <SelectItem key={group} value={group}>{group}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">Set the minimum age required for users to approve your app. This is locked if you are under 18.</p>
                    </div>

                     <div className="space-y-4">
                        <Label>Requested Integrations</Label>
                        <CardDescription>Select the user information your application will receive upon approval.</CardDescription>
                         <div className="rounded-lg border p-4 space-y-4">
                            <div className="flex flex-wrap gap-2">
                                {requestedIntegrationIds.length > 0 ? (
                                    requestedIntegrationIds.map(id => (
                                        <Badge key={id} variant={id === 'ssoPassword' ? 'default' : 'secondary'}>
                                            {allIntegrationsList.find(i => i.id === id)?.label || id}
                                        </Badge>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground">No integrations requested yet.</p>
                                )}
                            </div>
                            
                            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button type="button" variant="outline">Select Integrations</Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-2xl">
                                    <DialogHeader>
                                        <DialogTitle>Integration Store</DialogTitle>
                                        <DialogDescription>Select the user data your app needs to function.</DialogDescription>
                                    </DialogHeader>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input 
                                            placeholder="Search integrations..."
                                            className="pl-9"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <Accordion type="multiple" defaultValue={filteredIntegrationCategories.map(c => c.category)} className="max-h-[400px] overflow-y-auto p-1 -mx-1">
                                        {filteredIntegrationCategories.map(category => (
                                            <AccordionItem value={category.category} key={category.category}>
                                                <AccordionTrigger className="text-lg font-medium">{category.category}</AccordionTrigger>
                                                <AccordionContent>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                                        {category.integrations.map(integ => {
                                                            const isRestrictedForApp = isAppForAllAges && integ.restricted;
                                                            const isNameField = integ.id === 'name';
                                                            const isDisabled = integ.verifiedOnly || isRestrictedForApp || (isNameField && isSSOEnabled);
                                                            const isChecked = !!requestedIntegrations[integ.id] || (isNameField && isSSOEnabled);
                                                            
                                                            const labelElement = (
                                                                <Label 
                                                                    htmlFor={`create-${integ.id}`} 
                                                                    className={`flex items-start gap-3 rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent has-[:checked]:bg-accent has-[:checked]:ring-2 has-[:checked]:ring-primary w-full ${isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                                                                >
                                                                     <Checkbox
                                                                        id={`create-${integ.id}`}
                                                                        checked={isChecked}
                                                                        onCheckedChange={(checked) => handleIntegrationChange(integ.id, !!checked)}
                                                                        disabled={isDisabled}
                                                                        className="mt-1"
                                                                    />
                                                                    <div className="flex-1 space-y-1">
                                                                        <div className="font-semibold flex items-center gap-2">
                                                                            {integ.label}
                                                                            {integ.verifiedOnly && <Lock className="h-3 w-3 text-muted-foreground" />}
                                                                            {integ.restricted && <Badge variant="outline">18+</Badge>}
                                                                        </div>
                                                                        <div className="text-xs text-muted-foreground">{integ.description}</div>
                                                                        {isNameField && isSSOEnabled && <div className="text-xs font-semibold text-primary">Required for SSO</div>}
                                                                    </div>
                                                                </Label>
                                                            );
                                                            
                                                            return (
                                                                <div key={`create-${integ.id}`} className="relative flex items-start">
                                                                    {isDisabled && !isNameField ? (
                                                                         <TooltipProvider>
                                                                            <Tooltip>
                                                                                <TooltipTrigger asChild>
                                                                                    <div className="w-full h-full" tabIndex={0}>{labelElement}</div>
                                                                                </TooltipTrigger>
                                                                                <TooltipContent>
                                                                                     {integ.verifiedOnly && <p>This integration requires your app to be verified.</p>}
                                                                                     {isRestrictedForApp && <p>This integration cannot be requested for apps available to all ages.</p>}
                                                                                </TooltipContent>
                                                                            </Tooltip>
                                                                        </TooltipProvider>
                                                                    ) : (
                                                                        labelElement
                                                                    )}
                                                                </div>
                                                             )
                                                        })}
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>
                                        ))}
                                    </Accordion>
                                    {filteredIntegrationCategories.length === 0 && <p className="text-center text-muted-foreground col-span-2 py-4">No integrations found.</p>}

                                    <DialogFooter>
                                        <Button type="button" onClick={() => setIsDialogOpen(false)}>Done</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                    
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Important: This is a Profile Filler, Not a Login Service</AlertTitle>
                        <AlertDescription>
                            FastPass is a quick pass for pre-filling profiles; it is <strong>not</strong> a Single Sign-On (SSO) service. FastPass does not verify user identity. Do not use this as a sole authentication method, as it can be easily impersonated. FastPass is not responsible for the creation or security of accounts on third-party sites.
                            <br/><br/>
                            Our SSO feature is a demo and acts as a secure password manager, not a traditional OAuth provider. By using FastPass, you agree you understand this distinction.
                        </AlertDescription>
                        <div className="flex items-center space-x-2 mt-4">
                            <Checkbox id="terms" checked={acknowledged} onCheckedChange={(checked) => setAcknowledged(!!checked)} />
                            <label
                                htmlFor="terms"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                I understand and acknowledge the terms.
                            </label>
                        </div>
                    </Alert>
                </CardContent>
                <CardFooter className="border-t pt-6">
                    <Button type="submit" disabled={loading || !acknowledged}>
                        {loading ? "Creating..." : "Create App"}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    )
}
