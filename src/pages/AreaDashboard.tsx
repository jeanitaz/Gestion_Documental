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



const FILE_ICONS: { [key: string]: string } = {
    'DOC': '/assets/word.png',
    'DOCX': '/assets/word.png',
    'XLS': '/assets/excel.png',
    'XLSX': '/assets/excel.png',
    'XLSM': '/assets/excel.png',
    'ZIP': '/assets/zip.png',
    '3GP': '/assets/3gp.png',
    'LOG': '/assets/log.png',
    'TXT': '/assets/txt.png',
    'AD1': '/assets/ad1.png',
    'AD2': '/assets/ad2.png',
    'DAT': '/assets/dat.png',
    'DB': '/assets/sql.png',
    'MEM': '/assets/mem.png',
    'SYS': '/assets/sys.png',
    'RAR': '/assets/rar.png',
    'ACSESO DIRECTO': '/assets/folder.png',
    'EXE': '/assets/exe.png',
    'PDF': '/assets/pdf.png',
    'JPG': '/assets/image.png',
    'JPEG': '/assets/image.png',
    'PNG': '/assets/image.png',
    'DEFAULT': '/assets/file.png' 
};

const AreaDashboard = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [documents, setDocuments] = useState<DocumentFile[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentPath, setCurrentPath] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const foundArea = AREA_DATA.find(area => area.id === id);
    const areaName = foundArea ? foundArea.label : 'Gestión Documental';

    const fetchDocumentsFromNetwork = async () => {
        if (!id) return;
        setIsLoading(true);
        try {
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

    useEffect(() => { fetchDocumentsFromNetwork(); }, [id, currentPath]);

    const handleFolderClick = (folderName: string) => {
        const newPath = currentPath ? `${currentPath}\\${folderName}` : folderName;
        setCurrentPath(newPath);
    };

    const handleGoBack = () => {
        if (!currentPath) return;
        const parts = currentPath.split('\\');
        parts.pop();
        setCurrentPath(parts.join('\\'));
    };

    const filteredDocuments = documents.filter((doc) =>
        doc.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDownload = (doc: DocumentFile) => {
        if (doc.type === 'FOLDER') return;
        const rutaSegura = encodeURIComponent(doc.relativePath || doc.name);
        window.open(`http://localhost:3001/api/descargar/${id}?path=${rutaSegura}`, '_blank');
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-bg"></div>

            <aside className="sidebar-glass">
                <div className="sidebar-header">
                    <div className="sidebar-logo">INAMHI</div>
                    <p className="sidebar-role">Gestor de Archivos</p>
                </div>
                <nav className="sidebar-nav">
                    <button className="nav-item active">📂 Explorador</button>
                    <button className="nav-item" onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>
                        {viewMode === 'grid' ? '📝 Vista Lista' : '📱 Vista Iconos'}
                    </button>
                </nav>
                <button onClick={() => navigate('/area')} className="btn-logout">Salir</button>
            </aside>

            <main className="main-content">
                <header className="top-bar">
                    <div className="breadcrumb">
                        <h1 className="dashboard-title">{areaName}</h1>
                        <span className="path-text">{currentPath && ` > ${currentPath.replace(/\\/g, ' > ')}`}</span>
                    </div>
                </header>

                <div className="content-glass">
                    <div className="toolbar">
                        <div className="toolbar-left">
                            {currentPath && (
                                <button onClick={handleGoBack} className="btn-back">⬅ Volver</button>
                            )}
                            <h3>{filteredDocuments.length} elementos</h3>
                        </div>

                        <div className="toolbar-right">
                            <input
                                type="text"
                                placeholder="Buscar en esta carpeta..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input"
                            />
                            <button className="btn-upload-new" onClick={() => fileInputRef.current?.click()}>+ Subir</button>
                        </div>
                    </div>

                    <div className="explorer-container">
                        {isLoading ? (
                            <div className="status-msg">🌀 Accediendo al servidor...</div>
                        ) : filteredDocuments.length === 0 ? (
                            <div className="status-msg">📁 Carpeta vacía</div>
                        ) : viewMode === 'list' ? (
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
                                            <td className="col-name">
                                                {doc.type === 'FOLDER' ? '📁' : (
                                                    <img src={FILE_ICONS[doc.type] || FILE_ICONS['DEFAULT']} className="list-icon" alt="" />
                                                )} 
                                                {doc.name}
                                            </td>
                                            <td>{doc.date}</td>
                                            <td>{doc.size}</td>
                                            <td>
                                                {doc.type !== 'FOLDER' && <button className="mini-dl" onClick={(e) => { e.stopPropagation(); handleDownload(doc) }}>⬇</button>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="docs-grid">
                                {filteredDocuments.map((doc) => (
                                    <div
                                        key={doc.id}
                                        className={`doc-card ${doc.type === 'FOLDER' ? 'is-folder' : ''}`}
                                        onClick={() => doc.type === 'FOLDER' && handleFolderClick(doc.name)}
                                    >
                                        <div className="card-icon">
                                            {doc.type === 'FOLDER' ? (
                                                <span className="folder-emoji">📂</span>
                                            ) : (
                                                <img 
                                                    src={FILE_ICONS[doc.type] || FILE_ICONS['DEFAULT']} 
                                                    className="file-icon-img" 
                                                    alt={doc.type} 
                                                />
                                            )}
                                        </div>
                                        <div className="card-info">
                                            <span className="card-name" title={doc.name}>{doc.name}</span>
                                            <span className="card-date">{doc.date}</span>
                                        </div>
                                        {doc.type !== 'FOLDER' && (
                                            <div className="card-actions">
                                                <button onClick={(e) => { e.stopPropagation(); handleDownload(doc); }}>⬇</button>
                                            </div>
                                        )}
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