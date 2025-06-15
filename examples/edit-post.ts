/**
 * Ejemplo: Editar un post existente en Hive
 */

import { editPost } from '../src/operations.js';
import { HiveCredentials, PostMetadata } from '../src/types.js';

async function exampleEditPost() {
  console.log('✏️ Ejemplo: Editando un post existente...\n');

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

    // El permlink del post que queremos editar (debe existir)
    const permlink = 'mi-primer-post-con-hivets';

    const updatedPostData: PostMetadata = {
      title: 'Mi primer post con HiveTS (Actualizado)',
      body: `# Hola Hive! (Versión actualizada)

Este es un post de ejemplo editado usando la librería HiveTS.

## Características actualizadas
- Ligera y eficiente
- TypeScript nativo
- Validación completa
- Manejo de errores robusto
- **¡Ahora con funcionalidad de edición!**

## Changelog
- Agregada funcionalidad de edición
- Mejorado el contenido del ejemplo
- Actualizada la documentación

¡Gracias por leer la versión actualizada!`,
      tags: ['hivets', 'desarrollo', 'typescript', 'ejemplo', 'actualizado'],
      json_metadata: {
        app: 'hivets/1.0.0',
        format: 'markdown',
        description: 'Post de ejemplo editado usando HiveTS',
        updated: new Date().toISOString()
      }
    };

    console.log(`📝 Editando post: "${updatedPostData.title}"`);
    console.log(`👤 Autor: @${credentials.username}`);
    console.log(`🔗 Permlink: ${permlink}`);
    console.log(`🏷️  Tags: ${updatedPostData.tags.join(', ')}`);

    const result = await editPost(credentials, permlink, updatedPostData);

    if (result.success) {
      console.log('\n✅ Post editado exitosamente!');
      console.log(`📄 Transaction ID: ${result.transaction_id}`);
      console.log(`🔗 Ver en: https://hive.blog/@${credentials.username}/${permlink}`);
    } else {
      console.log(`\n❌ Error al editar post: ${result.error}`);
    }

  } catch (error) {
    console.error(`❌ Error inesperado: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
}

// Ejecutar ejemplo
exampleEditPost();