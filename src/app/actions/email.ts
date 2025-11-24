
'use server';

import { sendEmail } from "@/lib/email";
import type { ClientApp, UserProfile } from "@/lib/types";

interface UserInfo {
    email: string;
    name: string;
}

const emailWrapper = (content: string, title: string) => `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<style>
    body {
        margin: 0;
        padding: 0;
        background-color: #050505;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    }
    .container {
        width: 100%;
        max-width: 600px;
        margin: 0 auto;
        padding: 40px 20px;
        color: #e5e7eb;
    }
    .header {
        text-align: center;
        margin-bottom: 30px;
    }
    .header .logo {
        display: inline-block;
        color: #A855F7;
    }
    .content-card {
        background-color: #111111;
        border: 1px solid #374151;
        border-radius: 12px;
        padding: 30px;
    }
    .content-card h2 {
        font-size: 22px;
        font-weight: 600;
        color: #f9fafb;
        margin-top: 0;
        margin-bottom: 20px;
    }
    .content-card p {
        font-size: 16px;
        line-height: 1.6;
        color: #d1d5db;
        margin: 0 0 16px;
    }
    .button {
        display: inline-block;
        padding: 12px 24px;
        background-color: #A855F7;
        color: #ffffff;
        text-decoration: none;
        border-radius: 8px;
        font-weight: 600;
    }
    .footer {
        text-align: center;
        margin-top: 30px;
        font-size: 12px;
        color: #6b7280;
    }
    .data-table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 20px;
    }
    .data-table td {
        padding: 12px 0;
        border-bottom: 1px solid #374151;
        font-size: 14px;
    }
    .data-table td:first-child {
        color: #9ca3af;
    }
    .data-table td:last-child {
        text-align: right;
        font-weight: 500;
        color: #f3f4f6;
    }
     .data-table tr:last-child td {
        border-bottom: none;
    }
</style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    width="36"
                    height="36"
                >
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
            </div>
        </div>
        <div class="content-card">
            ${content}
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} FastPass. All rights reserved.</p>
            <p>If you did not request this email, you can safely ignore it.</p>
        </div>
    </div>
</body>
</html>
`;


export async function sendLoginEmail(user: UserInfo) {
    const title = "New Login to FastPass";
    const content = `
        <h2>New Login Detected</h2>
        <p>Hi ${user.name},</p>
        <p>We detected a new login to your FastPass account. If this was you, you can safely ignore this email.</p>
        <p>If you don't recognize this activity, please secure your account immediately. You can view your dashboard and manage settings by clicking the button below.</p>
        <p style="text-align:center; margin-top: 30px;">
            <a href="https://fastpass.kabirinvents.com/dashboard" class="button">Go to Dashboard</a>
        </p>
    `;

    await sendEmail({
        to: user,
        subject: title,
        html: emailWrapper(content, title),
        text: `Hi ${user.name},\n\nWe detected a new login to your FastPass account. If this wasn't you, please secure your account immediately.`
    });
}

export async function sendApprovalEmail(user: UserInfo, app: ClientApp, sharedData: { label: string, value: any }[], userProfile: UserProfile) {
    if (userProfile.hideEmail) return;

    const title = `Approval Confirmation for ${app.name}`;
    const sharedDataTable = sharedData.map(d => `
        <tr>
            <td>${d.label}</td>
            <td>${String(d.value)}</td>
        </tr>
    `).join('');
    
    const sharedDataText = sharedData.map(d => `- ${d.label}: ${String(d.value)}`).join('\n');

    const content = `
        <h2>Approval Successful</h2>
        <p>Hi ${user.name}, you've successfully used FastPass to share your information with <strong>${app.name}</strong>.</p>
        
        <h3>App Details</h3>
        <table class="data-table">
            <tr>
                <td>App Name</td>
                <td>${app.name}</td>
            </tr>
            <tr>
                <td>Verification Status</td>
                <td>${app.verified ? '✅ Verified' : '❌ Not Verified'}</td>
            </tr>
        </table>
        
        <h3 style="margin-top: 30px;">Information Shared</h3>
        <table class="data-table">
            ${sharedDataTable}
        </table>
        
        <p style="margin-top: 30px;">You can review and revoke app access at any time from your FastPass dashboard.</p>
        <p style="text-align:center; margin-top: 30px;">
            <a href="https://fastpass.kabirinvents.com/dashboard/apps" class="button">Manage Connected Apps</a>
        </p>
    `;
    
    if (user.email) {
        await sendEmail({
            to: user,
            subject: title,
            html: emailWrapper(content, title),
            text: `Hi ${user.name},\n\nYou've successfully shared your information with ${app.name} using FastPass.\n\nApp Details:\n- App Name: ${app.name}\n- Verification Status: ${app.verified ? 'Verified' : 'Not Verified'}\n\nThe following information was shared:\n${sharedDataText}\n\nYou can manage your connected apps in your FastPass dashboard.`
        });
    }
}

export async function sendNotificationsReenabledEmail(user: UserInfo) {
    const title = "FastPass Notifications Re-enabled";
    const content = `
        <h2>Approval Emails Are Back On</h2>
        <p>Hi ${user.name},</p>
        <p>This is a confirmation that you have re-enabled email notifications for app approvals.</p>
        <p>From now on, you will receive an email receipt each time you use FastPass to share your information with an application. You can change this preference at any time in your privacy settings.</p>
         <p style="text-align:center; margin-top: 30px;">
            <a href="https://fastpass.kabirinvents.com/dashboard/privacy" class="button">Manage Settings</a>
        </p>
    `;

    await sendEmail({
        to: user,
        subject: title,
        html: emailWrapper(content, title),
        text: `Hi ${user.name},\n\nThis is a confirmation that you have re-enabled email notifications for app approvals. You will now receive an email receipt each time you use FastPass.`
    });
}

export async function sendNotificationsDisabledEmail(user: UserInfo) {
    const title = "FastPass Notifications Disabled";
    const content = `
        <h2>Approval Emails Are Off</h2>
        <p>Hi ${user.name},</p>
        <p>This is a confirmation that you have turned off email notifications for app approvals.</p>
        <p>You will no longer receive an email receipt each time you use FastPass. You can change this preference at any time in your privacy settings.</p>
         <p style="text-align:center; margin-top: 30px;">
            <a href="https://fastpass.kabirinvents.com/dashboard/privacy" class="button">Manage Settings</a>
        </p>
    `;

    await sendEmail({
        to: user,
        subject: title,
        html: emailWrapper(content, title),
        text: `Hi ${user.name},\n\nThis is a confirmation that you have disabled email notifications for app approvals. You will no longer receive an email receipt each time you use FastPass.`
    });
}
