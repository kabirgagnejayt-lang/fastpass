'use client';
import { useEffect, useState } from "react";
import { useDatabase } from "@/firebase/provider";
import { useUser } from "@/firebase/auth/use-user";
import { onValue, ref, update } from "firebase/database";
import type { ClientApp } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const ADMIN_UID = "uwLvk5xo6rRXWSLR8VW6pVfwDON2";

export default function AppManagementPage() {
    const db = useDatabase();
    const { user } = useUser();
    const router = useRouter();
    const { toast } = useToast();
    const [apps, setApps] = useState<ClientApp[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedApp, setSelectedApp] = useState<ClientApp | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    useEffect(() => {
        if (user && user.uid !== ADMIN_UID) {
            router.push('/dev');
        }
    }, [user, router]);

    useEffect(() => {
        if (!db) return;
        const appsRef = ref(db, 'clients');
        onValue(appsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const appList = Object.keys(data).map(key => ({ ...data[key], id: key }));
                setApps(appList);
            } else {
                setApps([]);
            }
            setLoading(false);
        });
    }, [db]);

    const handleVerificationToggle = async (appId: string, currentStatus: boolean) => {
        if (!db) return;
        const appRef = ref(db, `clients/${appId}`);
        try {
            await update(appRef, { 
                verified: !currentStatus,
                verificationRequested: false // Clear request on manual action
            });
            toast({
                title: "App Status Updated",
                description: `The app has been ${!currentStatus ? 'verified' : 'unverified'}.`,
            });
        } catch (error) {
            console.error("Error updating app verification:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Could not update the app's verification status.",
            });
        }
    };
    
    const handleRequestReview = async (appId: string, approve: boolean) => {
        if (!db) return;
        const appRef = ref(db, `clients/${appId}`);
        try {
            await update(appRef, {
                verified: approve,
                verificationRequested: false,
            });
            toast({
                title: `Request ${approve ? 'Approved' : 'Declined'}`,
                description: `The application has been successfully ${approve ? 'verified' : 'declined'}.`,
            });
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Could not process the verification request.",
            });
        } finally {
            setIsDialogOpen(false);
        }
    }
    
    const openReviewDialog = (app: ClientApp) => {
        setSelectedApp(app);
        setIsDialogOpen(true);
    }


    if (loading || !user || user.uid !== ADMIN_UID) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>App Management</CardTitle>
                    <CardDescription>Manage all registered applications.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-center justify-between rounded-lg border p-4">
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-12 w-12 rounded-lg" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-3 w-48" />
                                </div>
                            </div>
                            <Skeleton className="h-6 w-12 rounded-full" />
                        </div>
                    ))}
                </CardContent>
            </Card>
        );
    }

    return (
        <>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            {selectedApp && selectedApp.verificationData && (
                 <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Verification Request: {selectedApp.verificationData.appName}</DialogTitle>
                        <DialogDescription>
                            Submitted by owner UID: {selectedApp.ownerUid}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 text-sm max-h-[60vh] overflow-y-auto pr-4">
                        <div>
                            <p className="font-semibold">App Description</p>
                            <p className="text-muted-foreground">{selectedApp.verificationData.appDescription}</p>
                        </div>
                            <div>
                            <p className="font-semibold">Reason for Data Usage</p>
                            <p className="text-muted-foreground">{selectedApp.verificationData.dataUsageReason}</p>
                        </div>
                            <div>
                            <p className="font-semibold">Privacy Policy URL</p>
                            <a href={selectedApp.verificationData.privacyPolicyUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground underline break-all">{selectedApp.verificationData.privacyPolicyUrl || "Not provided"}</a>
                        </div>
                            <div>
                            <p className="font-semibold">Terms of Service URL</p>
                            <a href={selectedApp.verificationData.termsOfServiceUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground underline break-all">{selectedApp.verificationData.termsOfServiceUrl || "Not provided"}</a>
                        </div>
                    </div>
                     <DialogFooter>
                        <Button variant="destructive" onClick={() => handleRequestReview(selectedApp.id, false)}>Decline</Button>
                        <Button onClick={() => handleRequestReview(selectedApp.id, true)}>Approve</Button>
                    </DialogFooter>
                </DialogContent>
            )}
        </Dialog>

        <Card>
            <CardHeader>
                <CardTitle>App Management</CardTitle>
                <CardDescription>Manage verification status for all registered applications.</CardDescription>
            </CardHeader>
            <CardContent>
                {apps.length > 0 ? (
                    <div className="space-y-4">
                        {apps.map((app) => (
                            <div key={app.id} className="flex items-center justify-between rounded-lg border p-4">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                                        {app.logo ? <img src={app.logo} alt={app.name} className="h-8 w-8 object-contain"/> : app.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-semibold flex items-center gap-2">
                                            {app.name}
                                            {app.verified && (
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger>
                                                            <CheckCircle2 className="h-4 w-4 text-primary" />
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Verified Application</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            )}
                                            {app.verificationRequested && !app.verified && (
                                                <Badge variant="default">Verification Requested</Badge>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground font-mono">{app.id}</p>
                                        <p className="text-xs text-muted-foreground">Owner: {app.ownerUid}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    {app.verificationRequested && app.verificationData && (
                                         <Button variant="outline" size="sm" onClick={() => openReviewDialog(app)}>
                                            <Info className="h-4 w-4 mr-2" />
                                            Review
                                        </Button>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <Label htmlFor={`verify-${app.id}`} className="text-sm">Verified</Label>
                                        <Switch
                                            id={`verify-${app.id}`}
                                            checked={!!app.verified}
                                            onCheckedChange={() => handleVerificationToggle(app.id, !!app.verified)}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 text-muted-foreground">
                        No applications have been registered yet.
                    </div>
                )}
            </CardContent>
        </Card>
        </>
    );
}
