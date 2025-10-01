const express = require('express');

const app = express();
const PORT = 3000;

// --- Importar Rutas ---
const serviciosRoutes = require('./routes/serviciosRoutes'); 
const authRoutes = require('./routes/authRoutes');
const citasRoutes = require('./routes/citasRoutes');
const adminRoutes = require('./routes/adminRoutes');
const disponibilidadRoutes = require('./routes/disponibilidadRoutes');
const clienteRoutes = require('./routes/clienteRoutes');

// --- Middleware ---

app.use(express.json());

// --- Definición de Rutas ---
app.get('/api', (req, res) => {
    res.json({ message: '¡El servidor de YH Pure Zone está funcionando correctamente!' });
});

// Le decimos a la app que use el archivo de rutas de servicios
// para cualquier petición que empiece con '/api/servicios'
app.use('/api/servicios', serviciosRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/citas', citasRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/disponibilidad', disponibilidadRoutes);
app.use('/api/cliente', clienteRoutes);



// --- Iniciar el Servidor ---
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});