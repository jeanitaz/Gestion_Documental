import { useParams, useNavigate } from 'react-router-dom';
import '../styles/AreaDashboard.css';
import { useEffect, useState, useRef } from 'react';

// 1. Definimos la interfaz del Área
interface AreaInfo {
    id: string;
    label: string;
}

// 2. Definimos la interfaz del Documento (para evitar errores con lista vacía)
interface DocumentFile {
    id: number;
    name: string;
    date: string;
    size: string;
    type: string;
}

// 3. Lista de áreas
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
    
    // Refs
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Estados
    const [searchTerm, setSearchTerm] = useState('');
    
    // --- CAMBIO: INICIAMOS LA LISTA VACÍA ---
    const [documents, setDocuments] = useState<DocumentFile[]>([]); 
    
    // Calculamos el nombre del área
    const foundArea = AREA_DATA.find(area => area.id === id);
    const areaName = foundArea ? foundArea.label : 'Gestión Documental';

    // --- LÓGICA DE FILTRADO ---
    const filteredDocuments = documents.filter((doc) => 
        doc.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // --- FUNCIÓN 1: SUBIR ARCHIVO ---
    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const newDoc: DocumentFile = {
                id: Date.now(),
                name: file.name,
                date: new Date().toISOString().split('T')[0],
                size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
                type: file.name.split('.').pop()?.toUpperCase() || 'FILE'
            };
            setDocuments([...documents, newDoc]);
        }
    };

    // --- FUNCIÓN 2: ELIMINAR ARCHIVO (AHORA SÍ FUNCIONA) ---
    const handleDelete = (docId: number) => {
        // Preguntamos antes de borrar
        const confirmDelete = window.confirm("¿Estás seguro de eliminar este archivo?");
        if (confirmDelete) {
            const updatedList = documents.filter(doc => doc.id !== docId);
            setDocuments(updatedList);
        }
    };

    // --- FUNCIÓN 3: DESCARGAR ARCHIVO ---
    const handleDownload = (fileName: string) => {
        alert(`Descargando archivo: ${fileName}`);
    };

    // Verificar sesión
    useEffect(() => {
        const session = localStorage.getItem('userSession');
        if (!session) {
            navigate('/area'); 
        }
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
                    <p className="sidebar-role">Administrador</p>
                </div>
                
                <nav className="sidebar-nav">
                    <button className="nav-item active">📂 Documentos</button>
                    <button className="nav-item">📤 Cargar Archivo</button>
                    <button className="nav-item">⚙️ Configuración</button>
                </nav>

                <button onClick={handleLogout} className="btn-logout">
                    Cerrar Sesión
                </button>
            </aside>

            <main className="main-content">
                <header className="top-bar">
                    <h1 className="dashboard-title">{areaName}</h1>
                    <div className="user-profile">
                        <span className="user-avatar">👤</span>
                        <span className="user-name">Admin {(id || 'User').toUpperCase()}</span>
                    </div>
                </header>

                <div className="content-glass">
                    <div className="toolbar">
                        <h3>Archivos del Área</h3>
                        
                        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                            <input 
                                type="text" 
                                placeholder="Buscar archivo..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(56, 189, 248, 0.3)',
                                    borderRadius: '8px',
                                    padding: '10px 15px',
                                    color: 'white',
                                    outline: 'none',
                                    fontFamily: 'Montserrat, sans-serif'
                                }}
                            />

                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                style={{ display: 'none' }} 
                                onChange={handleFileChange}
                            />

                            <button className="btn-upload-new" onClick={handleUploadClick}>
                                + Subir Nuevo
                            </button>
                        </div>
                    </div>

                    <div className="table-responsive">
                        <table className="docs-table">
                            <thead>
                                <tr>
                                    <th>Nombre del Archivo</th>
                                    <th>Fecha de Carga</th>
                                    <th>Tipo</th>
                                    <th>Tamaño</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* Si está vacío, mostramos mensaje opcional, sino la lista */}
                                {filteredDocuments.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>
                                            No hay documentos cargados. Sube uno nuevo.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredDocuments.map((doc) => (
                                        <tr key={doc.id}>
                                            <td className="col-name">
                                                <span className="file-icon">📄</span> {doc.name}
                                            </td>
                                            <td>{doc.date}</td>
                                            <td><span className={`badge ${doc.type}`}>{doc.type}</span></td>
                                            <td>{doc.size}</td>
                                            <td>
                                                {/* Botón Descargar CON FUNCIÓN */}
                                                <button 
                                                    className="btn-action download" 
                                                    onClick={() => handleDownload(doc.name)}
                                                    title="Descargar"
                                                >
                                                    ⬇
                                                </button>

                                                {/* Botón Borrar CON FUNCIÓN */}
                                                <button 
                                                    className="btn-action delete" 
                                                    onClick={() => handleDelete(doc.id)}
                                                    title="Eliminar"
                                                >
                                                    🗑
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AreaDashboard;