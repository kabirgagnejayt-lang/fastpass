
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { getAuth, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";

export default function SettingsPage() {
    const router = useRouter();
    const { setTheme } = useTheme();

    const handleLogout = async () => {
        const auth = getAuth();
        await signOut(auth);
        router.push("/");
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Settings</CardTitle>
                <CardDescription>Manage your account and application settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="theme">Theme</Label>
                     <Select onValueChange={setTheme}>
                        <SelectTrigger id="theme" className="w-[180px]">
                            <SelectValue placeholder="Select theme" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="light">Light</SelectItem>
                            <SelectItem value="dark">Dark</SelectItem>
                            <SelectItem value="system">System</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                 <div className="space-y-2">
                    <Label>About</Label>
                    <p className="text-sm text-muted-foreground">
                        FastPass is a service for quick, secure profile sharing.
                    </p>
                </div>
                <div>
                   <Button variant="outline" onClick={handleLogout}>Logout</Button>
                </div>
            </CardContent>
        </Card>
    )
}
