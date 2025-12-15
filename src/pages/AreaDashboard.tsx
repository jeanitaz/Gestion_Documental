import { useParams, useNavigate } from 'react-router-dom';
import '../styles/AreaDashboard.css';
import { useEffect, useState } from 'react';

// 1. Definimos la interfaz del dato
interface AreaInfo {
    id: string;
    label: string;
}

// 2. Lista de datos (Diccionario)
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
    
    // --- CORRECCIÓN: CALCULAMOS EL NOMBRE DIRECTAMENTE ---
    // No usamos useState ni useEffect para esto. Es más rápido y evita el error.
    const foundArea = AREA_DATA.find(area => area.id === id);
    const areaName = foundArea ? foundArea.label : 'Gestión Documental';

    // Datos quemados para la tabla
    const [documents] = useState([
        { id: 1, name: 'Informe_Mensual_Agosto.pdf', date: '2023-08-15', size: '2.4 MB', type: 'PDF' },
        { id: 2, name: 'Nomina_Personal.xlsx', date: '2023-08-10', size: '1.1 MB', type: 'EXCEL' },
        { id: 3, name: 'Requerimiento_Equipos.docx', date: '2023-08-05', size: '500 KB', type: 'WORD' },
    ]);

    // Solo usamos useEffect para verificar la seguridad (sesión)
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
                        {/* Usamos (id || 'user') para evitar undefined */}
                        <span className="user-name">Admin {(id || 'User').toUpperCase()}</span>
                    </div>
                </header>

                <div className="content-glass">
                    <div className="toolbar">
                        <h3>Archivos del Área</h3>
                        <button className="btn-upload-new">
                            + Subir Nuevo
                        </button>
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
                                {documents.map((doc) => (
                                    <tr key={doc.id}>
                                        <td className="col-name">
                                            <span className="file-icon">📄</span> {doc.name}
                                        </td>
                                        <td>{doc.date}</td>
                                        <td><span className={`badge ${doc.type}`}>{doc.type}</span></td>
                                        <td>{doc.size}</td>
                                        <td>
                                            <button className="btn-action download">⬇</button>
                                            <button className="btn-action delete">🗑</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AreaDashboard;