
"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/firebase/auth/use-user";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MoreHorizontal, CheckCircle2, FlaskConical } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useDatabase } from "@/firebase/provider";
import { query, ref, orderByChild, equalTo, onValue, remove } from "firebase/database";
import type { ClientApp } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function DevPage() {
  const { user, isLoading: isUserLoading } = useUser();
  const router = useRouter();
  const db = useDatabase();
  const { toast } = useToast();
  const [apps, setApps] = useState<ClientApp[]>([]);
  const [appsLoading, setAppsLoading] = useState(true);

  useEffect(() => {
    if (isUserLoading) return;
    if (!user || !db) {
        setAppsLoading(false);
        return;
    }
    
    setAppsLoading(true);
    const appsQuery = query(ref(db, 'clients'), orderByChild('ownerUid'), equalTo(user.uid));
    
    const unsubscribe = onValue(appsQuery, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const appList = Object.keys(data).map(key => ({
                id: key,
                ...data[key]
            }));
            setApps(appList);
        } else {
            setApps([]);
        }
        setAppsLoading(false);
    });

    return () => unsubscribe();
  }, [db, user, isUserLoading]);

  const handleDelete = async (appId: string) => {
    if (!db) return;
    if (!window.confirm("Are you sure you want to delete this app? This action cannot be undone.")) {
        return;
    }
    try {
        await remove(ref(db, `clients/${appId}`));
        toast({
            title: "App Deleted",
            description: "The application has been permanently removed.",
        });
    } catch (error) {
        console.error("Error deleting app:", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not delete the app. Please try again.",
        });
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
        <div className="flex items-center justify-between">
            <div className="grid gap-2">
                <h1 className="text-3xl font-bold tracking-tight">My Apps</h1>
                <p className="text-muted-foreground">
                    Here are the applications you've registered with FastPass.
                </p>
            </div>
            <Button onClick={() => router.push('/dev/create')}>Create New App</Button>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Registered Applications</CardTitle>
                <CardDescription>A list of your applications.</CardDescription>
            </CardHeader>
            <CardContent>
                {appsLoading ? (
                    <div className="space-y-4">
                       {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-lg" />)}
                    </div>
                ) : apps.length > 0 ? (
                    <div className="space-y-4">
                        {apps.map((app) => (
                            <div key={app.id} className="flex items-center justify-between rounded-lg border p-4">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                                      {app.logo ? <img src={app.logo} alt={app.name} className="h-8 w-8 object-contain" /> : app.name.charAt(0)}
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
                                        <p className="text-sm text-muted-foreground">Client ID: <span className="font-mono text-xs">{app.id}</span></p>
                                        <p className="text-xs text-muted-foreground">{app.redirectUri}</p>
                                    </div>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <span className="sr-only">Open menu</span>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => router.push(`/dev/${app.id}`)}>Edit</DropdownMenuItem>
                                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(app.id)}>Delete</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <h3 className="text-lg font-semibold">No apps yet</h3>
                        <p className="text-sm text-muted-foreground">
                            Click "Create New App" to get started.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    </div>
  );
}

    