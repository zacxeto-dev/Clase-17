import React, { useRef } from 'react'
import { useEffect, useState } from "react";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';

const API = 'http://localhost:3000/api/categorias';
const Categorias = () => {
    const [datos, setDatos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [globalFilter, setGlobalFilter] = useState('');

     // Modal
    const [modalVisible, setModalVisible] = useState(false);
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [estatus, setEstatus] = useState(1); // 1 = Activo, 2 = Inactivo
    const [submitting, setSubmitting] = useState(false);

    // Modal de edición
    const [editarModalVisible, setEditarModalVisible] = useState(false);
    const [categoriaEditando, setCategoriaEditando] = useState(null);
    const [nombreEdit, setNombreEdit] = useState('');
    const [descripcionEdit, setDescripcionEdit] = useState('');
    const [estatusEdit, setEstatusEdit] = useState(1);
    const [editando, setEditando] = useState(false);

    const toast = useRef(null);

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
    const handleSubmit = async () => {
        if (!nombre.trim()) {
            toast.current.show({ severity: 'warn', summary: 'Advertencia', detail: 'El nombre es requerido', life: 3000 });
            return;
        }

        setSubmitting(true);
        try {
            const response = await fetch(API, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    idestatus: estatus,
                    nombre: nombre.trim(),
                    descripcion: descripcion.trim() || null
                })
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            // refrescar la lista de categorías
            getDatos();
            toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Categoría creada', life: 3000 });
            cerrarModal();
        } catch (err) {
            console.error('Error al crear categoría:', err);
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'No se pudo crear la categoría', life: 5000 });
        } finally {
            setSubmitting(false);
        }
    };
    const guardarEdicion = async () => {
        if (!nombreEdit.trim()) {
            toast.current.show({ severity: 'warn', summary: 'Advertencia', detail: 'El nombre es requerido', life: 3000 });
            return;
        }

        setEditando(true);
        try {
            const response = await fetch(`${API}/${categoriaEditando.idcategoria}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    idestatus: estatusEdit,
                    nombre: nombreEdit.trim(),
                    descripcion: descripcionEdit.trim() || null
                })
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}`);
            }

            // Actualizar en la UI
            const categoriaActualizada = {
                ...categoriaEditando,
                idestatus: estatusEdit,
                nombre: nombreEdit.trim(),
                descripcion: descripcionEdit.trim() || null
            };

            setDatos(prev => 
                prev.map(cat => 
                    cat.idcategoria === categoriaActualizada.idcategoria 
                        ? categoriaActualizada 
                        : cat
                )
            );

            toast.current.show({ 
                severity: 'success', 
                summary: 'Éxito', 
                detail: 'Categoría actualizada', 
                life: 3000 
            });
            cerrarModalEdicion();
        } catch (err) {
            console.error('Error al actualizar:', err);
            toast.current.show({ 
                severity: 'error', 
                summary: 'Error', 
                detail: 'No se pudo actualizar la categoría', 
                life: 5000 
            });
        } finally {
            setEditando(false);
        }
    };
    const cerrarModalEdicion = () => {
        setEditarModalVisible(false);
        setCategoriaEditando(null);
        setNombreEdit('');
        setDescripcionEdit('');
        setEstatusEdit(1);
    };
    const eliminarCategoria = async (categoria) => {
        try {
            const response = await fetch(`${API}/${categoria.idcategoria}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}`);
            }

            // Eliminar de la UI
            setDatos(prev => prev.filter(cat => cat.idcategoria !== categoria.idcategoria));
            toast.current.show({ 
                severity: 'success', 
                summary: 'Éxito', 
                detail: 'Categoría eliminada', 
                life: 3000 
            });
        } catch (err) {
            console.error('Error al eliminar:', err);
            toast.current.show({ 
                severity: 'error', 
                summary: 'Error', 
                detail: 'No se pudo eliminar la categoría', 
                life: 5000 
            });
        }
    };
    const confirmarEliminar = (categoria) => {
        confirmDialog({
            message: `¿Está seguro de eliminar la categoría "${categoria.nombre}"?`,
            header: 'Confirmar',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sí, eliminar',
            rejectLabel: 'Cancelar',
            acceptClassName: 'p-button-danger',
            accept: () => eliminarCategoria(categoria),
            reject: () => {} // no hacer nada
        });
    };
    const cerrarModal = () => {
        setModalVisible(false);
        setNombre('');
        setDescripcion('');
        setEstatus(1);
    };
    const abrirModalEdicion = (categoria) => {
        setCategoriaEditando(categoria);
        setNombreEdit(categoria.nombre || '');
        setDescripcionEdit(categoria.descripcion || '');
        setEstatusEdit(categoria.idestatus || 1);
        setEditarModalVisible(true);
    };
    if (loading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p>Cargando Categorias...</p>
            </div>
        );
    }
    if (error) {
        return (
            <div className="text-center py-5 text-danger">
                <h4>Error al cargar los Categorias</h4>
                <p>{error}</p>
            </div>
        );
    }
  return (
    <div className="container">
          <Toast ref={toast} />
           <ConfirmDialog />
        <h4 className="text-center py-5">Categorias</h4> 
        <div className="row">
                <div className='col-md-6'>
                    <input
                        type="text"
                        placeholder="Buscar en categorías..."
                        className="form-control"
                        value={globalFilter}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                    />
                </div>
                 <div className='col-md-6 text-end'>
                    <Button 
                        label="Agregar Categoría" 
                        icon="pi pi-plus" 
                        onClick={() => setModalVisible(true)} 
                        className="p-button-success"
                    />
                </div>
            </div>
         <div className="mb-3">    
            </div> 
            <div className='card'>
            <DataTable value={datos} paginator
                rows={10}
                rowsPerPageOptions={[5, 10, 25]}
                globalFilter={globalFilter}
                emptyMessage="No se encontraron categorías."
                sortField="nombre"
                sortOrder={1}
                className="p-datatable-gridlines"
                stripedRows
                >
                <Column field="idcategoria" header="ID" sortable  style={{ width: '5%' }}></Column>
                <Column field="ne" header="Estatus"   sortable   style={{ width: '10%' }}></Column>
                <Column field="nombre" header="Nombre" sortable   style={{ width: '20%' }}></Column>
                <Column field="descripcion" header="Descripcion" sortable  style={{ width: '40%' }}></Column>
                 <Column 
                    header="Acciones" 
                    body={actionBodyTemplate} 
                    style={{ width: '15%', textAlign: 'center' }} 
                />
            </DataTable>
            </div>
             {/* Modal para crear categoría */}
            <Dialog
                header="Nueva Categoría"
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
                    <div className="field col-12">
                        <label htmlFor="nombre" className="font-bold">Nombre *</label>
                        <InputText
                            id="nombre"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            placeholder="Nombre de la categoría"
                            className="form-control"
                        />
                    </div>

                    <div className="field col-12 my-4">
                        <label htmlFor="descripcion" className="font-bold">Descripción</label>
                        <InputText
                            id="descripcion"
                            value={descripcion}
                            onChange={(e) => setDescripcion(e.target.value)}
                            placeholder="Descripción (opcional)"
                            className="form-control"
                        />
                    </div>

                    <div className="field col-12">
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
            {/* Modal de edición */}
            <Dialog
                header="Editar Categoría"
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
                    <div className="field col-12">
                        <label htmlFor="nombreEdit" className="font-bold">Nombre *</label>
                        <InputText
                            id="nombreEdit"
                            value={nombreEdit}
                            onChange={(e) => setNombreEdit(e.target.value)}
                            placeholder="Nombre de la categoría"
                            className="form-control"
                        />
                    </div>

                    <div className="field col-12 py-4">
                        <label htmlFor="descripcionEdit" className="font-bold">Descripción</label>
                        <InputText
                            id="descripcionEdit"
                            value={descripcionEdit}
                            onChange={(e) => setDescripcionEdit(e.target.value)}
                            placeholder="Descripción (opcional)"
                            className="form-control"
                        />
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
  )
}

export default Categorias