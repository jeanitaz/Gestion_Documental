import { useNavigate } from 'react-router-dom';
import '../styles/AdminDashboard.css';
import { useEffect, useState } from 'react';

// Definimos la estructura de los datos para TypeScript
interface LogEntry {
    id: number;
    area: string;
    action: string;
    detail: string;
    user: string;
    time: string;
}

const AdminDashboard = () => {
    const navigate = useNavigate();
    
    // 1. ESTADOS
    const [auditLogs, setAuditLogs] = useState<LogEntry[]>([]);
    const [stats, setStats] = useState({ hoy: 0, areas: 12 });

    // 2. FUNCIONES (Deben ir ANTES del useEffect)
    
    const formatTimeAgo = (isoDate: string) => {
        const date = new Date(isoDate);
        const now = new Date();
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (seconds < 60) return 'Hace un momento';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `Hace ${minutes} min`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `Hace ${hours} horas`;
        return date.toLocaleDateString();
    };

    const handleLogout = () => {
        localStorage.removeItem('userSession');
        navigate('/area');
    };

    // --- ESTA ES LA FUNCIÓN QUE FALTABA O ESTABA MAL UBICADA ---
    const fetchLogs = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/auditoria');
            if (response.ok) {
                const data = await response.json();
                setAuditLogs(data);

                // Calcular estadísticas
                const todayStr = new Date().toISOString().split('T')[0];
                const countHoy = data.filter((log: LogEntry) => log.time.startsWith(todayStr)).length;
                
                setStats(prev => ({ ...prev, hoy: countHoy }));
            }
        } catch (error) {
            console.error("Error conectando con auditoría:", error);
        }
    };
    // ------------------------------------------------------------

    // 3. USE EFFECT (Ahora sí encontrará fetchLogs)
    useEffect(() => {
        const session = localStorage.getItem('userSession');
        
        if (!session) {
            navigate('/area');
        } else {
            const parsed = JSON.parse(session);
            if (parsed.role !== 'super_admin') {
                alert('Acceso Denegado: Se requiere rol de Super Administrador');
                navigate('/area');
            } else {
                // Cargar datos iniciales
                fetchLogs();

                // Actualizar automáticamente cada 5 segundos
                const interval = setInterval(fetchLogs, 5000);
                return () => clearInterval(interval);
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [navigate]); 

    // 4. RENDERIZADO
    return (
        <div className="admin-container">
            <div className="admin-sidebar">
                <div className="admin-logo">🛡️ AUDITORÍA</div>
                <nav className="admin-nav">
                    <button className="active">📊 Panel General</button>
                    <button>👥 Usuarios Admin</button>
                    <button>⚙️ Configuraciones</button>
                </nav>
                <button className="btn-admin-logout" onClick={handleLogout}>Cerrar Auditoría</button>
            </div>

            <div className="admin-content">
                <header className="admin-header">
                    <h1>Registro de Actividad Institucional</h1>
                    <div className="admin-badge">Super Admin</div>
                </header>

                <div className="stats-grid">
                    <div className="stat-card">
                        <h3>Movimientos Hoy</h3>
                        <p>{stats.hoy}</p>
                    </div>
                    <div className="stat-card">
                        <h3>Áreas Activas</h3>
                        <p>{stats.areas}</p>
                    </div>
                    <div className="stat-card">
                        <h3>Alertas</h3>
                        <p style={{ color: '#ef4444' }}>0</p>
                    </div>
                </div>

                <div className="logs-table-container">
                    <h2>Últimos Eventos Registrados</h2>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Área</th>
                                <th>Usuario</th>
                                <th>Acción</th>
                                <th>Detalle</th>
                                <th>Tiempo</th>
                            </tr>
                        </thead>
                        <tbody>
                            {auditLogs.length > 0 ? (
                                auditLogs.map((log) => (
                                    <tr key={log.id}>
                                        <td style={{ fontWeight: 'bold', color: '#10b981' }}>{log.area}</td>
                                        <td>{log.user}</td>
                                        <td>
                                            <span className={`tag ${log.action.includes('Eliminación') ? 'red' : 'blue'}`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td>{log.detail}</td>
                                        <td>{formatTimeAgo(log.time)}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} style={{ textAlign: 'center', padding: '20px' }}>
                                        Esperando datos del servidor...
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
