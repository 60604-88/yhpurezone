document.addEventListener('DOMContentLoaded', function() {
    
    // --- REFERENCIAS Y ESTADO ---
    const serviciosContainer = document.getElementById('servicios-container');
    const addServiceModalEl = document.getElementById('addServiceModal');
    const addServiceModal = new bootstrap.Modal(addServiceModalEl);
    const editServiceModalEl = document.getElementById('editServiceModal');
    const editServiceModal = new bootstrap.Modal(editServiceModalEl);
    
    let todosLosServicios = [];

    // --- 2. LÓGICA PRINCIPAL (CARGA DE DATOS) ---

    /**
     * @function cargarServicios
     * @description Obtiene todos los servicios (activos e inactivos) desde la API y llama a la función para dibujarlos.
     */
    async function cargarServicios() {
        const token = localStorage.getItem('authToken');
        if (!serviciosContainer || !token) return;

        try {
            const response = await fetch('http://localhost:3000/api/admin/servicios', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('No se pudieron cargar los servicios.');
            
            todosLosServicios = await response.json();
            renderServicios(); // Llama a la función para dibujar la tabla una vez que se reciben los datos.

        } catch (error) {
            serviciosContainer.innerHTML = `<p class="text-danger text-center">${error.message}</p>`;
        }
    }

    // --- RENDERIZADO DE LA TABLA ---
    function renderServicios() {
        if (todosLosServicios.length === 0) {
            serviciosContainer.innerHTML = '<p class="text-center text-muted">No hay servicios registrados.</p>';
            return;
        }

        let tableHTML = `
            <div class="table-responsive">
                <table class="table table-hover align-middle">
                    <thead>
                        <tr>
                            <th>Servicio</th>
                            <th>Categoría</th>
                            <th>Precio Base</th>
                            <th class="text-center">Estado</th>
                            <th class="text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>`;
        
        todosLosServicios.forEach(servicio => {
            const estaActivo = servicio.esta_activo;
            tableHTML += `
                <tr id="servicio-row-${servicio.id}">
                    <td>
                        <div class="fw-bold">${servicio.nombre}</div>
                        <div class="small text-muted">${servicio.descripcion || ''}</div>
                    </td>
                    <td>${servicio.categoria}</td>
                    <td>${formatCurrency(getPrecioBase(servicio))}</td>
                    <td class="text-center">
                        <span class="badge ${estaActivo ? 'bg-success' : 'bg-secondary'}">${estaActivo ? 'Activo' : 'Inactivo'}</span>
                    </td>
                    <td class="text-center action-column">
                        <button class="btn btn-sm btn-outline-secondary edit-btn" title="Editar Servicio y Precios" data-servicio-id="${servicio.id}"><i class="bi bi-pencil"></i></button>
                        <div class="form-check form-switch d-inline-block mx-2" title="Activar/Desactivar">
                            <input class="form-check-input toggle-status" type="checkbox" role="switch" ${estaActivo ? 'checked' : ''} data-servicio-id="${servicio.id}">
                        </div>
                        <button class="btn btn-sm btn-outline-danger delete-btn" title="Eliminar Permanentemente" data-servicio-id="${servicio.id}" data-servicio-nombre="${servicio.nombre}"><i class="bi bi-trash"></i></button>
                    </td>
                </tr>
            `;
        });
        tableHTML += '</tbody></table></div>';
        serviciosContainer.innerHTML = tableHTML;
    }

    // --- MANEJADORES DE EVENTOS ---

    document.getElementById('addServiceForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const token = localStorage.getItem('authToken');
        const nuevoServicio = {
            nombre: document.getElementById('nombre').value,
            descripcion: document.getElementById('descripcion').value,
            categoria: document.getElementById('categoria').value,
        };

        try {
            const response = await fetch('http://localhost:3000/api/admin/servicios', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(nuevoServicio)
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            
            addServiceModal.hide();
            document.getElementById('addServiceForm').reset();
            cargarServicios();
        } catch (error) {
            alert(`Error al crear el servicio: ${error.message}`);
        }
    });

    serviciosContainer.addEventListener('click', function(event) {
        const editButton = event.target.closest('.edit-btn');
        const deleteButton = event.target.closest('.delete-btn');

        if (editButton) {
            const servicioId = editButton.getAttribute('data-servicio-id');
            populateEditModal(servicioId);
            editServiceModal.show();
        }
        
        if (deleteButton) {
            const servicioId = deleteButton.getAttribute('data-servicio-id');
            const servicioNombre = deleteButton.getAttribute('data-servicio-nombre');
            handleDeleteService(servicioId, servicioNombre);
        }
    });

    serviciosContainer.addEventListener('change', function(event) {
        const toggleSwitch = event.target.closest('.toggle-status');
        if (toggleSwitch) {
            const servicioId = toggleSwitch.getAttribute('data-servicio-id');
            const nuevoEstado = toggleSwitch.checked;
            handleToggleStatus(servicioId, nuevoEstado);
        }
    });

    // --- 4. FUNCIONES DE ACCIÓN ---

    /**
     * @function populateEditModal
     * @description Rellena el modal de edición con la información del servicio y sus precios.
     * @param {string} servicioId - El ID del servicio a mostrar.
     */
    // --- LÓGICA DEL MODAL DE EDICIÓN ---

    function populateEditModal(servicioId) {
        const servicio = todosLosServicios.find(s => s.id == servicioId);
        const modalBody = document.getElementById('modal-edit-service-body');
        
        if (servicio) {
            let optionsHTML = '<p class="text-muted">Este servicio no tiene opciones de precio configuradas.</p>';
            if (servicio.opciones && servicio.opciones.length > 0) {
                optionsHTML = servicio.opciones.map(opcion => `
                    <div class="card mb-3">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <strong>${opcion.nombre}</strong>
                        </div>
                        <ul class="list-group list-group-flush">
                            ${opcion.variaciones.map(v => `<li class="list-group-item">${v.nombre} - ${formatCurrency(v.precio)}</li>`).join('')}
                            <li class="list-group-item">
                                <form class="add-variation-form" data-opcion-id="${opcion.id}">
                                    <div class="input-group">
                                        <input type="text" class="form-control form-control-sm" placeholder="Nombre Variación" required>
                                        <input type="number" step="0.01" class="form-control form-control-sm" placeholder="Precio" required>
                                        <button type="submit" class="btn btn-sm btn-success">+</button>
                                    </div>
                                </form>
                            </li>
                        </ul>
                    </div>
                `).join('');
            }

            document.getElementById('editServiceModalLabel').textContent = `Editando: ${servicio.nombre}`;
            modalBody.innerHTML = `
                <h5>Opciones de Precio</h5>
                ${optionsHTML}<hr>
                <h5>Añadir Nueva Opción</h5>
                    <form id="add-option-form" data-servicio-id="${servicio.id}">
                        <div class="input-group">
                            <input type="text" class="form-control" placeholder="Nombre de la opción (ej: Tamaño)" required>
                            <button type="submit" class="btn btn-primary">Añadir</button>
                        </div>
                    </form>`;

            document.getElementById('add-option-form').addEventListener('submit', handleAddOption);
            document.querySelectorAll('.add-variation-form').forEach(form => form.addEventListener('submit', handleAddVariation));
        }
    }

    /**
     * @function handleToggleStatus
     * @description Llama a la API para activar o desactivar un servicio.
     * @param {string} servicioId - ID del servicio a modificar.
     * @param {boolean} nuevoEstado - El nuevo estado (true para activo, false para inactivo).
     */
    async function handleToggleStatus(servicioId, nuevoEstado) {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`http://localhost:3000/api/admin/servicios/${servicioId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ esta_activo: nuevoEstado })
            });
            if (!response.ok) throw new Error('Falló la actualización de estado.');
            
            // Actualizar la UI en tiempo real.
            const row = document.getElementById(`servicio-row-${servicioId}`);
            const badge = row.querySelector('.badge');
            badge.textContent = nuevoEstado ? 'Activo' : 'Inactivo';
            badge.className = `badge ${nuevoEstado ? 'bg-success' : 'bg-secondary'}`;
        } catch (error) {
            alert(`Error al cambiar el estado: ${error.message}`);
            cargarServicios(); // Recarga los datos para revertir el switch si la API falla.
        }
    }

    /**
     * @function handleDeleteService
     * @description Llama a la API para eliminar un servicio permanentemente.
     * @param {string} servicioId - ID del servicio a eliminar.
     * @param {string} servicioNombre - Nombre del servicio para el mensaje de confirmación.
     */
    async function handleDeleteService(servicioId, servicioNombre) {
        if (!confirm(`¿Estás seguro de que deseas eliminar "${servicioNombre}" permanentemente?`)) return;
        
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`http://localhost:3000/api/admin/servicios/${servicioId}/permanente`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            
            document.getElementById(`servicio-row-${servicioId}`).remove();
            alert(data.message);
        } catch (error) {
            alert(`Error al eliminar: ${error.message}`);
        }
    }
    
    /**
     * @function handleAddOption
     * @description Llama a la API para añadir una nueva opción a un servicio.
     */
    async function handleAddOption(event) {
        event.preventDefault();
        const form = event.target;
        const servicioId = form.dataset.servicioId;
        const nombre = form.querySelector('input[type="text"]').value;
        

        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`http://localhost:3000/api/admin/servicios/${servicioId}/opciones`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ nombre })
            });
            if (!response.ok) throw new Error('No se pudo añadir la opción.');

            await cargarServicios(); // Recargamos todos los datos.
            populateEditModal(servicioId); // Rellenamos el modal de nuevo para ver el cambio.
        } catch (error) {
            alert(error.message);
        }
    }

    /**
     * @function handleAddVariation
     * @description Llama a la API para añadir una nueva variación de precio a una opción.
     */
    async function handleAddVariation(event) {
        event.preventDefault();
        const form = event.target;
        const opcionId = form.dataset.opcionId;
        const nombre = form.querySelectorAll('input')[0].value;
        const precio = form.querySelectorAll('input')[1].value;
        
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`http://localhost:3000/api/admin/opciones/${opcionId}/variaciones`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ nombre, precio })
            });
            if (!response.ok) throw new Error('No se pudo añadir la variación.');
            
            const servicioId = todosLosServicios.find(s => s.opciones.some(o => o.id == opcionId)).id;
            await cargarServicios();
            populateEditModal(servicioId);
        } catch (error) {
            alert(error.message);
        }
    }

    // --- 5. FUNCIONES DE AYUDA ---
    
    /**
     * @function getPrecioBase
     * @description Calcula el precio más bajo de un servicio para mostrarlo como "precio base".
     */
    function getPrecioBase(servicio) {
        if (!servicio.opciones || servicio.opciones.length === 0) return 0;
        let precios = [];
        servicio.opciones.forEach(opcion => {
            opcion.variaciones.forEach(variacion => {
                precios.push(parseFloat(variacion.precio));
            });
        });
        if (precios.length === 0) return 0;
        return Math.min(...precios);
    }

    /**
     * @function formatCurrency
     * @description Formatea un número a moneda colombiana.
     */
    function formatCurrency(amount) {
        if (!amount && amount !== 0) amount = 0;
        return parseFloat(amount).toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });
    }

    // --- 6. EJECUCIÓN INICIAL ---
    cargarServicios();
});



