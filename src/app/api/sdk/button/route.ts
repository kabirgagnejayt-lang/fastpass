
import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getDatabase, ref, get } from 'firebase/database';
import { firebaseConfig } from '@/firebase/config';

if (!getApps().length) {
  initializeApp(firebaseConfig);
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-control-Allow-Headers": "Content-Type",
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get('clientId');

  if (!clientId) {
    return NextResponse.json({ error: 'Client ID is required' }, { status: 400, headers: corsHeaders });
  }

  const db = getDatabase();
  const appRef = ref(db, `clients/${clientId}`);
  const snapshot = await get(appRef);

  if (!snapshot.exists()) {
    return NextResponse.json({ error: 'App not found' }, { status: 404, headers: corsHeaders });
  }

  const appData = snapshot.val();
  const buttonStyle = appData.buttonStyle || {};
  const hostUrl = "https://fastpass.kabirinvents.com";
  const popupUrl = `${hostUrl}/fastpass/${clientId}?popup=true`;
  const sessionCheckUrl = `${hostUrl}/fastpass/session-check`;

  const buttonCss = `
    @keyframes fastpass-stripe-animation { from { background-position: 0 0; } to { background-position: -40px 0; } }
    @keyframes fastpass-tick-animation { 0% { stroke-dashoffset: 24; } 100% { stroke-dashoffset: 0; } }
    @keyframes fastpass-x-line-1 { 0% { stroke-dashoffset: 17; } 100% { stroke-dashoffset: 0; } }
    @keyframes fastpass-x-line-2 { 0% { stroke-dashoffset: 17; } 100% { stroke-dashoffset: 0; } }

    .fastpass-container {
        display: flex; flex-direction: column; align-items: center; gap: 8px; width: 100%; max-width: 350px;
    }
    .fastpass-button-wrapper { width: 100%; max-width: 350px; min-height: 90px; }
    .fastpass-button-base {
      position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px;
      width: 100%; min-height: 90px; padding: 16px; color: white;
      border: none; border-radius: 8px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      overflow: hidden; transition: all 0.3s ease; text-align: center;
    }
    .fastpass-button-base {
        background-image: repeating-linear-gradient(-45deg, transparent, transparent 10px, rgba(255, 255, 255, 0.05) 10px, rgba(255, 255, 255, 0.05) 20px);
        animation: fastpass-stripe-animation 1.5s linear infinite;
    }
    .fastpass-button-base.state-default { background-color: #10B981; cursor: pointer; }
    .fastpass-button-base.state-default:hover { filter: brightness(1.1); }
    .fastpass-button-base.state-waiting { background-color: #374151; }
    .fastpass-button-base.state-approved { background-color: #10B981; }
    .fastpass-button-base.state-declined { background-color: #EF4444; cursor: pointer; }
    .fastpass-button-base.state-declined:hover { filter: brightness(1.1); }
    .fastpass-button-base.state-canceled { background-color: #6B7280; cursor: pointer; }
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
    #fastpass-main-text { transition: all 0.2s ease-in-out; }
    .fastpass-mid-row { font-size: 14px; opacity: 0.9; margin-top: 4px; }
    .fastpass-bottom-row { display: flex; align-items: center; gap: 6px; font-size: 12px; opacity: 0.8; margin-top: 8px; }
    .fastpass-bottom-row > span { font-weight: 600; }
    .fastpass-logo { width: 20px; height: 20px; }
    .fastpass-check { width: 14px; height: 14px; }
    .fastpass-powered-by {
        font-size: 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        color: #9ca3af; text-align: center;
    }
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
    @keyframes fastpass-spin { to { transform: rotate(360deg); } }
  `;

  const verifiedCheck = (appData.verified && !buttonStyle.hideVerificationBadge)
      ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="fastpass-check"><path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clip-rule="evenodd" /></svg>`
      : '';
  
  const midRowHtml = appData.buttonDescription ? `<div class="fastpass-mid-row">${appData.buttonDescription}</div>` : '';
  const bottomRowHtml = !buttonStyle.hideAppName ? `
    <div class="fastpass-bottom-row">
        <span>${appData.name}</span>
        ${verifiedCheck}
    </div>
  ` : '';
  const mainText = buttonStyle.mainText || 'Continue with FastPass';

  const buttonHtml = `
    <div class="fastpass-container">
        <div id="fastpass-btn-wrapper-${clientId}" class="fastpass-button-wrapper">
            <button id="fastpass-btn-${clientId}" class="fastpass-button-base state-default">
                
                <!-- Default State -->
                <div class="fastpass-content-state state-content-default">
                    <div class="fastpass-top-row">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="fastpass-logo"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                        <span id="fastpass-main-text">${mainText}</span>
                    </div>
                    ${midRowHtml}
                    ${bottomRowHtml}
                </div>

                <!-- Waiting State -->
                <div class="fastpass-content-state state-content-waiting">
                    <div class="fastpass-spinner"></div>
                    <div style="margin-top: 8px; font-weight: 600;">Waiting for response...</div>
                </div>

                <!-- Approved State -->
                <div class="fastpass-content-state state-content-approved">
                    <div class="fastpass-approved-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)"/>
                            <path class="tick" d="M7 13l3 3 7-7"/>
                        </svg>
                    </div>
                    <div id="fastpass-approved-text" style="font-weight: 600;">Approved!</div>
                </div>

                <!-- Declined State -->
                <div class="fastpass-content-state state-content-declined">
                     <div class="fastpass-status-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" />
                            <line class="line1" x1="15" y1="9" x2="9" y2="15" />
                            <line class="line2" x1="9" y1="9" x2="15" y2="15" />
                        </svg>
                    </div>
                    <div style="font-weight: 600;">Request Declined</div>
                    <div style="font-size: 12px; opacity: 0.8;">Click to try again</div>
                </div>

                <!-- Canceled State -->
                <div class="fastpass-content-state state-content-canceled">
                     <div class="fastpass-status-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" />
                            <line class="line1" x1="15" y1="9" x2="9" y2="15" />
                            <line class="line2" x1="9" y1="9" x2="15" y2="15" />
                        </svg>
                    </div>
                    <div style="font-weight: 600;">Request Canceled</div>
                    <div style="font-size: 12px; opacity: 0.8;">Click to try again</div>
                </div>

            </button>
        </div>
        <div class="fastpass-powered-by">
            Powered by <a href="${hostUrl}" target="_blank">FastPass</a>
        </div>
    </div>
  `;

  const script = `
    (function() {
      const containerId = 'fastpass-button-container';
      const container = document.getElementById(containerId);
      if (!container) {
        console.error("FastPass Error: Container element #" + containerId + " not found.");
        return;
      }
      
      const style = document.createElement('style');
      style.textContent = \`${buttonCss}\`;
      document.head.appendChild(style);

      const sessionFrame = document.createElement('iframe');
      sessionFrame.src = '${sessionCheckUrl}';
      sessionFrame.style.display = 'none';
      document.body.appendChild(sessionFrame);
      
      let popup, popupChecker;

      function openPopup() {
        const btn = document.getElementById('fastpass-btn-${clientId}');
        if (!btn || (btn.disabled && !btn.classList.contains('state-declined') && !btn.classList.contains('state-canceled'))) return;
        
        btn.className = 'fastpass-button-base state-waiting';
        btn.disabled = true;

        const width = 600, height = 700;
        const left = (screen.width / 2) - width / 2;
        const top = (screen.height / 2) - height / 2;
        popup = window.open("${popupUrl}", "fastpass-popup", \`width=\${width},height=\${height},top=\${top},left=\${left}\`);
        
        // Start checking if the popup was closed by the user
        popupChecker = setInterval(() => {
          if (popup && popup.closed && btn && btn.classList.contains('state-waiting')) {
            clearInterval(popupChecker);
            handleResponseMessage({ status: 'canceled' });
          }
        }, 500);
      }
      
      function handleResponseMessage(eventData) {
        const { status, data } = eventData;
        const btn = document.getElementById('fastpass-btn-${clientId}');
        if (!btn) return;

        // Stop checking the popup status
        if (popupChecker) clearInterval(popupChecker);
        
        // Handle custom callback first
        if (window.fastPassCallback && typeof window.fastPassCallback === 'function') {
            if (status === "approved") {
                btn.className = 'fastpass-button-base state-approved';
                const approvedText = document.getElementById('fastpass-approved-text');
                if (approvedText && data.name) {
                    approvedText.textContent = 'Welcome, ' + data.name.split(' ')[0] + '!';
                }
                btn.disabled = true;
                setTimeout(() => window.fastPassCallback(null, data), 500);
            } else if (status === "declined") {
                btn.className = 'fastpass-button-base state-declined';
                btn.disabled = false;
                setTimeout(() => window.fastPassCallback(new Error('User declined.'), null), 500);
            } else if (status === "canceled") {
                btn.className = 'fastpass-button-base state-canceled';
                btn.disabled = false;
                setTimeout(() => window.fastPassCallback(new Error('User canceled.'), null), 500);
            }
            return;
        }

        // Default behavior if no callback
        if (status === "approved") {
            btn.className = 'fastpass-button-base state-approved';
            const approvedText = document.getElementById('fastpass-approved-text');
            if (approvedText && data.name) {
                approvedText.textContent = 'Welcome, ' + data.name.split(' ')[0] + '!';
            }
            btn.disabled = true;
            for (const key in data) {
                const el = document.getElementById(key);
                if (el) el.value = data[key];
            }
        } else if (status === "declined") {
            btn.className = 'fastpass-button-base state-declined';
            btn.disabled = false;
        } else if (status === "canceled") {
            btn.className = 'fastpass-button-base state-canceled';
            btn.disabled = false;
        }
      }

      container.innerHTML = \`${buttonHtml}\`;
      const btn = document.getElementById('fastpass-btn-${clientId}');
      if (!btn) return;

      btn.addEventListener("click", openPopup);

      window.addEventListener("message", (event) => {
          if (event.origin !== "${hostUrl}") return;
          
          // Handle session check for Express Fill
          if (event.data && event.data.type === 'FASTPASS_SESSION') {
              if (event.data.status === 'LOGGED_IN' && event.data.firstName) {
                  const mainTextEl = document.getElementById('fastpass-main-text');
                  if (mainTextEl) {
                      mainTextEl.textContent = 'Continue as ' + event.data.firstName;
                  }
              }
              // Cleanup the iframe
              if (sessionFrame.parentNode) {
                  sessionFrame.parentNode.removeChild(sessionFrame);
              }
              return;
          }

          // Handle approval/decline flow
          if (event.data && event.data.status) {
            handleResponseMessage(event.data);
          }
      });
    })();
  `;

  return new NextResponse(script, {
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/javascript',
    },
  });
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}
    

    
