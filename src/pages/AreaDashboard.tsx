import { useParams, useNavigate } from 'react-router-dom';
import '../styles/AreaDashboard.css';
import React, { useEffect, useState, useRef } from 'react';

interface AreaInfo {
    id: string;
    label: string;
}

interface DocumentFile {
    id: string;
    name: string;
    date: string;
    size: string;
    type: string;
    relativePath?: string;
}

// Datos hardcodeados solo para mostrar el nombre bonito en el título
const AREA_DATA: AreaInfo[] = [
    { id: 'tic', label: 'TECNOLOGÍAS DE LA INFORMACIÓN Y COMUNICACIÓN' },
    { id: 'rrhh', label: 'DIRECCIÓN DE ADMINISTRACIÓN DE RECURSOS HUMANOS' },
    { id: 'hidro', label: 'DIRECCIÓN DE INFORMACIÓN HIDROMETEOROLÓGICA' },
    { id: 'admin-fin', label: 'DIRECCIÓN ADMINISTRATIVA FINANCIERA' },
    { id: 'ejecutiva', label: 'DIRECCIÓN EJECUTIVA' },
    { id: 'juridica', label: 'DIRECCIÓN DE ASESORÍA JURÍDICA' },
    { id: 'com-social', label: 'DIRECCIÓN DE COMUNICACIÓN SOCIAL' },
    { id: 'planificacion', label: 'DIRECCIÓN DE PLANIFICACIÓN' },
    { id: 'pronosticos', label: 'DIRECCIÓN DE PRONÓSTICOS Y ALERTAS' },
    { id: 'estudios', label: 'DIRECCIÓN DE ESTUDIOS, INVESTIGACIÓN Y DESARROLLO' },
    { id: 'red-obs', label: 'DIRECCIÓN DE LA RED NACIONAL DE OBSERVACIÓN' },
    { id: 'calidad-agua', label: 'LABORATORIO NACIONAL DE CALIDAD DE AGUA' }
];

const FILE_ICONS: { [key: string]: string } = {
    'PDF': 'https://cdn-icons-png.flaticon.com/512/337/337946.png',
    'DOCX': 'https://cdn-icons-png.flaticon.com/512/337/337932.png',
    'XLSX': 'https://cdn-icons-png.flaticon.com/512/337/337958.png',
    'ZIP': 'https://cdn-icons-png.flaticon.com/512/337/337949.png',
    'PNG': 'https://cdn-icons-png.flaticon.com/512/337/337948.png',
    'JPG': 'https://cdn-icons-png.flaticon.com/512/337/337948.png',
    'DEFAULT': 'https://cdn-icons-png.flaticon.com/512/3767/3767084.png'
};

