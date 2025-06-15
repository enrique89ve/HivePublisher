/**
 * Ejemplo: Manejo de errores y validaciones
 */
import { createPost } from '../src/operations.js';
import { getAccountInfo } from '../src/accounts.js';
async function exampleErrorHandling() {
    console.log('🚨 Ejemplo: Manejo de errores y validaciones...\n');
    // Test 1: Validación de username inválido
    console.log('Test 1: Username inválido');
    try {
        await getAccountInfo('invalid@username!');
    }
    catch (error) {
        console.log(`✅ Error capturado correctamente: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
    // Test 2: Cuenta inexistente
    console.log('\nTest 2: Cuenta inexistente');
    try {
        const result = await getAccountInfo('usuario-que-no-existe-12345');
        if (result === null) {
            console.log('✅ Cuenta no encontrada (resultado esperado)');
        }
    }
    catch (error) {
        console.log(`✅ Error manejado: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
    // Test 3: Credenciales inválidas para posting
    console.log('\nTest 3: Credenciales inválidas');
    try {
        const invalidCredentials = {
            username: 'usuario-test',
            postingKey: 'clave-posting-invalida'
        };
        const postData = {
            title: 'Test Post',
            body: 'Este post no debería publicarse',
            tags: ['test']
        };
        const result = await createPost(invalidCredentials, postData);
        if (!result.success) {
            console.log(`✅ Error de credenciales capturado: ${result.error}`);
        }
    }
    catch (error) {
        console.log(`✅ Excepción manejada: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
    // Test 4: Post con datos inválidos
    console.log('\nTest 4: Datos de post inválidos');
    try {
        const credentials = {
            username: 'test-user',
            postingKey: 'test-key'
        };
        const invalidPostData = {
            title: '', // Título vacío (inválido)
            body: 'Contenido de prueba',
            tags: [] // Tags vacíos (inválido)
        };
        const result = await createPost(credentials, invalidPostData);
        if (!result.success) {
            console.log(`✅ Error de validación capturado: ${result.error}`);
        }
    }
    catch (error) {
        console.log(`✅ Validación funcionando: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
    // Test 5: Cuenta válida existente
    console.log('\nTest 5: Cuenta válida existente');
    try {
        const accountInfo = await getAccountInfo('mahdiyari');
        if (accountInfo) {
            console.log(`✅ Cuenta válida encontrada: @${accountInfo.name}`);
            console.log(`   Reputación: ${accountInfo.reputation}`);
            console.log(`   Posts: ${accountInfo.total_posts}`);
        }
    }
    catch (error) {
        console.log(`❌ Error inesperado: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
    console.log('\n🏁 Pruebas de manejo de errores completadas');
}
// Ejecutar ejemplo
exampleErrorHandling();
//# sourceMappingURL=error-handling.js.map