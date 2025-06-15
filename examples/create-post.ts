/**
 * Ejemplo: Crear un nuevo post en Hive
 */

import { createPost } from '../src/operations.js';
import { HiveCredentials, PostMetadata } from '../src/types.js';

async function exampleCreatePost() {
  console.log('🚀 Ejemplo: Creando un nuevo post...\n');

  // Verificar que las credenciales estén disponibles
  if (!process.env.HIVE_USERNAME || !process.env.HIVE_POSTING_KEY) {
    console.log('⚠️  Para ejecutar este ejemplo necesitas configurar:');
    console.log('   HIVE_USERNAME=tu_usuario');
    console.log('   HIVE_POSTING_KEY=tu_clave_posting');
    return;
  }

  try {
    const credentials: HiveCredentials = {
      username: process.env.HIVE_USERNAME,
      postingKey: process.env.HIVE_POSTING_KEY
    };

    const postData: PostMetadata = {
      title: 'Mi primer post con HiveTS',
      body: `# Hola Hive!

Este es un post de ejemplo creado usando la librería HiveTS.

## Características
- Ligera y eficiente
- TypeScript nativo
- Validación completa
- Manejo de errores robusto

¡Gracias por leer!`,
      tags: ['hivets', 'desarrollo', 'typescript', 'ejemplo'],
      json_metadata: {
        app: 'hivets/1.0.0',
        format: 'markdown',
        description: 'Post de ejemplo usando HiveTS'
      }
    };

    console.log(`📝 Creando post: "${postData.title}"`);
    console.log(`👤 Autor: @${credentials.username}`);
    console.log(`🏷️  Tags: ${postData.tags.join(', ')}`);

    const result = await createPost(credentials, postData);

    if (result.success) {
      console.log('\n✅ Post creado exitosamente!');
      console.log(`📄 Transaction ID: ${result.transaction_id}`);
      console.log(`🔗 Ver en: https://hive.blog/@${credentials.username}`);
    } else {
      console.log(`\n❌ Error al crear post: ${result.error}`);
    }

  } catch (error) {
    console.error(`❌ Error inesperado: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
}

// Ejecutar ejemplo
exampleCreatePost();