const AreaDashboard = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Estados
    const [searchTerm, setSearchTerm] = useState('');
    const [documents, setDocuments] = useState<DocumentFile[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [currentPath, setCurrentPath] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const foundArea = AREA_DATA.find(area => area.id === id);
    const areaName = foundArea ? foundArea.label : id?.toUpperCase().replace(/-/g, ' ') || 'Gestión Documental';

    const getFileIcon = (fileType: string) => {
        const typeUpper = fileType ? fileType.toUpperCase() : 'DEFAULT';
        return FILE_ICONS[typeUpper] || FILE_ICONS['DEFAULT'];
    };

    // --- FUNCIÓN CLAVE: OBTENER USUARIO LOGUEADO ---
    // Esto asegura que el historial no diga "Desconocido"
    const getCurrentUser = () => {
        const session = localStorage.getItem('userSession');
        if (session) {
            try {
                const parsed = JSON.parse(session);
                // Retorna el usuario o el email que se guardó al hacer login
                return parsed.user || parsed.email || 'Admin Área';
            } catch (e) {
                return 'Usuario Error';
            }
        }
        return 'Usuario Desconocido';
    };

    const fetchDocumentsFromNetwork = async () => {
        if (!id) return;
        setIsLoading(true);
        try {
            const url = `/api/archivos/${id}?subpath=${encodeURIComponent(currentPath)}`;
            const response = await fetch(url);
            if (!response.ok) throw new Error('Error al conectar');
            const data = await response.json();
            setDocuments(data);
        } catch (error) {
            console.error("Error cargando documentos:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDocumentsFromNetwork();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, currentPath]);

    // --- FUNCIÓN SUBIR ARCHIVOS ---
    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;
        const fileToUpload = files[0];
        
        const formData = new FormData();
        formData.append('archivo', fileToUpload);
        formData.append('areaId', id || '');
        formData.append('rutaActual', currentPath);
        
        // Enviamos el usuario explícitamente para el log
        formData.append('usuario', getCurrentUser());

        setIsUploading(true);
        try {
            const response = await fetch('/api/subir', {
                method: 'POST',
                body: formData
            });
            if (response.ok) {
                alert('✅ Archivo subido correctamente');
                fetchDocumentsFromNetwork();
            } else {
                alert('❌ Error al subir el archivo');
            }
        } catch (error) {
            console.error("Detalle del error:", error); 
            alert('❌ Error de conexión al subir');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    // --- FUNCIÓN CREAR CARPETA ---
    const handleCreateFolder = async () => {
        const folderName = prompt("Ingrese el nombre de la nueva carpeta:");
        if (!folderName || folderName.trim() === "") return;

        try {
            const response = await fetch('/api/crear-carpeta', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    areaId: id,
                    rutaActual: currentPath,
                    nombreCarpeta: folderName,
                    usuario: getCurrentUser() // Enviamos usuario para el log
                })
            });

            const data = await response.json();
            if (response.ok && data.success) {
                alert('✅ Carpeta creada exitosamente');
                fetchDocumentsFromNetwork();
            } else {
                alert(`❌ Error: ${data.message || 'No se pudo crear'}`);
            }
        } catch (error) {
            console.error("Error creando carpeta:", error);
            alert('❌ Error de conexión con el servidor');
        }
    };

    // --- FUNCIÓN ELIMINAR ---
    const handleDelete = async (doc: DocumentFile, e: React.MouseEvent) => {
        e.stopPropagation();
        
        const tipo = doc.type === 'FOLDER' ? 'la carpeta' : 'el archivo';
        if (!confirm(`⚠️ ¿Estás seguro de ELIMINAR ${tipo} "${doc.name}"?\nEsta acción no se puede deshacer.`)) return;

        try {
            const response = await fetch('/api/eliminar-archivo', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    areaId: id,
                    rutaActual: currentPath,
                    nombre: doc.name,
                    usuario: getCurrentUser() // Enviamos usuario para el log
                })
            });

            const data = await response.json();
            if (response.ok && data.success) {
                fetchDocumentsFromNetwork(); // Recargar lista
            } else {
                alert('❌ Error al eliminar: ' + (data.error || 'Desconocido'));
            }
        } catch (error) {
            console.error(error);
            alert('❌ Error de conexión');
        }
    };

    const handleFolderClick = (folderName: string) => {
        const newPath = currentPath ? `${currentPath}/${folderName}` : folderName;
        setCurrentPath(newPath);
        setSearchTerm('');
    };

    const handleGoBack = () => {
        if (!currentPath) return;
        const parts = currentPath.split('/');
        parts.pop();
        setCurrentPath(parts.join('/'));
    };

    const handleDownload = (doc: DocumentFile) => {
        if (doc.type === 'FOLDER') return;
        const rutaSegura = encodeURIComponent(doc.relativePath || doc.name);
        window.open(`/api/descargar/${id}?path=${rutaSegura}`, '_blank');
    };

    const filteredDocuments = documents.filter((doc) =>
        doc.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="dashboard-container">
            {/* Sidebar Flotante */}
            <aside className="sidebar-glass">
                <div className="sidebar-header">
                    <div className="sidebar-logo">INAMHI</div>
                    <p className="sidebar-role">Gestor de Archivos</p>
                </div>
                <nav className="sidebar-nav">
                    <button className={`nav-item ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')}>
                        📂 Explorador
                    </button>
                    <button className={`nav-item ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')}>
                        📝 Vista Lista
                    </button>
                </nav>
                <div className="sidebar-footer">
                    <button onClick={() => navigate('/area')} className="btn-logout">🚪 Salir</button>
                </div>
            </aside>

            {/* Contenido Flotante */}
            <main className="main-content">
                <header className="top-bar">
                    <div className="breadcrumb">
                        <h1 className="dashboard-title">{areaName}</h1>
                        <span className="path-text">
                            {currentPath ? `Raíz > ${currentPath.replace(/\//g, ' > ')}` : 'Raíz del Área'}
                        </span>
                    </div>
                </header>

                <div className="content-glass">
                    <div className="toolbar">
                        <div className="toolbar-left">
                            {currentPath && (
                                <button onClick={handleGoBack} className="btn-back">⬅ Volver</button>
                            )}
                            <h3 className="file-count-text">{filteredDocuments.length} elementos</h3>
                        </div>

                        <div className="toolbar-right">
                            <input
                                type="text"
                                placeholder="Buscar archivo..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input"
                            />
                            
                            <button className="btn-create-folder" onClick={handleCreateFolder}>
                                📁 Nueva Carpeta
                            </button>

                            <input
                                type="file"
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                onChange={handleFileUpload} 
                            />
                            <button 
                                className="btn-upload-new" 
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploading}
                            >
                                {isUploading ? '⏳ Subiendo...' : '☁️ Subir Archivo'}
                            </button>
                        </div>
                    </div>

                    <div className="explorer-container">
                        {isLoading ? (
                            <div className="loading-state">🌀 Cargando archivos...</div>
                        ) : filteredDocuments.length === 0 ? (
                            <div className="empty-state">
                                <span>📁</span>
                                <p>Esta carpeta está vacía</p>
                            </div>
                        ) : viewMode === 'list' ? (
                            <div className="table-responsive">
                                <table className="docs-table">
                                    <thead>
                                        <tr>
                                            <th>Nombre</th>
                                            <th>Fecha</th>
                                            <th>Tamaño</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredDocuments.map(doc => (
                                            <tr key={doc.id} onClick={() => doc.type === 'FOLDER' && handleFolderClick(doc.name)}>
                                                <td>
                                                    <div className="table-name-wrapper">
                                                        {doc.type === 'FOLDER' ? (
                                                            <span className="list-icon-folder">📁</span>
                                                        ) : (
                                                            <img src={getFileIcon(doc.type)} className="list-icon" alt="icon" />
                                                        )}
                                                        {doc.name}
                                                    </div>
                                                </td>
                                                <td>{doc.date}</td>
                                                <td>{doc.size}</td>
                                                <td>
                                                    <div style={{display: 'flex', gap: '8px'}}>
                                                        {doc.type !== 'FOLDER' && (
                                                            <button className="mini-dl" onClick={(e) => { e.stopPropagation(); handleDownload(doc) }}>⬇</button>
                                                        )}
                                                        {/* BOTÓN ELIMINAR EN LISTA */}
                                                        <button 
                                                            className="mini-dl" 
                                                            style={{backgroundColor: '#fee2e2', color: '#ef4444', border: '1px solid #fecaca'}}
                                                            onClick={(e) => handleDelete(doc, e)}
                                                        >
                                                            🗑️
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="docs-grid">
                                {filteredDocuments.map((doc) => (
                                    <div
                                        key={doc.id}
                                        className={`doc-card ${doc.type === 'FOLDER' ? 'is-folder' : ''}`}
                                        onClick={() => doc.type === 'FOLDER' ? handleFolderClick(doc.name) : handleDownload(doc)}
                                    >
                                        {/* BOTÓN ELIMINAR FLOTANTE EN GRID */}
                                        <button 
                                            className="delete-icon-float"
                                            onClick={(e) => handleDelete(doc, e)}
                                            title="Eliminar"
                                        >
                                            ✕
                                        </button>

                                        <div className="card-icon">
                                            {doc.type === 'FOLDER' ? (
                                                <span className="folder-emoji">📁</span>
                                            ) : (
                                                <img src={getFileIcon(doc.type)} className="file-icon-img" alt={doc.type} />
                                            )}
                                        </div>
                                        <div className="card-info">
                                            <span className="card-name" title={doc.name}>{doc.name}</span>
                                            <span className="card-date">{doc.date}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AreaDashboard;
