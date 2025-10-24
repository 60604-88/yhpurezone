/**
 * @description Maneja toda la lógica interactiva de la página de inicio, incluyendo
 * la calculadora de cotizaciones y el flujo completo de agendamiento de citas.
 */

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. REFERENCIAS A ELEMENTOS DEL DOM ---
    // Guardamos en variables los elementos del HTML con los que vamos a interactuar.
    const serviceButtonsContainer = document.getElementById('service-buttons-container');
    const dynamicOptionsContainer = document.getElementById('dynamic-options-container');
    const quoteSummaryContainer = document.getElementById('quote-summary');
    
    // Elementos del Modal de Agendamiento
    const bookingModalEl = document.getElementById('bookingModal');
    const bookingModal = bookingModalEl ? new bootstrap.Modal(bookingModalEl) : null;
    const dateSlotsContainer = document.getElementById('date-slots-container');
    const timeSlotsContainer = document.getElementById('time-slots-container');
    const detailsContainer = document.getElementById('details-container');
    const bookingSummaryContainer = document.getElementById('booking-summary');
    const prevStepButton = document.getElementById('prevStepButton');
    const nextStepButton = document.getElementById('nextStepButton');

    // --- 2. ESTADO DE LA APLICACIÓN ---
    // Variables que guardan el estado actual de la calculadora y el agendamiento.
    let allServicesData = [];
    let selectedService = null;
    let currentSelections = {};
    let finalQuote = { price: 0, breakdownHTML: '' };
    let bookingState = {};

    // --- 3. INICIALIZACIÓN ---
    fetchServices();
    
    // --- 4. MANEJADORES DE EVENTOS PRINCIPALES ---

    // Usamos delegación de eventos para el botón "Agendar Ahora" que se crea dinámicamente.
    quoteSummaryContainer.addEventListener('click', (e) => {
        if (e.target && e.target.id === 'agendar-ahora-btn') handleAgendarAhora();
    });

    // Eventos para la selección de fecha y hora en el modal.
    dateSlotsContainer.addEventListener('click', (e) => {
        if (e.target && e.target.classList.contains('date-slot')) handleDateSelection(e.target);
    });
    timeSlotsContainer.addEventListener('click', (e) => {
        if (e.target && e.target.classList.contains('time-slot')) handleTimeSelection(e.target);
    });
    
    // Eventos para los botones de navegación del modal.
    nextStepButton.addEventListener('click', handleNextStep);
    prevStepButton.addEventListener('click', handlePrevStep);

    // --- 5. LÓGICA DE LA CALCULADORA DE COTIZACIONES ---

    /**
     * Obtiene la lista de servicios desde la API al cargar la página.
     */
    async function fetchServices() {
        try {
            const response = await fetch('http://localhost:3000/api/servicios');
            if (!response.ok) throw new Error('No se pudieron cargar los servicios.');
            allServicesData = await response.json();
            renderServiceButtons();
        } catch (error) {
            console.error(error);
            serviceButtonsContainer.innerHTML = `<p class="text-danger">${error.message}</p>`;
        }
    }

    /**
     * Dibuja los botones principales para cada categoría de servicio.
     */
    function renderServiceButtons() {
        serviceButtonsContainer.innerHTML = '';
        serviceButtonsContainer.classList.remove('text-center');
        allServicesData.forEach(service => {
            const button = document.createElement('button');
            button.className = 'service-btn';
            button.dataset.serviceId = service.id;
            button.innerHTML = `<i class="bi bi-box-seam d-block mb-2 fs-4"></i> <span>${service.nombre}</span>`;
            button.addEventListener('click', () => handleServiceSelection(service));
            serviceButtonsContainer.appendChild(button);
        });
    }

    /**
     * Orquesta las acciones que ocurren al seleccionar un servicio.
     * @param {object} service - El servicio en el que el usuario hizo clic.
     */
    function handleServiceSelection(service) {
        selectedService = service;
        currentSelections = {};
        
        serviceButtonsContainer.querySelectorAll('button').forEach(btn => {
            btn.classList.toggle('active', parseInt(btn.dataset.serviceId) === service.id);
        });
        
        renderOptionsForService(service);
        quoteSummaryContainer.innerHTML = `<div class="text-center py-5"><i class="bi bi-card-checklist display-4 text-muted"></i><p class="text-muted mt-3">Selecciona una opción para calcular el precio.</p></div>`;
    }

    /**
     * Dibuja las opciones dinámicas (radio buttons, etc.) para el servicio seleccionado.
     * @param {object} service - El servicio seleccionado.
     */
    function renderOptionsForService(service) {
        dynamicOptionsContainer.innerHTML = '';
        service.opciones.forEach(opcion => {
            const optionWrapper = document.createElement('div');
            optionWrapper.className = 'mb-4';
            optionWrapper.innerHTML = `<h5 class="mt-4 mb-3 fw-bold">${opcion.nombre}</h5>`;
            opcion.variaciones.forEach(variacion => {
                const controlId = `variacion-${variacion.id}`;
                const control = document.createElement('div');
                control.className = 'form-check';
                control.innerHTML = `<input class="form-check-input" type="radio" name="opcion-${opcion.id}" id="${controlId}" value="${variacion.id}"><label class="form-check-label" for="${controlId}">${variacion.nombre} (+${parseFloat(variacion.precio).toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })})</label>`;
                optionWrapper.appendChild(control);
                control.querySelector('input').addEventListener('change', (e) => {
                    if (e.target.checked) {
                        currentSelections[opcion.id] = parseInt(e.target.value);
                        updateQuote();
                    }
                });
            });
            dynamicOptionsContainer.appendChild(optionWrapper);
        });
    }

    /**
     * Calcula el precio total basado en las selecciones y actualiza el resumen.
     */
    function updateQuote() {
        let totalPrice = 0;
        let breakdownHTML = '';
        for (const opcionId in currentSelections) {
            const variacionId = currentSelections[opcionId];
            const opcion = selectedService.opciones.find(o => o.id == opcionId);
            const variacion = opcion.variaciones.find(v => v.id == variacionId);
            if (variacion) {
                totalPrice += parseFloat(variacion.precio);
                breakdownHTML += `<div class="d-flex justify-content-between small mt-2"><span>${opcion.nombre}: ${variacion.nombre}</span><span>${parseFloat(variacion.precio).toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })}</span></div>`;
            }
        }
        finalQuote = {
            price: totalPrice,
            breakdownHTML: `<div class="text-center"><p class="text-muted mb-1">Total Estimado</p><h4 class="fw-bold text-primary mb-3">${totalPrice.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })}</h4></div><hr class="my-3">${breakdownHTML}`
        };
        quoteSummaryContainer.innerHTML = `${finalQuote.breakdownHTML}<div class="d-grid mt-4"><button id="agendar-ahora-btn" class="btn btn-primary btn-lg">Agendar Ahora</button></div>`;
    }

    // --- 6. LÓGICA DEL MODAL DE AGENDAMIENTO ---

    /**
     * Se ejecuta al hacer clic en "Agendar Ahora".
     * Revisa si el usuario está logueado y abre el modal correspondiente.
     */
    function handleAgendarAhora() {
        if (localStorage.getItem('authToken')) {
            resetBookingState();
            updateModalUI();
            fetchAvailability();
            bookingModal.show();
        } else {
            new bootstrap.Modal(document.getElementById('authModal')).show();
        }
    }
    
    /**
     * Pide las fechas disponibles a la API y las muestra en el modal.
     */
    async function fetchAvailability() {
        dateSlotsContainer.innerHTML = `<div class="text-center p-5"><div class="spinner-border text-primary"></div><p class="mt-2 text-muted">Cargando fechas...</p></div>`;
        try {
            const response = await fetch('http://localhost:3000/api/disponibilidad');
            if (!response.ok) throw new Error('No se pudo cargar la disponibilidad.');
            bookingState.availableSlots = (await response.json()).map(iso => new Date(iso));
            dateSlotsContainer.innerHTML = '';
            if (bookingState.availableSlots.length === 0) {
                dateSlotsContainer.innerHTML = '<p class="text-muted text-center">No hay fechas disponibles.</p>';
                return;
            }
            const slotsByDay = bookingState.availableSlots.reduce((acc, date) => {
                const dayString = date.toISOString().split('T')[0];
                if (!acc[dayString]) acc[dayString] = [];
                acc[dayString].push(date);
                return acc;
            }, {});
            for (const dayString in slotsByDay) {
                const date = new Date(dayString + 'T05:00:00Z'); // Corregir timezone para parseo
                const button = document.createElement('button');
                button.className = 'date-slot';
                button.textContent = date.toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short' });
                button.dataset.dayString = dayString;
                dateSlotsContainer.appendChild(button);
            }
        } catch (error) {
            dateSlotsContainer.innerHTML = `<p class="text-danger text-center">${error.message}</p>`;
        }
    }

    /**
     * Se ejecuta al seleccionar una fecha, muestra TODOS los horarios de ese día.
     */
    function handleDateSelection(button) {
        dateSlotsContainer.querySelectorAll('.date-slot').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        const dayString = button.dataset.dayString;
        bookingState.selectedDate = dayString;
        const timesForDate = bookingState.availableSlots.filter(date => date.toISOString().startsWith(dayString));
        timeSlotsContainer.innerHTML = '';
        timesForDate.forEach(date => {
            const timeButton = document.createElement('button');
            timeButton.className = 'time-slot';
            timeButton.textContent = date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true });
            timeButton.dataset.fullDateTime = date.toISOString();
            timeSlotsContainer.appendChild(timeButton);
        });
        bookingState.step = 2;
        updateModalUI();
    }
    
    /**
     * Se ejecuta al seleccionar una hora, muestra el formulario de datos.
     */
    async function handleTimeSelection(button) {
        timeSlotsContainer.querySelectorAll('.time-slot').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        bookingState.selectedTime = new Date(button.dataset.fullDateTime);
        await fetchAndRenderUserDetails();
        bookingState.step = 3;
        updateModalUI();
    }
    
    /**
     * Obtiene y muestra los datos del perfil del usuario en el paso 3.
     */
    async function fetchAndRenderUserDetails() {
        detailsContainer.innerHTML = '<div class="spinner-border text-primary" role="status"></div>';
        try {
            const response = await fetch('http://localhost:3000/api/cliente/perfil', { headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` } });
            if (!response.ok) throw new Error('No se pudo cargar tu perfil.');
            const profile = await response.json();
            let addressOptionsHTML = profile.direcciones.map(dir => `<option value="${dir.id}">${dir.direccion_calle}, ${dir.ciudad}</option>`).join('');
            detailsContainer.innerHTML = `<p><strong>Nombre:</strong> ${profile.nombre_completo}</p><p><strong>Email:</strong> ${profile.email}</p><div class="mb-3"><label for="address-select" class="form-label">Selecciona una dirección:</label><select class="form-select" id="address-select"><option value="">Selecciona...</option>${addressOptionsHTML}<option value="new">-- Añadir una nueva dirección --</option></select></div><div id="new-address-container"></div>`;
            document.getElementById('address-select').addEventListener('change', e => {
                if (e.target.value === 'new') {
                    renderNewAddressForm(document.getElementById('new-address-container'));
                    bookingState.selectedAddressId = null;
                } else {
                    document.getElementById('new-address-container').innerHTML = '';
                    bookingState.selectedAddressId = parseInt(e.target.value);
                }
            });
        } catch (error) {
            detailsContainer.innerHTML = `<p class="text-danger">${error.message}</p>`;
        }
    }

    /**
     * Dibuja el formulario para añadir una dirección nueva.
     */
    function renderNewAddressForm(container) {
        container.innerHTML = `<form id="new-address-form" class="mt-3 border p-3 rounded"><h6 class="fw-bold small">Nueva Dirección</h6><div class="mb-2"><label for="direccion_calle" class="form-label small">Dirección</label><input type="text" id="direccion_calle" class="form-control" required></div><div class="mb-2"><label for="ciudad" class="form-label small">Ciudad</label><input type="text" id="ciudad" class="form-control" required></div><div class="mb-3"><label for="detalles" class="form-label small">Detalles</label><input type="text" id="detalles" class="form-control"></div><button type="submit" class="btn btn-sm btn-success">Guardar Dirección</button></form>`;
        document.getElementById('new-address-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const newAddress = { direccion_calle: document.getElementById('direccion_calle').value, ciudad: document.getElementById('ciudad').value, detalles: document.getElementById('detalles').value };
            try {
                const response = await fetch('http://localhost:3000/api/cliente/direcciones', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('authToken')}` },
                    body: JSON.stringify(newAddress)
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.message);
                const addressSelect = document.getElementById('address-select');
                const newOption = new Option(`${newAddress.direccion_calle}, ${newAddress.ciudad}`, data.id, true, true);
                addressSelect.insertBefore(newOption, addressSelect.querySelector('option[value="new"]'));
                bookingState.selectedAddressId = data.id;
                container.innerHTML = '<p class="text-success small mt-2">✓ Dirección guardada.</p>';
            } catch (error) {
                container.innerHTML = `<p class="text-danger small mt-2">${error.message}</p>`;
            }
        });
    }

    /**
     * Navega entre los pasos del modal.
     */
    function handleNextStep() {
        if (bookingState.step === 3) {
            if (!bookingState.selectedAddressId || !bookingState.selectedTime) {
                alert('Por favor, selecciona una dirección para continuar.');
                return;
            }
            submitBooking();
        }
    }
    
    function handlePrevStep() {
        if (bookingState.step > 1) {
            bookingState.step--;
            updateModalUI();
        }
    }
    
    /**
     * Envía la cita final al backend.
     */
    async function submitBooking() {
        const token = localStorage.getItem('authToken');
        if (!token) {
            alert('Tu sesión ha expirado, por favor inicia sesión de nuevo.');
            return;
        }

        // --- CAMBIO CLAVE: Obtenemos el ID del usuario desde el token ---
        const user = parseJwt(token);
        if (!user || !user.id) {
            alert('Tu token de sesión es inválido. Por favor, inicia sesión de nuevo.');
            return;
        }

        // 1. Construimos el objeto de datos que nuestra API espera, AHORA INCLUYENDO EL usuario_id
        const citaData = {
            usuario_id: user.id, // <-- ID del usuario logueado
            direccion_id: bookingState.selectedAddressId,
            fecha_hora_cita: bookingState.selectedTime.toISOString().slice(0, 19).replace('T', ' '),
            precio_total: finalQuote.price,
            servicios: Object.keys(currentSelections).map(opcionId => {
                const variacionId = currentSelections[opcionId];
                const opcion = selectedService.opciones.find(o => o.id == opcionId);
                const variacion = opcion.variaciones.find(v => v.id == variacionId);
                return { 
                    id: selectedService.id,
                    cantidad: 1,
                    precio: variacion.precio
                };
            })
        };
        
        try {
            nextStepButton.disabled = true;
            nextStepButton.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Confirmando...';

            // 2. Hacemos la petición POST a la API para crear la cita
            const response = await fetch('http://localhost:3000/api/citas', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(citaData)
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            
            // 3. Si todo sale bien, cerramos el modal y mostramos un mensaje de éxito
            window.location.href = `confirmacion.html?id=${data.citaId}`;
            
        } catch (error) {
            console.error('Error al agendar la cita:', error);
            alert(`Hubo un error al agendar tu cita: ${error.message}`);
        } finally {
            nextStepButton.disabled = false;
            nextStepButton.textContent = 'Confirmar Cita';
        }
    }

    /**
     * @function parseJwt
     * @description Decodifica un token JWT para leer su contenido (payload).
     */
    function parseJwt(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(jsonPayload);
        } catch (e) {
            return null;
        }
    }
    
    /**
     * Muestra/oculta los divs de cada paso y actualiza los botones.
     */
    function updateModalUI() {
        document.getElementById('step-date').style.display = bookingState.step === 1 ? 'block' : 'none';
        document.getElementById('step-time').style.display = bookingState.step === 2 ? 'block' : 'none';
        document.getElementById('step-details').style.display = bookingState.step === 3 ? 'block' : 'none';
        prevStepButton.style.display = bookingState.step > 1 ? 'inline-block' : 'none';
        nextStepButton.textContent = bookingState.step === 3 ? 'Confirmar Cita' : 'Siguiente Paso';
        if (bookingState.step === 1) {
                if (bookingSummaryContainer) bookingSummaryContainer.innerHTML = finalQuote.breakdownHTML;
        }
    }
    
    function resetBookingState() {
        bookingState = { step: 1, availableSlots: [], selectedDate: null, selectedTime: null, selectedAddressId: null };
    }
});