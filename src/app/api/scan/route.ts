import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: NextRequest) {
    try {
        // SECURITY: Ensure only logged-in admins can use the AI API
        const authCookie = req.cookies.get('admin_session');
        if (!authCookie || authCookie.value !== 'true') {
            return NextResponse.json({ error: 'Unauthorized. Admin password required.' }, { status: 403 });
        }

        const formData = await req.formData();
        const file = formData.get('file') as File;
        const apiKey = process.env.GEMINI_API_KEY;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const ai = new GoogleGenAI({ apiKey });
        const buffer = await file.arrayBuffer();
        const base64Data = Buffer.from(buffer).toString('base64');
        const mimeType = file.type;

        const prompt = `You are a highly accurate data extraction system. Your job is to extract the weekly class timetable exactly from the uploaded image and output strictly valid JSON.

The output must exactly match this TypeScript structure:

type SectionSchedule = {
  [day: string]: {
    [slot: number]: {
      subject: string;
      room: string;
      slots: number[]; // e.g. [1] or [3, 4] if it spans two slots
    }
  }
};

Rules:
1. Only extract the schedule for the FIRST timetable section seen in the image.
2. Days must be strictly: "Monday", "Tuesday", "Wednesday", "Thursday", "Friday".
3. Slots are numbers from 1 to 10 based on the columns.
4. "subject" is the main text in the middle of the cell (e.g., "DBMS", "OS", "CN LAB").
5. "room" is the room number, usually at the bottom left or right (e.g., "AF21", "AS24"). If it says "Cafeteria" or breaks, ignore it.
6. "slots" is an array of the column numbers the class covers. E.g., if "CN LAB" covers slot 3 and 4, the entry goes under "3" with slots: [3, 4], and optionally "4" with slots: [3, 4].
7. Do not include markdown tags (\`\`\`json) in the response, ONLY the raw JSON string.
`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
                {
                    role: 'user',
                    parts: [
                        { text: prompt },
                        {
                            inlineData: {
                                data: base64Data,
                                mimeType: mimeType
                            }
                        }
                    ]
                }
            ]
        });

        let jsonString = response.text || "{}";

        // Clean up markdown blocks if any
        if (jsonString.startsWith("\`\`\`json")) {
            jsonString = jsonString.replace(/\`\`\`json/g, "").replace(/\`\`\`/g, "").trim();
        } else if (jsonString.startsWith("\`\`\`")) {
            jsonString = jsonString.replace(/\`\`\`/g, "").trim();
        }

        try {
            const parsed = JSON.parse(jsonString);
            return NextResponse.json({ data: parsed });
        } catch (parseError) {
            console.error("AI returned malformed JSON:", jsonString);
            return NextResponse.json({ error: 'AI did not return valid JSON' }, { status: 500 });
        }

    } catch (error: any) {
        console.error("Scan Error:", error);
        return NextResponse.json({ error: error.message || "Failed to process image" }, { status: 500 });
    }
}
