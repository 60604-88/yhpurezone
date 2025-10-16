document.addEventListener('DOMContentLoaded', function() {
    // --- Lógica del Menú Lateral (existente) ---
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.overlay');

    // Función para cerrar el menú
    function closeMenu() {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
    }

    // Función para abrir el menú
    function openMenu() {
        sidebar.classList.add('active');
        overlay.classList.add('active');
    }

    // El botón de hamburguesa abre o cierra el menú
    if (menuToggle) {
        menuToggle.addEventListener('click', function(event) {
            event.stopPropagation(); // Evita que el clic se propague a otros elementos
            if (sidebar.classList.contains('active')) {
                closeMenu();
            } else {
                openMenu();
            }
        });
    }

    // El overlay solo cierra el menú
    if (overlay) {
        overlay.addEventListener('click', function() {
            closeMenu();
        });
    }

    const logoutButton = document.getElementById('admin-logout-button');
    if(logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('authToken');
            window.location.href = '../index.html';
        });
    }
});