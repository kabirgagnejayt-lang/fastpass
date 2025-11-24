
'use client';
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser } from "@/firebase/auth/use-user";
import { useDatabase } from "@/firebase/provider";
import { useToast } from "@/hooks/use-toast";
import { onValue, ref, update } from "firebase/database";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useMemo, useRef } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import type { ClientApp, UserProfile } from "@/lib/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Search, Lock, CheckCircle2, Settings } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { allIntegrations, allIntegrationsList } from "@/lib/integrations-data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

const ageGroups = ["All ages", "18+"];
const mainTextOptions = ["Continue with FastPass", "FastPass"];
const bannerPositions = ["top-left", "top-right", "bottom-left", "bottom-right"];

const ButtonPreview = ({ appData, formData }: { appData: ClientApp, formData: Partial<ClientApp> }) => {
    const app = { ...appData, ...formData };
    const buttonStyle = app.buttonStyle || {};
    const mainText = buttonStyle.mainText || 'Continue with FastPass';
    const hideAppName = buttonStyle.hideAppName || false;

    return (
        <div className="flex justify-center p-8 rounded-lg bg-muted">
            <div className="fastpass-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '100%', maxWidth: '350px' }}>
                <div className="fastpass-button-wrapper" style={{ position: 'relative', width: '100%'}}>
                    <button className="fastpass-button-base state-default" disabled>
                        <div className="fastpass-content-state state-content-default" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px'}}>
                            <div className="fastpass-top-row" style={{display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', fontWeight: 600}}>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="fastpass-logo" style={{width: '20px', height: '20px'}}><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                                <span>{mainText}</span>
                            </div>
                            {app.buttonDescription && <div className="fastpass-mid-row" style={{fontSize: '14px', opacity: 0.9, marginTop: '4px'}}>{app.buttonDescription}</div>}
                            {!hideAppName && (
                                <div className="fastpass-bottom-row" style={{display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', opacity: 0.8, marginTop: '8px'}}>
                                    <span style={{fontWeight: 600}}>{app.name}</span>
                                    {(app.verified) && <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="fastpass-check" style={{width: '14px', height: '14px'}}><path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" /></svg>}
                                </div>
                            )}
                        </div>
                    </button>
                </div>
                <div className="fastpass-powered-by" style={{ fontSize: '12px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif', color: '#9ca3af', textAlign: 'center' }}>
                    Powered by <a href="https://fastpass.kabirinvents.com" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>FastPass</a>
                </div>
            </div>
            <style>{`
                @keyframes fastpass-stripe-animation-preview { from { background-position: 0 0; } to { background-position: -40px 0; } }
                .fastpass-button-base { 
                  position: relative; display: flex; flex-direction: column; align-items: center; 
                  justify-content: center; gap: 8px; 
                  width: 100%; max-width: 350px; min-height: 90px; padding: 16px; background-color: hsl(var(--primary)); color: white; 
                  border: none; border-radius: 8px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; 
                  overflow: hidden; transition: filter 0.2s ease-in-out; text-align: center;
                  background-image: repeating-linear-gradient(-45deg, transparent, transparent 10px, rgba(255, 255, 255, 0.05) 10px, rgba(255, 255, 255, 0.05) 20px);
                  animation: fastpass-stripe-animation-preview 1.5s linear infinite;
                }
            `}</style>
        </div>
    );
}

export default function EditAppPage() {
    const db = useDatabase();
    const { user, isLoading: isUserLoading } = useUser();
    const router = useRouter();
    const params = useParams();
    const appId = params.appId as string;
    const { toast } = useToast();
    
    const [app, setApp] = useState<ClientApp | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [formData, setFormData] = useState<Partial<ClientApp>>({});
    const [verificationFormData, setVerificationFormData] = useState({
        appDescription: "",
        dataUsageReason: "",
        privacyPolicyUrl: "",
        termsOfServiceUrl: "",
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isIntegrationsDialogOpen, setIsIntegrationsDialogOpen] = useState(false);
    const [isVerificationDialogOpen, setIsVerificationDialogOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const prevMinAgeGroup = useRef<string | undefined>();
    const hostUrl = "https://fastpass.kabirinvents.com";

    useEffect(() => {
        if (!user || !db) {
            if (!isUserLoading) {
                 router.push(`/login?redirect=/dev/${appId}`);
            }
            return;
        };

        if (!appId) return;

        setLoading(true);
        let userUnsubscribe: () => void;
        const userRef = ref(db, `users/${user.uid}`);
        userUnsubscribe = onValue(userRef, (snapshot) => {
            if (snapshot.exists()) {
                setUserProfile(snapshot.val());
            }
        });

        let appUnsubscribe: () => void;
        const appRef = ref(db, `clients/${appId}`);
        appUnsubscribe = onValue(appRef, (snapshot) => {
            if (snapshot.exists()) {
                const appData = snapshot.val();
                if (appData.ownerUid === user.uid) {
                    const fullApp = { id: appId, ...appData };
                    setApp(fullApp);
                    setFormData(fullApp);
                    prevMinAgeGroup.current = fullApp.minAgeGroup;
                } else {
                    toast({ variant: 'destructive', title: 'Access Denied' });
                    router.push('/dev');
                }
            } else {
                toast({ variant: 'destructive', title: 'App not found' });
                router.push('/dev');
            }
            setLoading(false);
        });

        return () => {
            if (userUnsubscribe) userUnsubscribe();
            if (appUnsubscribe) appUnsubscribe();
        }
    }, [db, appId, user, isUserLoading, router, toast]);

    const isSSOEnabled = useMemo(() => !!formData.requestedIntegrations?.ssoPassword, [formData.requestedIntegrations]);

    const memoizedRequestedIntegrationIds = useMemo(() => {
        if (!formData.requestedIntegrations) return [];
        return Object.keys(formData.requestedIntegrations);
    }, [formData.requestedIntegrations]);

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

    useEffect(() => {
        if (prevMinAgeGroup.current === '18+' && formData.minAgeGroup === 'All ages') {
             toast({
                title: "Restricted integrations removed",
                description: "18+ integrations were removed because 'All ages' was selected.",
            });
        }
        prevMinAgeGroup.current = formData.minAgeGroup;
    }, [formData.minAgeGroup, toast]);

    const isDevMinor = userProfile?.ageGroup === 'Under 18';
    const isAppForAllAges = formData.minAgeGroup === 'All ages';

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (field: keyof ClientApp | `buttonStyle.${string}`, value: string | boolean) => {
        if (typeof field === 'string' && field.startsWith('buttonStyle.')) {
            const styleField = field.split('.')[1];
            setFormData(prev => ({
                ...prev,
                buttonStyle: {
                    ...prev.buttonStyle,
                    [styleField]: value
                }
            }));
        } else {
            setFormData(prev => {
                const newFormData: Partial<ClientApp> = { ...prev, [field as keyof ClientApp]: value };
                
                if (field === 'minAgeGroup' && value === 'All ages' && newFormData.requestedIntegrations) {
                    const currentIntegrations = newFormData.requestedIntegrations;
                    const newIntegrations: { [key: string]: any } = {};

                    for (const integId in currentIntegrations) {
                        const detail = allIntegrationsList.find(i => i.id === integId);
                        if (!detail?.restricted) {
                           newIntegrations[integId] = currentIntegrations[integId];
                        }
                    }
                    newFormData.requestedIntegrations = newIntegrations;
                }

                return newFormData;
            });
        }
    }

    const handleIntegrationChange = (integrationId: string, checked: boolean) => {
        setFormData(prev => {
            const newIntegrations = { ...(prev.requestedIntegrations || {}) };
            if (checked) {
                newIntegrations[integrationId] = true;
                if (integrationId === 'ssoPassword') {
                    newIntegrations['name'] = true; // Force-enable name if SSO is enabled
                }
            } else {
                delete newIntegrations[integrationId];
            }
            return { ...prev, requestedIntegrations: newIntegrations };
        });
    };

    const handleButtonStyleChange = (field: string, value: string | boolean) => {
        setFormData(prev => ({
            ...prev,
            buttonStyle: {
                ...prev.buttonStyle,
                [field]: value
            }
        }));
    };
    

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!db || !appId || !app) return;

        setSaving(true);
        try {
            const appRef = ref(db, `clients/${appId}`);
            
            const reqIntegrations = { ...(formData.requestedIntegrations || {}) };
            // Ensure `name` is always requested, especially for SSO
            reqIntegrations['name'] = true;

            const updateData: Partial<ClientApp> = {
                ...formData,
                requestedIntegrations: reqIntegrations,
            };
            
            await update(appRef, updateData);
            toast({ title: "Success!", description: "Your app has been updated." });
        } catch (error) {
            console.error("Error updating app:", error);
            toast({ variant: "destructive", title: "Error", description: "Could not update the app." });
        } finally {
            setSaving(false);
        }
    }

     const handleRequestVerification = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!db || !appId || !app?.name) return;
        try {
            const appRef = ref(db, `clients/${appId}`);
            await update(appRef, { 
                verificationRequested: true,
                verificationData: {
                    appName: app.name,
                    ...verificationFormData
                }
            });
            toast({ title: "Verification Requested", description: "Your request has been submitted for review." });
            setIsVerificationDialogOpen(false);
        } catch (error) {
            console.error("Error requesting verification:", error);
            toast({ variant: "destructive", title: "Error", description: "Could not submit your request." });
        }
    };
    
    if (loading || !app || !user) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-64" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </CardContent>
                <CardFooter>
                    <Skeleton className="h-10 w-24" />
                </CardFooter>
            </Card>
        );
    }
    
    return (
        <form onSubmit={handleSubmit}>
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        Edit "{app.name}"
                    </CardTitle>
                    <CardDescription>Update your application settings and requested integrations.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="app-id">Client ID</Label>
                        <Input id="app-id" value={app.id} readOnly disabled />
                        <p className="text-xs text-muted-foreground">This is your unique Client ID.</p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="name">App Name</Label>
                        <Input id="name" name="name" value={formData.name || ''} onChange={handleInputChange} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="redirectUri">Redirect URI</Label>
                        <Input id="redirectUri" name="redirectUri" value={formData.redirectUri || ''} onChange={handleInputChange} required />
                         <p className="text-xs text-muted-foreground">For security, this must be the domain where your parent application is hosted.</p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="logo">Logo URL (Optional)</Label>
                        <Input id="logo" name="logo" value={formData.logo || ''} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">App Description (Optional)</Label>
                        <Textarea id="description" name="description" placeholder="A brief summary of what your app does, shown on the approval screen." value={formData.description || ''} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="buttonDescription">Button Description (Optional)</Label>
                        <Input id="buttonDescription" name="buttonDescription" placeholder="e.g., Get Started Fast" value={formData.buttonDescription || ''} onChange={handleInputChange} maxLength={30} />
                        <p className="text-xs text-muted-foreground">A few words to show on the button itself. If left blank, the app name will be used.</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="minAgeGroup">Minimum Age Group</Label>
                        <Select value={formData.minAgeGroup || "All ages"} onValueChange={(value) => handleSelectChange('minAgeGroup', value)} disabled={isDevMinor}>
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
                        <CardDescription>The user information your application will receive upon approval.</CardDescription>
                        
                        <div className="rounded-lg border p-4 space-y-4">
                            <div className="flex flex-wrap gap-2">
                                {memoizedRequestedIntegrationIds.length > 0 ? (
                                    memoizedRequestedIntegrationIds.map(id => (
                                        <Badge key={id} variant={id === 'ssoPassword' ? 'default' : 'secondary'}>
                                            {allIntegrationsList.find(i => i.id === id)?.label || id}
                                        </Badge>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground">No integrations requested yet.</p>
                                )}
                            </div>
                            
                            <Dialog open={isIntegrationsDialogOpen} onOpenChange={setIsIntegrationsDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button type="button" variant="outline">Manage Integrations</Button>
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
                                                            const isIntegrationSelected = !!formData.requestedIntegrations?.[integ.id] || (isNameField && isSSOEnabled);
                                                            const isDisabled = (integ.verifiedOnly && !app.verified) || isRestrictedForApp || (isNameField && isSSOEnabled);
                                                            
                                                            const labelElement = (
                                                                <Label 
                                                                    htmlFor={integ.id} 
                                                                    className={cn("flex items-start gap-3 rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent has-[:checked]:bg-accent has-[:checked]:ring-2 has-[:checked]:ring-primary w-full", isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer')}
                                                                >
                                                                     <Checkbox
                                                                        id={integ.id}
                                                                        checked={isIntegrationSelected}
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
                                                                <div key={integ.id} className="relative flex items-start">
                                                                    {isDisabled && !isNameField ? (
                                                                         <TooltipProvider>
                                                                            <Tooltip>
                                                                                <TooltipTrigger asChild>
                                                                                    <div className="w-full h-full" tabIndex={0}>{labelElement}</div>
                                                                                </TooltipTrigger>
                                                                                <TooltipContent>
                                                                                     {integ.verifiedOnly && !app.verified && <p>This integration requires your app to be verified.</p>}
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
                                        <Button type="button" onClick={() => setIsIntegrationsDialogOpen(false)}>Done</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </CardContent>
                 <CardFooter className="border-t pt-6">
                    <Button type="submit" disabled={saving}>
                        {saving ? "Saving..." : "Save Changes"}
                    </Button>
                </CardFooter>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Button Customization</CardTitle>
                    <CardDescription>Customize the look and feel of your FastPass button.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <ButtonPreview appData={app} formData={formData} />
                    <div className="space-y-2">
                        <Label htmlFor="button-main-text">Main Text</Label>
                        <Select
                            value={formData.buttonStyle?.mainText || mainTextOptions[0]}
                            onValueChange={(value) => handleButtonStyleChange('mainText', value)}
                        >
                            <SelectTrigger id="button-main-text" className="w-[280px]">
                                <SelectValue placeholder="Select text" />
                            </SelectTrigger>
                            <SelectContent>
                                {mainTextOptions.map(option => (
                                    <SelectItem key={option} value={option}>{option}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Switch
                            id="hide-app-name"
                            checked={formData.buttonStyle?.hideAppName || false}
                            onCheckedChange={(checked) => handleButtonStyleChange('hideAppName', checked)}
                        />
                        <Label htmlFor="hide-app-name">Hide App Name from button</Label>
                    </div>
                </CardContent>
                 <CardFooter className="border-t pt-6">
                    <Button type="submit" disabled={saving}>
                        {saving ? "Saving..." : "Save Customizations"}
                    </Button>
                </CardFooter>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Verification</CardTitle>
                    <CardDescription>Verified apps can request access to confidential user information.</CardDescription>
                </CardHeader>
                <CardContent>
                    {app.verified ? (
                        <div className="flex items-center space-x-2">
                            <CheckCircle2 className="h-5 w-5 text-primary" />
                            <Label>This app is verified.</Label>
                        </div>
                    ) : app.verificationRequested ? (
                         <div className="flex items-center space-x-2">
                            <Label>Verification request pending review.</Label>
                        </div>
                    ) : (
                        <Dialog open={isVerificationDialogOpen} onOpenChange={setIsVerificationDialogOpen}>
                            <DialogTrigger asChild>
                                <Button type="button">Request Verification</Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-lg">
                                <DialogHeader>
                                    <DialogTitle>Verification Request</DialogTitle>
                                    <DialogDescription>
                                        Please provide the following details so our team can review your application.
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleRequestVerification} className="space-y-4">
                                     <div className="space-y-2">
                                        <Label htmlFor="appDescription">What does your application do?</Label>
                                        <Textarea 
                                            id="appDescription" 
                                            required 
                                            value={verificationFormData.appDescription}
                                            onChange={(e) => setVerificationFormData({...verificationFormData, appDescription: e.target.value})}
                                            placeholder="Describe the main purpose and functionality of your app."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="dataUsageReason">How do you use the requested FastPass data?</Label>
                                        <Textarea 
                                            id="dataUsageReason" 
                                            required
                                            value={verificationFormData.dataUsageReason}
                                            onChange={(e) => setVerificationFormData({...verificationFormData, dataUsageReason: e.target.value})}
                                            placeholder="Explain why you need the user data you've requested and how it enhances your app's experience."
                                        />
                                    </div>
                                     <div className="space-y-2">
                                        <Label htmlFor="privacyPolicyUrl">Privacy Policy URL</Label>
                                        <Input 
                                            id="privacyPolicyUrl" 
                                            type="url"
                                            value={verificationFormData.privacyPolicyUrl}
                                            onChange={(e) => setVerificationFormData({...verificationFormData, privacyPolicyUrl: e.target.value})}
                                            placeholder="https://yourapp.com/privacy" 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="termsOfServiceUrl">Terms of Service URL</Label>
                                        <Input 
                                            id="termsOfServiceUrl" 
                                            type="url"
                                            value={verificationFormData.termsOfServiceUrl}
                                            onChange={(e) => setVerificationFormData({...verificationFormData, termsOfServiceUrl: e.target.value})}
                                            placeholder="https://yourapp.com/terms"
                                        />
                                    </div>
                                    <DialogFooter>
                                        <Button type="submit">Submit Request</Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    )}
                </CardContent>
                <CardFooter>
                    <p className="text-xs text-muted-foreground">App verification is handled by FastPass administrators.</p>
                </CardFooter>
            </Card>
        </div>
        </form>
    )
}
