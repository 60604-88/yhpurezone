const token = localStorage.getItem('authToken');

// 1. Guardián de la ruta: si no hay token, fuera.
if (!token) {
    window.location.href = 'index.html';
}

// --- Contenedores Principales ---
const saludoUsuario = document.getElementById('saludo-nombre-usuario');
const perfilNombre = document.getElementById('perfil-nombre');
const perfilEmail = document.getElementById('perfil-email');
const perfilTelefono = document.getElementById('perfil-telefono');
const proximasContenedor = document.getElementById('proximas-citas-contenedor');
const historialTbody = document.getElementById('historial-citas-tbody');
const loadingProximas = document.getElementById('loading-proximas');
const loadingHistorial = document.getElementById('loading-historial');
const notificacionContainer = document.getElementById('notificacion-reseña-container');

// --- Contenedores del Resumen ---
const resumenCompletadas = document.getElementById('resumen-completadas');
const resumenPendientes = document.getElementById('resumen-pendientes');
const resumenTotal = document.getElementById('resumen-total');
const resumenCalificacion = document.getElementById('resumen-calificacion');

let miPerfilData = null


// --- Función principal al cargar la página ---
document.addEventListener('DOMContentLoaded', () => {
    cargarPerfilUsuario();
    cargarCitasUsuario();
});

