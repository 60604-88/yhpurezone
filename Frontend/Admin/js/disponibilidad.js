document.addEventListener('DOMContentLoaded', function() {
    
    // Referencias del DOM
    const formBloquear = document.getElementById('form-bloquear-horario');
    const listaBloqueosContainer = document.getElementById('lista-bloqueos');
    const alertaContainer = document.getElementById('alerta-bloqueo');
    const token = localStorage.getItem('authToken');

    /**
     * @function cargarBloqueosExistentes
     * @description Llama a la nueva API GET para obtener y mostrar la lista de bloqueos.
     */
    async function cargarBloqueosExistentes() {
        listaBloqueosContainer.innerHTML = '<div class="text-center p-5"><div class="spinner-border text-primary"></div><p class="mt-2">Cargando bloqueos...</p></div>';

        try {
            const response = await fetch('http://localhost:3000/api/admin/disponibilidad', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('No se pudieron cargar los bloqueos.');

            const bloqueos = await response.json();

            if (bloqueos.length === 0) {
                listaBloqueosContainer.innerHTML = '<p class="text-center text-muted">No hay bloqueos registrados.</p>';
                return;
            }

            // Dibuja la lista dinámicamente
            listaBloqueosContainer.innerHTML = '<div class="list-group"></div>';
            const listGroup = listaBloqueosContainer.querySelector('.list-group');
            
            bloqueos.forEach(bloqueo => {
                const item = document.createElement('div');
                item.className = 'list-group-item';
                item.id = `bloqueo-row-${bloqueo.id}`;
                item.innerHTML = `
                    <div class="d-flex w-100 justify-content-between">
                        <h6 class="mb-1">${bloqueo.motivo || 'Bloqueo general'}</h6>
                        <small class="text-muted">ID: ${bloqueo.id}</small>
                    </div>
                    <p class="mb-1 small text-muted">
                        Desde: ${formatFecha(bloqueo.fecha_hora_inicio)} <br>
                        Hasta: ${formatFecha(bloqueo.fecha_hora_fin)}
                    </p>
                    <button class="btn btn-sm btn-outline-danger btn-delete-bloqueo" data-id="${bloqueo.id}">
                        <i class="bi bi-trash"></i> Eliminar
                    </button>
                `;
                listGroup.appendChild(item);
            });

        } catch (error) {
            listaBloqueosContainer.innerHTML = `<p class="text-danger text-center">${error.message}</p>`;
        }
    }

    /**
     * @function handleFormSubmit
     * @description Se dispara al enviar el formulario para crear un nuevo bloqueo.
     */
    formBloquear.addEventListener('submit', async function(e) {
        e.preventDefault();
        alertaContainer.innerHTML = '';

        const fecha_hora_inicio = document.getElementById('fecha_inicio').value;
        const fecha_hora_fin = document.getElementById('fecha_fin').value;
        const motivo = document.getElementById('motivo').value;

        if (new Date(fecha_fin) <= new Date(fecha_hora_inicio)) {
            mostrarAlerta('La fecha/hora de fin debe ser posterior a la de inicio.', 'danger');
            return;
        }

        const body = { fecha_hora_inicio, fecha_hora_fin, motivo: motivo || null };

        try {
            const response = await fetch('http://localhost:3000/api/admin/disponibilidad/bloquear', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(body)
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Error desconocido');
            
            mostrarAlerta('¡Horario bloqueado exitosamente!', 'success');
            formBloquear.reset();
            cargarBloqueosExistentes(); // ¡Vuelve a cargar la lista para mostrar el nuevo bloqueo!

        } catch (error) {
            console.error('Error al bloquear horario:', error);
            mostrarAlerta(`Error al bloquear: ${error.message}`, 'danger');
        }
    });

    /**
     * @function handleDeleteClick
     * @description Manejador de clics para los botones de eliminar (usando delegación de eventos).
     */
    listaBloqueosContainer.addEventListener('click', function(e) {
        const deleteButton = e.target.closest('.btn-delete-bloqueo');
        if (deleteButton) {
            const bloqueoId = deleteButton.dataset.id;
            handleDeleteBloqueo(bloqueoId);
        }
    });

    /**
     * @function handleDeleteBloqueo
     * @description Llama a la API DELETE para eliminar un bloqueo.
     */
    async function handleDeleteBloqueo(bloqueoId) {
        if (!confirm(`¿Estás seguro de que deseas eliminar el bloqueo ID #${bloqueoId}?`)) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:3000/api/admin/disponibilidad/${bloqueoId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message);

            // Elimina la fila del DOM
            const row = document.getElementById(`bloqueo-row-${bloqueoId}`);
            if (row) row.remove();

        } catch (error) {
            console.error('Error al eliminar bloqueo:', error);
            alert(`Error: ${error.message}`);
        }
    }

    // --- Funciones de Ayuda ---
    function mostrarAlerta(mensaje, tipo) {
        alertaContainer.innerHTML = `<div class="alert alert-${tipo}" role="alert">${mensaje}</div>`;
    }

    function formatFecha(isoString) {
        return new Date(isoString).toLocaleString('es-CO', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    }

    // --- Ejecución Inicial ---
    cargarBloqueosExistentes();
});