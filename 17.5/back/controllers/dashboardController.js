const db = require('../config/db');

const getDashboardData = async (req, res) => {
  try {
    // 1. Totales generales
    const [productosTotal] = await db.query('SELECT COUNT(*) AS total FROM productos');
    const [categoriasTotal] = await db.query('SELECT COUNT(*) AS total FROM categorias');
    const [usuariosTotal] = await db.query('SELECT COUNT(*) AS total FROM usuarios');

    // 2. Productos por estatus (1 = activo, 2 = inactivo)
    const [productosEstatus] = await db.query(`
      SELECT 
        SUM(CASE WHEN idestatus = 1 THEN 1 ELSE 0 END) AS activos,
        SUM(CASE WHEN idestatus = 2 THEN 1 ELSE 0 END) AS inactivos
      FROM productos
    `);

    // 3. Categorías por estatus
    const [categoriasEstatus] = await db.query(`
      SELECT 
        SUM(CASE WHEN idestatus = 1 THEN 1 ELSE 0 END) AS activas,
        SUM(CASE WHEN idestatus = 2 THEN 1 ELSE 0 END) AS inactivas
      FROM categorias
    `);

    // 4. Usuarios por rol (asumimos: 1=admin, 2=vendedor, 3=cliente)
    const [usuariosPorRol] = await db.query(`
      SELECT 
        SUM(CASE WHEN idrol = 1 THEN 1 ELSE 0 END) AS administrador,
        SUM(CASE WHEN idrol = 2 THEN 1 ELSE 0 END) AS vendedor,
        SUM(CASE WHEN idrol = 3 THEN 1 ELSE 0 END) AS cliente
      FROM usuarios
    `);

    // 5. Productos por categoría (solo categorías activas)
    const [productosPorCategoria] = await db.query(`
      SELECT 
        c.nombre AS categoria,
        COUNT(p.idproducto) AS total
      FROM categorias c
      LEFT JOIN productos p ON c.idcategoria = p.idcategoria AND p.idestatus = 1
      WHERE c.idestatus = 1
      GROUP BY c.idcategoria, c.nombre
      ORDER BY total DESC
    `);

    // Construir respuesta
    const dashboard = {
      totales: {
        productos: Number(productosTotal[0].total),
        categorias: Number(categoriasTotal[0].total),
        usuarios: Number(usuariosTotal[0].total)
      },
      productosPorEstatus: {
        activos: Number(productosEstatus[0].activos) || 0,
        inactivos: Number(productosEstatus[0].inactivos) || 0
      },
      categoriasPorEstatus: {
        activas: Number(categoriasEstatus[0].activas) || 0,
        inactivas: Number(categoriasEstatus[0].inactivas) || 0
      },
      usuariosPorRol: {
        administrador: Number(usuariosPorRol[0].administrador) || 0,
        vendedor: Number(usuariosPorRol[0].vendedor) || 0,
        cliente: Number(usuariosPorRol[0].cliente) || 0
      },
      productosPorCategoria: productosPorCategoria.map(item => ({
        categoria: item.categoria,
        total: Number(item.total)
      }))
    };

    res.json(dashboard);
  } catch (err) {
    console.error('Error en dashboard:', err);
    res.status(500).json({ error: 'Error al cargar datos del dashboard' });
  }
};

module.exports = { getDashboardData };