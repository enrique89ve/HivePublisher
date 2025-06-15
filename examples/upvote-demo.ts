/**
 * Demo completo: Diferentes opciones de upvote
 */

import { upvote } from '../src/operations.js';
import { HiveClient } from '../src/hive-client.js';
import { HiveCredentials } from '../src/types.js';

async function upvoteDemo() {
  console.log('🗳️ Demo: Opciones de upvote en HiveTS\n');

  const username = process.env.HIVE_USERNAME || 'test-user';
  const postingKey = process.env.HIVE_POSTING_KEY || 'test-key';

  if (username === 'test-user' || postingKey === 'test-key') {
    console.log('⚠️  Usando credenciales de prueba');
    console.log('💡 Para votar en blockchain real, configura HIVE_USERNAME y HIVE_POSTING_KEY\n');
    
    // Demostrar validaciones con datos de prueba
    console.log('📋 Demostrando validaciones:');
    console.log('• Peso de voto debe estar entre 0-100%');
    console.log('• Username debe tener formato válido');
    console.log('• Permlink no puede estar vacío');
    console.log('• El post debe existir en la blockchain\n');
    return;
  }

  console.log('🔑 Credenciales reales detectadas\n');

  const credentials: HiveCredentials = {
    username,
    postingKey
  };

  // Ejemplo con el post específico solicitado
  const author = 'enrique89.test';
  const permlink = 'testing-custom-client-1749966896';

  console.log('📝 Ejemplos de upvote con diferentes pesos:\n');

  // Ejemplo 1: Upvote al 100% (por defecto)
  console.log('1. Upvote al 100% (peso por defecto):');
  console.log(`   Post: @${author}/${permlink}`);
  try {
    const result = await upvote(credentials, author, permlink);
    if (result.success) {
      console.log(`   ✅ Exitoso - TX: ${result.transaction_id?.substring(0, 8)}...`);
    } else {
      console.log(`   ⚠️  ${result.error}`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error instanceof Error ? error.message : 'Unknown'}`);
  }

  // Ejemplo 2: Upvote al 50%
  console.log('\n2. Upvote al 50%:');
  try {
    const result = await upvote(credentials, author, permlink, 50);
    if (result.success) {
      console.log(`   ✅ Exitoso - TX: ${result.transaction_id?.substring(0, 8)}...`);
    } else {
      console.log(`   ⚠️  ${result.error}`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error instanceof Error ? error.message : 'Unknown'}`);
  }

  // Ejemplo 3: Upvote mínimo al 1%
  console.log('\n3. Upvote mínimo al 1%:');
  try {
    const result = await upvote(credentials, author, permlink, 1);
    if (result.success) {
      console.log(`   ✅ Exitoso - TX: ${result.transaction_id?.substring(0, 8)}...`);
    } else {
      console.log(`   ⚠️  ${result.error}`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error instanceof Error ? error.message : 'Unknown'}`);
  }

  // Ejemplo 4: Cliente personalizado
  console.log('\n4. Con cliente personalizado:');
  try {
    const customClient = new HiveClient({ 
      apiNode: 'https://rpc.mahdiyari.info',
      timeout: 15000 
    });
    
    const result = await upvote(credentials, author, permlink, 25, customClient);
    if (result.success) {
      console.log(`   ✅ Exitoso - TX: ${result.transaction_id?.substring(0, 8)}...`);
    } else {
      console.log(`   ⚠️  ${result.error}`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error instanceof Error ? error.message : 'Unknown'}`);
  }

  console.log('\n📊 Resumen de funcionalidad upvote:');
  console.log('• ✅ Validación de parámetros implementada');
  console.log('• ✅ Conversión automática de porcentaje a formato Hive');
  console.log('• ✅ Verificación de existencia de cuenta y post');
  console.log('• ✅ Manejo robusto de errores');
  console.log('• ✅ Soporte para cliente personalizado');
  console.log('• ✅ Transacciones firmadas correctamente');

  console.log('\n🏁 Demo completado');
}

// Ejecutar si es el archivo principal
if (import.meta.url === `file://${process.argv[1]}`) {
  upvoteDemo();
}

export { upvoteDemo };