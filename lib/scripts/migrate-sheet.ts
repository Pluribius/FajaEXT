import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';
import { google } from 'googleapis';
import dotenv from 'dotenv';

// Cargar explícitamente desde .env.local en la raíz del proyecto
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Extract credentials from environment variables (.env / .env.local)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const privateKey = process.env.GOOGLE_PRIVATE_KEY;

// ID de la hoja de cálculo de Google Sheets
const SHEET_FILE_ID = '1PeOnoenE_yqwM7Ei0L5bE_fsjww27qz_8ij-ZyLW020';

// Toggle: set to true to only allow rows where a column contains "migrate"
const REQUIRE_STATUS_MIGRATE = false;

if (!supabaseUrl || !supabaseUrl.startsWith('http')) {
    throw new Error('❌ Missing valid Supabase URL. Please check your .env or .env.local file.');
}

if (!supabaseServiceKey) {
    throw new Error('❌ Missing Supabase Service Key. Please check your .env or .env.local file.');
}

if (!clientEmail || !privateKey) {
    throw new Error('❌ Missing Google Service Account credentials in .env.local');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false }
});

// Inicializar Google Auth para descargar el CSV fresco
const auth = new google.auth.GoogleAuth({
    credentials: {
        client_email: clientEmail,
        private_key: privateKey.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
});

const drive = google.drive({ version: 'v3', auth });

interface SheetRow {
    [key: string]: string;
}

async function runFreshMigration() {
    try {
        console.log('📥 Descargando la versión más reciente del Google Sheet como Responses.csv...');
        const exportRes = await drive.files.export(
            { fileId: SHEET_FILE_ID, mimeType: 'text/csv' },
            { responseType: 'text' }
        );
        const filePath = path.resolve(process.cwd(), 'Responses.csv');
        fs.writeFileSync(filePath, exportRes.data as string, 'utf-8');
        console.log('✅ Responses.csv descargado y actualizado con éxito.');

        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const records = parse(fileContent, {
            columns: true,
            skip_empty_lines: true,
            trim: true
        }) as SheetRow[];

        console.log(`🚀 Iniciando migración de ${records.length} registros hacia Supabase... (REQUIRE_STATUS_MIGRATE: ${REQUIRE_STATUS_MIGRATE})`);

        let successCount = 0;
        let errorCount = 0;
        let skippedByStatusCount = 0;

        for (const [index, row] of records.entries()) {
            // 1. Encontrar columnas dinámicamente o por posición típica
            const idKey = Object.keys(row).find(k => k === 'ID_NUMBER' || k.includes('Cédula') || k.includes('cedula'));
            const emailKey = Object.keys(row).find(k => k.toLowerCase().includes('email') || k.toLowerCase().includes('correo'));
            const nameKey = Object.keys(row).find(k => k === 'NAME' || k.includes('Nombre') || k.includes('Nombres'));
            const phoneKey = Object.keys(row).find(k => k === 'PHONE' || k.includes('teléfono') || k.includes('telefono'));
            const companyKey = Object.keys(row).find(k => k === 'Empresa' || k.toLowerCase().includes('empresa'));
            const docUrlKey = Object.keys(row).find(k => k === 'ID_PHOTO' || k.includes('PHOTO') || k.includes('drive'));

            // 2. Verificar si CUALQUIER columna de la fila contiene la palabra "migrate"
            let hasMigrateFlag = false;
            if (REQUIRE_STATUS_MIGRATE) {
                for (const key of Object.keys(row)) {
                    const val = row[key];
                    if (val && typeof val === 'string' && val.trim().toLowerCase() === 'migrate') {
                        hasMigrateFlag = true;
                        break;
                    }
                }
            } else {
                hasMigrateFlag = true;
            }

            if (!hasMigrateFlag) {
                skippedByStatusCount++;
                continue;
            }

            // Extraer valores con respaldo en los índices
            const rawIdNumber = idKey ? row[idKey] : (row[Object.keys(row)[1]] || '');
            const email = emailKey ? row[emailKey]?.trim() : (row[Object.keys(row)[2]] || '').trim();
            const fullName = nameKey ? row[nameKey]?.trim() : (row[Object.keys(row)[3]] || '').trim();
            const phone = phoneKey ? row[phoneKey]?.trim() : '';
            const company = companyKey ? row[companyKey]?.trim() : '';

            // Buscar documentos en la fila (Foto de ID y comprobantes laborales como RIF, Seguro Social, BANAVIH)
            let idDocumentUrl = '';
            let workProofUrl = '';

            for (const key of Object.keys(row)) {
                const val = row[key];
                if (val && typeof val === 'string' && val.includes('drive.google.com')) {
                    const trimmedVal = val.trim();
                    // Identificar si es la foto de cédula principal o comprobante de trabajo
                    if (key.toLowerCase().includes('id_photo') || key.toLowerCase().includes('photo')) {
                        idDocumentUrl = trimmedVal;
                    } else if (!idDocumentUrl) {
                        idDocumentUrl = trimmedVal; // Asignar como ID por defecto si aún está vacío
                    } else if (!workProofUrl) {
                        workProofUrl = trimmedVal; // Tomar el primer comprobante adicional (RIF/Seguro/BANAVIH) como work_proof
                    }
                }
            }

            // Limpiar Cédula: remueve decimales si los hubiera y caracteres no numéricos
            const cleanIdNumber = rawIdNumber ? String(rawIdNumber).replace(/\.0$/, '').replace(/[^0-9]/g, '') : '';

            if (!email || !cleanIdNumber) {
                console.warn(`⚠️ Omitiendo fila ${index + 1}: Falta email o cédula.`);
                errorCount++;
                continue;
            }

            // Dividir nombre completo en nombre y apellido
            const nameParts = fullName.split(/\s+/);
            const firstName = nameParts.slice(0, 2).join(' ') || 'Desconocido';
            const lastName = nameParts.slice(2).join(' ') || 'Desconocido';

            const tempPassword = 'TempPassword123!';

            console.log(`[${index + 1}/${records.length}] Migrando: ${firstName} ${lastName} (Cédula: ${cleanIdNumber})`);

            // 3. Crear usuario en Supabase Auth Admin API
            // Nota: users_info se llena automáticamente si tienes un trigger en Supabase basado en auth.users, 
            // pero hacemos upserts explícitos a cada tabla para garantizar que se guarden todos los datos.
            const { data: authData, error: authError } = await supabase.auth.admin.createUser({
                email: email,
                password: tempPassword,
                email_confirm: true,
                user_metadata: {
                    first_name: firstName,
                    last_name: lastName,
                    id_number: cleanIdNumber,
                    phone: phone,
                    role: 'user'
                }
            });

            if (authError || !authData.user) {
                console.error(`❌ Error creando usuario ${email}:`, authError?.message);
                errorCount++;
                continue;
            }

            const userId = authData.user.id;

            // 4. Poblar tabla `users_info` (por si el trigger de auth no está configurado o para actualizar campos)
            const { error: userInfoError } = await supabase
                .from('users_info')
                .upsert({
                    id: userId,
                    first_name: firstName,
                    last_name: lastName,
                    id_number: cleanIdNumber,
                    role: 'user',
                    ID_Type: true
                });

            if (userInfoError) {
                console.error(`  ⚠️ Error en users_info para ${email}:`, userInfoError.message);
            }

            // 5. Poblar tabla `contact_info`
            const { error: contactError } = await supabase
                .from('contact_info')
                .upsert({
                    id: userId,
                    email: email,
                    phone: phone || null
                });

            if (contactError) {
                console.error(`  ⚠️ Error en contact_info para ${email}:`, contactError.message);
            }

            // 6. Poblar tabla `documents`
            if (idDocumentUrl || workProofUrl) {
                const { error: docError } = await supabase
                    .from('documents')
                    .upsert({
                        id: userId,
                        id_document_url: idDocumentUrl || '',
                        work_proof_url: workProofUrl || null
                    });

                if (docError) {
                    console.error(`  ⚠️ Error en documents para ${email}:`, docError.message);
                }
            }

            // 7. Poblar tabla `verification_status` (incluyendo la empresa)
            const { error: verificationError } = await supabase
                .from('verification_status')
                .upsert({
                    id: userId,
                    status: 'pending',
                    company: company || null
                });

            if (verificationError) {
                console.error(`  ⚠️ Error en verification_status para ${email}:`, verificationError.message);
            }

            // 8. Poblar tabla `payment_status`
            const { error: paymentError } = await supabase
                .from('payment_status')
                .upsert({
                    id: userId,
                    status: 'pending'
                });

            if (paymentError) {
                console.error(`  ⚠️ Error en payment_status para ${email}:`, paymentError.message);
            }

            console.log(`  └─ ✅ Usuario y relaciones guardadas con éxito.`);
            successCount++;
        }

        console.log(`\n🎉 ¡Migración Completada con Éxito!`);
        console.log(`   - Migrados exitosamente: ${successCount} usuarios`);
        console.log(`   - Omitidos por filtro 'migrate': ${skippedByStatusCount} filas`);
        console.log(`   - Errores / Datos faltantes: ${errorCount} filas`);
    } catch (error: any) {
        console.error('❌ Error fatal durante la migración:', error);
        process.exit(1);
    }
}

runFreshMigration();