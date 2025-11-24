
'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@/firebase/auth/use-user";
import { useDatabase } from "@/firebase/provider";
import { onValue, ref, remove } from "firebase/database";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import type { ClientApp } from "@/lib/types";
import { CheckCircle2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ConnectedApp extends ClientApp {
  approvedCount: number;
  lastUsed: number;
}

export default function ConnectedAppsPage() {
    const { user } = useUser();
    const db = useDatabase();
    const { toast } = useToast();
    const [connectedApps, setConnectedApps] = useState<ConnectedApp[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || !db) return;

        setLoading(true);
        const userAppsRef = ref(db, `users/${user.uid}/apps`);
        const unsubscribe = onValue(userAppsRef, async (snapshot) => {
            if (snapshot.exists()) {
                const userAppsData = snapshot.val();
                const appIds = Object.keys(userAppsData);

                const appDetailsPromises = appIds.map(appId => {
                    return new Promise<ConnectedApp | null>((resolve) => {
                        const appRef = ref(db, `clients/${appId}`);
                        onValue(appRef, (appSnap) => {
                            if (appSnap.exists()) {
                                const appData = appSnap.val();
                                resolve({
                                    ...appData,
                                    id: appId,
                                    approvedCount: userAppsData[appId].approvedCount,
                                    lastUsed: userAppsData[appId].lastUsed,
                                });
                            } else {
                                resolve(null);
                            }
                        }, { onlyOnce: true });
                    });
                });

                const apps = (await Promise.all(appDetailsPromises)).filter(Boolean) as ConnectedApp[];
                setConnectedApps(apps.sort((a, b) => b.lastUsed - a.lastUsed));
            } else {
                setConnectedApps([]);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [db, user]);

    const handleRevoke = async (appId: string) => {
        if (!db || !user) return;
        const appConnectionRef = ref(db, `users/${user.uid}/apps/${appId}`);
        try {
            await remove(appConnectionRef);
            toast({
                title: "App Revoked",
                description: "Access has been revoked successfully.",
            });
        } catch (error) {
            console.error("Error revoking app:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Could not revoke app access. Please try again.",
            });
        }
    };

    const formatLastUsed = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    if (loading) {
        return (
             <Card>
                <CardHeader>
                    <CardTitle>Connected Apps</CardTitle>
                    <CardDescription>Manage the apps you've approved with FastPass.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     {[...Array(2)].map((_, i) => (
                        <div key={i} className="flex items-center justify-between rounded-lg border p-4">
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-12 w-12 rounded-lg" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-3 w-48" />
                                </div>
                            </div>
                            <Skeleton className="h-9 w-20 rounded-md" />
                        </div>
                     ))}
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Connected Apps</CardTitle>
                <CardDescription>Manage the apps you've approved with FastPass.</CardDescription>
            </CardHeader>
            <CardContent>
                {connectedApps.length > 0 ? (
                    <div className="space-y-4">
                        {connectedApps.map((app) => (
                            <div key={app.id} className="flex items-center justify-between rounded-lg border p-4">
                               <div className="flex items-center gap-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                                        {app.logo ? <img src={app.logo} alt={app.name} className="h-8 w-8 object-contain"/> : app.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-semibold">{app.name}</p>
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
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            <span>Approved {app.approvedCount} {app.approvedCount === 1 ? 'time' : 'times'}</span>
                                            <span className="mx-2">·</span>
                                            <span>Last used {formatLastUsed(app.lastUsed)}</span>
                                        </div>
                                    </div>
                               </div>
                                <Button variant="destructive" size="sm" onClick={() => handleRevoke(app.id)}>Revoke</Button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <h3 className="text-lg font-semibold">No Connected Apps</h3>
                        <p className="text-sm text-muted-foreground">
                            You haven't approved any apps with FastPass yet.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
