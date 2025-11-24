
'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/firebase/auth/use-user';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useDatabase } from '@/firebase/provider';
import { onValue, ref } from 'firebase/database';
import { Skeleton } from '@/components/ui/skeleton';
import type { UserProfile } from '@/lib/types';
import { allIntegrationsList } from '@/lib/integrations-data';
import { Progress } from '@/components/ui/progress';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { subDays, format, parse } from 'date-fns';

function getInitials(name?: string | null) {
  if (!name) return 'U';
  const parts = name.split(' ');
  if (parts.length > 1) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return parts[0][0].toUpperCase();
}

export default function DashboardPage() {
  const { user } = useUser();
  const router = useRouter();
  const db = useDatabase();
  const [stats, setStats] = useState({ connectedApps: 0, lastUsed: '' });
  const [statsLoading, setStatsLoading] = useState(true);
  const [profileCompleteness, setProfileCompleteness] = useState(0);
  const [userProfile, setUserProfile] = useState<Partial<UserProfile>>({});
  const [activityData, setActivityData] = useState<any[]>([]);
  const [activityLoading, setActivityLoading] = useState(true);

   useEffect(() => {
    if (!user || !db) return;

    const today = new Date();
    const last7Days: any[] = [];
    for (let i = 6; i >= 0; i--) {
      last7Days.push({
        date: format(subDays(today, i), 'MMM d'),
        approvals: 0,
      });
    }

    const logsRef = ref(db, `logs/${user.uid}`);
    const unsubscribeLogs = onValue(logsRef, (snapshot) => {
      const processedData = [...last7Days];
      if (snapshot.exists()) {
        const logs = snapshot.val();
        Object.values(logs).forEach((log: any) => {
            if (log.action === 'Approved') {
                const logDate = new Date(log.timestamp);
                const dayDifference = (today.getTime() - logDate.getTime()) / (1000 * 3600 * 24);
                if (dayDifference >= 0 && dayDifference < 7) {
                    const formattedDate = format(logDate, 'MMM d');
                    const dayData = processedData.find(d => d.date === formattedDate);
                    if (dayData) {
                        dayData.approvals += 1;
                    }
                }
            }
        });
      }
      setActivityData(processedData);
      setActivityLoading(false);
    });

    return () => unsubscribeLogs();
   }, [user, db]);

  useEffect(() => {
    if (!user || !db) return;

    setStatsLoading(true);
    const userRef = ref(db, `users/${user.uid}`);
    const unsubscribeProfile = onValue(userRef, (snapshot) => {
      if (snapshot.exists()) {
        const profileData = snapshot.val();
        setUserProfile(profileData);

        const filledFields = allIntegrationsList.filter((integration) => {
          const value = profileData[integration.id];
          return value !== undefined && value !== null && value !== '';
        }).length;
        const totalFields = allIntegrationsList.length;
        setProfileCompleteness(Math.round((filledFields / totalFields) * 100));
      }
    });

    const userAppsRef = ref(db, `users/${user.uid}/apps`);
    const unsubscribeApps = onValue(userAppsRef, (snapshot) => {
      if (snapshot.exists()) {
        const appsData = snapshot.val();
        const appIds = Object.keys(appsData);

        const connectedApps = appIds.length;
        const lastUsedTimestamp = Math.max(...appIds.map((appId) => appsData[appId].lastUsed || 0));

        setStats({
          connectedApps,
          lastUsed:
            lastUsedTimestamp > 0
              ? new Date(lastUsedTimestamp).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : 'Never',
        });
      } else {
        setStats({ connectedApps: 0, lastUsed: 'Never' });
      }
      setStatsLoading(false);
    });

    return () => {
      unsubscribeProfile();
      unsubscribeApps();
    };
  }, [db, user]);

  if (!user) {
    return null;
  }
  
  const chartConfig = {
    approvals: {
      label: "Approvals",
      color: "hsl(var(--primary))",
    },
  } satisfies any;


  return (
    <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="h-20 w-20 border">
            <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
            <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
          </Avatar>
          <div className="grid gap-1">
            <CardTitle className="text-2xl">{user.displayName}</CardTitle>
            <CardDescription>{user.email}</CardDescription>
          </div>
          <Button className="ml-auto" onClick={() => router.push('/dashboard/profile')}>
            Edit Profile
          </Button>
        </CardHeader>
      </Card>
      
      <Card>
          <CardHeader>
              <CardTitle>Activity Overview</CardTitle>
              <CardDescription>Your FastPass approval activity over the last 7 days.</CardDescription>
          </CardHeader>
          <CardContent>
              {activityLoading ? (
                  <Skeleton className="h-[250px] w-full" />
              ) : (
                <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                    <BarChart accessibilityLayer data={activityData}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            tickFormatter={(value) => value.slice(0, 6)}
                        />
                        <YAxis allowDecimals={false} />
                        <ChartTooltip
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Bar dataKey="approvals" fill="var(--color-approvals)" radius={4} />
                    </BarChart>
                </ChartContainer>
              )}
          </CardContent>
      </Card>
      
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Connected Apps</CardDescription>
            {statsLoading ? <Skeleton className="h-10 w-12" /> : <CardTitle className="text-4xl">{stats.connectedApps}</CardTitle>}
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Last FastPass Use</CardDescription>
            {statsLoading ? <Skeleton className="h-8 w-36" /> : <CardTitle className="text-2xl">{stats.lastUsed}</CardTitle>}
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Profile Completeness</CardDescription>
            {statsLoading ? <Skeleton className="h-10 w-12" /> : <CardTitle className="text-4xl">{profileCompleteness}%</CardTitle>}
          </CardHeader>
          <CardContent>
            <Progress value={profileCompleteness} aria-label={`${profileCompleteness}% profile complete`} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

    