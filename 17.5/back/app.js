// ============================================================
// 1. IMPORTACIONES
// ============================================================
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./config/db');

// 👉 IMPORTA MULTER AQUÍ (al inicio)
const multer = require('multer');

// ============================================================
// 2. INICIALIZACIÓN
// ============================================================
const app = express();
const PORT = process.env.PORT || 3000;

// ============================================================
// 3. CONFIGURACIÓN DE MULTER (solo si lo usas globalmente)
//    Pero mejor: usa multer en las rutas específicas (recomendado)
//    Por ahora, lo quitamos de aquí y lo movemos a productoRoutes.js
// ============================================================

// ============================================================
// 4. MIDDLEWARES GENERALES
// ============================================================
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ============================================================
// 5. RUTAS
// ============================================================
app.get('/', (req, res) => {
    res.send('¡Servidor funcionando correctamente con nodemon!');
});

// Importa y usa rutas
const categoriaRoutes = require('./routes/categoriaRoutes');
const productoRoutes = require('./routes/productoRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

app.use('/api/categorias', categoriaRoutes);
app.use('/api/productos', productoRoutes); 
app.use('/api/dashboard', dashboardRoutes);

// ============================================================
// 6. MIDDLEWARE DE MANEJO DE ERRORES (¡AL FINAL!)
// ============================================================
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: 'Error al subir el archivo' });
    }
    console.error('Error no manejado:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
});

// ============================================================
// 7. CONEXIÓN A BD Y SERVIDOR
// ============================================================
db.getConnection()
    .then(conn => {
        console.log('✅ Conexión a MySQL exitosa!');
        conn.release();
    })
    .catch(err => {
        console.error('❌ Error de conexión a MySQL:', err);
    });

app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});