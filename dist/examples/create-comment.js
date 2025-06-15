/**
 * Ejemplo: Crear un comentario en Hive (sin limitación de 5 minutos)
 */
import { createPost } from '../src/operations.js';
import { HiveClient } from '../src/hive-client.js';
async function exampleCreateComment() {
    console.log('💬 Ejemplo: Creando un comentario...\n');
    // Verificar si tenemos credenciales reales
    const username = process.env.HIVE_USERNAME || 'test-user';
    const postingKey = process.env.HIVE_POSTING_KEY || 'test-key';
    if (username === 'test-user' || postingKey === 'test-key') {
        console.log('⚠️  Usando credenciales de prueba (no se publicará realmente)');
        console.log('💡 Para probar con blockchain real, configura HIVE_USERNAME y HIVE_POSTING_KEY\n');
        return;
    }
    console.log('🔑 Credenciales reales detectadas. Probando con blockchain de Hive...');
    const credentials = {
        username,
        postingKey
    };
    // Comentario en un post existente popular (sin limitación de 5 minutos)
    const commentData = {
        title: '', // Los comentarios no tienen título
        body: `¡Comentario de prueba desde HiveTS! 

Este comentario fue creado usando la librería HiveTS para demostrar que el posting funciona correctamente.

Timestamp: ${new Date().toISOString()}`,
        tags: ['hivets'], // Heredará las tags del post padre
        parent_author: 'mahdiyari', // Autor del post padre
        parent_permlink: 'new-feature-added-for-hivedx-io-you-can-now-see-and-track-all-nodes-on-the-network' // Post existente
    };
    try {
        console.log('💬 Creando comentario en post de @mahdiyari...');
        console.log(`👤 Autor: @${credentials.username}`);
        console.log(`📝 Contenido: ${commentData.body.substring(0, 50)}...`);
        const client = new HiveClient();
        const result = await createPost(credentials, commentData, client);
        if (result.success) {
            console.log('\n✅ ¡Comentario creado exitosamente!');
            console.log(`🔗 Transaction ID: ${result.transaction_id}`);
            console.log(`🌐 Ver en: https://hiveblocks.com/tx/${result.transaction_id}`);
        }
        else {
            console.log('\n❌ Error al crear comentario:', result.error);
        }
    }
    catch (error) {
        console.log('\n❌ Error inesperado:', error instanceof Error ? error.message : 'Error desconocido');
    }
}
// Ejecutar si es el archivo principal
if (import.meta.url === `file://${process.argv[1]}`) {
    exampleCreateComment();
}
export { exampleCreateComment };
//# sourceMappingURL=create-comment.js.map