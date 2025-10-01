const db = require('../config/db');

// CREATE: Función para crear una nueva cita
const createCita = async (req, res) => {
  // Obtenemos una conexión del pool para poder usar transacciones
    const connection = await db.getConnection(); 
    try {
    const { usuario_id, direccion_id, fecha_hora_cita, precio_total, servicios } = req.body;

    // --- Iniciamos una transacción ---
    // Esto asegura que si algo falla, todos los cambios se revierten.
    // O se guardan los datos en AMBAS tablas, o no se guarda nada.
    await connection.beginTransaction();

    // 1. Insertar la cita principal en la tabla `citas`
    const citaSql = 'INSERT INTO citas (usuario_id, direccion_id, fecha_hora_cita, precio_total) VALUES (?, ?, ?, ?)';
    const [citaResult] = await connection.query(citaSql, [usuario_id, direccion_id, fecha_hora_cita, precio_total]);
    const nuevaCitaId = citaResult.insertId;

    // 2. Insertar cada servicio de la cita en la tabla `citas_servicios`
    const serviciosPromises = servicios.map(servicio => {
        const servicioSql = 'INSERT INTO citas_servicios (cita_id, servicio_id, cantidad, precio_reserva) VALUES (?, ?, ?, ?)';
        return connection.query(servicioSql, [nuevaCitaId, servicio.id, servicio.cantidad, servicio.precio]);
    });
    
    await Promise.all(serviciosPromises); // Esperamos que todos los servicios se inserten

    // --- Confirmamos la transacción ---
    // Si llegamos aquí sin errores, guardamos todos los cambios permanentemente.
    await connection.commit();

    res.status(201).json({ id: nuevaCitaId, message: 'Cita creada exitosamente' });

    } catch (error) {
    // --- Revertimos la transacción ---
    // Si hubo cualquier error, deshacemos todos los cambios.
    await connection.rollback();
    console.error('Error al crear la cita:', error);
    res.status(500).json({ message: 'Error en el servidor al crear la cita' });
    } finally {
    // Liberamos la conexión para que pueda ser usada por otros
    connection.release();
    }
};

// READ (Admin): Función para obtener TODAS las citas
const getAllCitasAdmin = async (req, res) => {
    try {
        // Esta consulta es más compleja porque une varias tablas para obtener información útil
        const sql = `
            SELECT 
                c.id, c.fecha_hora_cita, c.precio_total, c.estado,
                u.nombre_completo AS cliente_nombre,
                d.direccion_calle AS direccion
            FROM citas c
            JOIN usuarios u ON c.usuario_id = u.id
            JOIN direcciones d ON c.direccion_id = d.id
            ORDER BY c.fecha_hora_cita DESC;
        `;
        const [citas] = await db.query(sql);
        res.json(citas);
    } catch (error) {
        console.error('Error al obtener las citas para admin:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

// READ (Cliente): Función para obtener las citas de UN solo usuario
const getCitasByUsuario = async (req, res) => {
    try {
        const { usuarioId } = req.params; // Obtenemos el ID del usuario de la URL
        const sql = 'SELECT * FROM citas WHERE usuario_id = ? ORDER BY fecha_hora_cita DESC';
        const [citas] = await db.query(sql, [usuarioId]);
        res.json(citas);
    } catch (error) {
        console.error('Error al obtener las citas del usuario:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

// UPDATE (Admin): Función para actualizar el estado de una cita
const updateCitaStatus = async (req, res) => {
    try {
        const { id } = req.params; // ID de la cita
        const { estado } = req.body; // Nuevo estado: "completada" o "cancelada"

        // Validamos que el estado sea uno de los permitidos
        if (!['completada', 'cancelada'].includes(estado)) {
            return res.status(400).json({ message: 'Estado no válido' });
        }

        const sql = 'UPDATE citas SET estado = ? WHERE id = ?';
        await db.query(sql, [estado, id]);

        res.json({ message: `Cita marcada como ${estado}` });
    } catch (error) {
        console.error('Error al actualizar el estado de la cita:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

// Exportamos todas las funciones
module.exports = {
    createCita,
    getAllCitasAdmin,
    getCitasByUsuario,
    updateCitaStatus
};