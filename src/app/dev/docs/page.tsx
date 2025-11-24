
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";
import { useUser } from "@/firebase/auth/use-user";
import { useDatabase } from "@/firebase/provider";
import { query, ref, orderByChild, equalTo, onValue } from "firebase/database";
import type { ClientApp } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { integrationDetails } from "@/lib/integrations-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

const CodeBlock = ({ children, lang }: { children: React.ReactNode, lang?: string }) => (
    <pre className={`p-4 rounded-md bg-muted text-muted-foreground overflow-x-auto text-sm font-mono break-words whitespace-pre-wrap ${lang ? `language-${lang}`: ''}`}>{children}</pre>
)

export default function DocumentationPage() {
    const { user, isLoading: userLoading } = useUser();
    const db = useDatabase();
    const [apps, setApps] = useState<ClientApp[]>([]);
    const [selectedApp, setSelectedApp] = useState<ClientApp | null>(null);
    const [loading, setLoading] = useState(true);
    const [demoState, setDemoState] = useState('default');

    useEffect(() => {
        if (userLoading) {
            return;
        }
        if (!user) {
            setLoading(false);
            return;
        }
        if (!db) {
            return;
        }

        const appsQuery = query(ref(db, 'clients'), orderByChild('ownerUid'), equalTo(user.uid));
        
        const unsubscribe = onValue(appsQuery, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const appList: ClientApp[] = Object.keys(data).map(key => ({
                    id: key,
                    ...data[key]
                }));
                setApps(appList);
                if (appList.length > 0 && !selectedApp) {
                    setSelectedApp(appList[0]);
                }
            } else {
                setApps([]);
                setSelectedApp(null);
            }
            setLoading(false);
        }, (error) => {
            console.error(error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user, userLoading, db, selectedApp]);


    const handleAppChange = (appId: string) => {
        const app = apps.find(a => a.id === appId);
        setSelectedApp(app || null);
        setDemoState('default');
    }
    
    const generateExampleData = () => {
        if (!selectedApp || !selectedApp.requestedIntegrations) return { status: "approved", data: {} };

        const data: { [key: string]: any } = {};

        Object.keys(selectedApp.requestedIntegrations).forEach(key => {
            const detail = integrationDetails[key];
            if (detail) {
                data[key] = detail.example;
            }
        });
        
        if (selectedApp.requestedIntegrations.ssoPassword) {
            data.LOS = "Signup";
        }
        
        return { status: "approved", data };
    }
    
    const simpleIntegrationCode = `
<div id="fastpass-button-container"></div>
<script src="https://fastpass.kabirinvents.com/api/sdk/button?clientId=${selectedApp?.id || 'YOUR_CLIENT_ID'}" async defer></script>
`.trim();

    const callbackCode = `
<script>
  function fastPassCallback(error, data) {
    if (error) {
      console.error('FastPass failed:', error.message);
      return;
    }
    
    console.log('FastPass approved! Received data:', data);
    
    // Example: Welcome the user
    const welcomeHeader = document.getElementById('welcome-message');
    if (welcomeHeader && data.name) {
      welcomeHeader.textContent = 'Welcome, ' + data.name.split(' ')[0] + '!';
    }

    // Example: Automatically fill form fields
    for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
            const element = document.getElementById(key);
            if (element) {
                (element as HTMLInputElement).value = data[key];
            }
        }
    }
  }
</script>
`.trim();

    const extractionCode = `
const { status, data } = event.data;

if (status === 'approved') {
    console.log('FastPass Approved! Received data:', data);
    
    // If using SSO, you can check the LOS (Login or Signup) status
    if (data.LOS === 'Signup') {
        // Run your create account logic
    } else if (data.LOS === 'Login') {
        // Run your login logic
    }

    // For autofill apps, fill fields
    for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
            const element = document.getElementById(key);
            if (element) {
                (element as HTMLInputElement).value = data[key];
            }
        }
    }

} else if (status === 'declined') {
    console.log('FastPass Declined. User clicked decline.');
} else if (status === 'canceled') {
    console.log('FastPass Canceled. User closed the popup.');
}
    `.trim();
    
    const demoCss = `
        @keyframes fastpass-stripe-animation-demo { from { background-position: 0 0; } to { background-position: -40px 0; } }
        @keyframes fastpass-tick-animation { 0% { stroke-dashoffset: 24; } 100% { stroke-dashoffset: 0; } }
        @keyframes fastpass-x-line-1 { 0% { stroke-dashoffset: 17; } 100% { stroke-dashoffset: 0; } }
        @keyframes fastpass-x-line-2 { 0% { stroke-dashoffset: 17; } 100% { stroke-dashoffset: 0; } }
        @keyframes fastpass-spin { to { transform: rotate(360deg); } }

        .fastpass-button-base { 
            position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center;
            gap: 8px; width: 100%; max-width: 350px; min-height: 90px; padding: 16px; color: white;
            border: none; border-radius: 8px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            overflow: hidden; transition: all 0.3s ease; text-align: center;
            background-image: repeating-linear-gradient(-45deg, transparent, transparent 10px, rgba(255, 255, 255, 0.05) 10px, rgba(255, 255, 255, 0.05) 20px);
            animation: fastpass-stripe-animation-demo 1.5s linear infinite;
        }

        .fastpass-button-base.state-default { background-color: #10B981; }
        .fastpass-button-base.state-waiting { background-color: #374151; }
        .fastpass-button-base.state-approved { background-color: #10B981; }
        .fastpass-button-base.state-declined { background-color: #EF4444; }
        .fastpass-button-base.state-canceled { background-color: #6B7280; }

        .fastpass-content-state { display: none; }
        .fastpass-button-base.state-default .state-content-default,
        .fastpass-button-base.state-waiting .state-content-waiting,
        .fastpass-button-base.state-approved .state-content-approved,
        .fastpass-button-base.state-declined .state-content-declined,
        .fastpass-button-base.state-canceled .state-content-canceled {
            display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px;
        }
        
        .fastpass-top-row { display: flex; align-items: center; gap: 8px; font-size: 16px; font-weight: 600; }
        .fastpass-mid-row { font-size: 14px; opacity: 0.9; margin-top: 4px; }
        .fastpass-bottom-row { display: flex; align-items: center; gap: 6px; font-size: 12px; opacity: 0.8; margin-top: 8px; }
        .fastpass-bottom-row > span { font-weight: 600; }
        .fastpass-logo { width: 20px; height: 20px; }
        .fastpass-check { width: 14px; height: 14px; }
        .fastpass-powered-by {
            font-size: 12px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: #9ca3af; text-align: center;
        }
        .fastpass-powered-by a { color: inherit; text-decoration: none; }
        .fastpass-powered-by a:hover { text-decoration: underline; }

        .fastpass-spinner {
            width: 20px; height: 20px; border: 2px solid rgba(255,255,255,0.3);
            border-radius: 50%; border-top-color: #fff; animation: fastpass-spin 1s ease-in-out infinite; margin: 0 auto;
        }
        .fastpass-approved-icon svg { width: 32px; height: 32px; }
        .fastpass-approved-icon .tick { stroke-dasharray: 24; stroke-dashoffset: 24; animation: fastpass-tick-animation 0.5s ease-out forwards; animation-delay: 0.2s;}
        
        .fastpass-status-icon svg { width: 28px; height: 28px; }
        .fastpass-status-icon .line1 { stroke-dasharray: 17; stroke-dashoffset: 17; animation: fastpass-x-line-1 0.4s ease-out forwards; animation-delay: 0.2s; }
        .fastpass-status-icon .line2 { stroke-dasharray: 17; stroke-dashoffset: 17; animation: fastpass-x-line-2 0.4s ease-out forwards; animation-delay: 0.4s; }
    `;

    if (userLoading) {
        return (
             <div className="grid gap-6">
                 <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-64" />
                        <Skeleton className="h-4 w-full max-w-lg" />
                    </CardHeader>
                     <CardContent>
                        <Skeleton className="h-48 w-full" />
                    </CardContent>
                </Card>
            </div>
        )
    }

    const demoButtonStyle = selectedApp?.buttonStyle || {};
    const demoMainText = demoButtonStyle.mainText || 'Continue with FastPass';
    const demoMidRowHtml = selectedApp?.buttonDescription ? `<div class="fastpass-mid-row">${selectedApp.buttonDescription}</div>` : '';
    const demoHideAppName = demoButtonStyle.hideAppName || false;
    const demoHideVerificationBadge = demoButtonStyle.hideVerificationBadge || false;
    const demoVerifiedCheck = (selectedApp?.verified && !demoHideVerificationBadge)
      ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="fastpass-check"><path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clip-rule="evenodd" /></svg>`
      : '';
    const demoBottomRowHtml = !demoHideAppName ? `
    <div class="fastpass-bottom-row">
        <span>${selectedApp?.name}</span>
        ${demoVerifiedCheck}
    </div>
  ` : '';

    const defaultStateHtml = `
        <div class="fastpass-top-row">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="fastpass-logo"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            <span>${demoMainText}</span>
        </div>
        ${demoMidRowHtml}
        ${demoBottomRowHtml}
    `;

    return (
        <div className="grid gap-8">
            <style>{demoCss}</style>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">Developer Documentation <Badge variant="destructive">BETA</Badge></CardTitle>
                    <CardDescription>Integrate FastPass into your application with our simple, plug-and-play solution.</CardDescription>
                </CardHeader>
                <CardContent>
                     <section className="space-y-4">
                        <h2 className="text-xl font-semibold">Select Your App</h2>
                        <p className="text-muted-foreground">
                           Choose an application to generate its personalized integration snippets.
                        </p>
                        {loading ? (
                            <Skeleton className="h-10 w-full max-w-sm" />
                        ) : apps.length > 0 ? (
                            <Select onValueChange={handleAppChange} defaultValue={selectedApp?.id || apps[0]?.id}>
                                <SelectTrigger className="w-full max-w-sm">
                                    <SelectValue placeholder="Select an application" />
                                </SelectTrigger>
                                <SelectContent>
                                    {apps.map(app => (
                                        <SelectItem key={app.id} value={app.id}>{app.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        ) : (
                            <p className="text-sm text-muted-foreground">You haven't created any apps yet. <a href="/dev/create" className="underline">Create one</a> to get started.</p>
                        )}
                    </section>
                </CardContent>
            </Card>

            {selectedApp && (
                <div className="space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Interactive Demo</CardTitle>
                             <CardDescription>
                                See the button in action. Use the controls below to simulate the user flow.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                             <div className="flex justify-center p-8 rounded-lg bg-muted">
                                <div className="fastpass-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '100%', maxWidth: '350px' }}>
                                    <div id="fastpass-demo-btn-wrapper" style={{width: '100%' }}>
                                        <button id="fastpass-demo-btn" className={`fastpass-button-base state-${demoState}`}>
                                            
                                            <div className="fastpass-content-state state-content-default" dangerouslySetInnerHTML={{ __html: defaultStateHtml }}></div>

                                            <div className="fastpass-content-state state-content-waiting">
                                                <div className="fastpass-spinner"></div>
                                                <div style={{ marginTop: '8px', fontWeight: 600 }}>Waiting for response...</div>
                                            </div>
                                            <div className="fastpass-content-state state-content-approved">
                                                <div className="fastpass-approved-icon">
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                                        <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)"/>
                                                        <path className="tick" d="M7 13l3 3 7-7"/>
                                                    </svg>
                                                </div>
                                                <div style={{ fontWeight: 600 }}>Approved!</div>
                                            </div>
                                            <div className="fastpass-content-state state-content-declined">
                                                 <div className="fastpass-status-icon">
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                                                        <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" />
                                                        <line className="line1" x1="15" y1="9" x2="9" y2="15" />
                                                        <line className="line2" x1="9" y1="9" x2="15" y2="15" />
                                                    </svg>
                                                </div>
                                                <div style={{ fontWeight: 600 }}>Request Declined</div>
                                                <div style={{ fontSize: '12px', opacity: 0.8 }}>Click to try again</div>
                                            </div>
                                            <div className="fastpass-content-state state-content-canceled">
                                                 <div className="fastpass-status-icon">
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                                                        <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" />
                                                        <line className="line1" x1="15" y1="9" x2="9" y2="15" />
                                                        <line className="line2" x1="9" y1="9" x2="15" y2="15" />
                                                    </svg>
                                                </div>
                                                <div style={{ fontWeight: 600 }}>Request Canceled</div>
                                                <div style={{ fontSize: '12px', opacity: 0.8 }}>Click to try again</div>
                                            </div>
                                        </button>
                                    </div>
                                    <div className="fastpass-powered-by">
                                        Powered by <a href="https://fastpass.kabirinvents.com" target="_blank" rel="noopener noreferrer" style={{color: 'inherit', textDecoration: 'none'}}>FastPass</a>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-center gap-2 flex-wrap">
                                <Button variant="outline" onClick={() => setDemoState('default')}>Start</Button>
                                <Button variant="outline" onClick={() => setDemoState('waiting')}>Wait</Button>
                                <Button variant="outline" onClick={() => setDemoState('approved')}>Approve</Button>
                                <Button variant="outline" onClick={() => setDemoState('declined')}>Deny</Button>
                                <Button variant="outline" onClick={() => setDemoState('canceled')}>Cancel</Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Part 1: Standard FastPass (Autofill)</CardTitle>
                             <CardDescription>
                                This is the recommended "plug-and-play" integration for pre-filling user profiles and forms. It uses a single script to dynamically create the button and handle the entire popup flow.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <h3 className="font-semibold">How It Works</h3>
                                <p className="text-sm text-muted-foreground mt-2 mb-4">The user clicks the button, approves data sharing in the popup, and our script handles the rest. Upon approval, it automatically finds any form elements on your page with an <strong>id</strong> that matches a key in the returned data object (e.g., &lt;input id="email" /&gt;) and fills in the value for you.</p>
                            </div>
                             <div>
                                <h3 className="font-semibold">HTML Snippet</h3>
                                <p className="text-sm text-muted-foreground mt-2 mb-4">Add this snippet to your HTML where you want the button to appear.</p>
                                <CodeBlock lang="html">{simpleIntegrationCode}</CodeBlock>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader>
                           <CardTitle>Part 2: FastPass SSO (Demo)</CardTitle>
                           <CardDescription>FastPass SSO lets apps use your system as a login method. FastPass generates a private password for each app, storing it once and returning it every time the user logs in.</CardDescription>
                        </CardHeader>
                         <CardContent className="space-y-4">
                            <Alert variant="destructive">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertTitle>Important: How FastPass SSO Works</AlertTitle>
                                <AlertDescription>
                                    FastPass SSO is currently a demo. It functions like a secure password manager, not a traditional OAuth 2.0 provider. It simplifies login by providing a consistent, secure password for the user, but it does **not** provide cryptographic identity verification. Your app is responsible for creating and managing its own sessions.
                                </AlertDescription>
                            </Alert>
                            <p>When a developer sets up their app in the FastPass developer panel, they select a special integration called <strong>"SSO"</strong>.</p>
                            <p>This choice flags the app to use a unique password-generation flow. The developer is warned that selecting <strong>"SSO"</strong> will transform the app's function: instead of receiving a variety of profile fields, their app will receive only a user's email and a unique, persistent password. The user experience is seamless and familiar:</p>
                            <p>The user clicks the "Continue with FastPass" button, and a secure popup opens for approval. When the user approves, the FastPass backend performs these steps:</p>
                            <ul className="list-decimal list-inside space-y-2 pl-4">
                                <li><strong>Check the Vault:</strong> It looks for an existing password in a secure database path specific to that user and app: `users/{'{user_id}'}/apps/{'{clientId}'}/ssoPassword`.</li>
                                <li>
                                    <strong>Generate or Retrieve:</strong>
                                    <ul className="list-disc list-inside space-y-1 pl-6">
                                        <li><strong>First Time (Signup Mode):</strong> If no password exists, it generates a new, very long, and cryptographically secure random password, saves it to the vault, and sets the returned `LOS` mode to `Signup`.</li>
                                        <li><strong>Returning User (Login Mode):</strong> If a password is found, it retrieves the exact same password and sets the returned `LOS` mode to `Login`.</li>
                                    </ul>
                                </li>
                                <li><strong>Return Result:</strong> FastPass securely sends the user's email, the unique `ssoPassword`, and the `LOS` (Login or Signup) mode directly to your application via `postMessage`.</li>
                            </ul>
                            <p>Your app then uses this information to either log the user in or create a new account. FastPass handles password management; you handle the session.</p>
                            <div className="space-y-4 pt-4">
                                <h3 className="font-semibold">HTML Snippet</h3>
                                <p className="text-sm text-muted-foreground mt-2 mb-4">Add this snippet to your HTML where you want the button to appear.</p>
                                <CodeBlock lang="html">{simpleIntegrationCode}</CodeBlock>
                            </div>
                         </CardContent>
                    </Card>


                    <Card>
                         <CardHeader>
                            <CardTitle>Part 3: Receiving User Data</CardTitle>
                            <CardDescription>
                                Upon approval, your page will receive the user's data. You can handle this automatically or with a custom callback.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <h3 className="font-semibold">Method 1: Automatic Form Filling (Default for Autofill)</h3>
                                <p className="text-sm text-muted-foreground mt-2 mb-4">
                                    Our script will automatically find any form elements on your page with an <strong>id</strong> that matches a key in the returned data object and fill the value. You can also listen for the `message` event to get the data.
                                </p>
                                <CodeBlock lang="javascript">{extractionCode}</CodeBlock>
                            </div>
                            <div>
                                <h3 className="font-semibold">Method 2: Advanced Handling with a Callback</h3>
                                 <p className="text-sm text-muted-foreground mt-2 mb-4">
                                   For more control, you can define a global `window.fastPassCallback` function. If our script finds this function, it will call it with the results instead of automatically filling forms. The first argument is an error object (or null on success), and the second is the data object.
                                </p>
                                <CodeBlock lang="javascript">{callbackCode}</CodeBlock>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader>
                            <CardTitle>✅ Security Comparison (Which One Is More Secure)</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <h3 className="font-semibold">✔ Method 1 — Automatic Form Fill</h3>
                                <ul className="list-disc list-inside space-y-1 pl-4 mt-2 text-sm text-muted-foreground">
                                    <li>Security level: High, but only for basic autofill</li>
                                    <li>The SDK handles everything internally</li>
                                    <li>No custom logic, so no mistakes</li>
                                    <li>Good for simple apps</li>
                                    <li>But you cannot control how the data is used, stored, or validated</li>
                                    <li>Not ideal for SSO because it auto-fills fields that might get exposed in the DOM</li>
                                    <li>Safe, but limited.</li>
                                    <li>Not ideal for a real SSO system.</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-semibold">✔ Method 2 — Callback</h3>
                                <ul className="list-disc list-inside space-y-1 pl-4 mt-2 text-sm text-muted-foreground">
                                    <li>Security level: <strong>Very High, and recommended for SSO</strong></li>
                                    <li>You <strong>fully control</strong> how the data is handled</li>
                                    <li>You can keep passwords/tokens out of the HTML, preventing DOM leaks</li>
                                    <li>You can run your own: hashing, encryption, secure storage, server-side verification</li>
                                    <li><strong>No auto-filling of inputs</strong> (this is safer for sensitive SSO data)</li>
                                    <li>This is the method real login providers use (Google Sign-In, OAuth, etc.).</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-semibold">🔥 Which is more secure for SSO?</h3>
                                <p className="mt-2 text-sm">👉 <strong>Method 2: Callback</strong></p>
                                <ul className="list-disc list-inside space-y-1 pl-4 mt-2 text-sm text-muted-foreground">
                                    <li>You avoid putting sensitive data into visible inputs</li>
                                    <li>You can store passwords/tokens securely in Firebase RTDB or Firestore</li>
                                    <li>You can do signup/login logic securely yourself</li>
                                    <li>You reduce risk of front-end leaks</li>
                                </ul>
                            </div>
                             <div>
                                <h3 className="font-semibold">🔒 Simple Rule</h3>
                                <ul className="list-none space-y-2 pl-2 mt-2 text-sm">
                                    <li><strong>Autofill app → Method 1</strong> (not sensitive data, just names/emails)</li>
                                    <li><strong>SSO / Login System → Method 2</strong> (sensitive passwords/tokens → must be controlled manually)</li>
                                </ul>
                                <p className="mt-4 text-sm font-medium">SSO = <strong>ONLY Method 2 allowed</strong><br/>Autofill = <strong>Both methods are allowed</strong></p>
                            </div>
                        </CardContent>
                    </Card>

                     <Card>
                         <CardHeader>
                            <CardTitle>Part 4: Understanding the Data Payloads</CardTitle>
                            <CardDescription>
                                Here is an example of the data object your page will receive based on your app's current configuration.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                             <div>
                                <h3 className="font-semibold">Your App's Requested Integrations</h3>
                                <p className="text-sm text-muted-foreground mt-2 mb-4">
                                    The following data fields will be included in the payload if the user has filled them out on their FastPass profile.
                                </p>
                                <div className="flex flex-wrap gap-2 rounded-lg border p-4">
                                    {selectedApp.requestedIntegrations && Object.keys(selectedApp.requestedIntegrations).length > 0 ? Object.keys(selectedApp.requestedIntegrations).map(key => (
                                        <Badge key={key} variant="secondary">{integrationDetails[key]?.label || key}</Badge>
                                    )) : <Badge variant="destructive">No integrations requested</Badge>}
                                </div>
                            </div>
                             <div>
                                <h3 className="font-semibold">Example `data` on Approval</h3>
                                <p className="text-sm text-muted-foreground mt-2 mb-4">
                                    This is an example based on your app's current configuration. The payload will be a flat object. For SSO apps, it will also include `ssoPassword` and `LOS`.
                                </p>
                                <CodeBlock lang="json">
                                    {JSON.stringify(generateExampleData(), null, 2)}
                                </CodeBlock>
                            </div>
                               
                             <div>
                                <h3 className="font-semibold">Example on Decline or Cancel</h3>
                                <p className="text-sm text-muted-foreground mt-2 mb-4">
                                If the user declines or cancels, the script will pass an error to your callback (or do nothing if no callback is defined). The event data will look like this.
                                </p>
                                <CodeBlock lang="json">
                                    {`
{
  "status": "declined",
  "data": null
}

// or

{
  "status": "canceled",
  "data": null
}
                                    `.trim()}
                                </CodeBlock>
                             </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )

}