// --- 1. Cargar Perfil (Sidebar) ---
async function cargarPerfilUsuario() {
    try {
        const response = await fetch('http://localhost:3000/api/cliente/perfil', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
    if (!response.ok) {
        if (response.status === 401) { // Token inválido o expirado
            localStorage.removeItem('authToken');
            window.location.href = 'index.html';
        }
        throw new Error('Error al cargar perfil');
    }
    
    miPerfilData = await response.json(); 

    // Inyectar datos en el HTML
    saludoUsuario.textContent = miPerfilData.nombre_completo.split(' ')[0]; // Solo el primer nombre
    perfilNombre.textContent = miPerfilData.nombre_completo;
    perfilEmail.textContent = miPerfilData.email;
    perfilTelefono.textContent = miPerfilData.telefono;

    } catch (error) {
    console.error('Error cargando perfil:', error);
    }
}

// --- 2. Cargar Citas (Próximas e Historial) ---
async function cargarCitasUsuario() {
    try {
    // Usamos la API que creamos en el Paso 1
        const response = await fetch('http://localhost:3000/api/cliente/citas', {
            headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Error al cargar citas');
    
    const citas = await response.json();

    const citasParaReseñar = citas.filter(
        cita => cita.estado === 'completada' && cita.calificacion === null
    );

    // 2. Si encontramos alguna, construimos la alerta
    if (citasParaReseñar.length > 0) {
        let serviciosHtml = '';
        citasParaReseñar.forEach(cita => {
        const servicioNombres = cita.servicios.join(', ') || 'Servicio';
        
        // Usamos la función onclick="abrirModalReseña()" que ya creamos
        serviciosHtml += `
            <li class="list-group-item d-flex justify-content-between align-items-center">
                <span>${servicioNombres}</span>
                <button class="btn btn-sm btn-outline-warning fw-bold" onclick="abrirModalReseña(${cita.id})">
                Dejar reseña
                </button>
            </li>
            `;
        });

      // 3. Inyectamos el HTML en el contenedor
        notificacionContainer.innerHTML = `
            <div class="alert alert-info border-0 shadow-sm" role="alert">
                <h5 class="alert-heading"><i class="bi bi-star-fill text-warning"></i> ¡Servicios completados!</h5>
                <p>Hola, <strong>${saludoUsuario.textContent}</strong>. Tienes ${citasParaReseñar.length} servicio(s) reciente(s) que puedes calificar para ayudarnos a mejorar.</p>
                <hr>
                <ul class="list-group">
                    ${serviciosHtml}
                </ul>
            </div>
        `;
    }

    // Limpiar contenedores
    proximasContenedor.innerHTML = '';
    historialTbody.innerHTML = '';

    // Contadores para el Resumen
    let contPendientes = 0;
    let contCompletadas = 0;
    let totalInvertido = 0;
    let calificaciones = [];

    if (citas.length === 0) {
        loadingProximas.innerHTML = '<div class="card card-body text-center text-muted">No tienes citas programadas.</div>';
        loadingHistorial.style.display = 'block';
        return;
    }

    citas.forEach(cita => {
      // Formateo de datos
        const fecha = new Date(cita.fecha_hora_cita).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
        const hora = new Date(cita.fecha_hora_cita).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
        const servicioNombres = cita.servicios.join(', ') || 'Servicio';
        const direccionCompleta = `${cita.direccion_calle}, ${cita.ciudad}`;

        if (cita.estado === 'completada') {
        // --- Rellenar Historial ---
            contCompletadas++;
            totalInvertido += parseFloat(cita.precio_total);
        if(cita.calificacion) calificaciones.push(cita.calificacion);

        const filaHtml = `
            <tr>
                <td class="p-3">${servicioNombres}</td>
                <td class="p-3">${fecha}</td>
                <td class="p-3">${generarEstrellas(cita.calificacion)}</td>
                <td class="p-3">$${formatoMoneda(cita.precio_total)}</td>
                <td class="p-3 text-end">
                    ${!cita.calificacion ? `<button class="btn btn-sm btn-outline-warning" onclick="abrirModalReseña(${cita.id})">Dejar reseña</button>` : ''}
                </td>
            </tr>
            `;
        historialTbody.innerHTML += filaHtml;

        } else if (cita.estado === 'confirmada') {
        // --- Rellenar Próximas Citas ---
        contPendientes++;
        proximasContenedor.innerHTML += `
            <div class="card mb-3 shadow-sm border-0">
                <div class="card-body p-4">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <h6 class="card-title">${servicioNombres}</h6>
                            <p class="card-text text-muted mb-1">
                                <i class="bi bi-calendar-event"></i> ${fecha} &nbsp;&nbsp; <i class="bi bi-clock"></i> ${hora}
                            </p>
                            <p class="card-text text-muted mb-0">
                                <i class="bi bi-geo-alt-fill"></i> ${direccionCompleta}
                            </p>
                        </div>
                        <div class="text-end">
                            <span class="badge bg-success">Confirmada</span>
                            <h5 class="my-1">$${formatoMoneda(cita.precio_total)}</h5>
                        </div>
                    </div>
                    <hr>
                    <button class="btn btn-sm btn-outline-danger me-2" onclick="reprogramarCita(${cita.id})">Reprogramar</button>
                    <button class="btn btn-sm btn-outline-danger" onclick="cancelarCita(${cita.id})">
                        <i class="bi bi-x-circle"></i> Cancelar
                    </button>
                </div>
            </div>
            `;
        } else if (cita.estado === 'cancelada') {
        // --- Rellenar Historial (Cancelada) ---
        // La contamos como "historial" pero no suma al total invertido
            contCompletadas++; 
        
            const filaHtml = `
                <tr>
                    <td class="p-3 text-muted"><del>${servicioNombres}</del></td>
                    <td class="p-3 text-muted"><del>${fecha}</del></td>
                    <td class="p-3"><span class="badge bg-secondary">Cancelada</span></td>
                    <td class="p-3 text-muted"><del>$${formatoMoneda(cita.precio_total)}</del></td>
                    <td class="p-3"></td>
                </tr>
            `;
            historialTbody.innerHTML += filaHtml;
        }

    });

    // --- 3. Actualizar Resumen ---
    resumenCompletadas.textContent = contCompletadas;
    resumenPendientes.textContent = contPendientes;
    resumenTotal.textContent = `$${formatoMoneda(totalInvertido)}`;
    
    if (calificaciones.length > 0) {
        const promedio = calificaciones.reduce((a, b) => a + b, 0) / calificaciones.length;
        resumenCalificacion.innerHTML = `${promedio.toFixed(1)} <i class="bi bi-star-fill"></i>`;
    }

    if (contPendientes === 0) proximasContenedor.innerHTML = '<div class="card card-body text-center text-muted">No tienes citas programadas.</div>';
    if (contCompletadas === 0) loadingHistorial.style.display = 'block';

    } catch (error) {
    console.error('Error cargando citas:', error);
    proximasContenedor.innerHTML = '<div class="card card-body text-center text-danger">Error al cargar las citas.</div>';
    }
}

// --- 4. Funciones de Interacción (Cancelar Cita) ---

async function cancelarCita(citaId) {
    // 1. Pedimos confirmación al usuario
    if (!confirm('¿Estás seguro de que deseas cancelar esta cita? Esta acción no se puede deshacer.')) {
        return;
    }

    // 2. Obtenemos el token de autenticación
    const token = localStorage.getItem('authToken');
    if (!token) {
        alert('Tu sesión ha expirado. Por favor, recarga la página.');
        return;
    }

    try {
        // 3. Llamamos a la API con el método PUT y la URL correcta
        const response = await fetch(`http://localhost:3000/api/cliente/citas/${citaId}/cancelar`, {
            method: 'PUT', 
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        
        // 4. Verificamos la respuesta
        if (!response.ok) {
            // Si la API nos da un error (ej. 404, 500), lo mostramos
            throw new Error(data.message || 'No se pudo cancelar la cita.');
        }

        // 5. ¡Éxito!
        alert('Cita cancelada exitosamente.');
        window.location.reload(); // Recargamos la página para que la cita pase al historial

    } catch (error) {
        console.error('Error al cancelar cita:', error);
        alert(`Error: ${error.message}`);
    }
}

// --- Funcion para reprogramar citas (cancela la cita para reagendar) ---
async function reprogramarCita(citaId) {
    // 1. Confirmamos la acción con el usuario
    const confirmacion = confirm('Esto cancelará tu cita actual y te llevará a la calculadora para agendar una nueva fecha. ¿Deseas continuar?');
    
    if (!confirmacion) {
        return; // Si el usuario dice "No", no hacemos nada.
    }

    // 2. Obtenemos el token
    const token = localStorage.getItem('authToken');
    if (!token) {
        alert('Tu sesión ha expirado. Por favor, recarga la página.');
        return;
    }

    try {
        // 3. Llamamos a la MISMA API de "cancelar"
        const response = await fetch(`http://localhost:3000/api/cliente/citas/${citaId}/cancelar`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'No se pudo cancelar la cita para reprogramar.');
        }

        // 4. ¡Éxito! Esta es la única parte diferente
        alert('Cita actual cancelada. Serás redirigido a la calculadora para elegir una nueva fecha.');
        
        // 5. Redirigimos a la calculadora
        window.location.href = 'index.html'; 

    } catch (error) {
        // 6. Manejo de errores
        console.error('Error al reprogramar cita:', error);
        alert(`Error: ${error.message}`);
    }
}

// --- 5. Funciones Utilitarias ---

function generarEstrellas(calificacion) {
    if (!calificacion) return '<span class="text-muted small">Sin calificar</span>';
        let estrellasHtml = '';
    for (let i = 1; i <= 5; i++) {
    estrellasHtml += `<i class="bi ${i <= calificacion ? 'bi-star-fill text-warning' : 'bi-star text-warning'}"></i>`;
    }
    return estrellasHtml;
}

function formatoMoneda(valor) {
  return parseFloat(valor).toLocaleString('es-ES'); // Asumiendo formato local
}

/// ---6. LÓGICA DEL MODAL DE RESEÑAS---

const modalReseñaEl = document.getElementById('modalDejarReseña');
const modalReseña = new bootstrap.Modal(modalReseñaEl);
const formReseña = document.getElementById('formDejarReseña');
const estrellasContainer = document.getElementById('reseña-estrellas');
const inputCalificacion = document.getElementById('reseña-calificacion');
const inputComentario = document.getElementById('reseña-comentario');
const inputCitaId = document.getElementById('reseña-cita-id');
const reseñaAlertContainer = document.getElementById('reseña-alert-container');
const btnEnviarReseña = document.getElementById('btn-enviar-reseña');

/**
 * Función que se llama desde el botón "Dejar reseña" en la tabla.
 * Prepara y abre el modal.
 */
function abrirModalReseña(citaId) {
    // 1. Reseteamos el formulario
    formReseña.reset();
    inputCitaId.value = citaId; // Guardamos el ID de la cita
    inputCalificacion.value = 0;
    reseñaAlertContainer.innerHTML = '';
    btnEnviarReseña.disabled = false;
    actualizarEstrellas(0); // Limpiamos las estrellas

    // 2. Abrimos el modal
    modalReseña.show();
}

/**
 * Manejador de clics para las estrellas
 */
estrellasContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('bi-star') || e.target.classList.contains('bi-star-fill')) {
        const calificacion = e.target.dataset.value;
        inputCalificacion.value = calificacion;
        actualizarEstrellas(calificacion);
    }
});

/**
 * Pinta las estrellas según la calificación seleccionada
 */
function actualizarEstrellas(calificacion) {
    const estrellas = estrellasContainer.querySelectorAll('i');
    estrellas.forEach(star => {
        if (star.dataset.value <= calificacion) {
            star.classList.remove('bi-star');
            star.classList.add('bi-star-fill', 'text-warning');
        } else {
            star.classList.remove('bi-star-fill', 'text-warning');
            star.classList.add('bi-star');
        }
    });
}

/**
 * Manejador del envío del formulario de reseña
 */
formReseña.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const datosReseña = {
        cita_id: parseInt(inputCitaId.value),
        calificacion: parseInt(inputCalificacion.value),
        comentario: inputComentario.value
    };

    if (datosReseña.calificacion === 0) {
        mostrarAlertaReseña('Por favor, selecciona una calificación (1-5 estrellas).', 'warning');
        return;
    }

    btnEnviarReseña.disabled = true;
    btnEnviarReseña.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Enviando...';

    try {
        const response = await fetch('http://localhost:3000/api/cliente/resenas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(datosReseña)
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message);

        // ¡Éxito!
        mostrarAlertaReseña(data.message, 'success');
        setTimeout(() => {
            modalReseña.hide();
            window.location.reload(); // Recargamos la página para que se actualice la tabla
        }, 2000);

    } catch (error) {
        mostrarAlertaReseña(error.message, 'danger');
        btnEnviarReseña.disabled = false;
        btnEnviarReseña.innerHTML = 'Enviar Reseña';
    }
});

