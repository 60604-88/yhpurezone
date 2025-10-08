// Espera a que el contenido de la página esté cargado
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const alertContainer = document.getElementById('alert-container-modal');
    const authModalEl = document.getElementById('authModal');
    const authModal = authModalEl ? new bootstrap.Modal(authModalEl) : null;


    // --- Lógica para el Formulario de Login ---
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            try {
                const response = await fetch('http://localhost:3000/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, contraseña: password })
                });

                const data = await response.json();
                if (!response.ok) throw new Error(data.message);

                // Si el login es exitoso, guardamos el token
                localStorage.setItem('authToken', data.token);
                showAlert('Inicio de sesión exitoso. Redirigiendo...', 'success', alertContainer);
                
                // Espera un momento, cierra el modal y recarga la página
                setTimeout(() => {
                    if (authModal) authModal.hide();
                    window.location.reload(); // Recargar la página actualiza la navbar y todo lo demás
                }, 1000);

            } catch (error) {
                showAlert(error.message || 'Error de conexión', 'danger', alertContainer);
            }
        });
    }

    // --- Lógica para el Formulario de Registro ---
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const nombre_completo = document.getElementById('register-name').value;
            const email = document.getElementById('register-email').value;
            const telefono = document.getElementById('register-phone').value;
            const password = document.getElementById('register-password').value;
            const confirmPassword = document.getElementById('register-confirm-password').value;
            
            // Validamos que las contraseñas coincidan
            if (password !== confirmPassword){
                showAlert('Las contraseñas no coinciden', 'danger', alertContainer);
            return;
            }

            try {
                const response = await fetch('http://localhost:3000/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nombre_completo, email, telefono, contraseña: password })
                });

                const data = await response.json();
                if (!response.ok) throw new Error(data.message);

                showAlert('¡Registro exitoso! Por favor, ve a la pestaña de Iniciar Sesión para entrar.', 'success', alertContainer);
                // Limpiamos el formulario
                registerForm.reset();
                // Opcional: cambiar automáticamente a la pestaña de login
                document.getElementById('login-tab').click();

            } catch (error) {
                showAlert(error.message || 'Error de conexión', 'danger', alertContainer);
            }
        });
    }
});

// Función para mostrar alertas en el HTML
function showAlert(message, type, container) {
    if (!container) return;
    container.innerHTML = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
}