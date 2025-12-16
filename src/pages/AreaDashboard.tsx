import { useParams, useNavigate } from 'react-router-dom';
import '../styles/AreaDashboard.css';
import { useEffect, useState, useRef } from 'react';

interface AreaInfo {
    id: string;
    label: string;
}

interface DocumentFile {
    id: number;
    name: string;
    date: string;
    size: string;
    type: string;
    relativePath?: string;
    fileData?: File;
}

const AREA_DATA: AreaInfo[] = [
    { id: 'tic', label: 'Tecnologías de la Información' },
    { id: 'rrhh', label: 'Recursos Humanos' },
    { id: 'hidro', label: 'Información Hidrometeorológica' },
    { id: 'admin-fin', label: 'Dirección Administrativa Financiera' },
    { id: 'ejecutiva', label: 'Dirección Ejecutiva' },
    { id: 'juridica', label: 'Asesoría Jurídica' },
    { id: 'com-social', label: 'Comunicación Social' },
    { id: 'planificacion', label: 'Planificación' },
    { id: 'pronosticos', label: 'Pronósticos y Alertas' },
    { id: 'estudios', label: 'Estudios e Investigación' },
    { id: 'red-obs', label: 'Red Nacional de Observación' },
    { id: 'calidad-agua', label: 'Calidad de Agua y Sedimentos' }
];

