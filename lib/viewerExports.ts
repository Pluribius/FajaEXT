/*This centralizes image caching/downscaling, guards against missing idPhotoUrl values
escapes CSV fields/formula prefixes safely, and lazy-loads exceljs only when an Excel export is requested.*/
import { AppUser, getUserUID, formatIdNumber } from '@/lib/types';

const imageCache = new Map<string, string>();

export function clearImageCache(): void {
    imageCache.clear();
}

export function resolveDocumentUrl(url?: string): string {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('/')) {
        return url;
    }
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    return `${origin}/${url}`;
}

export async function fetchAndCacheImageAsBase64(
    url: string,
    maxWidth = 300,
    maxHeight = 180,
    cacheKey = url
): Promise<string> {
    if (!url) return '';
    if (imageCache.has(cacheKey)) {
        return imageCache.get(cacheKey)!;
    }

    try {
        const response = await fetch(url, { mode: 'cors' });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const blob = await response.blob();

        const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let { width, height } = img;

                    if (width > maxWidth || height > maxHeight) {
                        const ratio = Math.min(maxWidth / width, maxHeight / height);
                        width = Math.max(1, Math.round(width * ratio));
                        height = Math.max(1, Math.round(height * ratio));
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    if (!ctx) {
                        resolve((e.target?.result as string) || '');
                        return;
                    }

                    ctx.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL('image/jpeg', 0.85));
                };
                img.onerror = reject;
                img.src = e.target?.result as string;
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });

        imageCache.set(cacheKey, base64);
        return base64;
    } catch {
        return url;
    }
}

function escapeCsvCell(value: unknown): string {
    const raw = String(value ?? '');
    const neutralized = /^[=+\-@]/.test(raw) ? `'${raw}` : raw;
    return `"${neutralized.replace(/"/g, '""')}"`;
}

function triggerBlobDownload(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function exportUsersToCSV(users: AppUser[]): void {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const headers = [
        'N°',
        'UID Control',
        'Nombre Completo',
        'Cedula',
        'Documento Identidad URL',
        'Correo',
        'Telefono',
        'Estatus',
        'Fecha de Registro',
        'Fecha Verificacion',
    ];

    const rows = users.map((u, idx) => {
        const rawUrl = u.idPhotoUrl || '';
        const docUrl = !rawUrl
            ? ''
            : rawUrl.startsWith('http') || rawUrl.startsWith('data:')
                ? rawUrl
                : `${origin}${rawUrl.startsWith('/') ? '' : '/'}${rawUrl}`;

        return [
            escapeCsvCell(idx + 1),
            escapeCsvCell(getUserUID(u)),
            escapeCsvCell(u.fullName),
            escapeCsvCell(formatIdNumber(u)),
            escapeCsvCell(docUrl),
            escapeCsvCell(u.email),
            escapeCsvCell(u.phone),
            escapeCsvCell(u.status.toUpperCase()),
            escapeCsvCell(u.createdAt),
            escapeCsvCell(u.verifiedAt || 'N/A'),
        ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.map(escapeCsvCell).join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const dateStamp = new Date().toISOString().split('T')[0];
    triggerBlobDownload(blob, `Nomina_Usuarios_Autorizados_${dateStamp}.csv`);
}

export async function exportUsersToExcel(users: AppUser[]): Promise<void> {
    const ExcelJS = (await import('exceljs')).default;
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'FAJA-EXT System';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('Usuarios Autorizados', {
        views: [{ showGridLines: true }],
    });

    worksheet.columns = [
        { header: 'N°', key: 'index', width: 6 },
        { header: 'UID Control', key: 'uid', width: 16 },
        { header: 'Nombre Completo', key: 'fullName', width: 32 },
        { header: 'Cédula', key: 'idNumber', width: 16 },
        { header: 'Cédula Digitalizada (Imagen)', key: 'image', width: 26 },
        { header: 'Correo Electrónico', key: 'email', width: 28 },
        { header: 'Teléfono', key: 'phone', width: 18 },
        { header: 'Estatus', key: 'status', width: 14 },
        { header: 'Fecha Registro', key: 'createdAt', width: 20 },
    ];

    const headerRow = worksheet.getRow(1);
    headerRow.height = 28;
    headerRow.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFF' } };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0E1B29' } };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

    for (let idx = 0; idx < users.length; idx++) {
        const u = users[idx];
        const row = worksheet.addRow({
            index: idx + 1,
            uid: getUserUID(u),
            fullName: u.fullName,
            idNumber: formatIdNumber(u),
            image: '',
            email: u.email,
            phone: u.phone || 'N/A',
            status: u.status.toUpperCase(),
            createdAt: u.verifiedAt || u.createdAt,
        });

        row.height = 75;
        row.alignment = { vertical: 'middle', horizontal: 'left' };
        row.font = { name: 'Arial', size: 10 };

        row.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' };
        row.getCell(2).alignment = { vertical: 'middle', horizontal: 'center' };
        row.getCell(4).alignment = { vertical: 'middle', horizontal: 'center' };
        row.getCell(8).alignment = { vertical: 'middle', horizontal: 'center' };

        if (u.idPhotoUrl) {
            try {
                const base64DataUri = await fetchAndCacheImageAsBase64(u.idPhotoUrl, 280, 160);
                if (base64DataUri.startsWith('data:image/')) {
                    const base64Clean = base64DataUri.replace(/^data:image\/\w+;base64,/, '');
                    const imageId = workbook.addImage({
                        base64: base64Clean,
                        extension: 'jpeg',
                    });

                    worksheet.addImage(imageId, {
                        tl: { col: 4, row: idx + 1 },
                        ext: { width: 140, height: 85 },
                    });
                } else {
                    row.getCell(5).value = '[Imagen No Disponible]';
                }
            } catch {
                row.getCell(5).value = '[Imagen No Disponible]';
            }
        }
    }

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const dateStamp = new Date().toISOString().split('T')[0];
    triggerBlobDownload(blob, `Reporte_Usuarios_Nativo_${dateStamp}.xlsx`);
}