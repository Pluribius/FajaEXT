import fs from 'node:fs';
import path from 'node:path';
import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const CLIENT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY;
const ID_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID;
const SHEET_FILE_ID = '1PeOnoenE_yqwM7Ei0L5bE_fsjww27qz_8ij-ZyLW020';

if (!CLIENT_EMAIL || !PRIVATE_KEY || !ID_FOLDER_ID) {
    console.error('❌ Missing environment variables in .env.local');
    process.exit(1);
}

const auth = new google.auth.GoogleAuth({
    credentials: {
        client_email: CLIENT_EMAIL,
        private_key: PRIVATE_KEY.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/drive'],
});

const drive = google.drive({ version: 'v3', auth });

function parseCSV(csvContent: string): string[][] {
    const lines = csvContent.split(/\r?\n/);
    return lines
        .filter((line) => line.trim().length > 0)
        .map((line) => {
            const row: string[] = [];
            let insideQuote = false;
            let entry = '';

            for (let i = 0; i < line.length; i++) {
                const char = line[i];
                if (char === '"') {
                    insideQuote = !insideQuote;
                } else if (char === ',' && !insideQuote) {
                    row.push(entry.trim());
                    entry = '';
                } else {
                    entry += char;
                }
            }
            row.push(entry.trim());
            return row;
        });
}

function extractDriveId(url: string): string | null {
    if (!url) return null;
    const match1 = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (match1) return match1[1];
    const match2 = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (match2) return match2[1];
    if (/^[a-zA-Z0-9_-]{25,45}$/.test(url.trim())) {
        return url.trim();
    }
    return null;
}

function extractFileIdPrefix(filename: string): { idNumber: string; cleanName: string } | null {
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, '').trim();
    const match = nameWithoutExt.match(/^(\d+)\s+(.+)$/);
    if (!match) return null;
    return {
        idNumber: match[1],
        cleanName: match[2],
    };
}

