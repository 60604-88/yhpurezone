const express = require('express');
const router = express.Router();

const { protect, isAdmin } = require('../middleware/authMiddleware');
const { bloquearHorario } = require('../controllers/disponibilidadController');
// funciones del adminController
const { getAllClientes, createCitaAdmin, createServicio, updateServicio, deleteServicio} = require('../controllers/adminController');

// --- Rutas de Disponibilidad ---
router.post('/disponibilidad/bloquear', protect, isAdmin, bloquearHorario);

// --- Rutas de Clientes ---
router.get('/clientes', protect, isAdmin, getAllClientes);

// --- RUTA DE CITAS ---
router.post('/citas', protect, isAdmin, createCitaAdmin);

// ---RUTA DE CREAR SERVICIOS---
router.post('/servicios', protect, isAdmin, createServicio);

// ---RUTA DE ACTUALIZAR SERVICIOS---
router.put('/servicios/:id', protect, isAdmin, updateServicio);

// ---RUTA DE ELIMINAR SERVICIOS---
router.delete('/servicios/:id', protect, isAdmin, deleteServicio);
module.exports = router;