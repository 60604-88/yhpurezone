document.addEventListener('DOMContentLoaded', function() {
    const citasContainer = document.getElementById('citas-container');
    const citaDetailModalEl = document.getElementById('citaDetailModal');
    const citaDetailModal = new bootstrap.Modal(citaDetailModalEl);
    
    let todasLasCitas = [];

    async function cargarCitas() {
        const token = localStorage.getItem('authToken');
        if (!citasContainer || !token) return;

        try {
            const response = await fetch('http://localhost:3000/api/citas/admin', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('No se pudieron cargar las citas.');
            todasLasCitas = await response.json();
            
            if (todasLasCitas.length === 0) {
                citasContainer.innerHTML = '<p class="text-center text-muted">No hay citas registradas.</p>';
                return;
            }

            // Construimos la nueva lista visual
            let listHTML = '<div class="cita-list-header d-none d-lg-grid"><span>Cliente</span><span>Servicio</span><span>Fecha y Hora</span><span>Ubicación</span><span class="text-center">Estado</span><span class="text-center">Acciones</span></div>';
            
            todasLasCitas.forEach(cita => {
                const statusClass = `status-${cita.estado.toLowerCase().replace(' ', '-')}`;
                const servicioNombres = cita.servicios && cita.servicios.length > 0 
                                        ? cita.servicios.join('<br>')
                                        : 'Servicio no especificado';
                listHTML += `
                    <div class="cita-row" id="cita-row-${cita.id}">
                        <div>
                            <div class="fw-bold">${cita.cliente_nombre}</div>
                            <div class="small text-muted">ID Cita: #${cita.id}</div>
                        </div>
                        <div>
                            <div class="small fw-bold">${servicioNombres}</div>
                        </div>
                        <div class="small">${formatDate(cita.fecha_hora_cita)}</div>
                        <div class="small text-muted">${cita.direccion}</div>
                        <div class="text-center"><span class="status-badge ${statusClass}">${cita.estado}</span></div>
                        <td class="text-center">
                            <button class="btn btn-sm btn-outline-primary" data-bs-toggle="modal" data-bs-target="#citaDetailModal" data-cita-id="${cita.id}">
                                Gestionar
                            </button>
                        </td>
                    </div>
                `;
            });
            citasContainer.innerHTML = listHTML;

        } catch (error) {
            citasContainer.innerHTML = `<p class="text-danger text-center">${error.message}</p>`;
        }
    }

    /**
     * Se ejecuta cuando el modal está a punto de abrirse. Carga los datos de la cita.
     */
    citaDetailModalEl.addEventListener('show.bs.modal', function (event) {
        const button = event.relatedTarget; // El botón que activó el modal
        const citaId = button.getAttribute('data-cita-id');
        populateModal(citaId);
    });

    /**
     * Rellena el modal con la información de una cita específica.
     * @param {number} citaId - El ID de la cita a mostrar.
     */
    function populateModal(citaId) {
        const modalBody = document.getElementById('modal-body-content');
        const cita = todasLasCitas.find(c => c.id == citaId);

        if (!cita) {
            modalBody.innerHTML = '<p class="text-danger">Error: Cita no encontrada.</p>';
            return;
        }

        modalBody.innerHTML = `
            <h5>Cliente: ${cita.cliente_nombre}</h5>
            <p><strong>Fecha:</strong> ${formatDate(cita.fecha_hora_cita)}</p>
            <p><strong>Dirección:</strong> ${cita.direccion}</p>
            <p><strong>Precio Total:</strong> ${formatCurrency(cita.precio_total)}</p>
            <hr>
            <div class="mb-3">
                <label for="status-select" class="form-label"><strong>Cambiar Estado:</strong></label>
                <select class="form-select" id="status-select">
                    <option value="confirmada" ${cita.estado === 'confirmada' ? 'selected' : ''}>Confirmada</option>
                    <option value="completada" ${cita.estado === 'completada' ? 'selected' : ''}>Completada</option>
                    <option value="cancelada" ${cita.estado === 'cancelada' ? 'selected' : ''}>Cancelada</option>
                </select>
            </div>
        `;

        // Añadimos el listener al botón de guardar, pasándole el ID de la cita
        document.getElementById('saveStatusButton').onclick = () => updateCitaStatus(citaId);
    }
    
    /**
     * Llama a la API para actualizar el estado de una cita.
     * @param {number} citaId - El ID de la cita a actualizar.
     */
    async function updateCitaStatus(citaId) {
        const nuevoEstado = document.getElementById('status-select').value;
        const token = localStorage.getItem('authToken');

        try {
            const response = await fetch(`http://localhost:3000/api/citas/admin/${citaId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ estado: nuevoEstado })
            });
            if (!response.ok) throw new Error('Falló la actualización.');

            // Si la API responde con éxito, actualizamos la tabla en tiempo real
            const citaIndex = todasLasCitas.findIndex(c => c.id == citaId);
            todasLasCitas[citaIndex].estado = nuevoEstado;

            // Actualizamos solo el 'badge' en la fila de la tabla
            const row = document.getElementById(`cita-row-${citaId}`);
            const badge = row.querySelector('.status-badge');
            badge.textContent = nuevoEstado;
            badge.className = `status-badge ${getStatusClass(nuevoEstado)}`;

            citaDetailModal.hide(); // Cerramos el modal
        } catch (error) {
            console.error(error);
            alert('No se pudo actualizar el estado.');
        }
    }


    // --- Funciones de Ayuda ---
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true });
    }
    function formatCurrency(amount) {
        return parseFloat(amount).toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });
    }
    function getStatusClass(status) {
        switch (status) {
            case 'completada': return 'bg-success';
            case 'cancelada': return 'bg-secondary';
            case 'confirmada': default: return 'bg-primary';
        }
    }

    // Llamamos a la función para que se ejecute al cargar la página
    cargarCitas();
});