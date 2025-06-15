/**
 * Ejemplo: Usar un cliente personalizado con configuración específica
 */
import { createPost } from '../src/operations.js';
import { HiveClient } from '../src/hive-client.js';
async function exampleCustomClient() {
    console.log('🔧 Ejemplo: Usando cliente personalizado...\n');
    // Verificar que las credenciales estén disponibles
    if (!process.env.HIVE_USERNAME || !process.env.HIVE_POSTING_KEY) {
        console.log('⚠️  Para ejecutar este ejemplo necesitas configurar:');
        console.log('   HIVE_USERNAME=tu_usuario');
        console.log('   HIVE_POSTING_KEY=tu_clave_posting');
        return;
    }
    try {
        // Crear cliente personalizado con configuración específica
        const customClient = new HiveClient({
            apiNode: 'https://rpc.mahdiyari.info', // Nodo alternativo
            timeout: 15000 // Timeout extendido
        });
        const credentials = {
            username: process.env.HIVE_USERNAME,
            postingKey: process.env.HIVE_POSTING_KEY
        };
        const postData = {
            title: 'Post con Cliente Personalizado',
            body: `# Usando Cliente Personalizado

Este post fue creado usando un cliente Hive personalizado con:

## Configuración
- **Nodo API**: rpc.mahdiyari.info
- **Timeout**: 15 segundos
- **Manejo de errores**: Mejorado

## Ventajas
- Mayor control sobre la conexión
- Posibilidad de usar nodos específicos
- Configuración de timeouts personalizados
- Mejor rendimiento según el caso de uso

¡Cliente personalizado funcionando correctamente!`,
            tags: ['hivets', 'cliente', 'personalizado', 'configuracion'],
            json_metadata: {
                app: 'hivets/1.0.0',
                format: 'markdown',
                client_config: {
                    custom_node: true,
                    timeout: 15000
                }
            }
        };
        console.log('🔧 Configuración del cliente:');
        console.log('   Nodo API: rpc.mahdiyari.info');
        console.log('   Timeout: 15000ms');
        console.log(`📝 Creando post: "${postData.title}"`);
        console.log(`👤 Autor: @${credentials.username}`);
        const result = await createPost(credentials, postData, customClient);
        if (result.success) {
            console.log('\n✅ Post creado con cliente personalizado!');
            console.log(`📄 Transaction ID: ${result.transaction_id}`);
            console.log(`🔗 Ver en: https://hive.blog/@${credentials.username}`);
        }
        else {
            console.log(`\n❌ Error con cliente personalizado: ${result.error}`);
        }
    }
    catch (error) {
        console.error(`❌ Error inesperado: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
}
// Ejecutar ejemplo
exampleCustomClient();
//# sourceMappingURL=custom-client.js.map