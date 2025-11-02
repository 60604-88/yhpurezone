document.addEventListener('DOMContentLoaded', () => {
    // Referencias a los botones de la barra de navegación que pueden cambiar
    const loginButton = document.getElementById('login-button');
    const accountButton = document.getElementById('account-button');
    const adminButton = document.getElementById('admin-button');
    const logoutButton = document.getElementById('logout-button');

    // Buscamos el token de autenticación en el almacenamiento local del navegador
    const token = localStorage.getItem('authToken');

    if (token) {
        // --- CASO 1: El usuario SÍ ha iniciado sesión ---
        const user = parseJwt(token); // Decodificamos el token para obtener sus datos (id y rol)

        // Ocultamos el botón de "Iniciar Sesión"
        if (loginButton) {
            loginButton.style.display = 'none';
        }

        // Mostramos los botones para usuarios logueados
        if (accountButton) {
            accountButton.style.display = 'block';
        }
        if (logoutButton) {
            logoutButton.style.display = 'block';
        }

        // Si el rol del usuario en el token es 'admin', mostramos el botón de Admin
        if (user && user.rol === 'admin' && adminButton) {
            adminButton.style.display = 'block';
        }
        
        // Añadimos la funcionalidad al botón de "Cerrar Sesión"
        if (logoutButton) {
            logoutButton.addEventListener('click', () => {
                localStorage.removeItem('authToken'); // Borramos el token del almacenamiento
                window.location.reload(); // Recargamos la página para actualizar la vista
            });
        }

    } else {
        // --- CASO 2: El usuario NO ha iniciado sesión ---
        // Nos aseguramos de que solo se vea el botón de "Iniciar Sesión"
        if (loginButton) {
            loginButton.style.display = 'block';
        }
        if (accountButton) {
            accountButton.style.display = 'none';
        }
        if (adminButton) {
            adminButton.style.display = 'none';
        }
        if (logoutButton) {
            logoutButton.style.display = 'none';
        }
    }
});


function parseJwt(token) {
    try {
        // El payload está en la segunda parte del token, codificado en Base64
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload);
    } catch (e) {
        // Si el token es inválido o está malformado, devuelve null
        console.error("Error al decodificar el token:", e);
        return null;
    }
}