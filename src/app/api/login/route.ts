import { NextRequest, NextResponse } from 'next/server';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

export async function POST(req: NextRequest) {
    try {
        const { password } = await req.json();

        if (password === ADMIN_PASSWORD) {
            // Set a secure HTTP-only cookie to keep the admin logged in
            const response = NextResponse.json({ success: true });
            response.cookies.set({
                name: 'admin_session',
                value: 'true',
                httpOnly: true,
                path: '/',
                maxAge: 60 * 60 * 24 * 7, // 1 week
            });
            return response;
        }

        return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
    } catch (error) {
        return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
    }
}
