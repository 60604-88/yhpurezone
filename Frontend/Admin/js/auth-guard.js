(function() {
    const token = localStorage.getItem('authToken');

    if (!token) {
        // Si no hay token, redirige a la pagina principal.
        window.location.href = '../index.html';
        return;
    }

    try {
        const payload = parseJwt(token);
        // Si el token expiró 
        if (payload.exp * 1000 < Date.now()) {
            localStorage.removeItem('authToken');
            window.location.href = '../index.html';
            return;
        }
        // Si el rol no es 'admin', lo sacamos.
        if (payload.rol !== 'admin') {
            alert('Acceso denegado. No tienes permisos de administrador.');
            window.location.href = '../index.html';
            return;
        }
    } catch (e) {
        // Si el token es inválido, lo borramos y redirigimos.
        localStorage.removeItem('authToken');
        window.location.href = '../index.html';
        return;
    }

    function parseJwt(token) {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
        return JSON.parse(jsonPayload);
    }
})();