const express = require('express');
const router = express.Router();

// 👉 IMPORTA MULTER Y CONFIGÚRALO AQUÍ
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '..', 'public', 'img'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Solo se permiten imágenes'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// Importa controladores
const {
  getAllProductos,
  getProductoById,
  getProductosPaginados,
  createProducto,
  updateProducto,
  deleteProducto
} = require('../controllers/productoController');

// Rutas
router.get('/', getAllProductos);
router.get('/:id', getProductoById);
router.get('/pagina/:page', (req, res) => {
    const page = req.params.page;
    const limit = req.query.limit;
    getProductosPaginados(req, res, page, limit);
});

// 👉 Usa upload.single('imagen') en la ruta de creación
router.post('/', upload.single('imagen'), createProducto);

router.put('/:id', upload.single('imagen'), updateProducto);
router.delete('/:id', deleteProducto);

module.exports = router;