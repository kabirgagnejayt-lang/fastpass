'use client';

import { useEffect, useState } from "react";
import { useUser } from "@/firebase/auth/use-user";
import { useDatabase } from "@/firebase/provider";
import { onValue, ref } from "firebase/database";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";

export function AgeGroupWarning() {
    const { user } = useUser();
    const db = useDatabase();
    const [ageGroupSet, setAgeGroupSet] = useState(true);

    useEffect(() => {
        if (!user || !db) return;

        const userRef = ref(db, `users/${user.uid}/ageGroup`);
        const unsubscribe = onValue(userRef, (snapshot) => {
            const ageGroup = snapshot.val();
            // The banner should show if the ageGroup field doesn't exist OR if it's an empty string.
            if (snapshot.exists() && ageGroup !== "") {
                setAgeGroupSet(true);
            } else {
                setAgeGroupSet(false);
            }
        });

        return () => unsubscribe();
    }, [user, db]);

    if (ageGroupSet) {
        return null;
    }

    return (
        <Alert variant="destructive" className="mb-6 border-2 border-destructive/80">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Action Required: Set Your Age Group</AlertTitle>
            <AlertDescription className="flex items-center justify-between">
                <div>
                You must select your age group on your profile to enable all features, including creating apps and approving FastPass requests.
                </div>
                 <Button asChild variant="secondary" size="sm">
                    <Link href="/dashboard/profile">Go to Profile</Link>
                </Button>
            </AlertDescription>
        </Alert>
    );
}
