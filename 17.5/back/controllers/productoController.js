const db = require('../config/db');

const getAllProductos = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM productos');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getProductosPaginados = async (req, res, pageStr, limitStr) => {
  // Convertir y validar
  let page = parseInt(pageStr, 10);
  let limit = parseInt(limitStr, 10);

  if (isNaN(page) || page < 1) page = 1;
  if (isNaN(limit) || limit < 1 || limit > 100) limit = 10;

  const offset = (page - 1) * limit;

  try {
    const [productos] = await db.query(
      'SELECT * FROM productos ORDER BY idproducto LIMIT ? OFFSET ?',
      [limit, offset]
    );

    const [[{ total }]] = await db.query('SELECT COUNT(*) AS total FROM productos');
    const totalPages = Math.ceil(total / limit);

    res.json({
      totalItems: total,
      totalPages,
      currentPage: page,
      productos,
    });
  } catch (err) {
    console.error('Error en paginación:', err);
    res.status(500).json({ error: err.message });
  }
};


const getProductoById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query('SELECT * FROM productos WHERE idproducto = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createProducto = async (req, res) => {
  const { idestatus = 1, idcategoria, nombre, precio, stock,  descripcion } = req.body;

  if (!idcategoria || isNaN(Number(idcategoria))) {
    return res.status(400).json({ error: 'El campo idcategoria es requerido y debe ser un número válido' });
  }

  if (!nombre || typeof nombre !== 'string' || nombre.trim() === '') {
    return res.status(400).json({ error: 'El campo nombre es requerido y debe ser una cadena válida' });
  }

  if (precio !== undefined && isNaN(Number(precio))) {
    return res.status(400).json({ error: 'El campo precio debe ser un número válido' });
  }

  if (stock !== undefined && isNaN(Number(stock))) {
    return res.status(400).json({ error: 'El campo stock debe ser un número válido' });
  }

  if (![1, 2].includes(Number(idestatus))) {
    return res.status(400).json({ error: 'El campo idestatus debe ser 1 (Activo) o 2 (Inactivo)' });
  }

  try {
    const imagen = req.file ? req.file.filename : null;
    const [result] = await db.query(
      `INSERT INTO productos (idestatus, idcategoria, nombre, precio, stock, imagen, descripcion) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [idestatus, idcategoria, nombre.trim(), precio || null, stock || null, imagen || null, descripcion || null]
    );

    res.status(201).json({
      idproducto: result.insertId,
      idestatus,
      idcategoria,
      nombre: nombre.trim(),
      precio,
      stock,
      imagen,
      descripcion,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateProducto = async (req, res) => {
    const { id } = req.params;
    const { idestatus, idcategoria, nombre, precio, stock, descripcion } = req.body;

    // Validaciones...
    if (!id || isNaN(Number(id))) {
        return res.status(400).json({ error: 'Id inválido' });
    }

    try {
        // Manejar imagen si se subió
        let imagen = null;
        if (req.file) {
            // Nueva imagen subida
            imagen = req.file.filename;
        }
        // Si no hay req.file, no actualizamos el campo 'imagen'

        const fields = [];
        const values = [];

        if (idestatus !== undefined) {
            fields.push('idestatus = ?');
            values.push(idestatus);
        }
        if (idcategoria !== undefined) {
            fields.push('idcategoria = ?');
            values.push(idcategoria);
        }
        if (nombre !== undefined) {
            fields.push('nombre = ?');
            values.push(nombre.trim());
        }
        if (precio !== undefined) {
            fields.push('precio = ?');
            values.push(precio);
        }
        if (stock !== undefined) {
            fields.push('stock = ?');
            values.push(stock);
        }
        if (descripcion !== undefined) {
            fields.push('descripcion = ?');
            values.push(descripcion);
        }
        if (imagen !== null) { // Solo si se subió una nueva imagen
            fields.push('imagen = ?');
            values.push(imagen);
        }

        if (fields.length === 0) {
            return res.status(400).json({ error: 'No se proporcionaron campos para actualizar' });
        }

        values.push(id);
        const sql = `UPDATE productos SET ${fields.join(', ')} WHERE idproducto = ?`;
        const [result] = await db.query(sql, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        // Devolver el producto actualizado
        const [rows] = await db.query('SELECT * FROM productos WHERE idproducto = ?', [id]);
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const deleteProducto = async (req, res) => {
  const { id } = req.params;
  if (!id || isNaN(Number(id))) {
    return res.status(400).json({ error: 'Id inválido' });
  }
  try {
    const [result] = await db.query('DELETE FROM productos WHERE idproducto = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.status(200).json({ message: 'Producto eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getAllProductos,
  getProductoById,
  getProductosPaginados,
  createProducto,
  updateProducto,
  deleteProducto
};
