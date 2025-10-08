const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/authMiddleware');
const { getMiPerfil, updateMiPerfil, cancelarMiCita, addMiDireccion } = require('../controllers/clienteController');

// Ruta para obtener el perfil del usuario logueado
router.get('/perfil', protect, getMiPerfil);

// Ruta para actualizar el perfil del usuario logueado
router.put('/perfil', protect, updateMiPerfil);

// Ruta para cancelar una cita
router.put('/citas/:id/cancelar', protect, cancelarMiCita);

// Ruta para agregar una dirección
router.post('/direcciones', protect, addMiDireccion);

module.exports = router;