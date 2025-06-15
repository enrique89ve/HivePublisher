/**
 * Ejemplo: Dar upvote a un post específico
 */

import { upvote } from '../src/operations.js';
import { HiveClient } from '../src/hive-client.js';
import { HiveCredentials } from '../src/types.js';

async function exampleUpvote() {
  console.log('👍 Ejemplo: Dando upvote a un post...\n');

  const username = process.env.HIVE_USERNAME || 'test-user';
  const postingKey = process.env.HIVE_POSTING_KEY || 'test-key';

  if (username === 'test-user' || postingKey === 'test-key') {
    console.log('⚠️  Credenciales de prueba detectadas');
    console.log('💡 Configure HIVE_USERNAME y HIVE_POSTING_KEY para votar en posts reales\n');
    return;
  }

  console.log('🔑 Credenciales reales detectadas');

  const credentials: HiveCredentials = {
    username,
    postingKey
  };

  // Post específico solicitado
  const author = 'enrique89.test';
  const permlink = 'testing-custom-client-1749966896';
  const voteWeight = 75; // 75% upvote

  console.log(`📝 Votando post: @${author}/${permlink}`);
  console.log(`👤 Votante: @${credentials.username}`);
  console.log(`⚖️  Peso del voto: ${voteWeight}%`);

  try {
    // Verificar que el post existe antes de votar
    const client = new HiveClient();
    const post = await client.getContent(author, permlink);

    if (!post || !post.author) {
      console.log('❌ Post no encontrado');
      return;
    }

    console.log(`✅ Post encontrado: "${post.title}"`);
    console.log('🚀 Enviando voto...');

    const result = await upvote(credentials, author, permlink, voteWeight, client);

    if (result.success) {
      console.log('\n✅ ¡Voto enviado exitosamente!');
      console.log(`🔗 Transaction ID: ${result.transaction_id}`);
      console.log(`🌐 Ver transacción: https://hiveblocks.com/tx/${result.transaction_id}`);
      console.log(`📄 Ver post: https://peakd.com/@${author}/${permlink}`);
    } else {
      console.log('\n❌ Error al enviar voto:', result.error);
      
      // Analizar tipos de error comunes
      const error = result.error || '';
      if (error.includes('HIVE_MIN_VOTE_INTERVAL')) {
        console.log('ℹ️  Nota: Solo se puede votar una vez cada 3 segundos');
      } else if (error.includes('already voted')) {
        console.log('ℹ️  Nota: Ya has votado en este post');
      } else if (error.includes('insufficient voting power')) {
        console.log('ℹ️  Nota: Poder de voto insuficiente');
      }
    }

  } catch (error) {
    console.log('\n❌ Error inesperado:', error instanceof Error ? error.message : 'Error desconocido');
  }

  console.log('\n🏁 Proceso de voto completado');
}

// Ejecutar si es el archivo principal
if (import.meta.url === `file://${process.argv[1]}`) {
  exampleUpvote();
}

export { exampleUpvote };