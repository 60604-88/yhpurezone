const db = require('../config/db');

// Función para obtener todos los usuarios con el rol 'cliente'
const getAllClientes = async (req, res) => {
    try {
        // Seleccionamos solo los campos necesarios para no exponer datos sensibles como el hash de la contraseña.
        const sql = "SELECT id, nombre_completo, email, telefono, fecha_creacion FROM usuarios WHERE rol = 'cliente' ORDER BY fecha_creacion DESC";
        
        const [clientes] = await db.query(sql);
        
        res.json(clientes);
    } catch (error) {
        console.error('Error al obtener los clientes:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

// Función para que el admin cree una cita para un cliente
const createCitaAdmin = async (req, res) => {
    const connection = await db.getConnection(); 
    try {
    const { usuario_id, direccion_id, fecha_hora_cita, precio_total, servicios } = req.body;

    await connection.beginTransaction();

    // 1. Insertar la cita principal
    const citaSql = 'INSERT INTO citas (usuario_id, direccion_id, fecha_hora_cita, precio_total) VALUES (?, ?, ?, ?)';
    const [citaResult] = await connection.query(citaSql, [usuario_id, direccion_id, fecha_hora_cita, precio_total]);
    const nuevaCitaId = citaResult.insertId;

    // 2. Insertar los servicios asociados a la cita
    const serviciosPromises = servicios.map(servicio => {
        const servicioSql = 'INSERT INTO citas_servicios (cita_id, servicio_id, cantidad, precio_reserva) VALUES (?, ?, ?, ?)';
        return connection.query(servicioSql, [nuevaCitaId, servicio.id, servicio.cantidad, servicio.precio]);
    });
    await Promise.all(serviciosPromises);

    await connection.commit();
    res.status(201).json({ id: nuevaCitaId, message: 'Cita creada exitosamente por el administrador' });

    } catch (error) {
    await connection.rollback();
    console.error('Error al crear la cita por admin:', error);
    res.status(500).json({ message: 'Error en el servidor al crear la cita' });
    } finally {
    connection.release();
    }
};

// FUNCIONES CREATE, UPDATE AND DELETE

// CREATE: Función para crear un nuevo servicio
const createServicio = async (req, res) => {
    try {
    const { nombre, precio_base, modelo_precio, nombre_unidad } = req.body;
    const sql = 'INSERT INTO servicios (nombre, precio_base, modelo_precio, nombre_unidad) VALUES (?, ?, ?, ?)';
    const [result] = await db.query(sql, [nombre, precio_base, modelo_precio, nombre_unidad]);
    res.status(201).json({ id: result.insertId, message: 'Servicio creado exitosamente' });
    } catch (error) {
    console.error('Error al crear el servicio:', error);
    res.status(500).json({ message: 'Error en el servidor' });
    }
};

// UPDATE: Función para actualizar un servicio existente
const updateServicio = async (req, res) => {
    try {
    const { id } = req.params; // Obtenemos el ID de la URL
    const { nombre, precio_base, modelo_precio, nombre_unidad } = req.body;
    const sql = 'UPDATE servicios SET nombre = ?, precio_base = ?, modelo_precio = ?, nombre_unidad = ? WHERE id = ?';
    await db.query(sql, [nombre, precio_base, modelo_precio, nombre_unidad, id]);
    res.json({ message: 'Servicio actualizado exitosamente' });
    } catch (error) {
    console.error('Error al actualizar el servicio:', error);
    res.status(500).json({ message: 'Error en el servidor' });
    }
};

// DELETE: Función para "eliminar" un servicio (lo marcaremos como inactivo)
const deleteServicio = async (req, res) => {
    try {
    const { id } = req.params; // Obtenemos el ID de la URL
    // Buena práctica: en lugar de borrar, inactivamos el servicio.
    const sql = 'UPDATE servicios SET esta_activo = FALSE WHERE id = ?';
    await db.query(sql, [id]);
    res.json({ message: 'Servicio desactivado exitosamente' });
    } catch (error) {
    console.error('Error al desactivar el servicio:', error);
    res.status(500).json({ message: 'Error en el servidor' });
    }
};


module.exports = {
    getAllClientes,
    createCitaAdmin,
    createServicio,
    updateServicio,
    deleteServicio,
}; 