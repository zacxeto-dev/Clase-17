const express = require('express');
const router = express.Router();

const {
  getAllCategorias,
  getCategoriaById,
  createCategoria, 
  updateCategoria,
  deleteCategoria  
} = require('../controllers/categoriaController');

// Ruta para obtener todos los géneros
router.get('/', getAllCategorias);

// Ruta para obtener un género por ID 👇
router.get('/:id', getCategoriaById);

// Ruta para crear un nuevo género
router.post('/', createCategoria);

// Ruta para actualizar un género existente
router.put('/:id', updateCategoria);

// Ruta para eliminar un género
router.delete('/:id', deleteCategoria);

module.exports = router;