async function runAudit() {
    console.log('🔄 Starting Enhanced Audit & Synchronization Workflow...');

    // 1. Download latest CSV
    console.log('📥 Downloading latest CSV from Google Sheets...');
    const exportRes = await drive.files.export(
        { fileId: SHEET_FILE_ID, mimeType: 'text/csv' },
        { responseType: 'text' }
    );
    const csvPath = path.resolve(process.cwd(), 'Responses.csv');
    fs.writeFileSync(csvPath, exportRes.data as string, 'utf-8');
    console.log('✅ Responses.csv downloaded successfully.');

    // 2. Fetch Drive files with pagination (SOLO dentro de la carpeta específica)
    console.log('📂 Fetching files list from Google Drive ID folder...');
    let driveFiles: any[] = [];
    let pageToken: string | undefined = undefined;

    do {
        const res: any = await drive.files.list({
            // AQUÍ ESTÁ LA CLAVE: Usamos 'in parents' junto con el ID de la carpeta de entorno
            q: `'${ID_FOLDER_ID}' in parents and trashed = false`,
            fields: 'nextPageToken, files(id, name, mimeType, size, createdTime, webViewLink)',
            pageSize: 1000,
            pageToken,
        });
        driveFiles = driveFiles.concat(res.data.files || []);
        pageToken = res.data.nextPageToken || undefined;
    } while (pageToken);

    const jsonCachePath = path.resolve(process.cwd(), 'drive.json');
    fs.writeFileSync(jsonCachePath, JSON.stringify(driveFiles, null, 2), 'utf-8');
    console.log(`✅ Cache drive.json created with ${driveFiles.length} item(s).`);

    // 3. Parse CSV & Map Data
    const csvRows = parseCSV(exportRes.data as string);

    // Como los formularios de Google a veces no tienen encabezados claros, 
    // buscaremos la columna de nombre analizando qué columna suele contener texto largo con espacios (nombres completos)
    // o haciendo coincidir los índices comunes de Google Forms.
    const csvRecordMapByFileId = new Map<string, { fullName: string; idNum: string; rowNum: number }>();
    const csvRecordMapByIdNum = new Map<string, { fullName: string; idNum: string; rowNum: number }>();

    csvRows.slice(1).forEach((row, index) => {
        const rowNum = index + 2;

        // Buscamos una URL de Drive en toda la fila para asociar el archivo
        let fileId: string | null = null;
        let rawIdNum = '';
        let fullName = '';

        row.forEach((cell) => {
            const extracted = extractDriveId(cell);
            if (extracted) {
                fileId = extracted;
            }
            // Detectar cédula (números entre 6 y 9 dígitos típicamente)
            if (/^\d{6,9}$/.test(cell.trim())) {
                rawIdNum = cell.trim();
            }
            // Detectar nombre (texto con varias palabras en mayúsculas/minúsculas sin símbolos extraños)
            if (/^[A-ZÁÉÍÓÚÑ\s]{5,}$/.test(cell.trim()) && !cell.includes('http') && !cell.includes('@')) {
                if (!fullName || cell.trim().length > fullName.length) {
                    fullName = cell.trim();
                }
            }
        });

        // Fallbacks específicos basados en la estructura típica de tus datos mostrados:
        // Columna 1 o 3 suelen ser nombres, Columna 1 o 9 suelen ser cédulas
        if (!fullName && row[3]) fullName = row[3];
        if (!fullName && row[4]) fullName = row[4];
        if (!rawIdNum && row[1]) rawIdNum = row[1].replace(/\D/g, '');

        const idNum = rawIdNum ? String(rawIdNum).replace(/\D/g, '') : '';
        const finalName = fullName || 'Desconocido';

        if (fileId) {
            csvRecordMapByFileId.set(fileId, { fullName: finalName, idNum, rowNum });
        }
        if (idNum) {
            csvRecordMapByIdNum.set(idNum, { fullName: finalName, idNum, rowNum });
        }
    });

    const renamedFiles: { oldName: string; newName: string }[] = [];
    const markedOrphans: string[] = [];
    const invalidUrlRows: { rowNumber: number; rawUrl: string }[] = [];
    const nonImageFiles: { name: string; mimeType: string }[] = [];
    let discardedFilesCount = 0;

    // 4. Evaluate each file in Drive
    for (const file of driveFiles) {
        const parsedPrefix = extractFileIdPrefix(file.name);

        if (!parsedPrefix) {
            discardedFilesCount++;
            continue;
        }

        const { idNumber } = parsedPrefix;
        const isImage = file.mimeType.startsWith('image/');

        if (!isImage) {
            nonImageFiles.push({ name: file.name, mimeType: file.mimeType });
        }

        const csvRecord = csvRecordMapByFileId.get(file.id) || csvRecordMapByIdNum.get(idNumber);

        if (!csvRecord) {
            if (!file.name.toLowerCase().includes('orphan')) {
                const ext = path.extname(file.name);
                const baseName = file.name.replace(/\.[^/.]+$/, '');
                const newName = `${baseName} [orphan]${ext}`;

                try {
                    await drive.files.update({
                        fileId: file.id,
                        requestBody: { name: newName },
                    });
                    markedOrphans.push(newName);
                } catch (err) {
                    console.error(`Failed to mark file as orphan ${file.name}:`, err);
                }
            }
        } else {
            // Seguridad: Solo renombramos si el nombre recuperado del CSV NO es "Desconocido"
            if (csvRecord.fullName && csvRecord.fullName !== 'Desconocido') {
                const expectedNamePrefix = `${csvRecord.idNum} ${csvRecord.fullName}`;
                const ext = path.extname(file.name);

                if (!file.name.startsWith(expectedNamePrefix)) {
                    const newName = `${expectedNamePrefix}${ext}`;
                    try {
                        await drive.files.update({
                            fileId: file.id,
                            requestBody: { name: newName },
                        });
                        renamedFiles.push({ oldName: file.name, newName });
                    } catch (err) {
                        console.error(`Failed to rename file ${file.name}:`, err);
                    }
                }
            }
        }
    }

    // Check CSV rows for missing Drive references
    csvRows.slice(1).forEach((row, index) => {
        const rowNum = index + 2;
        let rawUrl = '';
        row.forEach((cell) => {
            if (cell.includes('drive.google.com')) rawUrl = cell;
        });

        const fileId = extractDriveId(rawUrl);
        if (rawUrl && (!fileId || !driveFiles.some((f) => f.id === fileId))) {
            invalidUrlRows.push({ rowNumber: rowNum, rawUrl });
        }
    });

    // 5. Generate Audit.md Report
    const timestamp = new Date().toLocaleString('es-VE', { timeZone: 'America/Caracas' });

    const auditMd = `# Informe de Auditoría de Archivos e Identificaciones
**Fecha de Ejecución:** ${timestamp}
**Total Registros CSV:** ${csvRows.length - 1}
**Total Archivos en Drive:** ${driveFiles.length}
**Archivos Descartados (Sin ID inicial válido):** ${discardedFilesCount}

---

## 1. Filas de CSV con URL de Cédula Inválida o No Encontrada
${invalidUrlRows.length === 0
            ? '✅ **Ninguna.** Todas las URLs del CSV corresponden a archivos válidos.'
            : invalidUrlRows.map((item) => `- **Fila ${item.rowNumber}:** URL: \`${item.rawUrl}\``).join('\n')
        }

---

## 2. Archivos Renombrados Automáticamente (\`[id_number] [full_name]\`)
${renamedFiles.length === 0
            ? '✅ **Ninguno.** Todos los archivos con relación válida ya tenían el nombre correcto.'
            : renamedFiles.map((f) => `- Original: \`${f.oldName}\` ➡️ Renombrado: \`${f.newName}\``).join('\n')
        }

---

## 3. Archivos Marcados como Huérfanos (\`[orphan]\`)
${markedOrphans.length === 0
            ? '✅ **Ninguno.** No se encontraron archivos huérfanos nuevos en Drive.'
            : markedOrphans.map((name) => `- \`${name}\``).join('\n')
        }

---

## 4. Archivos en Drive que No Son Imágenes
${nonImageFiles.length === 0
            ? '✅ **Ninguno.** Todos los archivos evaluados son imágenes válidas.'
            : nonImageFiles.map((f) => `- \`${f.name}\` (${f.mimeType})`).join('\n')
        }
`;

    const reportPath = path.resolve(process.cwd(), 'Audit.md');
    fs.writeFileSync(reportPath, auditMd, 'utf-8');

    console.log('\n✨ Auditoría y sincronización completadas con éxito.');
    console.log(`📄 Reporte generado en: ${reportPath}`);
}

runAudit().catch((err) => {
    console.error('❌ Error fatal durante la auditoría:', err);
    process.exit(1);
});