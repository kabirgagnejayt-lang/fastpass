
import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getDatabase, ref, get } from 'firebase/database';
import { firebaseConfig } from '@/firebase/config';

// Initialize Firebase Admin App
if (!getApps().length) {
  initializeApp(firebaseConfig);
}

// Set up CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};


export async function GET(
  request: NextRequest,
  { params }: { params: { clientId: string } }
) {
  const { clientId } = params;

  if (!clientId) {
    return NextResponse.json({ error: 'Client ID is required' }, { status: 400, headers: corsHeaders });
  }

  try {
    const db = getDatabase();
    const appRef = ref(db, `clients/${clientId}`);
    const snapshot = await get(appRef);

    if (!snapshot.exists()) {
      return NextResponse.json({ error: 'App not found' }, { status: 404, headers: corsHeaders });
    }

    const appData = snapshot.val();

    // Return only the public-facing data needed for the button
    const responseData = {
      name: appData.name,
      logo: appData.logo || null,
      verified: appData.verified || false,
    };

    return NextResponse.json(responseData, { headers: corsHeaders });
  } catch (error) {
    console.error('Firebase Realtime DB Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500, headers: corsHeaders });
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}