const AreaDashboard = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Estados
    const [searchTerm, setSearchTerm] = useState('');
    const [documents, setDocuments] = useState<DocumentFile[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // ESTADO DE NAVEGACIÓN (Ruta actual)
    const [currentPath, setCurrentPath] = useState('');

    const foundArea = AREA_DATA.find(area => area.id === id);
    const areaName = foundArea ? foundArea.label : 'Gestión Documental';

    // --- CONEXIÓN AL BACKEND ---
    const fetchDocumentsFromNetwork = async () => {
        if (!id) return;
        setIsLoading(true);
        try {
            // ENVIAMOS EL PATH ACTUAL AL SERVIDOR
            const response = await fetch(`http://localhost:3001/api/archivos/${id}?subpath=${encodeURIComponent(currentPath)}`);

            if (!response.ok) throw new Error('Error al conectar');
            const data = await response.json();
            setDocuments(data);
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Recargar cuando cambia el ID o la ruta actual (navegación)
    useEffect(() => {
        fetchDocumentsFromNetwork();
    }, [id, currentPath]);

    // --- ENTRAR A CARPETA ---
    const handleFolderClick = (folderName: string) => {
        const newPath = currentPath ? `${currentPath}\\${folderName}` : folderName;
        setCurrentPath(newPath);
        setSearchTerm('');
    };

    // --- REGRESAR (SUBIR NIVEL) ---
    const handleGoBack = () => {
        if (!currentPath) return;
        const parts = currentPath.split('\\');
        parts.pop();
        setCurrentPath(parts.join('\\'));
    };

    // --- FILTRADO ---
    const filteredDocuments = documents.filter((doc) =>
        doc.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleUploadClick = () => fileInputRef.current?.click();
    const handleFileChange = () => { };
    const handleDelete = (docId: number) => {
        if (window.confirm("¿Eliminar de la vista?")) {
            setDocuments(documents.filter(d => d.id !== docId));
        }
    };

    // --- DESCARGAR ---
    const handleDownload = (doc: DocumentFile) => {
        if (doc.type === 'FOLDER') return; // No descargar carpetas

        if (doc.fileData) {
            const url = URL.createObjectURL(doc.fileData);
            const a = document.createElement('a');
            a.href = url; a.download = doc.name; a.click();
        } else {
            // SOLUCIÓN AL ERROR DEL SÍMBOLO #:
            // Usamos encodeURIComponent para que el # no rompa la URL
            const rutaSegura = encodeURIComponent(doc.relativePath || doc.name);
            const downloadUrl = `http://localhost:3001/api/descargar/${id}?path=${rutaSegura}`;

            // Abrimos en nueva pestaña
            window.open(downloadUrl, '_blank');
        }
    };

    // Sesión
    useEffect(() => {
        if (!localStorage.getItem('userSession')) navigate('/area');
    }, [navigate]);
    const handleLogout = () => {
        localStorage.removeItem('userSession');
        navigate('/area');
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-bg"></div>

            <aside className="sidebar-glass">
                <div className="sidebar-header">
                    <div className="sidebar-logo">INAMHI</div>
                    <p className="sidebar-role">Admin</p>
                </div>
                <nav className="sidebar-nav">
                    <button className="nav-item active">📂 Documentos</button>
                    <button className="nav-item">📤 Cargar</button>
                </nav>
                <button onClick={handleLogout} className="btn-logout">Salir</button>
            </aside>

            <main className="main-content">
                <header className="top-bar">
                    <h1 className="dashboard-title">{areaName}</h1>
                    <div className="user-profile">
                        <span className="user-avatar">👤</span>
                        <span className="user-name">Admin</span>
                    </div>
                </header>

                <div className="content-glass">
                    <div className="toolbar">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            <h3>Archivos en Red: {id?.toUpperCase()}</h3>

                        </div>

                        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                            {/* BOTÓN REGRESAR */}
                            {currentPath && (
                                <button
                                    onClick={handleGoBack}
                                    style={{
                                        background: '#334155', border: 'none', color: 'white',
                                        padding: '10px 15px', borderRadius: '8px', cursor: 'pointer'
                                    }}
                                >
                                    ⬅ Regresar
                                </button>
                            )}

                            <input
                                type="text"
                                placeholder="Buscar..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(56, 189, 248, 0.3)',
                                    borderRadius: '8px',
                                    padding: '10px 15px',
                                    color: 'white',
                                    outline: 'none'
                                }}
                            />
                            <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />
                            <button className="btn-upload-new" onClick={handleUploadClick}>+ Subir Nuevo</button>
                        </div>
                    </div>

                    <div className="table-responsive">
                        {isLoading ? (
                            <div style={{ textAlign: 'center', padding: '40px', color: 'white' }}>
                                🌀 Cargando...
                            </div>
                        ) : (
                            <table className="docs-table">
                                <thead>
                                    <tr>
                                        <th>Nombre</th>
                                        <th>Fecha</th>
                                        <th>Tipo</th>
                                        <th>Tamaño</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {!isLoading && filteredDocuments.length === 0 && (
                                        <tr><td colSpan={5} style={{ textAlign: 'center', padding: '20px' }}>Carpeta vacía</td></tr>
                                    )}

                                    {filteredDocuments.map((doc) => (
                                        <tr key={doc.id}
                                            // CLIC EN CARPETA
                                            onClick={() => doc.type === 'FOLDER' && handleFolderClick(doc.name)}
                                            style={{ cursor: doc.type === 'FOLDER' ? 'pointer' : 'default' }}
                                            className={doc.type === 'FOLDER' ? 'folder-row' : ''}
                                        >
                                            <td className="col-name" style={{ fontWeight: doc.type === 'FOLDER' ? 'bold' : 'normal', color: doc.type === 'FOLDER' ? '#fbbf24' : 'inherit' }}>
                                                <span className="file-icon">
                                                    {doc.type === 'FOLDER' ? '📁' : '📄'}
                                                </span>
                                                {doc.name}
                                            </td>
                                            <td>{doc.date}</td>
                                            <td><span className={`badge ${doc.type === 'FOLDER' ? 'folder-badge' : doc.type}`}>{doc.type}</span></td>
                                            <td>{doc.size}</td>
                                            <td>
                                                {doc.type !== 'FOLDER' && (
                                                    <>
                                                        <button
                                                            className="btn-action download"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDownload(doc);
                                                            }}
                                                            title="Descargar"
                                                        >⬇</button>
                                                        <button
                                                            className="btn-action delete"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDelete(doc.id);
                                                            }}
                                                            title="Eliminar de la vista"
                                                        >🗑️</button>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AreaDashboard;