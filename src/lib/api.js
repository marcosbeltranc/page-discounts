import Cookies from 'js-cookie';

const BASE_URL = 'http://172.16.101.119:8008/api';

async function request(endpoint, options = {}) {
    const token = Cookies.get('token');

    // Configurar cabeceras por defecto
    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
    };

    // Si el token existe en las cookies, lo inyectamos automáticamente
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        ...options,
        headers,
    };

    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, config);

        // Si la API responde un error de no autenticado (401), limpiamos y mandamos al login
        if (response.status === 401) {
            Cookies.remove('token');
            if (typeof window !== 'undefined') {
                window.location.href = '/login';
            }
            return { error: true, result: 'Sesión expirada. Por favor inicia sesión de nuevo.' };
        }

        return await response.json();
    } catch (error) {
        return {
            error: true,
            result: 'Error de conexión con el servidor de TI Center.'
        };
    }
}

// Exportamos los métodos limpios para tus componentes
export const api = {
    get: (endpoint) => request(endpoint, { method: 'GET' }),
    post: (endpoint, body) => request(endpoint, { method: 'POST', body: JSON.stringify(body) }),
    put: (endpoint, body) => request(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (endpoint) => request(endpoint, { method: 'DELETE' }),
};