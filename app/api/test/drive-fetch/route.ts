import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function GET() {
    try {
        const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
        const privateKey = process.env.GOOGLE_PRIVATE_KEY;
        const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

        if (!clientEmail || !privateKey || !folderId) {
            return NextResponse.json(
                { success: false, error: 'Faltan variables de entorno en .env.local' },
                { status: 400 }
            );
        }

        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: clientEmail,
                private_key: privateKey.replace(/\\n/g, '\n'),
            },
            scopes: ['https://www.googleapis.com/auth/drive.readonly'],
        });

        const drive = google.drive({ version: 'v3', auth });

        let allFiles: any[] = [];
        let pageToken: string | undefined = undefined;

        // Loop through pages until all files are retrieved
        do {
            // Explicitly typed response to prevent TS7022 inference error
            const response: any = await drive.files.list({
                q: `'${folderId}' in parents and trashed = false`,
                fields: 'nextPageToken, files(id, name, mimeType, size, createdTime, webViewLink)',
                pageSize: 1000,
                pageToken: pageToken,
                orderBy: 'createdTime desc',
            });

            const files = response.data.files || [];
            allFiles = allFiles.concat(files);
            pageToken = response.data.nextPageToken || undefined;
        } while (pageToken);

        return NextResponse.json(
            {
                success: true,
                message: `¡Conexión exitosa! Se encontraron ${allFiles.length} archivo(s) en total en la carpeta.`,
                folderId,
                filesCount: allFiles.length,
                files: allFiles,
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('Error al listar archivos de Google Drive:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Error al consultar Google Drive' },
            { status: 500 }
        );
    }
}