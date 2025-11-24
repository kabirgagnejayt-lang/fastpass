
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import Header from "@/components/header";
import { Fingerprint, KeyRound, UserCheck, PlayCircle, PartyPopper } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    icon: <UserCheck className="h-10 w-10" />,
    title: "One-Click Profiles",
    description: "Fill it out once, use it everywhere. Stop wasting time manually entering your details into forms over and over again.",
  },
  {
    icon: <KeyRound className="h-10 w-10" />,
    title: "Developer Friendly",
    "description": "No complex SDKs or backend code needed. Just add a single script tag to your site to enable a secure, client-side data flow.",
  },
  {
    icon: <Fingerprint className="h-10 w-10" />,
    title: "Privacy & Security",
    description: "You control what you share. With clear, granular permissions, you decide which apps get access to your information.",
  }
]

export function AppLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}

function LiveDemo() {
  const [state, setState] = useState('default');
  const [popup, setPopup] = useState<Window | null>(null);

  useEffect(() => {
    let popupChecker: NodeJS.Timeout;

    const handleMessage = (event: MessageEvent) => {
      if (!event.data || !event.data.status) {
        return;
      }
      
      const { status, data } = event.data;

      if (status === 'approved' || status === 'declined' || status === 'canceled') {
        setState(status);
        if(status === 'approved' && data && data.name){
            const approvedText = document.getElementById('demo-approved-text');
            if(approvedText) {
                approvedText.textContent = 'Welcome, ' + data.name.split(' ')[0] + '!';
            }
        }
        if (popup) {
          popup.close();
        }
        if (popupChecker) {
          clearInterval(popupChecker);
        }
      }
    };

    window.addEventListener('message', handleMessage);

    if (popup) {
      popupChecker = setInterval(() => {
        if (popup.closed && state === 'waiting') {
          clearInterval(popupChecker);
          setState('canceled');
        }
      }, 100);
    }

    return () => {
      window.removeEventListener('message', handleMessage);
      if (popupChecker) {
        clearInterval(popupChecker);
      }
      if (popup && !popup.closed) {
        popup.close();
      }
    };
  }, [popup, state]);


  const handleClick = () => {
    if (['approved', 'declined', 'canceled'].includes(state)) {
      setState('default');
      const approvedText = document.getElementById('demo-approved-text');
      if(approvedText) approvedText.textContent = 'Approved!';
      return;
    }

    setState('waiting');
    
    const width = 600, height = 700;
    const left = (window.screen.width / 2) - (width / 2);
    const top = (window.screen.height / 2) - (height / 2);

    const newPopup = window.open(
        '/fastpass/autofilldemo',
        'fastpass-demo-popup',
        `width=${width},height=${height},top=${top},left=${left}`
    );
    setPopup(newPopup);
  };

  return (
    <div className="mx-auto max-w-2xl rounded-xl bg-card p-8 shadow-2xl ring-1 ring-inset ring-primary/20">
      <div className="fastpass-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '100%', maxWidth: '350px', margin: '0 auto' }}>
        <button 
          onClick={handleClick}
          className={cn("fastpass-button-base", `state-${state}`)}
        >
          {/* Default State */}
          <div className="fastpass-content-state state-content-default">
            <div className="fastpass-top-row">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="fastpass-logo"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
              <span>Continue with FastPass</span>
            </div>
            <div className="fastpass-bottom-row">
              <span>Demo App</span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="fastpass-check"><path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" /></svg>
            </div>
          </div>
          {/* Waiting State */}
          <div className="fastpass-content-state state-content-waiting">
            <div className="fastpass-spinner" />
            <div style={{ marginTop: '8px', fontWeight: 600 }}>Waiting for response...</div>
          </div>
          {/* Approved State */}
          <div className="fastpass-content-state state-content-approved">
            <div className="fastpass-approved-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" />
                <path className="tick" d="M7 13l3 3 7-7" />
              </svg>
            </div>
            <div id="demo-approved-text" style={{ fontWeight: 600 }}>Approved!</div>
          </div>
           {/* Declined State */}
          <div className="fastpass-content-state state-content-declined">
                <div className="fastpass-status-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" />
                        <line className="line1" x1="15" y1="9" x2="9" y2="15" />
                        <line className="line2" x1="9" y1="9" x2="15" y2="15" />
                    </svg>
                </div>
              <div style={{ fontWeight: 600 }}>Request Declined</div>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>Click to try again</div>
          </div>
           {/* Canceled State */}
          <div className="fastpass-content-state state-content-canceled">
                <div className="fastpass-status-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" />
                        <line className="line1" x1="15" y1="9" x2="9" y2="15" />
                        <line className="line2" x1="9" y1="9" x2="15" y2="15" />
                    </svg>
                </div>
              <div style={{ fontWeight: 600 }}>Request Canceled</div>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>Click to try again</div>
          </div>
        </button>
        <div className="fastpass-powered-by">
          Powered by <a href="https://fastpass.kabirinvents.com" target="_blank" rel="noopener noreferrer">FastPass</a>
        </div>
      </div>
      <style>{`
        @keyframes fastpass-stripe-animation { from { background-position: 0 0; } to { background-position: -40px 0; } }
        @keyframes fastpass-tick-animation { 0% { stroke-dashoffset: 24; } 100% { stroke-dashoffset: 0; } }
        @keyframes fastpass-spin { to { transform: rotate(360deg); } }
        @keyframes fastpass-x-line-1 { 0% { stroke-dashoffset: 17; } 100% { stroke-dashoffset: 0; } }
        @keyframes fastpass-x-line-2 { 0% { stroke-dashoffset: 17; } 100% { stroke-dashoffset: 0; } }


        .fastpass-container { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
        .fastpass-button-base {
          position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px;
          width: 100%; min-height: 90px; padding: 16px; color: white;
          border: none; border-radius: 8px; overflow: hidden; transition: all 0.3s ease; text-align: center; cursor: pointer;
          background-image: repeating-linear-gradient(-45deg, transparent, transparent 10px, rgba(255, 255, 255, 0.05) 10px, rgba(255, 255, 255, 0.05) 20px);
          animation: fastpass-stripe-animation 1.5s linear infinite;
        }
        .fastpass-button-base.state-default { background-color: #10B981; }
        .fastpass-button-base.state-default:hover { filter: brightness(1.1); }
        .fastpass-button-base.state-waiting { background-color: #374151; }
        .fastpass-button-base.state-approved { background-color: #10B981; }
        .fastpass-button-base.state-declined { background-color: #EF4444; }
        .fastpass-button-base.state-declined:hover { filter: brightness(1.1); }
        .fastpass-button-base.state-canceled { background-color: #6B7280; }
        .fastpass-button-base.state-canceled:hover { filter: brightness(1.1); }


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
        .fastpass-check { width: 14px; height: 14px; color: hsl(var(--primary-foreground)); }
        .fastpass-powered-by { font-size: 12px; color: hsl(var(--muted-foreground)); text-align: center; }
        .fastpass-powered-by a { color: inherit; text-decoration: none; }
        .fastpass-powered-by a:hover { text-decoration: underline; }

        .fastpass-approved-icon svg { width: 32px; height: 32px; }
        .fastpass-approved-icon .tick { stroke-dasharray: 24; stroke-dashoffset: 24; animation: fastpass-tick-animation 0.5s ease-out forwards; animation-delay: 0.2s;}

        .fastpass-status-icon svg { width: 28px; height: 28px; }
        .fastpass-status-icon .line1 { stroke-dasharray: 17; stroke-dashoffset: 17; animation: fastpass-x-line-1 0.4s ease-out forwards; animation-delay: 0.2s; }
        .fastpass-status-icon .line2 { stroke-dasharray: 17; stroke-dashoffset: 17; animation: fastpass-x-line-2 0.4s ease-out forwards; animation-delay: 0.4s; }

        .fastpass-spinner {
            width: 20px; height: 20px; border: 2px solid rgba(255,255,255,0.3);
            border-radius: 50%; border-top-color: #fff; animation: fastpass-spin 1s ease-in-out infinite; margin: 0 auto;
        }
      `}</style>
    </div>
  )
}

