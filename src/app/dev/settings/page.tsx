
'use client'
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser } from "@/firebase/auth/use-user";


export default function DevSettingsPage() {
    const { user } = useUser();

    return (
        <div className="grid gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Developer Settings</CardTitle>
                    <CardDescription>Manage your developer account information.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" defaultValue={user?.displayName || ''} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" defaultValue={user?.email || ''} />
                    </div>
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                    <Button>Save Changes</Button>
                </CardFooter>
            </Card>
            <Card className="border-destructive">
                <CardHeader>
                    <CardTitle className="text-destructive">Danger Zone</CardTitle>
                    <CardDescription>Deleting your developer account will also delete all of your registered applications. This action cannot be undone.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button variant="destructive">Delete Developer Account</Button>
                </CardContent>
            </Card>
        </div>
    )
}
