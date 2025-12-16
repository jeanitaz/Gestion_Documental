import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminDashboard.css';

const AUDIT_LOGS = [
    { id: 1, area: 'Tecnologías Info.', action: 'Subida de Archivo', detail: 'manual_redes.pdf', user: 'admin_tic', time: 'Hace 5 min' },
    { id: 2, area: 'Recursos Humanos', action: 'Eliminación', detail: 'nomina_julio.xlsx', user: 'admin_rrhh', time: 'Hace 10 min' },
    { id: 3, area: 'Hidrometeorología', action: 'Acceso al Sistema', detail: 'Login Exitoso', user: 'admin_hidro', time: 'Hace 25 min' },
    { id: 4, area: 'Dirección Ejecutiva', action: 'Creación de Carpeta', detail: 'Informes 2025', user: 'admin_dir', time: 'Hace 1 hora' },
    { id: 5, area: 'Asesoría Jurídica', action: 'Subida de Archivo', detail: 'contrato_001.pdf', user: 'admin_jur', time: 'Hace 2 horas' },
];

const AdminDashboard = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('userSession');
        navigate('/area');
    };

    useEffect(() => {
        const session = localStorage.getItem('userSession');
        if (!session) {
            navigate('/area');
        } else {
            const parsed = JSON.parse(session);
            if (parsed.role !== 'super_admin') {
                alert('Acceso Denegado: Se requiere rol de Super Administrador');
                navigate('/area');
            }
        }
    }, [navigate]);

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
                        <h3>Archivos Hoy</h3>
                        <p>124</p>
                    </div>
                    <div className="stat-card">
                        <h3>Áreas Activas</h3>
                        <p>12</p>
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
                            {AUDIT_LOGS.map(log => (
                                <tr key={log.id}>
                                    {/* Color Verde en la tabla */}
                                    <td style={{ fontWeight: 'bold', color: '#10b981' }}>{log.area}</td>
                                    <td>{log.user}</td>
                                    <td>
                                        <span className={`tag ${log.action.includes('Eliminación') ? 'red' : 'blue'}`}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td>{log.detail}</td>
                                    <td>{log.time}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;