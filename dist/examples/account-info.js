/**
 * Ejemplo: Obtener información completa de una cuenta de Hive
 */
import { getAccountInfo } from '../src/accounts.js';
async function exampleAccountInfo() {
    console.log('📊 Ejemplo: Obteniendo información de cuenta...\n');
    try {
        // Obtener información de una cuenta conocida
        const accountInfo = await getAccountInfo('mahdiyari');
        if (accountInfo) {
            console.log(`✅ Cuenta encontrada: @${accountInfo.name}`);
            console.log(`📅 Creada: ${accountInfo.created_at}`);
            console.log(`👥 Seguidores: ${accountInfo.followers}`);
            console.log(`👤 Siguiendo: ${accountInfo.followings}`);
            console.log(`📝 Total posts: ${accountInfo.total_posts}`);
            console.log(`⭐ Reputación: ${accountInfo.reputation}`);
            console.log(`💰 Balance HIVE: ${accountInfo.reward_hive_balance}`);
            console.log(`💎 Balance HBD: ${accountInfo.reward_hbd_balance}`);
            console.log(`⚡ HP delegado entrante: ${accountInfo.incoming_hp} HP`);
            console.log(`📤 HP delegado saliente: ${accountInfo.outgoing_hp} HP`);
            if (accountInfo.posting_metadata.profile) {
                const profile = accountInfo.posting_metadata.profile;
                console.log('\n📋 Información del perfil:');
                console.log(`🏷️ Nombre: ${profile.name || 'No establecido'}`);
                console.log(`📝 Descripción: ${profile.about || 'No establecida'}`);
                console.log(`🌐 Sitio web: ${profile.website || 'No establecido'}`);
                console.log(`📍 Ubicación: ${profile.location || 'No establecida'}`);
            }
            console.log('\n🔐 Información de autoridades:');
            console.log(`Owner keys: ${accountInfo.owner.key_auths.length}`);
            console.log(`Active keys: ${accountInfo.active.key_auths.length}`);
            console.log(`Posting keys: ${accountInfo.posting.key_auths.length}`);
            console.log(`Posting accounts authorized: ${accountInfo.posting.account_auths.length}`);
        }
        else {
            console.log('❌ Cuenta no encontrada');
        }
    }
    catch (error) {
        console.error(`❌ Error al obtener información de cuenta: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
}
// Ejecutar ejemplo
exampleAccountInfo();
//# sourceMappingURL=account-info.js.map