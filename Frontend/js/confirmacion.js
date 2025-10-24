document.addEventListener('DOMContentLoaded', async () => {
    // 1. Obtener el ID de la cita desde la URL
    const params = new URLSearchParams(window.location.search);
    const citaId = params.get('id');

    if (!citaId) {
        // Si no hay ID, redirigir al inicio para evitar errores
        window.location.href = 'index.html';
        return;
    }

    // 2. Pedir los detalles de esa cita específica al backend
    const token = localStorage.getItem('authToken');
    if (!token) {
        // Si no hay token, no podemos verificar al usuario, redirigir al login
        window.location.href = 'auth.html'; // o al modal de login
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/api/citas/${citaId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('No se pudieron cargar los detalles de la cita.');
        }

        const cita = await response.json();

        // 3. Rellenar la página con los datos recibidos
        document.getElementById('cita-fecha').textContent = new Date(cita.fecha_hora_cita).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
        document.getElementById('cita-hora').textContent = new Date(cita.fecha_hora_cita).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
        document.getElementById('cita-servicio').textContent = cita.servicios.map(s => s.nombre).join(', ');
        document.getElementById('cita-numero').textContent = `#${cita.id.toString().padStart(6, '0')}`;
        
        document.getElementById('cliente-nombre').textContent = cita.cliente_nombre;
        document.getElementById('cliente-email').textContent = cita.cliente_email;
        document.getElementById('cliente-telefono').textContent = cita.cliente_telefono;
        document.getElementById('cliente-direccion').textContent = cita.direccion_calle;

    } catch (error) {
        console.error('Error:', error);
        alert('Hubo un problema al cargar la confirmación de tu cita. Por favor, revisa tu perfil.');
    }
}); 