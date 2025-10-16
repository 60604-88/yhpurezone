document.addEventListener('DOMContentLoaded', function() {
    const clientesContainer = document.getElementById('clientes-container');
    const clientDetailModalEl = document.getElementById('clientDetailModal');
    let todosLosClientes = []; // Guardaremos los clientes aquí

    // --- LÓGICA PRINCIPAL ---
    async function cargarClientes() {
        const token = localStorage.getItem('authToken');
        if (!clientesContainer || !token) return;

        try {
            const response = await fetch('http://localhost:3000/api/admin/clientes', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('No se pudieron cargar los clientes.');
            
            todosLosClientes = await response.json();
            renderClientes();

        } catch (error) {
            clientesContainer.innerHTML = `<p class="text-danger text-center">${error.message}</p>`;
        }
    }

    // --- FUNCIÓN PARA "DIBUJAR" LA LISTA ---
    function renderClientes() {
        if (todosLosClientes.length === 0) {
            clientesContainer.innerHTML = '<p class="text-center text-muted">No hay clientes registrados.</p>';
            return;
        }
        let listHTML = '<div class="client-list-header d-none d-lg-grid"><span>Cliente</span><span>Contacto</span><span class="text-center"></span></div>';
        todosLosClientes.forEach(cliente => {
            const iniciales = cliente.nombre_completo.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
            listHTML += `
                <div class="client-row" id="cliente-row-${cliente.id}">
                    <div class="client-info">
                        <div class="client-avatar">${iniciales}</div>
                        <div><div class="fw-bold">${cliente.nombre_completo}</div></div>
                    </div>
                    <div>
                        <div class="small"><i class="bi bi-envelope me-2"></i>${cliente.email}</div>
                        <div class="small text-muted"><i class="bi bi-phone me-2"></i>${cliente.telefono}</div>
                    </div>
                    <div class="text-center">
                        <button class="btn btn-sm btn-outline-secondary action-btn view-btn" data-bs-toggle="modal" data-bs-target="#clientDetailModal" data-cliente-id="${cliente.id}"><i class="bi bi-eye"></i> Ver</button>
                        <button class="btn btn-sm btn-outline-danger action-btn delete-btn" data-cliente-id="${cliente.id}" data-cliente-nombre="${cliente.nombre_completo}"><i class="bi bi-trash"></i></button>
                    </div>
                </div>
            `;
        });
        clientesContainer.innerHTML = listHTML;
    }

    // --- LÓGICA DEL MODAL "VER DETALLES" ---
    clientDetailModalEl.addEventListener('show.bs.modal', function (event) {
        const button = event.relatedTarget;
        const clienteId = button.getAttribute('data-cliente-id');
        const cliente = todosLosClientes.find(c => c.id == clienteId);
        
        const modalBody = document.getElementById('modal-client-body');
        if (cliente) {
            modalBody.innerHTML = `
                <h5>${cliente.nombre_completo}</h5>
                <p class="text-muted">ID: ${cliente.id}</p>
                <hr>
                <p><i class="bi bi-envelope-fill me-2"></i><strong>Email:</strong> ${cliente.email}</p>
                <p><i class="bi bi-phone-fill me-2"></i><strong>Teléfono:</strong> ${cliente.telefono}</p>
                <p><i class="bi bi-calendar-plus-fill me-2"></i><strong>Cliente desde:</strong> ${new Date(cliente.fecha_creacion).toLocaleDateString('es-CO')}</p>
            `;
        }
    });

    // --- LÓGICA DE ELIMINACIÓN (CON DELEGACIÓN DE EVENTOS) ---
    clientesContainer.addEventListener('click', function(event) {
        const deleteButton = event.target.closest('.delete-btn');
        if (deleteButton) {
            const clienteId = deleteButton.getAttribute('data-cliente-id');
            const clienteNombre = deleteButton.getAttribute('data-cliente-nombre');
            handleDeleteCliente(clienteId, clienteNombre);
        }
    });

    async function handleDeleteCliente(clienteId, clienteNombre) {
        if (!confirm(`¿Estás seguro de que deseas eliminar a ${clienteNombre}? Esta acción no se puede deshacer.`)) {
            return;
        }
        
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`http://localhost:3000/api/admin/clientes/${clienteId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            
            // Si se elimina con éxito, quita la fila de la vista
            document.getElementById(`cliente-row-${clienteId}`).remove();
            alert(data.message);

        } catch (error) {
            alert(`Error al eliminar: ${error.message}`);
        }
    }

    // --- EJECUCIÓN INICIAL ---
    cargarClientes();
});