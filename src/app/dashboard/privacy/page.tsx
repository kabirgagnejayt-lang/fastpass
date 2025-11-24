
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useUser } from "@/firebase/auth/use-user";
import { useDatabase } from "@/firebase/provider";
import { onValue, ref, update } from "firebase/database";
import { useEffect, useState } from "react";
import type { UserProfile } from "@/lib/types";
import { sendNotificationsReenabledEmail, sendNotificationsDisabledEmail } from "@/app/actions/email";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

const securityLevels = [
    { value: "Off", label: "Off", description: "PIN is not required for any approvals." },
    { value: "Low", label: "Low", description: "PIN required for Professional & E-Commerce info." },
    { value: "Medium", label: "Medium", description: "PIN required for all except basic identity." },
    { value: "High", label: "High", description: "PIN required for all except Name, Email, & PFP." },
    { value: "Full", label: "Full", description: "PIN is always required for every approval." },
]

export default function PrivacyPage() {
    const { user } = useUser();
    const db = useDatabase();
    const { toast } = useToast();
    const [profile, setProfile] = useState<Partial<UserProfile>>({});
    const [pin, setPin] = useState('');
    const [securityLevel, setSecurityLevel] = useState('Off');

    useEffect(() => {
        if (!user || !db) return;
        const profileRef = ref(db, `users/${user.uid}`);
        onValue(profileRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                setProfile(data);
                setPin(data.pin || '');
                setSecurityLevel(data.pinSecurityLevel || 'Off');
            }
        });
    }, [user, db]);

    const handleToggle = (field: keyof UserProfile, checked: boolean) => {
        if (!user || !db) return;
        
        const updates: Partial<UserProfile> = { [field]: checked };
        update(ref(db, `users/${user.uid}`), updates);

        if (field === 'hideEmail') {
             if (!user.email || !user.displayName) return;
            const userInfo = { email: user.email, name: user.displayName };
            if (checked) {
                sendNotificationsDisabledEmail(userInfo);
                toast({
                    title: "Notifications Disabled",
                    description: "We've sent a confirmation to your email."
                });
            } else {
                sendNotificationsReenabledEmail(userInfo);
                toast({
                    title: "Notifications Re-enabled",
                    description: "We've sent a confirmation to your email."
                });
            }
        }
    };
    
    const handlePinSave = () => {
        if (!user || !db) return;

        if (pin && (pin.length < 4 || pin.length > 6)) {
            toast({
                variant: 'destructive',
                title: 'Invalid PIN',
                description: 'Your PIN must be between 4 and 6 digits.'
            });
            return;
        }

        const updates: Partial<UserProfile> = {
            pin: pin || null,
            pinSecurityLevel: securityLevel as UserProfile['pinSecurityLevel'],
        };

        update(ref(db, `users/${user.uid}`), updates)
            .then(() => {
                toast({
                    title: 'PIN Settings Saved',
                    description: 'Your new PIN preferences have been updated.'
                });
            })
            .catch((error) => {
                 toast({
                    variant: 'destructive',
                    title: 'Error Saving PIN',
                    description: error.message,
                });
            });
    }


    return (
        <Card>
            <CardHeader>
                <CardTitle>Privacy & Security</CardTitle>
                <CardDescription>Control how your data is shared and managed.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                 <div className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                            <Label htmlFor="hide-email" className="font-semibold">Stop sending approval emails</Label>
                            <p className="text-sm text-muted-foreground">
                                You will no longer receive an email receipt when you approve an app.
                            </p>
                        </div>
                        <Switch 
                            id="hide-email"
                            checked={!!profile.hideEmail}
                            onCheckedChange={(checked) => handleToggle('hideEmail', checked)}
                        />
                    </div>
                </div>
                
                <Separator />

                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold">PIN Protection</h3>
                        <p className="text-sm text-muted-foreground">
                           Add an optional PIN to approve sensitive data sharing requests. Recommended for extra security.
                        </p>
                    </div>

                    <div className="space-y-4 rounded-lg border p-4">
                         <div className="space-y-2">
                            <Label htmlFor="pin">4 to 6-Digit PIN</Label>
                             <Input 
                                id="pin" 
                                type="password"
                                maxLength={6}
                                value={pin}
                                onChange={(e) => setPin(e.target.value)}
                                placeholder="Enter a 4 to 6-digit PIN" 
                                className="w-[220px]"
                            />
                            <p className="text-xs text-muted-foreground">Leave blank to disable PIN protection.</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="security-level">Security Level</Label>
                            <Select value={securityLevel} onValueChange={setSecurityLevel}>
                                <SelectTrigger id="security-level" className="w-full md:w-[280px]">
                                    <SelectValue placeholder="Select level" />
                                </SelectTrigger>
                                <SelectContent>
                                    {securityLevels.map(level => (
                                        <SelectItem key={level.value} value={level.value}>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{level.label}</span>
                                                <span className="text-xs text-muted-foreground">{level.description}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    
                    <Button onClick={handlePinSave}>Save PIN Settings</Button>
                </div>


            </CardContent>
        </Card>
    )
}
