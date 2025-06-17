#!/usr/bin/env node

/**
 * Script para verificar la configuración de HivePublisher
 */

// Cargar dotenv al inicio
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
}

console.log('🔧 Verificando configuración de HivePublisher...\n');

// Verificar si existe el archivo .env
const envExamplePath = path.join(__dirname, '..', '.env.example');

if (fs.existsSync(envPath)) {
  console.log('✅ Archivo .env encontrado');
} else {
  console.log('⚠️  Archivo .env no encontrado');
  console.log('   💡 Copia .env.example como .env y configura tus credenciales');
}

if (fs.existsSync(envExamplePath)) {
  console.log('✅ Archivo .env.example encontrado');
} else {
  console.log('❌ Archivo .env.example no encontrado');
}

// Cargar configuración
try {
  const { loadEnvConfig } = require('../dist/config.js');
  const config = loadEnvConfig();

  console.log('\n📋 Configuración actual:');
  console.log('---------------------------');

  if (config.username) {
    console.log(`👤 Usuario: ${config.username}`);
  } else {
    console.log('👤 Usuario: (no configurado - solo lectura)');
  }

  if (config.postingKey) {
    console.log('🔑 Clave posting: ✅ Configurada');
  } else {
    console.log('🔑 Clave posting: ❌ No configurada');
  }
  console.log(`🌐 Red: ${config.testnet ? 'Testnet' : 'Mainnet'}`);

  if (config.apiNode) {
    console.log(`🔗 Nodo API: ${config.apiNode}`);
  } else {
    console.log('🔗 Nodo API: (automático)');
  }

  console.log('\n🎯 Estado:');
  if (config.username && config.postingKey) {
    console.log('✅ Listo para operaciones de lectura y escritura');
  } else {
    console.log('📖 Solo operaciones de lectura disponibles');
    console.log('   Para escritura, configura HIVE_USERNAME y HIVE_POSTING_KEY');
  }
} catch (error) {
  console.log('\n❌ Error al cargar configuración:');
  console.log(error.message);
  console.log('\n💡 Asegúrate de haber compilado el proyecto: npm run build');
}

console.log('\n📚 Para más información, consulta el README.md');
