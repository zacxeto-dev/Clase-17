
import React, { useRef } from 'react';
import { useEffect, useState } from "react";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { InputTextarea } from 'primereact/inputtextarea';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';

const API_PRODUCTOS = 'http://localhost:3000/api/productos';
const API_CATEGORIAS = 'http://localhost:3000/api/categorias';

const Productos = () => {
    const [productos, setProductos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [globalFilter, setGlobalFilter] = useState('');

    // Modal crear
    const [modalVisible, setModalVisible] = useState(false);
    const [nombre, setNombre] = useState('');
    const [idcategoria, setIdCategoria] = useState('');
    const [precio, setPrecio] = useState('');
    const [stock, setStock] = useState('');
    const [imagenFile, setImagenFile] = useState(null);
    const [descripcion, setDescripcion] = useState('');
    const [estatus, setEstatus] = useState(1);
    const [submitting, setSubmitting] = useState(false);

    // Modal editar
    const [editarModalVisible, setEditarModalVisible] = useState(false);
    const [productoEditando, setProductoEditando] = useState(null);
    const [nombreEdit, setNombreEdit] = useState('');
    const [idcategoriaEdit, setIdCategoriaEdit] = useState('');
    const [precioEdit, setPrecioEdit] = useState('');
    const [stockEdit, setStockEdit] = useState('');
    const [descripcionEdit, setDescripcionEdit] = useState('');
    const [estatusEdit, setEstatusEdit] = useState(1);
    const [nuevaImagen, setNuevaImagen] = useState(null); 
    const [urlImagenActual, setUrlImagenActual] = useState(''); 
    const [editando, setEditando] = useState(false);

    const toast = useRef(null);

    // Cargar productos y categorías
    const getDatos = async () => {
        try {
            const [productosRes, categoriasRes] = await Promise.all([
                fetch(API_PRODUCTOS),
                fetch(API_CATEGORIAS)
            ]);

            if (!productosRes.ok || !categoriasRes.ok) {
                throw new Error('Error al cargar datos');
            }

            const productosData = await productosRes.json();
            const categoriasData = await categoriasRes.json();

            setProductos(productosData);
            setCategorias(categoriasData);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        getDatos();
    }, []);

    // === ELIMINAR ===
    const eliminarProducto = async (producto) => {
        try {
            const response = await fetch(`${API_PRODUCTOS}/${producto.idproducto}`, { method: 'DELETE' });
            if (!response.ok) throw new Error(`Error ${response.status}`);
            setProductos(prev => prev.filter(p => p.idproducto !== producto.idproducto));
            toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Producto eliminado', life: 3000 });
        } catch (err) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar', life: 5000 });
        }
    };

    const confirmarEliminar = (producto) => {
        confirmDialog({
            message: `¿Está seguro de eliminar el producto "${producto.nombre}"?`,
            header: 'Confirmar',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sí, eliminar',
            rejectLabel: 'Cancelar',
            acceptClassName: 'p-button-danger',
            accept: () => eliminarProducto(producto)
        });
    };

    // === EDITAR ===
    const abrirModalEdicion = (producto) => {
        setProductoEditando(producto);
        setNombreEdit(producto.nombre || '');
        setIdCategoriaEdit(producto.idcategoria || '');
        setPrecioEdit(producto.precio || '');
        setStockEdit(producto.stock || '');
        setDescripcionEdit(producto.descripcion || '');
        setEstatusEdit(producto.idestatus || 1);
        setEditarModalVisible(true);

        if (producto.imagen) {
            setUrlImagenActual(`http://localhost:3000/img/${producto.imagen}`);
        } else {
            setUrlImagenActual('http://localhost:3000/img/default.png'); // imagen por defecto
        }
        
        setNuevaImagen(null); // Resetear nueva imagen
        setEditarModalVisible(true);
    };

    const guardarEdicion = async () => {
        if (!nombreEdit.trim() || !idcategoriaEdit) {
            toast.current.show({ 
                severity: 'warn', 
                summary: 'Advertencia', 
                detail: 'Nombre y categoría son requeridos', 
                life: 3000 
            });
            return;
        }

        setEditando(true);
        try {
            let response;

            if (nuevaImagen) {
                // 👉 Si hay una nueva imagen, usar FormData
                const formData = new FormData();
                formData.append('idestatus', estatusEdit);
                formData.append('idcategoria', idcategoriaEdit);
                formData.append('nombre', nombreEdit.trim());
                formData.append('precio', precioEdit || '');
                formData.append('stock', stockEdit || '');
                formData.append('descripcion', descripcionEdit.trim() || '');
                formData.append('imagen', nuevaImagen); // Nueva imagen

                response = await fetch(`${API_PRODUCTOS}/${productoEditando.idproducto}`, {
                    method: 'PUT',
                    body: formData
                });
            } else {
                // 👉 Si no hay nueva imagen, enviar JSON normal
                response = await fetch(`${API_PRODUCTOS}/${productoEditando.idproducto}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        idestatus: estatusEdit,
                        idcategoria: idcategoriaEdit,
                        nombre: nombreEdit.trim(),
                        precio: precioEdit || null,
                        stock: stockEdit || null,
                        descripcion: descripcionEdit.trim() || null
                        // 👉 No incluimos 'imagen' si no se cambia
                    })
                });
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error desconocido');
            }

            // Actualizar en la UI
            const productoActualizado = await response.json();
            setProductos(prev => 
                prev.map(p => 
                    p.idproducto === productoActualizado.idproducto 
                        ? productoActualizado 
                        : p
                )
            );

            toast.current.show({ 
                severity: 'success', 
                summary: 'Éxito', 
                detail: 'Producto actualizado', 
                life: 3000 
            });
            cerrarModalEdicion();
        } catch (err) {
            console.error('Error al actualizar:', err);
            toast.current.show({ 
                severity: 'error', 
                summary: 'Error', 
                detail: err.message || 'No se pudo actualizar', 
                life: 5000 
            });
        } finally {
            setEditando(false);
        }
    };

    const cerrarModalEdicion = () => {
        setEditarModalVisible(false);
        setProductoEditando(null);
        setNombreEdit('');
        setIdCategoriaEdit('');
        setPrecioEdit('');
        setStockEdit('');
        setDescripcionEdit('');
        setEstatusEdit(1);
    };

    // === CREAR ===
    const handleSubmit = async () => {
        if (!nombre.trim() || !idcategoria) {
            toast.current.show({ 
                severity: 'warn', 
                summary: 'Advertencia', 
                detail: 'Nombre y categoría son requeridos', 
                life: 3000 
            });
            return;
        }

        setSubmitting(true);
        try {
            const formData = new FormData();
            
            // Agregar campos de texto
            formData.append('idestatus', estatus);
            formData.append('idcategoria', idcategoria);
            formData.append('nombre', nombre.trim());
            formData.append('precio', precio || '');
            formData.append('stock', stock || '');
            formData.append('descripcion', descripcionEdit.trim() || '');

            // Agregar imagen si existe
            if (imagenFile) {
                formData.append('imagen', imagenFile);
            }

            const response = await fetch(API_PRODUCTOS, {
                method: 'POST',
                body: formData // 👈 No uses headers: { 'Content-Type': ... }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error desconocido');
            }

            // Recargar la lista y mostrar éxito
            getDatos();
            toast.current.show({ 
                severity: 'success', 
                summary: 'Éxito', 
                detail: 'Producto creado correctamente', 
                life: 3000 
            });
            cerrarModal();
        } catch (err) {
            console.error('Error al crear producto:', err);
            toast.current.show({ 
                severity: 'error', 
                summary: 'Error', 
                detail: err.message || 'No se pudo crear el producto', 
                life: 5000 
            });
        } finally {
            setSubmitting(false);
        }
    };

    const cerrarModal = () => {
        setModalVisible(false);
        setNombre('');
        setIdCategoria('');
        setPrecio('');
        setStock('');
        setDescripcion('');
        setEstatus(1);
         setImagenFile(null); 
    };

    // === TEMPLATES ===
    const estatusBodyTemplate = (rowData) => {
        return rowData.idestatus === 1 ? 'Activo' : 'Inactivo';
    };
    const imageBodyTemplate = (product) => {
        return <img src={`http://localhost:3000/img/${product.imagen}`} alt={product.nombre} 
            style={{ 
                width: '60px', 
                height: '60px', 
                objectFit: 'cover',   // Para que no se distorsione
                borderRadius: '8px',  // Opcional: bordes redondeados
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)' // Opcional: sombra
            }} 
             onError={(e) => {
                e.target.src = 'http://localhost:3000/img/default.png'; // 👈 Imagen por defecto
                e.target.style.backgroundColor = '#f5f5f5'; // 👈 Fondo si no hay imagen
            }}
            />;
    };
    const categoriaBodyTemplate = (rowData) => {
        const categoria = categorias.find(cat => cat.idcategoria === rowData.idcategoria);
        return categoria ? categoria.nombre : 'Sin categoría';
    };

    const actionBodyTemplate = (rowData) => {
        return (
            <div className="flex justify-content-center gap-2">
                <Button 
                    icon="pi pi-pencil" 
                    rounded 
                    text 
                    severity="info" 
                    onClick={() => abrirModalEdicion(rowData)}
                />
                <Button 
                    icon="pi pi-trash" 
                    rounded 
                    text 
                    severity="danger" 
                    onClick={() => confirmarEliminar(rowData)} 
                />
            </div>
        );
    };

    if (loading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p>Cargando Productos...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-5 text-danger">
                <h4>Error al cargar los productos</h4>
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="container">
            <Toast ref={toast} />
            <ConfirmDialog />
            <h4 className="text-center pt-5 pb-3">Productos</h4> 
            <div className="row my-4">
               <div className='col-md-6 '>
                    <input
                        type="text"
                        placeholder="Buscar en productos..."
                        className="form-control"
                        value={globalFilter}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                    />
               </div>
                <div className='col-md-6 text-end'>
                <Button 
                    label="Agregar Producto" 
                    icon="pi pi-plus" 
                    onClick={() => setModalVisible(true)} 
                    className="p-button-success"
                />
                </div>
            </div>

     

            <div className="card">
                <DataTable 
                    value={productos}
                    paginator
                    rows={10}
                    rowsPerPageOptions={[5, 10, 25]}
                    globalFilter={globalFilter}
                    emptyMessage="No se encontraron productos."
                    sortField="nombre"
                    sortOrder={1}
                    className="p-datatable-gridlines"
                    stripedRows
                >
                    <Column field="idproducto" header="ID" sortable style={{ width: '8%', textAlign: 'center' }} />
                     <Column header="Image" body={imageBodyTemplate}></Column>
                    <Column 
                        field="idcategoria" 
                        header="Categoría" 
                        body={categoriaBodyTemplate}
                        sortable 
                        style={{ width: '15%' }} 
                    />
                    <Column field="nombre" header="Nombre" sortable style={{ width: '20%' }} />
                    <Column field="precio" header="Precio" sortable style={{ width: '10%', textAlign: 'right' }} 
                        body={(rowData) => rowData.precio ? `$${rowData.precio}` : '-'} 
                    />
                    <Column field="stock" header="Stock" sortable style={{ width: '10%', textAlign: 'center' }} />
                    <Column field="idestatus" header="Estatus" body={estatusBodyTemplate} sortable style={{ width: '12%', textAlign: 'center' }} />
                    <Column 
                        header="Acciones" 
                        body={actionBodyTemplate} 
                        style={{ width: '15%', textAlign: 'center' }} 
                    />
                </DataTable>
            </div>

            {/* Modal Crear */}
            <Dialog
                header="Nuevo Producto"
                visible={modalVisible}
                style={{ width: '50vw' }}
                onHide={cerrarModal}
                footer={
                    <>
                        <Button label="Cancelar" icon="pi pi-times" onClick={cerrarModal} className="p-button-text" />
                        <Button 
                            label={submitting ? 'Guardando...' : 'Guardar'} 
                            icon="pi pi-check" 
                            onClick={handleSubmit} 
                            loading={submitting}
                            disabled={submitting}
                        />
                    </>
                }
            >
                <div className="formgrid grid">
                    <div className="field mb-3">
                        <label htmlFor="nombre" className="font-bold">Nombre *</label>
                        <InputText
                            id="nombre"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            placeholder="Nombre del producto"
                            className="w-full p-inputnumber-sm col-12"
                        />
                    </div>

                    <div className="field mb-3">
                        <label htmlFor="idcategoria" className="font-bold">Categoría *</label>
                        <Dropdown
                            id="idcategoria"
                            value={idcategoria}
                            options={categorias}
                            onChange={(e) => setIdCategoria(e.value)}
                            optionLabel="nombre"
                            optionValue="idcategoria"
                            placeholder="Seleccione una categoría"
                            className="w-full p-inputnumber-sm col-12"
                            required
                        />
                    </div>

                    <div className="field mb-3">
                        <label htmlFor="precio" className="font-bold">Precio</label>
                        <InputNumber
                            id="precio"
                            value={precio}
                            onValueChange={(e) => setPrecio(e.value)}
                            mode="currency"
                            currency="USD"
                            locale="es-MX"
                            minFractionDigits={2}
                            maxFractionDigits={2}
                            className="w-full p-inputnumber-sm col-12"
                        />
                    </div>

                    <div className="field mb-3">
                        <label htmlFor="stock" className="font-bold">Stock</label>
                        <InputNumber
                            id="stock"
                            value={stock}
                            onValueChange={(e) => setStock(e.value)}
                            min={0}
                            className="w-full p-inputnumber-sm col-12"
                        />
                    </div>

                    <div className="field col-12">
                        <label htmlFor="descripcion" className="font-bold">Descripción</label>
                        <InputTextarea
                            id="descripcionEdit"
                            value={descripcion}
                            onChange={(e) => setDescripcionEdit(e.target.value)}
                            placeholder="Descripción (opcional)"
                            rows={3}         
                            cols={30}        
                            className="w-full col-12"
                        />
                    </div>
                    <div className="field mb-3">
                        <label htmlFor="imagen" className="font-bold">Imagen del producto</label>
                        <input
                            type="file"
                            id="imagen"
                            accept="image/*"
                            onChange={(e) => setImagenFile(e.target.files[0])}
                            className="w-full"
                        />
                        {imagenFile && (
                            <small className="block mt-1 text-muted">
                                Seleccionado: {imagenFile.name}
                            </small>
                        )}
                    </div>

                    <div className="field mt-3">
                        <label className="font-bold">Estatus</label>
                        <div className="d-flex gap-3 mt-2">
                            <div className="flex align-items-center">
                                <input
                                    type="radio"
                                    id="activo"
                                    name="estatus"
                                    value={1}
                                    checked={estatus === 1}
                                    onChange={() => setEstatus(1)}
                                    className="me-2"
                                />
                                <label htmlFor="activo">Activo</label>
                            </div>
                            <div className="flex align-items-center">
                                <input
                                    type="radio"
                                    id="inactivo"
                                    name="estatus"
                                    value={2}
                                    checked={estatus === 2}
                                    onChange={() => setEstatus(2)}
                                    className="me-2"
                                />
                                <label htmlFor="inactivo">Inactivo</label>
                            </div>
                        </div>
                    </div>
                </div>
            </Dialog>

            {/* Modal Editar */}
            <Dialog
                header="Editar Producto"
                visible={editarModalVisible}
                style={{ width: '50vw' }}
                onHide={cerrarModalEdicion}
                footer={
                    <>
                        <Button label="Cancelar" icon="pi pi-times" onClick={cerrarModalEdicion} className="p-button-text" />
                        <Button 
                            label={editando ? 'Guardando...' : 'Guardar'} 
                            icon="pi pi-check" 
                            onClick={guardarEdicion} 
                            loading={editando}
                            disabled={editando}
                        />
                    </>
                }
            >
                <div className="formgrid grid">
                    <div className="field col-12 mb-3">
                        <label htmlFor="nombreEdit" className="font-bold">Nombre *</label>
                        <InputText
                            id="nombreEdit"
                            value={nombreEdit}
                            onChange={(e) => setNombreEdit(e.target.value)}
                            placeholder="Nombre del producto"
                            className="w-full p-inputtext-sm col-12"
                        />
                    </div>

                    <div className="field  mb-3">
                        <label htmlFor="idcategoriaEdit" className="font-bold">Categoría *</label>
                        <Dropdown
                            id="idcategoriaEdit"
                            value={idcategoriaEdit}
                            options={categorias}
                            onChange={(e) => setIdCategoriaEdit(e.value)}
                            optionLabel="nombre"
                            optionValue="idcategoria"
                            placeholder="Seleccione una categoría"
                            className="w-full p-dropdown-sm col-12"
                        />
                    </div>

                    <div className="field mb-3">
                        <label htmlFor="precioEdit" className="font-bold">Precio</label>
                        <InputNumber
                            id="precioEdit"
                            value={precioEdit}
                            onValueChange={(e) => setPrecioEdit(e.value)}
                            mode="currency"
                            currency="USD"
                            locale="es-MX"
                            minFractionDigits={2}
                            maxFractionDigits={2}
                            className="w-full p-inputnumber-sm col-12"
                        />
                    </div>

                    <div className="field mb-3">
                        <label htmlFor="stockEdit" className="font-bold">Stock</label>
                        <InputNumber
                            id="stockEdit"
                            value={stockEdit}
                            onValueChange={(e) => setStockEdit(e.value)}
                            min={0}
                            className="w-full p-inputnumber-sm col-12"
                        />
                    </div>

                    <div className="field mb-3">
                        <label htmlFor="descripcionEdit" className="font-bold">Descripción</label>
                        <InputTextarea
                            id="descripcionEdit"
                            value={descripcionEdit}
                            onChange={(e) => setDescripcionEdit(e.target.value)}
                            placeholder="Descripción (opcional)"
                            rows={3}         
                            cols={30}        
                            className="w-full col-12"
                        />
                    </div>
                    <div className="field mb-3">
                        <label className="font-bold">Imagen actual</label>
                        <div className="mt-2">
                            <img 
                                src={urlImagenActual} 
                                alt="Imagen actual" 
                                style={{ 
                                    width: '100px', 
                                    height: '100px', 
                                    objectFit: 'cover',
                                    borderRadius: '8px',
                                    border: '1px solid #ddd'
                                }} 
                            />
                        </div>
                    </div>

                    <div className="field mb-3">
                        <label htmlFor="nuevaImagen" className="font-bold">Cambiar imagen</label>
                        <input
                            type="file"
                            id="nuevaImagen"
                            accept="image/*"
                            onChange={(e) => setNuevaImagen(e.target.files[0])}
                            className="w-full"
                        />
                        {nuevaImagen && (
                            <small className="block mt-1 text-muted">
                                Nueva imagen: {nuevaImagen.name}
                            </small>
                        )}
                    </div>

                    <div className="field col-12">
                        <label className="font-bold">Estatus</label>
                        <div className="d-flex gap-3 mt-2">
                            <div className="flex align-items-center">
                                <input
                                    type="radio"
                                    id="activoEdit"
                                    name="estatusEdit"
                                    value={1}
                                    checked={estatusEdit === 1}
                                    onChange={() => setEstatusEdit(1)}
                                    className="me-2"
                                />
                                <label htmlFor="activoEdit">Activo</label>
                            </div>
                            <div className="flex align-items-center">
                                <input
                                    type="radio"
                                    id="inactivoEdit"
                                    name="estatusEdit"
                                    value={2}
                                    checked={estatusEdit === 2}
                                    onChange={() => setEstatusEdit(2)}
                                    className="me-2"
                                />
                                <label htmlFor="inactivoEdit">Inactivo</label>
                            </div>
                        </div>
                    </div>
                </div>
            </Dialog>
        </div>
    );
};

export default Productos;