function LiveSSODemo() {
  const [state, setState] = useState('default');
  const [popup, setPopup] = useState<Window | null>(null);

  useEffect(() => {
    let popupChecker: NodeJS.Timeout;

    const handleMessage = (event: MessageEvent) => {
      if (!event.data || !event.data.status) {
        return;
      }
      
      const { status, data } = event.data;

      if (status === 'approved' || status === 'declined' || status === 'canceled') {
        setState(status);
        if(status === 'approved' && data && data.name){
            const approvedText = document.getElementById('sso-demo-approved-text');
            if(approvedText) {
                approvedText.textContent = 'Welcome, ' + data.name.split(' ')[0] + '!';
            }
        }
        if (popup) popup.close();
        if (popupChecker) clearInterval(popupChecker);
      }
    };

    window.addEventListener('message', handleMessage);

    if (popup) {
      popupChecker = setInterval(() => {
        if (popup.closed && state === 'waiting') {
          clearInterval(popupChecker);
          setState('canceled');
        }
      }, 100);
    }

    return () => {
      window.removeEventListener('message', handleMessage);
      if (popupChecker) clearInterval(popupChecker);
      if (popup && !popup.closed) popup.close();
    };
  }, [popup, state]);


  const handleClick = () => {
    if (['approved', 'declined', 'canceled'].includes(state)) {
      setState('default');
      const approvedText = document.getElementById('sso-demo-approved-text');
      if(approvedText) approvedText.textContent = 'Approved!';
      return;
    }

    setState('waiting');
    
    const width = 600, height = 700;
    const left = (window.screen.width / 2) - (width / 2);
    const top = (window.screen.height / 2) - (height / 2);

    const newPopup = window.open(
        '/fastpass/ssodemo',
        'fastpass-sso-demo-popup',
        `width=${width},height=${height},top=${top},left=${left}`
    );
    setPopup(newPopup);
  };

  return (
    <div className="mx-auto max-w-2xl rounded-xl bg-card p-8 shadow-2xl ring-1 ring-inset ring-primary/20">
      <div className="fastpass-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '100%', maxWidth: '350px', margin: '0 auto' }}>
        <button 
          onClick={handleClick}
          className={cn("fastpass-button-base", `state-${state}`)}
        >
          {/* Default State */}
          <div className="fastpass-content-state state-content-default">
            <div className="fastpass-top-row">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="fastpass-logo"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
              <span>Continue with FastPass</span>
            </div>
            <div className="fastpass-bottom-row">
              <span>SSO Demo App</span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="fastpass-check"><path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" /></svg>
            </div>
          </div>
          {/* Other states are the same as LiveDemo so they share styles */}
          <div className="fastpass-content-state state-content-waiting">
            <div className="fastpass-spinner" />
            <div style={{ marginTop: '8px', fontWeight: 600 }}>Waiting for response...</div>
          </div>
          <div className="fastpass-content-state state-content-approved">
            <div className="fastpass-approved-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" />
                <path className="tick" d="M7 13l3 3 7-7" />
              </svg>
            </div>
            <div id="sso-demo-approved-text" style={{ fontWeight: 600 }}>Approved!</div>
          </div>
          <div className="fastpass-content-state state-content-declined">
                <div className="fastpass-status-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" />
                        <line className="line1" x1="15" y1="9" x2="9" y2="15" />
                        <line className="line2" x1="9" y1="9" x2="15" y2="15" />
                    </svg>
                </div>
              <div style={{ fontWeight: 600 }}>Request Canceled</div>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>Click to try again</div>
          </div>
        </button>
        <div className="fastpass-powered-by">
          Powered by <a href="https://fastpass.kabirinvents.com" target="_blank" rel="noopener noreferrer">FastPass</a>
        </div>
      </div>
    </div>
  )
}

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <Header />
      <main className="flex-1">
        <section className="py-24 md:py-32 lg:py-40">
          <div className="container px-4 md:px-6">
            <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary mb-6">
                <AppLogo className="h-10 w-10" />
              </div>
              <h1 className="text-4xl font-extrabold leading-tight tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
                A Quick Pass for App Logins <Badge variant="destructive" className="text-4xl align-middle">BETA</Badge>
              </h1>
              <p className="max-w-2xl text-xl text-muted-foreground md:text-2xl">
                FastPass is a quick pass for apps, letting you pre-fill your profile information to create an account or log in instantly.
              </p>
              <div className="mt-6 flex gap-4">
                <Button asChild size="lg">
                  <Link href="/dashboard">Get Started</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/dev">Developer? Create an App</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-muted/50">
          <div className="container">
            <div className="mx-auto max-w-4xl text-center">
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1 text-primary">
                    <PartyPopper className="h-5 w-5" />
                    <span className="font-semibold">Announcement</span>
                </div>
                <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">FastPass Beta 1.0 is Here!</h2>
                <p className="mt-4 text-lg text-muted-foreground">
                    After a long time of fixing and debugging, the first public beta of FastPass is officially OUT! We're so excited for you to try it out. Whether you're a user tired of filling out forms or a developer looking for a simple login solution, FastPass is for you.
                </p>
            </div>
          </div>
        </section>

         <section id="demo" className="py-16 md:py-24">
          <div className="container">
            <div className="mx-auto max-w-4xl text-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1 text-primary">
                <PlayCircle className="h-5 w-5" />
                <span className="font-semibold">Live Autofill Demo</span>
              </div>
              <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">See It In Action</h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Tired of filling out sign-up forms? Experience the magic of FastPass yourself. Click the button below to see how it works.
              </p>
            </div>
            <div className="mt-16">
              <LiveDemo />
            </div>
          </div>
        </section>

        <section id="sso-demo" className="py-16 md:py-24 bg-muted/50">
          <div className="container">
            <div className="mx-auto max-w-4xl text-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1 text-primary">
                <KeyRound className="h-5 w-5" />
                <span className="font-semibold">Live SSO Demo</span>
                 <Badge variant="outline">DEMO</Badge>
              </div>
              <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Or Sign In with SSO</h2>
              <p className="mt-4 text-lg text-muted-foreground">
                For apps that use FastPass as a login provider, we securely manage a unique password for you. Experience the seamless sign-in flow.
              </p>
            </div>
            <div className="mt-16">
              <LiveSSODemo />
            </div>
          </div>
        </section>

        <section id="features" className="py-16 md:py-24">
            <div className="container">
                <div className="mx-auto max-w-4xl text-center">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">One Platform, Endless Convenience</h2>
                    <p className="mt-4 text-lg text-muted-foreground">
                        For users, it's a digital passport. For developers, it's the fastest way to build a user-centric experience.
                    </p>
                </div>
                <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
                    {features.map((feature) => (
                        <Card key={feature.title} className="text-center">
                            <CardHeader className="items-center">
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                                    {feature.icon}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <h3 className="text-xl font-bold">{feature.title}</h3>
                                <p className="mt-2 text-muted-foreground">{feature.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
        
        <section id="how-it-works" className="py-16 md:py-24 bg-muted/50">
            <div className="container">
                <div className="mx-auto max-w-4xl text-center">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Simple Integration for Developers</h2>
                    <p className="mt-4 text-lg text-muted-foreground">
                        Get up and running with FastPass in just three simple steps.
                    </p>
                </div>
                <div className="mt-16 grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-3">
                    <div className="flex flex-col items-center text-center">
                         <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-primary bg-primary/10 text-primary text-xl font-bold">1</div>
                         <h3 className="mt-6 text-xl font-semibold">Launch the Popup</h3>
                         <p className="mt-2 text-muted-foreground">Use our simple script to open a secure popup window where the user can authenticate.</p>
                    </div>
                    <div className="flex flex-col items-center text-center">
                         <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-primary bg-primary/10 text-primary text-xl font-bold">2</div>
                         <h3 className="mt-6 text-xl font-semibold">User Approves</h3>
                         <p className="mt-2 text-muted-foreground">The user reviews the requested data and approves the request on our secure platform.</p>
                    </div>
                    <div className="flex flex-col items-center text-center">
                         <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-primary bg-primary/10 text-primary text-xl font-bold">3</div>
                         <h3 className="mt-6 text-xl font-semibold">Receive Data</h3>
                         <p className="mt-2 text-muted-foreground">The popup securely sends the approved user data directly to your client-side code via `postMessage`.</p>
                    </div>
                </div>
            </div>
        </section>

      </main>
       <footer className="border-t">
        <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
          <div className="flex items-center gap-2">
            <AppLogo className="h-6 w-6 text-primary" />
            <span className="font-bold">FastPass</span>
             <Badge variant="outline">BETA</Badge>
          </div>
          <div className="flex flex-col items-center gap-4 text-center md:flex-row md:items-end md:gap-6">
            <p className="text-sm leading-loose text-muted-foreground">
                An invention by{" "}
                <a
                href="https://kabirinvents.com"
                target="_blank"
                rel="noreferrer"
                className="font-medium underline underline-offset-4"
                >
                Kabir
                </a>
                .
            </p>
            <div className="flex gap-4">
                <a
                    href="https://ko-fi.com/kabirinvents"
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-medium text-muted-foreground underline underline-offset-4"
                >
                    Support on Ko-fi
                </a>
                <a
                    href="https://whatsapp.com/channel/0029VbB4DCr9Gv7Qj7NgCX2t"
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-medium text-muted-foreground underline underline-offset-4"
                >
                    Join our WhatsApp Channel
                </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
