const db = require('../config/db');

const getAllCategorias = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT categorias.idcategoria, categorias.idestatus, estatus.nombre as ne, categorias.nombre, categorias.descripcion FROM categorias INNER JOIN estatus on categorias.idestatus=estatus.idestatus;');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const getCategoriaById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query('SELECT * FROM categorias WHERE idcategoria = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Categoria no encontrado' });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
const createCategoria = async (req, res) => {
  const { nombre, descripcion, idestatus = 1 } = req.body;

  if (!nombre || typeof nombre !== 'string' || nombre.trim() === '') {
    return res.status(400).json({ error: 'El campo nombre es requerido y debe ser una cadena válida' });
  }

  if (![1, 2].includes(Number(idestatus))) {
    return res.status(400).json({ error: 'El campo idestatus debe ser 1 (Activo) o 2 (Inactivo)' });
  }

  try {
    // Verificar existencia con EXISTS para mejor performance
    const [existsResult] = await db.query(
      'SELECT EXISTS (SELECT 1 FROM categorias WHERE nombre = ?) AS existe',
      [nombre.trim()]
    );

    if (existsResult[0].existe) {
      return res.status(400).json({ error: 'El nombre de categoría ya existe' });
    }

    const [result] = await db.query(
      'INSERT INTO categorias (nombre, descripcion, idestatus) VALUES (?, ?, ?)',
      [nombre.trim(), descripcion || null, idestatus]
    );

    res.status(201).json({
      id: result.insertId,
      nombre: nombre.trim(),
      descripcion,
      idestatus,
    });
  } catch (err) {
    // Manejar error de duplicado si ocurre en inserción por concurrencia
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'El nombre de categoría ya existe' });
    }
    res.status(500).json({ error: err.message });
  }
};

const updateCategoria = async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, idestatus } = req.body;

  if (!id || isNaN(Number(id))) {
    return res.status(400).json({ error: 'Id inválido' });
  }

  if (nombre !== undefined) {
    if (typeof nombre !== 'string' || nombre.trim() === '') {
      return res.status(400).json({ error: 'El campo nombre debe ser una cadena válida' });
    }
  }

  if (idestatus !== undefined) {
    if (![1, 2].includes(Number(idestatus))) {
      return res.status(400).json({ error: 'El campo idestatus debe ser 1 (Activo) o 2 (Inactivo)' });
    }
  }

  try {
    if (nombre) {
      // Validar que no exista otra categoría con el mismo nombre distinto al id actual
      const [existsResult] = await db.query(
        'SELECT EXISTS (SELECT 1 FROM categorias WHERE nombre = ? AND idcategoria != ?) AS existe',
        [nombre.trim(), id]
      );

      if (existsResult[0].existe) {
        return res.status(400).json({ error: 'El nombre de categoría ya existe' });
      }
    }

    // Construir consulta dinámica para actualizar sólo campos que vienen
    const fields = [];
    const values = [];

    if (nombre !== undefined) {
      fields.push('nombre = ?');
      values.push(nombre.trim());
    }
    if (descripcion !== undefined) {
      fields.push('descripcion = ?');
      values.push(descripcion);
    }
    if (idestatus !== undefined) {
      fields.push('idestatus = ?');
      values.push(idestatus);
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No se proporcionaron campos para actualizar' });
    }

    values.push(id);

    const sql = `UPDATE categorias SET ${fields.join(', ')} WHERE idcategoria = ?`;

    const [result] = await db.query(sql, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    res.status(200).json({ message: 'Categoría actualizada correctamente' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'El nombre de categoría ya existe' });
    }
    res.status(500).json({ error: err.message });
  }
};

const deleteCategoria = async (req, res) => {
  const { id } = req.params;
  if (!id || isNaN(Number(id))) {
    return res.status(400).json({ error: 'Id inválido' });
  }
  try {
    const [result] = await db.query('DELETE FROM categorias WHERE idcategoria = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }
    res.status(200).json({ message: 'Categoría eliminada correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getAllCategorias,
  getCategoriaById, 
  createCategoria,
  updateCategoria,
  deleteCategoria

};

/*
EXISTS solo verifica si existe al menos una fila que cumple la condición, y el motor de la base de datos deja de buscar tan pronto la encuentra, por lo que es más rápida en casos donde solo interesa confirmar existencia y no traer datos completos.

La subconsulta con SELECT 1 es semánticamente clara: no se retornan columnas ni datos, solo se evalúa si hay filas que cumplen la condición.

En cambio, SELECT * recupera todas las columnas de las filas que cumplen la condición, lo que puede implicar más trabajo de lectura y transferencia de datos aunque se use en una subconsulta.

En términos de optimización, la diferencia puede ser pequeña o nula en bases de datos modernas, pero es una buena práctica usar EXISTS con SELECT 1 para claridad y potencialmente mejor rendimiento en consultas grandes o complejas.

Por tanto, el uso de SELECT EXISTS (SELECT 1 ...) es recomendable para verificar existencia porque es más eficiente y expresivo que SELECT * que recupera datos completos


*/