document.addEventListener('DOMContentLoaded', function() {
    
    // --- Lógica del Menú Lateral ---
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.overlay');

    function closeMenu() {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
    }

    function openMenu() {
        sidebar.classList.add('active');
        overlay.classList.add('active');
    }

    if (menuToggle) {
        menuToggle.addEventListener('click', function(event) {
            event.stopPropagation();
            if (sidebar.classList.contains('active')) {
                closeMenu();
            } else {
                openMenu();
            }
        });
    }

    if (overlay) {
        overlay.addEventListener('click', function() {
            closeMenu();
        });
    }

    // --- Lógica de Cierre de Sesión ---
    const logoutButton = document.getElementById('admin-logout-button');
    if(logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('authToken');
            window.location.href = '../index.html';
        });
    }

    
    // Referencias a los contenedores de KPI
    const kpiClientes = document.getElementById('kpi-total-clientes');
    const kpiServicios = document.getElementById('kpi-total-servicios');
    
    const token = localStorage.getItem('authToken');

    /**
     * Carga el número total de clientes desde la API
     */
    async function cargarTotalClientes() {
        if (!kpiClientes || !token) return;

        try {
            // Reutilizamos la API que usa 'clientes.html'
            const response = await fetch('http://localhost:3000/api/admin/clientes', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Error al cargar clientes');
            
            const clientes = await response.json();
            kpiClientes.textContent = clientes.length; // Mostramos el conteo

        } catch (error) {
            console.error('Error en KPI Clientes:', error);
            kpiClientes.textContent = 'Error';
        }
    }

    /**
     * Carga el número total de servicios desde la API
     */
    async function cargarTotalServicios() {
        if (!kpiServicios || !token) return;

        try {
            // Reutilizamos la API que usa 'servicios.html'
            const response = await fetch('http://localhost:3000/api/admin/servicios', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Error al cargar servicios');
            
            const servicios = await response.json();
            kpiServicios.textContent = servicios.length; // Mostramos el conteo

        } catch (error) {
            console.error('Error en KPI Servicios:', error);
            kpiServicios.textContent = 'Error';
        }
    }

    // --- Ejecución de las nuevas funciones ---
    cargarTotalClientes();
    cargarTotalServicios();
});