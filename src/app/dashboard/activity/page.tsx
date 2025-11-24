
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/firebase/auth/use-user";
import { useDatabase } from "@/firebase/provider";
import { useEffect, useState } from "react";
import { onValue, ref } from "firebase/database";
import { Skeleton } from "@/components/ui/skeleton";

interface ActivityLog {
    id: string;
    timestamp: number;
    action: string;
    clientId: string;
    appName?: string;
}

const statusVariantMap: { [key: string]: "default" | "destructive" | "secondary" } = {
    Approved: "default",
    Declined: "destructive",
    Viewed: "secondary"
};

export default function ActivityLogPage() {
    const { user } = useUser();
    const db = useDatabase();
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || !db) return;

        setLoading(true);
        const logsRef = ref(db, `logs/${user.uid}`);
        const unsubscribe = onValue(logsRef, (snapshot) => {
            if (snapshot.exists()) {
                const logsData = snapshot.val();
                const logsList: ActivityLog[] = Object.keys(logsData).map(key => ({
                    id: key,
                    ...logsData[key]
                })).sort((a, b) => b.timestamp - a.timestamp);

                const appPromises = logsList.map(log => {
                    if (!log.clientId) return Promise.resolve(log);
                    return new Promise((resolve) => {
                        const appRef = ref(db, `clients/${log.clientId}/name`);
                        onValue(appRef, (appSnap) => {
                            resolve({ ...log, appName: appSnap.val() || 'Unknown App' });
                        }, { onlyOnce: true });
                    });
                });

                Promise.all(appPromises).then(results => {
                    setLogs(results as ActivityLog[]);
                    setLoading(false);
                });

            } else {
                setLogs([]);
                setLoading(false);
            }
        });
        
        return () => unsubscribe();

    }, [db, user]);

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Activity Log</CardTitle>
                    <CardDescription>A complete history of your FastPass activity.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-center gap-4">
                           <Skeleton className="h-5 w-16" />
                           <div className="flex-1 space-y-2">
                             <Skeleton className="h-4 w-1/2" />
                           </div>
                            <Skeleton className="h-6 w-20 rounded-full" />
                        </div>
                    ))}
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Activity Log</CardTitle>
                <CardDescription>A complete history of your FastPass activity.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {logs.length > 0 ? logs.map((log) => (
                        <div key={log.id} className="flex items-center gap-4">
                            <div className="w-16 text-sm text-muted-foreground">{formatDate(log.timestamp)}</div>
                            <div className="flex-1">
                                <span className="font-medium">{log.action}</span>
                                {log.appName && <span className="text-muted-foreground"> - {log.appName}</span>}
                            </div>
                            <Badge variant={statusVariantMap[log.action] || 'secondary'}>{log.action}</Badge>
                        </div>
                    )) : (
                         <div className="text-center py-12 text-muted-foreground">
                            No activity recorded yet.
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
