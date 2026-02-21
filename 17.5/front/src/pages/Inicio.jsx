
import { useEffect, useState } from "react";
import { Card } from 'primereact/card';
import { Chart } from 'primereact/chart';

const API = 'http://localhost:3000/api/dashboard';
const Inicio = () => {
    const [datos, setDatos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const getDatos = async () => {
      try {
          const response = await fetch(API);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          setDatos(data);
          setLoading(false);
          } catch (err) {
            setError(err.message);
            setLoading(false);
          }
      };
      useEffect(() => {
        getDatos();
    }, []);
    if (loading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p>Cargando Dashboard...</p>
            </div>
        );
    }
    if (error) {
        return (
            <div className="text-center py-5 text-danger">
                <h4>Error al cargar el dashboard</h4>
                <p>{error}</p>
            </div>
        );
    }
    // === Datos para gráficas ===
    const productosPorCategoriaData = {
        labels: datos.productosPorCategoria.map(item => item.categoria),
        datasets: [
            {
                label: 'Productos por Categoría',
                data: datos.productosPorCategoria.map(item => item.total),
                backgroundColor: [
                    '#42A5F5', '#66BB6A', '#FFA726', '#EF5350', '#AB47BC', '#26A69A'
                ],
                borderColor: '#ffffff',
                borderWidth: 1
            }
        ]
    };

    const usuariosPorRolData = {
        labels: ['Administradores', 'Vendedores', 'Clientes'],
        datasets: [
            {
                data: [
                    datos.usuariosPorRol.administrador,
                    datos.usuariosPorRol.vendedor,
                    datos.usuariosPorRol.cliente
                ],
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
                hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56']
            }
        ]
    };

    const basicOptions = {
        plugins: {
            legend: {
                labels: {
                    color: '#495057'
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    color: '#495057'
                },
                grid: {
                    color: '#ebedef'
                }
            },
            x: {
                ticks: {
                    color: '#495057'
                },
                grid: {
                    color: '#ebedef'
                }
            }
        }
    };

    const pieOptions = {
        plugins: {
            legend: {
                labels: {
                    color: '#495057'
                }
            }
        }
    };

  return (
      <div className="container">
            <h4 className="text-center py-5">Dashboard - Tienda 2025</h4>

            {/* Tarjetas resumen */}
            <div className="row">
                <div className="col-md-4">
                    <div  className="card bg-black mb-3 ">
                        <div className="card-header">
                            <h4 className="text-center py-3">Total Productos</h4>
                        </div>
                        <div className="card-body text-center">
                            <h3 className="text-2xl font-bold text-primary">{datos.totales.productos}</h3>
                            <div className="flex mt-2">
                                <span className="text-success mr-3">✓ Activos: {datos.productosPorEstatus.activos}</span>
                                <span className="text-danger mx-3">✗ Inactivos: {datos.productosPorEstatus.inactivos}</span>
                            </div>
                        </div>  
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="card bg-black mb-3">
                        <div className="card-header">
                            <h4 className="text-center py-3">Total Categorías</h4>
                        </div>
                        <div className="card-body text-center">
                          <h3 className="text-2xl font-bold text-primary">{datos.totales.categorias}</h3>
                          <div className="flex mt-2">
                            <span className="text-success">✓ Activas: {datos.categoriasPorEstatus.activas}</span>
                            <span className="text-danger mx-3">✗ Inactivos: {datos.categoriasPorEstatus.inactivas}</span>
                        </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="card bg-black mb-3">
                        <div className="card-header">
                            <h4 className="text-center py-3">Total Usuarios</h4>
                        </div>
                        <div className="card-body text-center">
                          <h3 className="text-2xl font-bold text-primary">{datos.totales.usuarios}</h3>
                          <div className="flex flex-wrap mt-2">
                              <span className="text-info mx-1">Admin: {datos.usuariosPorRol.administrador}</span>
                              <span className="text-warning mx-3">Vend: {datos.usuariosPorRol.vendedor}</span>
                              <span className="text-secondary">Cli: {datos.usuariosPorRol.cliente}</span>
                          </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Gráficas */}
            <div className="row mt-4">
                <div className="col-md-6">
                  <div className="card bg-black h-100 p-2">
                        <p className="text-center py-3">Productos por Categoría</p>
                        <Chart 
                            type="bar" 
                            data={productosPorCategoriaData} 
                            options={basicOptions} 
                            style={{ height: '300px' }} 
                        />
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="card bg-black h-100 p-2 ">
                      <p className="text-center py-3">Usuarios por Rol</p>
                      <div className="d-flex justify-content-center align-content-center">
                        <Chart 
                            type="pie" 
                            data={usuariosPorRolData} 
                            options={pieOptions} 
                            style={{ width: '250px', height: '250px' }} 
                        />
                      </div>
                  </div> 
                </div>
            </div>
        </div>

  )
}

export default Inicio