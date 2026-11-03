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
    scopes: [
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/spreadsheets'
    ],
});

const drive = google.drive({ version: 'v3', auth });
const sheets = google.sheets({ version: 'v4', auth });

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
    const cleanFilename = filename.replace(/^\[DELETIONPENDING\]\s*/i, '');
    const nameWithoutExt = cleanFilename.replace(/\.[^/.]+$/, '').trim();
    const match = nameWithoutExt.match(/^(\d+)\s+(.+)$/);
    if (!match) return null;
    return {
        idNumber: match[1],
        cleanName: match[2],
    };
}

function getColumnLetter(colIndex: number): string {
    let temp, letter = '';
    colIndex++;
    while (colIndex > 0) {
        temp = (colIndex - 1) % 26;
        letter = String.fromCharCode(temp + 65) + letter;
        colIndex = (colIndex - temp - 1) / 26;
    }
    return letter;
}

async function runAudit() {
    console.log('🔄 Starting Enhanced Audit & Synchronization Workflow...');

    // 1. Download latest CSV
    console.log('📥 Downloading latest CSV from Google Sheets...');
    const exportRes = await drive.files.export(
        { fileId: SHEET_FILE_ID, mimeType: 'text/csv' },
        { responseType: 'text' }
    );
    const csvContent = exportRes.data as string;
    const csvPath = path.resolve(process.cwd(), 'Responses.csv');
    fs.writeFileSync(csvPath, csvContent, 'utf-8');
    console.log('✅ Responses.csv downloaded successfully.');

    let sheetName = 'Sheet1';
    let canUseSheetsApi = true;
    try {
        const sheetMeta = await sheets.spreadsheets.get({ spreadsheetId: SHEET_FILE_ID });
        sheetName = sheetMeta.data.sheets?.[0]?.properties?.title || 'Sheet1';
    } catch (e) {
        console.warn('⚠️ Google Sheets API is disabled or inaccessible.');
        canUseSheetsApi = false;
    }

    // 2. Fetch Drive files strictly from the ID folder
    console.log('📂 Fetching files list from Google Drive ID folder...');
    let driveFiles: any[] = [];
    let pageToken: string | undefined = undefined;

    do {
        const res: any = await drive.files.list({
            q: `'${ID_FOLDER_ID}' in parents and trashed = false`,
            fields: 'nextPageToken, files(id, name, mimeType, size, createdTime, webViewLink)',
            pageSize: 1000,
            pageToken,
        });
        driveFiles = driveFiles.concat(res.data.files || []);
        pageToken = res.data.nextPageToken || undefined;
    } while (pageToken);

    // 3. Handle Duplicates: Keep newest, try deleting/trashing older duplicates
    const filesByIdNumber = new Map<string, any[]>();
    for (const file of driveFiles) {
        const prefix = extractFileIdPrefix(file.name);
        if (prefix) {
            const list = filesByIdNumber.get(prefix.idNumber) || [];
            list.push(file);
            filesByIdNumber.set(prefix.idNumber, list);
        }
    }

    const deletedDuplicates: { fileName: string; idNumber: string; createdTime: string }[] = [];
    const permissionDeniedDuplicates: { fileName: string; idNumber: string }[] = [];

    for (const [idNumber, list] of filesByIdNumber.entries()) {
        if (list.length > 1) {
            list.sort((a, b) => new Date(b.createdTime).getTime() - new Date(a.createdTime).getTime());
            const olderFiles = list.slice(1);

            for (const oldFile of olderFiles) {
                try {
                    try {
                        await drive.files.delete({ fileId: oldFile.id });
                    } catch (delErr) {
                        await drive.files.update({
                            fileId: oldFile.id,
                            requestBody: { trashed: true }
                        });
                    }

                    deletedDuplicates.push({
                        fileName: oldFile.name,
                        idNumber,
                        createdTime: oldFile.createdTime
                    });
                    driveFiles = driveFiles.filter(f => f.id !== oldFile.id);
                } catch (err: any) {
                    console.warn(`⚠️ Could not delete/trash duplicate file ${oldFile.name}: ${err.message}`);

                    // Append [DELETIONPENDING] to filename if deletion/trash failed due to permissions
                    try {
                        if (!oldFile.name.startsWith('[DELETIONPENDING]')) {
                            const newName = `[DELETIONPENDING] ${oldFile.name}`;
                            await drive.files.update({
                                fileId: oldFile.id,
                                requestBody: { name: newName }
                            });
                            oldFile.name = newName;
                        }
                    } catch (renameErr) {
                        console.error(`Failed to prepend [DELETIONPENDING] to ${oldFile.name}:`, renameErr);
                    }

                    permissionDeniedDuplicates.push({ fileName: oldFile.name, idNumber });
                }
            }
        }
    }

    const jsonCachePath = path.resolve(process.cwd(), 'drive.json');
    fs.writeFileSync(jsonCachePath, JSON.stringify(driveFiles, null, 2), 'utf-8');
    console.log(`✅ Cache drive.json created with ${driveFiles.length} item(s) after deduplication.`);

    // 4. Parse CSV & Map Data
    const csvRows = parseCSV(csvContent);
    const headers = csvRows[0] || [];
    let cedulaUrlColIndex = -1;

    headers.forEach((h, idx) => {
        if (h.toLowerCase().includes('cédula de identidad actualizada') || h.toLowerCase().includes('cédula debe ser')) {
            cedulaUrlColIndex = idx;
        }
    });
    if (cedulaUrlColIndex === -1) {
        cedulaUrlColIndex = 10;
    }

    const csvRecordMapByFileId = new Map<string, { fullName: string; idNum: string; rowNum: number }>();
    const csvRecordMapByIdNum = new Map<string, { fullName: string; idNum: string; rowNum: number }>();
    const recoveredLinks: { rowNumber: number; idNumber: string; fullName: string; url: string; reason: string }[] = [];

    for (let i = 1; i < csvRows.length; i++) {
        const row = csvRows[i];
        const rowNum = i + 1;

        let fileId: string | null = null;
        let rawIdNum = '';
        let fullName = '';

        const currentUrl = cedulaUrlColIndex !== -1 && row[cedulaUrlColIndex] ? row[cedulaUrlColIndex] : '';
        fileId = extractDriveId(currentUrl);
        const fileExistsInDrive = fileId ? driveFiles.some((f) => f.id === fileId) : false;

        row.forEach((cell) => {
            if (/^\d{6,9}$/.test(cell.trim())) {
                rawIdNum = cell.trim();
            }
            if (/^[A-ZÁÉÍÓÚÑ\s]{5,}$/.test(cell.trim()) && !cell.includes('http') && !cell.includes('@')) {
                if (!fullName || cell.trim().length > fullName.length) {
                    fullName = cell.trim();
                }
            }
        });

        if (!fullName && row[3]) fullName = row[3];
        if (!fullName && row[4]) fullName = row[4];
        if (!rawIdNum && row[1]) rawIdNum = row[1].replace(/\D/g, '');

        const idNum = rawIdNum ? String(rawIdNum).replace(/\D/g, '') : '';
        const finalName = fullName || 'Desconocido';

        if (idNum && (!fileId || !fileExistsInDrive)) {
            const matchingFile = driveFiles.find(f => {
                const prefix = extractFileIdPrefix(f.name);
                return prefix && prefix.idNumber === idNum;
            });

            if (matchingFile) {
                const fileUrl = matchingFile.webViewLink || `https://drive.google.com/file/d/${matchingFile.id}/view?usp=sharing`;
                const reason = !fileId ? 'Enlace faltante' : 'Enlace roto reemplazado';

                if (canUseSheetsApi) {
                    const colLetter = getColumnLetter(cedulaUrlColIndex);
                    const range = `${sheetName}!${colLetter}${rowNum}`;

                    try {
                        await sheets.spreadsheets.values.update({
                            spreadsheetId: SHEET_FILE_ID,
                            range,
                            valueInputOption: 'USER_ENTERED',
                            requestBody: { values: [[fileUrl]] }
                        });
                    } catch (err) {
                        console.error(`Failed to update spreadsheet for row ${rowNum}:`, err);
                    }
                }

                fileId = matchingFile.id;
                row[cedulaUrlColIndex] = fileUrl;
                recoveredLinks.push({ rowNumber: rowNum, idNumber: idNum, fullName: finalName, url: fileUrl, reason });
            }
        }

        if (fileId) {
            csvRecordMapByFileId.set(fileId, { fullName: finalName, idNum, rowNum });
        }
        if (idNum) {
            csvRecordMapByIdNum.set(idNum, { fullName: finalName, idNum, rowNum });
        }
    }

    const renamedFiles: { oldName: string; newName: string }[] = [];
    const markedOrphans: string[] = [];
    const invalidUrlRows: { rowNumber: number; rawUrl: string }[] = [];
    const nonImageFiles: { name: string; mimeType: string }[] = [];
    let discardedFilesCount = 0;

    // 5. Evaluate remaining files in Drive
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
            if (!file.name.toLowerCase().includes('orphan') && !file.name.includes('[DELETIONPENDING]')) {
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
            if (csvRecord.fullName && csvRecord.fullName !== 'Desconocido') {
                const expectedNamePrefix = `${csvRecord.idNum} ${csvRecord.fullName}`;
                const ext = path.extname(file.name);
                const hasDeletionPending = file.name.startsWith('[DELETIONPENDING]');
                const prefixCheck = hasDeletionPending ? `[DELETIONPENDING] ${expectedNamePrefix}` : expectedNamePrefix;

                if (!file.name.startsWith(prefixCheck)) {
                    const newName = hasDeletionPending ? `[DELETIONPENDING] ${expectedNamePrefix}${ext}` : `${expectedNamePrefix}${ext}`;
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

    csvRows.slice(1).forEach((row, index) => {
        const rowNum = index + 2;
        let rawUrl = '';
        if (cedulaUrlColIndex !== -1 && row[cedulaUrlColIndex]) {
            rawUrl = row[cedulaUrlColIndex];
        }

        const fileId = extractDriveId(rawUrl);
        const fileExistsInDrive = fileId ? driveFiles.some((f) => f.id === fileId) : false;

        if (rawUrl && (!fileId || !fileExistsInDrive)) {
            invalidUrlRows.push({ rowNumber: rowNum, rawUrl });
        }
    });

    // 6. Generate Audit.md Report
    const timestamp = new Date().toLocaleString('es-VE', { timeZone: 'America/Caracas' });

    const auditMd = `# Informe de Auditoría de Archivos e Identificaciones
**Fecha de Ejecución:** ${timestamp}
**Total Registros CSV:** ${csvRows.length - 1}
**Total Archivos en Drive (Carpeta ID):** ${driveFiles.length}
**Archivos Descartados (Sin ID inicial válido):** ${discardedFilesCount}

---

## 1. Enlaces Recuperados / Actualizados Automáticamente (Faltaban o Estaban Rotos)
${recoveredLinks.length === 0
            ? '✅ **Ninguno.** No se requirió rellenar o actualizar enlaces desde Drive.'
            : recoveredLinks.map((item) => `- **Fila ${item.rowNumber} (Cédula: ${item.idNumber} - ${item.fullName}):** [${item.reason}] URL actualizada: \`${item.url}\``).join('\n')
        }

---

## 2. Documentos Duplicados Eliminados / Procesados
${deletedDuplicates.length === 0
            ? '✅ **Ninguno.** No se eliminaron duplicados.'
            : deletedDuplicates.map((d) => `- Archivo eliminado: \`${d.fileName}\` (Cédula: \`${d.idNumber}\`)`).join('\n')
        }
${permissionDeniedDuplicates.length > 0
            ? '\n> ⚠️ **Aviso de Permisos:** Los siguientes duplicados no pudieron ser eliminados debido a permisos insuficientes. Se les ha añadido el prefijo **`[DELETIONPENDING]`** en su nombre:\n' +
            permissionDeniedDuplicates.map((p) => `- \`${p.fileName}\` (Cédula: \`${p.idNumber}\`)`).join('\n')
            : ''
        }

---

## 3. Filas de CSV con URL de Cédula Inválida o No Encontrada (Sin archivo coincidente en Drive)
${invalidUrlRows.length === 0
            ? '✅ **Ninguna.** Todas las URLs de cédula del CSV corresponden a archivos válidos.'
            : invalidUrlRows.map((item) => `- **Fila ${item.rowNumber}:** URL: \`${item.rawUrl}\``).join('\n')
        }

---

## 4. Archivos Renombrados Automáticamente (\`[id_number] [full_name]\`)
${renamedFiles.length === 0
            ? '✅ **Ninguno.** Todos los archivos con relación válida ya tenían el nombre correcto.'
            : renamedFiles.map((f) => `- Original: \`${f.oldName}\` ➡️ Renombrado: \`${f.newName}\``).join('\n')
        }

---

## 5. Archivos Marcados como Huérfanos (\`[orphan]\`)
${markedOrphans.length === 0
            ? '✅ **Ninguno.** No se encontraron archivos huérfanos nuevos en Drive.'
            : markedOrphans.map((name) => `- \`${name}\``).join('\n')
        }

---

## 6. Archivos en Drive que No Son Imágenes
${nonImageFiles.length === 0
            ? '✅ **Ninguno.** Todos los archivos evaluados son imágenes válidas.'
            : nonImageFiles.map((f) => `- \`${f.name}\` (${f.mimeType})`).join('\n')
        }
`;

    const reportPath = path.resolve(process.cwd(), 'Audit.md');
    fs.writeFileSync(reportPath, auditMd, 'utf-8');

    console.log('\n✨ Auditoría, recuperación de enlaces y deduplicación completadas con éxito.');
    console.log(`📄 Reporte generado en: ${reportPath}`);
}

runAudit().catch((err) => {
    console.error('❌ Error fatal durante la auditoría:', err);
    process.exit(1);
});