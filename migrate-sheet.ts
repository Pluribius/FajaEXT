import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import { parse } from 'csv-parse/sync';

// Extract credentials from environment variables (.env / .env.local)
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Toggle: set to true to only allow rows where the STATUS column is "migrate"
const REQUIRE_STATUS_MIGRATE = true;

if (!supabaseUrl || !supabaseUrl.startsWith('http')) {
    throw new Error('❌ Missing valid Supabase URL. Please check your .env or .env.local file.');
}

if (!supabaseServiceKey) {
    throw new Error('❌ Missing Supabase Service Key. Please check your .env or .env.local file.');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false }
});

interface SheetRow {
    [key: string]: string;
}

async function runFreshMigration() {
    const filePath = 'Responses.csv';

    if (!fs.existsSync(filePath)) {
        console.error(`❌ CSV file not found at ${filePath}`);
        return;
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true
    }) as SheetRow[];

    console.log(`🚀 Starting fresh migration of ${records.length} records into Supabase... (REQUIRE_STATUS_MIGRATE: ${REQUIRE_STATUS_MIGRATE})`);

    let successCount = 0;
    let errorCount = 0;
    let skippedByStatusCount = 0;

    for (const [index, row] of records.entries()) {
        // 1. Find columns dynamically to avoid newline/spacing issues
        const idKey = Object.keys(row).find(k => k.includes('Cédula de Identidad venezolana'));
        const emailKey = Object.keys(row).find(k => k.toLowerCase().includes('email'));
        const nameKey = Object.keys(row).find(k => k.includes('Nombres y apellidos'));
        const phoneKey = Object.keys(row).find(k => k.includes('Número de teléfono de contacto'));
        const docUrlKey = Object.keys(row).find(k => k.includes('Cédula de Identidad actualizada'));

        // Find the STATUS column (handles variations like 'STATUS', 'Status', etc.)
        const statusKey = Object.keys(row).find(k => k.trim().toUpperCase() === 'STATUS');

        const rawIdNumber = idKey ? row[idKey] : '';
        const email = emailKey ? row[emailKey]?.trim() : '';
        const fullName = nameKey ? row[nameKey]?.trim() : '';
        const phone = phoneKey ? row[phoneKey]?.trim() : '';
        const idDocumentUrl = docUrlKey ? row[docUrlKey]?.trim() : '';
        const statusValue = statusKey ? row[statusKey]?.trim().toLowerCase() : '';

        // Check toggle condition if enabled (looking for "migrate")
        if (REQUIRE_STATUS_MIGRATE && statusValue !== 'migrate') {
            skippedByStatusCount++;
            continue;
        }

        // Clean Cédula string: strips trailing float decimals (.0) and non-numeric chars
        const cleanIdNumber = rawIdNumber?.replace(/\.0$/, '').replace(/[^0-9]/g, '');

        if (!email || !cleanIdNumber) {
            console.warn(`⚠️ Skipping row ${index + 1}: Missing email or cédula.`);
            errorCount++;
            continue;
        }

        // Split full name into first and last name parts
        const nameParts = fullName.split(/\s+/);
        const firstName = nameParts.slice(0, 2).join(' ') || 'Desconocido';
        const lastName = nameParts.slice(2).join(' ') || 'Desconocido';

        const tempPassword = 'TempPassword123!';

        console.log(`[${index + 1}/${records.length}] Migrating: ${firstName} ${lastName} (Cédula: ${cleanIdNumber}) [status: ${statusValue || 'N/A'}]`);

        // 2. Create User via Supabase Auth Admin API (fires handle_new_user trigger)
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
            console.error(`❌ Error creating auth user ${email}:`, authError?.message);
            errorCount++;
            continue;
        }

        const userId = authData.user.id;

        // 3. Explicitly insert/upsert the Government ID document URL into the documents table
        if (idDocumentUrl) {
            const { error: docError } = await supabase
                .from('documents')
                .upsert({
                    id: userId,
                    id_document_url: idDocumentUrl
                });

            if (docError) {
                console.error(`  ⚠️ Failed to save document URL for ${email}:`, docError.message);
            } else {
                console.log(`  └─ 📄 Document URL linked successfully`);
            }
        }

        successCount++;
    }

    console.log(`\n🎉 Fresh Migration Completed!`);
    console.log(`   - Successfully migrated: ${successCount} users`);
    console.log(`   - Skipped by status filter: ${skippedByStatusCount} rows`);
    console.log(`   - Errors / Missing data: ${errorCount} rows`);
}

runFreshMigration();