function mostrarAlertaReseña(mensaje, tipo) {
    reseñaAlertContainer.innerHTML = `<div class="alert alert-${tipo} mt-3">${mensaje}</div>`;
}

// ---7. LÓGICA DEL MODAL DE EDITAR PERFIL ---

const modalPerfilEl = document.getElementById('modalEditarPerfil');
const modalPerfil = new bootstrap.Modal(modalPerfilEl);

// Contenedores del Modal
const modalPerfilNombre = document.getElementById('modal-perfil-nombre');
const modalPerfilEmail = document.getElementById('modal-perfil-email');
const modalPerfilTelefono = document.getElementById('modal-perfil-telefono');
const modalDireccionesList = document.getElementById('modal-direcciones-list');
const direccionAlertContainer = document.getElementById('direccion-alert-container');

/**
 * Se dispara CADA VEZ que el modal #modalEditarPerfil se abre.
 * Usa los datos guardados en 'miPerfilData' para rellenar el modal.
 */
modalPerfilEl.addEventListener('show.bs.modal', () => {
  // Limpiamos alertas
    direccionAlertContainer.innerHTML = '';

    if (!miPerfilData) {
    modalPerfilNombre.textContent = "Error al cargar.";
    modalDireccionesList.innerHTML = '<p class="text-danger">Error al cargar datos.</p>';
    return;
    }

  // 1. Rellenar Pestaña 1: Mi Perfil
    modalPerfilNombre.textContent = miPerfilData.nombre_completo;
    modalPerfilEmail.textContent = miPerfilData.email;
    modalPerfilTelefono.textContent = miPerfilData.telefono;

  // 2. Rellenar Pestaña 2: Mis Direcciones
    if (miPerfilData.direcciones.length === 0) {
    modalDireccionesList.innerHTML = '<p class="text-muted">No tienes direcciones guardadas.</p>';
    return;
    }

    modalDireccionesList.innerHTML = ''; // Limpiar la lista
    miPerfilData.direcciones.forEach(dir => {
    modalDireccionesList.innerHTML += `
        <div class="list-group-item d-flex justify-content-between align-items-center" id="direccion-row-${dir.id}">
            <div>
                <strong>${dir.direccion_calle}, ${dir.ciudad}</strong>
                <br>
                <small class="text-muted">${dir.detalles || 'Sin detalles'}</small>
            </div>
        </div>
        `;
    });
});

