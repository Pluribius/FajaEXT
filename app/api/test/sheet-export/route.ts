import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function GET() {
    try {
        const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
        const privateKey = process.env.GOOGLE_PRIVATE_KEY;

        // Google Sheet File ID extracted from your URL
        const fileId = '1PeOnoenE_yqwM7Ei0L5bE_fsjww27qz_8ij-ZyLW020';

        if (!clientEmail || !privateKey) {
            return NextResponse.json(
                { success: false, error: 'Faltan variables de entorno en .env.local' },
                { status: 400 }
            );
        }

        // Initialize Google Auth
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: clientEmail,
                private_key: privateKey.replace(/\\n/g, '\n'),
            },
            scopes: ['https://www.googleapis.com/auth/drive.readonly'],
        });

        const drive = google.drive({ version: 'v3', auth });

        // Export the Google Sheet as CSV
        const response = await drive.files.export(
            {
                fileId: fileId,
                mimeType: 'text/csv',
            },
            { responseType: 'text' }
        );

        const csvData = response.data as string;

        // Return the CSV content directly as a downloadable file
        return new NextResponse(csvData, {
            status: 200,
            headers: {
                'Content-Type': 'text/csv; charset=utf-8',
                'Content-Disposition': 'attachment; filename="PROYECTO_HAMACA_Responses.csv"',
            },
        });
    } catch (error: any) {
        console.error('Error al exportar Google Sheet a CSV:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Error al exportar la hoja de cálculo de Google',
            },
            { status: 500 }
        );
    }
}