/**
 * Ejemplo: Editar post específico agregando "----done---"
 */

import { editPost } from '../src/operations.js';
import { HiveClient } from '../src/hive-client.js';
import { HiveCredentials, PostMetadata } from '../src/types.js';

async function editSpecificPost() {
  console.log('✏️ Editando post específico...\n');

  const username = process.env.HIVE_USERNAME || 'test-user';
  const postingKey = process.env.HIVE_POSTING_KEY || 'test-key';

  if (username === 'test-user' || postingKey === 'test-key') {
    console.log('⚠️  Credenciales de prueba detectadas');
    console.log('💡 Configure HIVE_USERNAME y HIVE_POSTING_KEY para editar posts reales\n');
    return;
  }

  console.log('🔑 Credenciales reales detectadas');

  const credentials: HiveCredentials = {
    username,
    postingKey
  };

  // Datos del post específico a editar
  const author = 'enrique89.test';
  const permlink = 'testing-custom-client-1749966896';

  console.log(`📝 Editando post: @${author}/${permlink}`);

  try {
    // Primero obtener el contenido actual del post
    const client = new HiveClient();
    const currentPost = await client.getContent(author, permlink);

    if (!currentPost || !currentPost.body) {
      console.log('❌ Post no encontrado o sin contenido');
      return;
    }

    console.log('✅ Post encontrado, obteniendo contenido actual...');
    console.log(`📄 Título actual: ${currentPost.title}`);
    console.log(`📝 Contenido actual: ${currentPost.body.substring(0, 100)}...`);

    // Agregar "----done---" al final del contenido existente
    let updatedBody = currentPost.body;
    
    // Verificar si ya tiene "----done---" para evitar duplicados
    if (!updatedBody.includes('----done---')) {
      updatedBody += '\n\n----done---';
      console.log('➕ Agregando "----done---" al final del post');
    } else {
      console.log('ℹ️  El post ya contiene "----done---"');
      return;
    }

    // Parsear JSON metadata existente
    let existingTags = ['general'];
    try {
      const jsonMeta = JSON.parse(currentPost.json_metadata || '{}');
      if (jsonMeta.tags && Array.isArray(jsonMeta.tags)) {
        existingTags = jsonMeta.tags;
      }
    } catch (e) {
      console.log('⚠️  No se pudo parsear metadata, usando tags por defecto');
    }

    // Datos actualizados para la edición
    const updatedPostData: PostMetadata = {
      title: currentPost.title,
      body: updatedBody,
      tags: existingTags,
      json_metadata: {
        app: 'hivets/1.0.0',
        format: 'markdown',
        edit_reason: 'Added completion marker'
      }
    };

    console.log('🚀 Enviando edición...');

    const result = await editPost(credentials, permlink, updatedPostData, client);

    if (result.success) {
      console.log('\n✅ ¡Post editado exitosamente!');
      console.log(`🔗 Transaction ID: ${result.transaction_id}`);
      console.log(`🌐 Ver post editado: https://peakd.com/@${author}/${permlink}`);
    } else {
      console.log('\n❌ Error al editar post:', result.error);
      
      // Analizar el tipo de error
      const error = result.error || '';
      if (error.includes('HIVE_MIN_COMMENT_EDIT_INTERVAL')) {
        console.log('ℹ️  Nota: Solo se puede editar un post por bloque (~3 segundos)');
      } else if (error.includes('HIVE_MIN_ROOT_COMMENT_INTERVAL')) {
        console.log('ℹ️  Nota: Límite de tiempo entre posts/ediciones');
      }
    }

  } catch (error) {
    console.log('\n❌ Error inesperado:', error instanceof Error ? error.message : 'Error desconocido');
  }

  console.log('\n🏁 Edición completada');
}

// Ejecutar si es el archivo principal
if (import.meta.url === `file://${process.argv[1]}`) {
  editSpecificPost();
}

export { editSpecificPost };