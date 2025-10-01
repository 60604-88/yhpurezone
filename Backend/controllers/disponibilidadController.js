const db = require('../config/db');
const { startOfDay, endOfDay, addDays, addHours, format } = require('date-fns');

// ADMIN: Función para bloquear un rango de fechas/horas
const bloquearHorario = async (req, res) => {
    try {
        const { fecha_hora_inicio, fecha_hora_fin, motivo } = req.body;
        const sql = 'INSERT INTO bloqueos_disponibilidad (fecha_hora_inicio, fecha_hora_fin, motivo) VALUES (?, ?, ?)';
        await db.query(sql, [fecha_hora_inicio, fecha_hora_fin, motivo]);
        res.status(201).json({ message: 'Horario bloqueado exitosamente' });
    } catch (error) {
        console.error('Error al bloquear el horario:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

// PÚBLICO: Función para obtener los horarios disponibles
const getDisponibilidad = async (req, res) => {
    try {
        // --- 1. Definir las reglas del negocio ---
        const hoy = new Date();
        const rangoBusquedaDias = 30; // Mostraremos disponibilidad para los próximos 30 días
        const duracionCitaHoras = 2; // Asumimos que cada cita dura 2 horas
        const horariosTrabajo = {
            inicio: 8, // 8 AM
            fin: 18    // 6 PM
        };

        // --- 2. Obtener todas las citas y bloqueos existentes ---
        const fechaInicioBusqueda = format(startOfDay(hoy), 'yyyy-MM-dd HH:mm:ss');
        const fechaFinBusqueda = format(endOfDay(addDays(hoy, rangoBusquedaDias)), 'yyyy-MM-dd HH:mm:ss');

        const [citas] = await db.query('SELECT fecha_hora_cita FROM citas WHERE estado = "confirmada" AND fecha_hora_cita BETWEEN ? AND ?', [fechaInicioBusqueda, fechaFinBusqueda]);
        const [bloqueos] = await db.query('SELECT fecha_hora_inicio, fecha_hora_fin FROM bloqueos_disponibilidad WHERE fecha_hora_fin >= ?', [fechaInicioBusqueda]);
        
        const horariosOcupados = new Set(citas.map(cita => new Date(cita.fecha_hora_cita).getTime()));

        // --- 3. Generar todos los slots posibles y filtrarlos ---
        let slotsDisponibles = [];
        for (let i = 0; i < rangoBusquedaDias; i++) {
            let diaActual = addDays(hoy, i);
            let diaSemana = diaActual.getDay(); // 0=Domingo, 6=Sábado

            // No trabajamos los domingos
            if (diaSemana === 0) continue;

            for (let hora = horariosTrabajo.inicio; hora < horariosTrabajo.fin; hora += duracionCitaHoras) {
                let slotActual = new Date(diaActual.getFullYear(), diaActual.getMonth(), diaActual.getDate(), hora);

                // Omitir slots en el pasado
                if (slotActual < hoy) continue;
                
                // Verificar si el slot está ocupado por una cita
                if (horariosOcupados.has(slotActual.getTime())) continue;

                // Verificar si el slot choca con un bloqueo del admin
                let estaBloqueado = bloqueos.some(bloqueo => 
                    slotActual >= new Date(bloqueo.fecha_hora_inicio) && slotActual < new Date(bloqueo.fecha_hora_fin)
                );
                if (estaBloqueado) continue;

                // Si pasa todos los filtros, es un slot disponible
                slotsDisponibles.push(format(slotActual, 'yyyy-MM-dd HH:mm:ss'));
            }
        }
        
        res.json(slotsDisponibles);
    } catch (error) {
        console.error('Error al obtener la disponibilidad:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

module.exports = {
    bloquearHorario,
    getDisponibilidad
};