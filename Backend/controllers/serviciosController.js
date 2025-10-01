// Importamos la conexión a la base de datos
const db = require('../config/db');

// READ: Función para obtener todos los servicios (la única que queda aquí)
const getAllServicios = async (req, res) => {
    try {
    const [rows] = await db.query('SELECT * FROM servicios WHERE esta_activo = TRUE');
    res.json(rows);
    } catch (error) {
    console.error('Error al obtener los servicios:', error);
    res.status(500).json({ message: 'Error en el servidor' });
    }
};

module.exports = {
    getAllServicios,
};