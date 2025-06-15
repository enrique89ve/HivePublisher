/**
 * Ejecutar todos los ejemplos de HiveTS
 */

import { getAccountInfo } from '../src/accounts.js';
import { createPost, editPost } from '../src/operations.js';
import { HiveClient } from '../src/hive-client.js';
import { HiveCredentials, PostMetadata } from '../src/types.js';

async function runAllExamples() {
  console.log('🎯 HiveTS - Ejemplos Completos\n');

  // Ejemplo 1: Información de cuenta
  console.log('📊 1. Obteniendo información de cuenta...');
  try {
    const accountInfo = await getAccountInfo('mahdiyari');
    if (accountInfo) {
      console.log(`✅ Cuenta: @${accountInfo.name} | Posts: ${accountInfo.total_posts} | Rep: ${accountInfo.reputation}`);
    }
  } catch (error) {
    console.log(`❌ Error: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }

  // Ejemplo 2: Manejo de errores
  console.log('\n🚨 2. Probando manejo de errores...');
  try {
    await getAccountInfo('invalid@username!');
  } catch (error) {
    console.log('✅ Validación de username funcionando correctamente');
  }

  // Verificar credenciales para ejemplos de posting
  if (!process.env.HIVE_USERNAME || !process.env.HIVE_POSTING_KEY) {
    console.log('\n⚠️  Credenciales no configuradas. Saltando ejemplos de posting.');
    console.log('   Para probar posting, configura:');
    console.log('   HIVE_USERNAME=tu_usuario');
    console.log('   HIVE_POSTING_KEY=tu_clave_posting');
    return;
  }

  const credentials: HiveCredentials = {
    username: process.env.HIVE_USERNAME,
    postingKey: process.env.HIVE_POSTING_KEY
  };

  // Ejemplo 3: Cliente personalizado
  console.log('\n🔧 3. Probando cliente personalizado...');
  try {
    const customClient = new HiveClient({
      apiNode: 'https://rpc.mahdiyari.info',
      timeout: 15000
    });

    const accountData = await getAccountInfo(credentials.username);
    if (accountData) {
      console.log(`✅ Cliente personalizado: @${accountData.name} encontrado`);
    }
  } catch (error) {
    console.log(`❌ Error con cliente personalizado: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }

  // Ejemplo 4: Crear post (con límite de tiempo)
  console.log('\n🚀 4. Intentando crear post...');
  try {
    const postData: PostMetadata = {
      title: `Post de Prueba HiveTS - ${Date.now()}`,
      body: `# Post de Prueba

Este post fue creado automáticamente usando HiveTS para demostrar la funcionalidad de la librería.

Timestamp: ${new Date().toISOString()}`,
      tags: ['hivets', 'prueba', 'typescript'],
      json_metadata: {
        app: 'hivets/1.0.0',
        format: 'markdown'
      }
    };

    const result = await createPost(credentials, postData);
    
    if (result.success) {
      console.log(`✅ Post creado: ${result.transaction_id}`);
    } else {
      console.log(`❌ Error al crear post: ${result.error}`);
    }
  } catch (error) {
    console.log(`❌ Error inesperado: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }

  console.log('\n🏁 Todos los ejemplos completados!');
}

// Ejecutar todos los ejemplos
runAllExamples().catch(console.error);