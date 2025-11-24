
'use client'
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser } from "@/firebase/auth/use-user";
import { useDatabase } from "@/firebase/provider";
import { useToast } from "@/hooks/use-toast";
import { onValue, ref, remove, set, update } from "firebase/database";
import { PlusCircle, Trash2, Search, Lock } from "lucide-react";
import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { getAuth, signOut } from "firebase/auth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DynamicProfileInput } from "@/components/dynamic-profile-input";
import { allIntegrations as availableExtraIntegrations, allIntegrationsList } from "@/lib/integrations-data";


const standardIntegrations = [
    { id: 'name', label: 'Full Name' },
    { id: 'email', label: 'Email' },
    { id: 'pfp', label: 'Profile Picture URL' },
    { id: 'ageGroup', label: 'Age Group' },
];

const restrictedFieldsForMinors = allIntegrationsList
    .filter(i => i.restricted)
    .map(i => i.id);

type Integration = {
    id: string;
    label: string;
    description: string;
    verifiedOnly: boolean;
};

export default function ProfilePage() {
    const { user } = useUser();
    const db = useDatabase();
    const { toast } = useToast();
    const router = useRouter();
    const [integrations, setIntegrations] = useState<{ [key: string]: string }>({});
    const [searchTerm, setSearchTerm] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [formData, setFormData] = useState<{ [key: string]: any }>({});
    const [pendingIntegration, setPendingIntegration] = useState<Integration | null>(null);

    useEffect(() => {
        if (!db || !user) return;
        const integrationsRef = ref(db, `users/${user.uid}`);
        onValue(integrationsRef, (snapshot) => {
            const data = snapshot.val() || {};
            setIntegrations(data);
            setFormData(data);
        });
    }, [db, user]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | string | boolean | Date, fieldId: string) => {
        const value = (typeof e === 'object' && 'target' in e) ? e.target.value : e;

        setFormData(prev => {
            const newFormData = { ...prev, [fieldId]: value };
            
            if (fieldId === 'ageGroup' && value === 'Under 18') {
                restrictedFieldsForMinors.forEach(field => {
                    if (newFormData[field]) {
                        delete newFormData[field];
                    }
                });
            }
            return newFormData;
        });
    };

    const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!db || !user) return;
    
        const updates: { [key: string]: any } = { ...formData };
    
        Object.keys(integrations).forEach(key => {
            const isStandard = standardIntegrations.some(i => i.id === key);
            if (!isStandard && (updates[key] === '' || updates[key] === null || updates[key] === undefined)) {
                updates[key] = null; 
            }
        });
        
        if (formData.ageGroup === 'Under 18') {
            restrictedFieldsForMinors.forEach(field => {
                updates[field] = null;
            });
        }

        try {
            await update(ref(db, `users/${user.uid}`), updates);
            toast({ title: "Profile Saved", description: "Your information has been updated." });
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: "Error", description: "Could not save your information." });
        }
    };
    
    const handleAddExtraIntegration = (integ: Integration) => {
        if (integrations.hasOwnProperty(integ.id)) {
            toast({variant: 'destructive', title: 'Field already exists'});
            return;
        }
        if (integ.verifiedOnly) {
            setPendingIntegration(integ);
        } else {
            addIntegrationToDB(integ.id);
        }
    }
    
    const confirmAddConfidentialIntegration = () => {
        if (pendingIntegration) {
            addIntegrationToDB(pendingIntegration.id);
            setPendingIntegration(null);
        }
    }

    const addIntegrationToDB = async (fieldId: string) => {
        if (!db || !user) return;
        try {
            await set(ref(db, `users/${user.uid}/${fieldId}`), '');
            toast({title: `Added field. Please fill it out and save.`});
            setIsDialogOpen(false);
            setSearchTerm('');
        } catch (error) {
            console.error(error);
            toast({variant: 'destructive', title: "Error", description: `Could not add "${fieldId}" integration.`})
        }
    }
    
    const handleDeleteField = async (field: string) => {
        if (!db || !user) return;
        
        const fieldRef = ref(db, `users/${user.uid}/${field}`);
        try {
            await remove(fieldRef);
            toast({ title: "Field Deleted", description: `The "${field}" field has been removed.` });
        } catch (error: any) {
            console.error("Error deleting field:", error);
            toast({ variant: 'destructive', title: "Error Deleting Field", description: error.message || "Could not delete field." });
        }
    };
    
    const handleDeleteAccount = async () => {
        if (!db || !user || !window.confirm("Are you sure you want to delete your account? This will permanently erase all of your data.")) return;

        try {
            await remove(ref(db, `users/${user.uid}`));
            await remove(ref(db, `logs/${user.uid}`));
            
            const auth = getAuth();
            const currentUser = auth.currentUser;

            if (currentUser) {
              await signOut(auth);
              await currentUser.delete().catch((error) => {
                  if (error.code === 'auth/requires-recent-login') {
                      toast({ variant: 'destructive', title: 'Re-authentication required', description: 'Please log in again to delete your account.'});
                      router.push('/login');
                  } else {
                      throw error;
                  }
              });
            }

            toast({ title: "Account Deleted", description: "Your account data has been removed. You have been logged out." });
            router.push("/");
        } catch (error) {
            console.error(error);
            toast({ variant: "destructive", title: "Error", description: "Could not delete your account. You may need to log in again to complete this action." });
        }
    };
    
    const filteredExtraIntegrations = useMemo(() => {
        if (!searchTerm) {
            return availableExtraIntegrations;
        }
        return availableExtraIntegrations
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

    const isMinor = formData.ageGroup === 'Under 18';
    const ageGroupNotSet = !formData.ageGroup;
    
    const groupedIntegrations = useMemo(() => {
        const activeIntegrations = Object.keys(integrations).map(key => {
             const standard = standardIntegrations.find(i => i.id === key);
             if (standard) return { id: key, label: standard.label, category: 'Identity' };
             const extra = allIntegrationsList.find(i => i.id === key);
             if (extra) return { id: key, label: extra.label, category: extra.category };
             return null;
        }).filter(Boolean);

        const groups = activeIntegrations.reduce((acc, integ) => {
            if (!integ) return acc;
            const category = integ.category || 'Miscellaneous';
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(integ.id);
            return acc;
        }, {} as { [key: string]: string[] });
        
        return Object.keys(groups).sort().reduce(
          (obj, key) => { 
            obj[key] = groups[key]; 
            return obj;
          }, 
          {} as { [key: string]: string[] }
        );

    }, [integrations]);


    return (
        <form onSubmit={handleSave}>
            <AlertDialog open={!!pendingIntegration} onOpenChange={(open) => !open && setPendingIntegration(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Warning: Highly Confidential Information</AlertDialogTitle>
                    <AlertDialogDescription>
                        The field "{pendingIntegration?.label}" contains highly confidential information. <strong>This is not recommended for general use.</strong>
                        <br /><br />
                        Adding this data means it will be stored in the FastPass database. This level of information is typically only requested by highly secure services, such as government websites or financial institutions.
                        <br /><br />
                        Only share this data with applications you absolutely trust. Are you sure you want to proceed?
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setPendingIntegration(null)}>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                        className={cn(buttonVariants({ variant: "destructive" }))}
                        onClick={confirmAddConfidentialIntegration}
                    >
                        I Understand, Continue
                    </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Your Profile</CardTitle>
                        <CardDescription>Manage the information you can share via FastPass. Fill it out once, use it everywhere. To remove a field, clear its content and save.</CardDescription>
                    </CardHeader>
                </Card>
                
                <Accordion type="multiple" defaultValue={Object.keys(groupedIntegrations)} className="space-y-4">
                    {Object.entries(groupedIntegrations).map(([category, items]) => (
                        <AccordionItem value={category} key={category} className="border rounded-lg bg-card overflow-hidden">
                            <AccordionTrigger className="px-6 py-4 text-lg font-medium hover:no-underline">
                                {category}
                            </AccordionTrigger>
                            <AccordionContent className="p-6 pt-0">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {items.sort((a,b) => a.localeCompare(b)).map(key => {
                                     if (['uid', 'photoURL', 'displayName', 'apps'].includes(key)) {
                                        return null;
                                    }
                                    
                                    const standardLabel = standardIntegrations.find(i => i.id === key)?.label;
                                    const extraInteg = allIntegrationsList.find(i => i.id === key);
                                    const isStandard = !!standardLabel;
                                    const isVerifiedOnly = extraInteg?.verifiedOnly;
                                    const label = standardLabel || extraInteg?.label || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                                    
                                    const isDisabledByAge = isMinor && restrictedFieldsForMinors.includes(key);
    
                                    if (!extraInteg && !standardLabel) return null; // Don't render fields that are no longer in the master list
    
                                    return (
                                        <div key={key} className={cn("flex flex-col space-y-2", isDisabledByAge && "opacity-50")}>
                                             <div className="flex flex-row items-start justify-between">
                                                <Label htmlFor={key} className={cn("font-semibold", isDisabledByAge && "cursor-not-allowed")}>{label}</Label>
                                                 {!isStandard && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 -mr-2 -mt-1"
                                                        onClick={() => !isDisabledByAge && handleDeleteField(key)}
                                                        disabled={isDisabledByAge}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                                                        <span className="sr-only">Delete {label}</span>
                                                    </Button>
                                                )}
                                             </div>
                                            {isVerifiedOnly && (
                                                <Badge variant="destructive" className="w-fit">Confidential</Badge>
                                            )}
                                            {isDisabledByAge && (
                                                <Badge variant="secondary" className="w-fit">Disabled for Under 18</Badge>
                                            )}
                                             <DynamicProfileInput 
                                                id={key}
                                                label={label}
                                                value={formData[key]}
                                                onChange={handleInputChange}
                                                disabled={key === 'name' || key === 'pfp' || key === 'email' ? false : isDisabledByAge}
                                             />
                                             {key === 'ageGroup' && isMinor && (
                                                 <p className="text-xs text-destructive mt-2">
                                                     Warning: To protect your privacy, selecting this option will disable all 18+ integrations.
                                                 </p>
                                             )}
                                        </div>
                                    )
                                })}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
                
                <Card>
                    <CardFooter className="flex-row-reverse">
                        <Button type="submit">Save All Changes</Button>
                    </CardFooter>
                </Card>

                <Card>
                     <CardHeader>
                         <CardTitle>Add More Integrations</CardTitle>
                         <CardDescription>Add new fields to your profile from our integration store.</CardDescription>
                    </CardHeader>
                    <CardContent>
                       <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                           <DialogTrigger asChild>
                                <Button type="button" variant="outline" disabled={ageGroupNotSet}>
                                    <PlusCircle className="mr-2 h-4 w-4" /> Browse Integration Store
                                </Button>
                           </DialogTrigger>
                           <DialogContent className="sm:max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle>Integration Store</DialogTitle>
                                    <DialogDescription>Add new fields to your FastPass profile. Click an integration to add it.</DialogDescription>
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
                                <Accordion type="multiple" defaultValue={filteredExtraIntegrations.map(c => c.category)} className="max-h-[400px] overflow-y-auto p-1 -mx-1">
                                    {filteredExtraIntegrations.map(category => (
                                        <AccordionItem value={category.category} key={category.category}>
                                            <AccordionTrigger className="text-lg font-medium">{category.category}</AccordionTrigger>
                                            <AccordionContent>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                                    {category.integrations.map(integ => {
                                                        const isDisabledByAge = isMinor && restrictedFieldsForMinors.includes(integ.id);
                                                        const isAlreadyAdded = integrations.hasOwnProperty(integ.id);
                                                        const isDisabled = isDisabledByAge || isAlreadyAdded;

                                                        return (
                                                            <button
                                                                key={integ.id}
                                                                type="button"
                                                                onClick={() => handleAddExtraIntegration(integ)}
                                                                disabled={isDisabled}
                                                                className="flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
                                                            >
                                                                <div className="font-semibold flex items-center gap-2">
                                                                    {integ.label}
                                                                    {integ.verifiedOnly && <Lock className="h-3 w-3 text-muted-foreground" />}
                                                                </div>
                                                                <div className="text-xs text-muted-foreground">{integ.description}</div>
                                                                {isAlreadyAdded && <div className="text-xs font-semibold text-primary mt-auto pt-2">Added</div>}
                                                                {isDisabledByAge && !isAlreadyAdded && <div className="text-xs font-semibold text-destructive mt-auto pt-2">Disabled for Under 18</div>}
                                                            </button>
                                                        )
                                                    })}
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                                {filteredExtraIntegrations.length === 0 && <p className="text-center text-muted-foreground col-span-2 py-4">No integrations found.</p>}
                           </DialogContent>
                       </Dialog>
                    </CardContent>
                </Card>
                <Card className="border-destructive">
                    <CardHeader>
                        <CardTitle className="text-destructive">Danger Zone</CardTitle>
                        <CardDescription>This action is permanent and cannot be undone. It will delete your account and all associated data.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button type="button" variant="destructive" onClick={handleDeleteAccount}>Delete Account</Button>
                    </CardContent>
                </Card>
            </div>
        </form>
    )
}

    