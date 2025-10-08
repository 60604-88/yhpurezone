const db = require('../config/db');

// Función para que un usuario obtenga su propio perfil
const getMiPerfil = async (req, res) => {
    try {
        // Gracias al middleware 'protect', ya tenemos la info del usuario en req.usuario
        const usuarioId = req.usuario.id;

        // 1. Buscamos los datos del usuario (sin la contraseña)
        const [usuarioRows] = await db.query(
            "SELECT id, nombre_completo, email, telefono FROM usuarios WHERE id = ?", 
            [usuarioId]
        );

        if (usuarioRows.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // 2. Buscamos las direcciones asociadas a ese usuario
        const [direccionesRows] = await db.query("SELECT * FROM direcciones WHERE usuario_id = ?", [usuarioId]);

        // 3. Combinamos la información y la enviamos
        const perfil = {
            ...usuarioRows[0],
            direcciones: direccionesRows
        };

        res.json(perfil);

    } catch (error) {
        console.error('Error al obtener el perfil del cliente:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

// Función para que un usuario actualice su propio perfil (nombre y teléfono)
const updateMiPerfil = async (req, res) => {
    try {
        const usuarioId = req.usuario.id;
        const { nombre_completo, telefono } = req.body;

        // Validamos que al menos uno de los campos venga en la petición
        if (!nombre_completo && !telefono) {
            return res.status(400).json({ message: 'Se requiere al menos un campo para actualizar' });
        }

        const sql = 'UPDATE usuarios SET nombre_completo = ?, telefono = ? WHERE id = ?';
        await db.query(sql, [nombre_completo, telefono, usuarioId]);

        res.json({ message: 'Perfil actualizado exitosamente' });

    } catch (error) {
        console.error('Error al actualizar el perfil del cliente:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

// Función para que un cliente cancele una de sus propias citas
const cancelarMiCita = async (req, res) => {
    try {
        const usuarioId = req.usuario.id; // ID del usuario logueado (viene del token)
        const { id: citaId } = req.params; // ID de la cita que se quiere cancelar (viene de la URL)

        // 1. Verificación de seguridad: ¿Existe la cita Y pertenece al usuario logueado?
        const [citas] = await db.query(
            'SELECT * FROM citas WHERE id = ? AND usuario_id = ?',
            [citaId, usuarioId]
        );

        if (citas.length === 0) {
            return res.status(404).json({ message: 'Cita no encontrada o no tienes permiso para cancelarla' });
        }

        // 2. Si la cita existe y le pertenece, la actualizamos a 'cancelada'
        await db.query("UPDATE citas SET estado = 'cancelada' WHERE id = ?", [citaId]);

        res.json({ message: 'Cita cancelada exitosamente' });

    } catch (error) {
        console.error('Error al cancelar la cita:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

// Función para que un cliente añada una nueva dirección
const addMiDireccion = async (req, res) => {
    try {
        const usuarioId = req.usuario.id; // ID del usuario logueado
        const { direccion_calle, ciudad, detalles } = req.body;

        if (!direccion_calle || !ciudad) {
            return res.status(400).json({ message: 'La calle y la ciudad son campos requeridos' });
        }

        const sql = 'INSERT INTO direcciones (usuario_id, direccion_calle, ciudad, detalles) VALUES (?, ?, ?, ?)';
        const [result] = await db.query(sql, [usuarioId, direccion_calle, ciudad, detalles || null]);

        res.status(201).json({ id: result.insertId, message: 'Dirección añadida exitosamente' });

    } catch (error) {
        console.error('Error al añadir la dirección:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

module.exports = {
    getMiPerfil,
    updateMiPerfil,
    cancelarMiCita,
    addMiDireccion
};