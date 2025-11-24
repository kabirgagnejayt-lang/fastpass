
'use server';

import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";

const mailerSend = new MailerSend({
    apiKey: process.env.NEXT_PUBLIC_MAILERSEND_API_KEY || "",
});

const sentFrom = new Sender("info@fastpass.kabirinvents.com", "FastPass by Kabir");

export interface SendEmailProps {
    to: {
        email: string;
        name: string;
    };
    subject: string;
    html: string;
    text: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailProps) {
    if (!process.env.NEXT_PUBLIC_MAILERSEND_API_KEY) {
        console.error('MAILERSEND_API_KEY is not set. Email not sent.');
        // In a real app, you might want to return an error or throw
        return { error: 'MailerSend API Key not configured.' };
    }

    const recipients = [
        new Recipient(to.email, to.name)
    ];

    const emailParams = new EmailParams()
        .setFrom(sentFrom)
        .setTo(recipients)
        .setReplyTo(sentFrom)
        .setSubject(subject)
        .setHtml(html)
        .setText(text);

    try {
        const response = await mailerSend.email.send(emailParams);
        console.log(`Email sent successfully to ${to.email}`, response);
        return { success: true };
    } catch (error) {
        console.error('Error sending email:', error);
        return { error: 'Failed to send email.' };
    }
}
