import { createClient } from '@supabase/supabase-js';
import * as path from 'path';
import dotenv from 'dotenv';

// Cargar variables de entorno desde .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// ⚠️ Coloca aquí el correo electrónico de tu cuenta de administrador que deseas conservar
const ADMIN_EMAIL = 'tu-admin@email.com';

if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('❌ Faltan las credenciales de Supabase en .env.local');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false }
});

async function deleteAllUsersExceptAdmin() {
    try {
        console.log('🔍 Obteniendo la lista de usuarios de Supabase Auth...');

        let allUsers: any[] = [];
        let page = 1;
        let fetchMore = true;

        // Supabase pagina los resultados de auth.admin.listUsers, los recorremos todos
        while (fetchMore) {
            const { data, error } = await supabase.auth.admin.listUsers({
                page: page,
                perPage: 1000
            });

            if (error) {
                throw new Error(`Error al listar usuarios: ${error.message}`);
            }

            if (data && data.users.length > 0) {
                allUsers = allUsers.concat(data.users);
                if (data.users.length < 1000) {
                    fetchMore = false;
                } else {
                    page++;
                }
            } else {
                fetchMore = false;
            }
        }

        console.log(`📋 Total de usuarios encontrados: ${allUsers.length}`);

        let deletedCount = 0;
        let skippedCount = 0;

        for (const user of allUsers) {
            if (user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
                console.log(`🛡️ Omitiendo administrador (cuenta protegida): ${user.email} (${user.id})`);
                skippedCount++;
                continue;
            }

            console.log(`🗑️ Eliminando usuario: ${user.email} (${user.id})...`);

            // Al eliminar el usuario en auth.users, las tablas relacionadas configuradas con 
            // ON DELETE CASCADE (como users_info, contact_info, documents, etc.) se limpiarán automáticamente.
            const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);

            if (deleteError) {
                console.error(`  ❌ Error al eliminar al usuario ${user.email}:`, deleteError.message);
            } else {
                deletedCount++;
            }
        }

        console.log(`\n🎉 ¡Proceso finalizado!`);
        console.log(`   - Usuarios eliminados: ${deletedCount}`);
        console.log(`   - Administradores preservados: ${skippedCount}`);

    } catch (error: any) {
        console.error('❌ Error fatal durante la eliminación de usuarios:', error);
        process.exit(1);
    }
}

deleteAllUsersExceptAdmin();