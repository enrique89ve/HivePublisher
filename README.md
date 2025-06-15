# HiveTS

Una librería ligera de TypeScript para publicar y editar posts en la blockchain de Hive, y obtener información completa de cuentas. Esta librería extrae solo las funciones necesarias para evitar dependencias pesadas.

## Características

- ✅ **Publicación de posts** - Crear nuevos posts en Hive
- ✅ **Edición de posts** - Modificar posts existentes
- ✅ **Información de cuentas** - Obtener datos completos de cuentas (seguidores, reputación, balances, etc.)
- ✅ **TypeScript nativo** - Tipos completos y validación
- ✅ **Validación robusta** - Verificación de datos y formatos
- ✅ **Manejo de errores** - Gestión completa de errores
- ✅ **Cliente personalizable** - Configuración de nodos API y timeouts
- ✅ **Criptografía integrada** - Firmado de transacciones con hive-tx

## Instalación

```bash
npm install typescript @types/node hive-tx secp256k1
```

## Configuración

Para usar las funciones de posting, configura las variables de entorno:

```bash
export HIVE_USERNAME=tu_usuario
export HIVE_POSTING_KEY=tu_clave_posting
```

## Uso Básico

### Obtener Información de Cuenta

```typescript
import { getAccountInfo } from './src/accounts.js';

const accountInfo = await getAccountInfo('mahdiyari');
console.log(`Cuenta: @${accountInfo.name}`);
console.log(`Reputación: ${accountInfo.reputation}`);
console.log(`Seguidores: ${accountInfo.followers}`);
console.log(`Posts: ${accountInfo.total_posts}`);
```

### Crear un Post

```typescript
import { createPost } from './src/operations.js';
import { HiveCredentials, PostMetadata } from './src/types.js';

const credentials: HiveCredentials = {
  username: 'tu_usuario',
  postingKey: 'tu_clave_posting'
};

const postData: PostMetadata = {
  title: 'Mi Primer Post',
  body: '# Hola Hive!\n\nEste es mi primer post usando HiveTS.',
  tags: ['introducción', 'hivets', 'desarrollo']
};

const result = await createPost(credentials, postData);
if (result.success) {
  console.log(`Post creado: ${result.transaction_id}`);
}
```

### Editar un Post

```typescript
import { editPost } from './src/operations.js';

const updatedData: PostMetadata = {
  title: 'Mi Post Actualizado',
  body: '# Contenido actualizado\n\nEste post ha sido editado.',
  tags: ['actualizado', 'hivets']
};

const result = await editPost(credentials, 'mi-permlink', updatedData);
```

### Cliente Personalizado

```typescript
import { HiveClient } from './src/hive-client.js';

const customClient = new HiveClient({
  apiNode: 'https://rpc.mahdiyari.info',
  timeout: 15000
});

const result = await createPost(credentials, postData, customClient);
```

## Ejemplos

La carpeta `examples/` contiene ejemplos detallados:

- `account-info.ts` - Obtener información completa de cuentas
- `create-post.ts` - Crear nuevos posts
- `edit-post.ts` - Editar posts existentes  
- `custom-client.ts` - Usar cliente personalizado
- `error-handling.ts` - Manejo de errores y validaciones
- `run-all.ts` - Ejecutar todos los ejemplos

### Ejecutar Ejemplos

```bash
# Compilar
npm run build

# Ejemplo específico
node dist/examples/account-info.js

# Todos los ejemplos
node dist/examples/run-all.js
```

## API Reference

### Tipos Principales

```typescript
interface HiveCredentials {
  username: string;
  postingKey: string;
}

interface PostMetadata {
  title: string;
  body: string;
  tags: string[];
  json_metadata?: Record<string, any>;
  parent_author?: string;
  parent_permlink?: string;
}

interface AccountInfo {
  id: number;
  name: string;
  reputation: string;
  followers: string;
  followings: string;
  total_posts: string;
  created_at: string;
  // ... más campos disponibles
}
```

### Funciones Principales

#### `getAccountInfo(username: string, client?: HiveClient): Promise<AccountInfo | null>`

Obtiene información completa de una cuenta de Hive.

#### `createPost(credentials: HiveCredentials, metadata: PostMetadata, client?: HiveClient): Promise<PublishResult>`

Crea un nuevo post en Hive.

#### `editPost(credentials: HiveCredentials, permlink: string, metadata: PostMetadata, client?: HiveClient): Promise<PublishResult>`

Edita un post existente.

## Validaciones

La librería incluye validaciones automáticas:

- ✅ Formato de username
- ✅ Longitud y contenido de tags
- ✅ Estructura de posts
- ✅ Claves de posting válidas
- ✅ Formato de permlinks

## Manejo de Errores

```typescript
try {
  const result = await createPost(credentials, postData);
} catch (error) {
  if (error instanceof HiveError) {
    console.log(`Error de Hive: ${error.message}`);
  } else {
    console.log(`Error general: ${error.message}`);
  }
}
```

## Contribuir

1. Fork el repositorio
2. Crea una rama para tu feature
3. Realiza los cambios
4. Agrega tests si es necesario
5. Envía un pull request

## Licencia

MIT License

## Features

- ✅ Create and publish new posts to Hive blockchain
- ✅ Edit existing posts on Hive blockchain
- ✅ TypeScript support with full type definitions
- ✅ Lightweight implementation with minimal dependencies
- ✅ Comprehensive error handling and validation
- ✅ Support for post metadata, tags, and formatting
- ✅ Configurable Hive node endpoints

## Installation

```bash
npm install hivets
