import { useNavigate } from 'react-router-dom';
import '../styles/AdminDashboard.css';
import { useEffect, useState } from 'react';

// Interfaces
interface LogEntry {
    id: number;
    area: string;
    action: string;
    detail: string;
    user: string;
    time: string;
}

// Lista de emojis para el selector
const EMOJI_LIST = [
    '📂', '💻', '🌧️', '👥', '📊', '👔', '⚖️', '📢', '📅', '⚠️', 
    '🔬', '📡', '💧', '🚀', '🛠️', '🔒', '📈', '📝', '📞', '🚒'
];

const AdminDashboard = () => {
    const navigate = useNavigate();
    
    // 1. ESTADOS
    const [auditLogs, setAuditLogs] = useState<LogEntry[]>([]);
    const [stats, setStats] = useState({ hoy: 0, areas: 0 });
    
    // Estados para MODAL CREAR ÁREA
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newAreaName, setNewAreaName] = useState('');
    const [newAreaUser, setNewAreaUser] = useState('');
    const [newAreaPass, setNewAreaPass] = useState('');
    const [newAreaIcon, setNewAreaIcon] = useState('📂'); 
    const [showEmojiPicker, setShowEmojiPicker] = useState(false); 
    const [isCreating, setIsCreating] = useState(false);

    // 2. FUNCIONES
    const formatTimeAgo = (isoDate: string) => {
        if (!isoDate) return 'Fecha desconocida';
        const date = new Date(isoDate);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const handleLogout = () => {
        localStorage.removeItem('userSession');
        navigate('/area');
    };

    const fetchLogs = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/auditoria');
            const areasRes = await fetch('http://localhost:3001/api/areas');
            
            if (response.ok && areasRes.ok) {
                const data = await response.json();
                const areasData = await areasRes.json();
                
                // Aseguramos que data sea un array antes de setearlo
                if (Array.isArray(data)) {
                    setAuditLogs(data);
                    
                    const todayStr = new Date().toISOString().split('T')[0];
                    const countHoy = data.filter((log: LogEntry) => log.time && log.time.startsWith(todayStr)).length;
                    
                    setStats({ hoy: countHoy, areas: areasData.length });
                }
            }
        } catch (error) { console.error(error); }
    };

    // --- CREAR ÁREA ---
    const handleCreateArea = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newAreaName || !newAreaUser || !newAreaPass) return;

        setIsCreating(true);

        const generatedId = newAreaName.toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .replace(/\s+/g, '-');

        try {
            const response = await fetch('http://localhost:3001/api/crear-area', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    nombreCarpeta: generatedId,
                    nombreVisible: newAreaName,
                    icono: newAreaIcon,
                    usuario: newAreaUser,
                    pass: newAreaPass
                })
            });

            const data = await response.json();

            if (data.success) {
                alert(`✅ Área "${newAreaName}" creada y disponible en login.`);
                setShowCreateModal(false);
                setNewAreaName(''); setNewAreaUser(''); setNewAreaPass(''); setNewAreaIcon('📂');
                fetchLogs(); 
            } else {
                alert('❌ Error: ' + (data.details || 'Error desconocido'));
            }
        } finally {
            setIsCreating(false);
        }
    };

    useEffect(() => {
        const session = localStorage.getItem('userSession');
        if (!session) {
            navigate('/area');
        } else {
            const parsed = JSON.parse(session);
            if (parsed.role !== 'super_admin') {
                alert('Acceso Denegado');
                navigate('/area');
            } else {
                fetchLogs();
                const interval = setInterval(fetchLogs, 5000);
                return () => clearInterval(interval);
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [navigate]); 

    return (
        <div className="admin-container">
            {/* SIDEBAR FLOTANTE */}
            <div className="admin-sidebar">
                <div className="admin-logo-container">
                    <div className="admin-logo-icon">🛡️</div>
                    <div className="admin-logo-text">AUDITORÍA</div>
                </div>
                
                <nav className="admin-nav">
                    <button className={!showCreateModal ? "active" : ""} onClick={() => setShowCreateModal(false)}>
                        <span className="nav-icon">📊</span> Panel General
                    </button>
                    <button 
                        className={showCreateModal ? "active" : ""} 
                        onClick={() => setShowCreateModal(true)}
                    >
                        <span className="nav-icon">➕</span> Crear Nueva Área
                    </button>
                </nav>

                <div className="sidebar-footer">
                    <button className="btn-admin-logout" onClick={handleLogout}>
                        <span className="logout-icon">🚪</span> Cerrar Sesión
                    </button>
                </div>
            </div>

            {/* CONTENIDO FLOTANTE */}
            <div className="admin-content">
                <header className="admin-header">
                    <div>
                        <h1 className="page-title">{showCreateModal ? 'Gestión de Áreas' : 'Registro de Actividad'}</h1>
                        <p className="page-subtitle">Bienvenido, Super Administrador</p>
                    </div>
                    <div className="admin-profile-badge">
                        <div className="status-dot"></div>
                        Super Admin
                    </div>
                </header>

                <div className="content-scrollable">
                    {showCreateModal ? (
                        /* FORMULARIO DE CREACIÓN */
                        <div className="create-area-wrapper">
                            <div className="create-card">
                                <h2 className="card-title">Nueva Área Departamental</h2>
                                <p className="card-desc">Complete los datos para registrar un nuevo departamento en el sistema.</p>
                                
                                <form className="admin-form" onSubmit={handleCreateArea}>
                                    
                                    {/* Selector de Icono */}
                                    <div className="form-group icon-picker-group">
                                        <label>Ícono Representativo</label>
                                        <div className="icon-selector-wrapper">
                                            <div 
                                                className="selected-icon-display"
                                                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                            >
                                                {newAreaIcon}
                                            </div>
                                            {showEmojiPicker && (
                                                <div className="emoji-picker-dropdown">
                                                    {EMOJI_LIST.map(emoji => (
                                                        <div key={emoji} className="emoji-item" onClick={() => { setNewAreaIcon(emoji); setShowEmojiPicker(false); }}>
                                                            {emoji}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>Nombre del Área</label>
                                        <input type="text" placeholder="Ej. Recursos Humanos" value={newAreaName} onChange={(e) => setNewAreaName(e.target.value)} required />
                                    </div>
                                    
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Usuario Admin</label>
                                            <input type="email" placeholder="admin_rrhh@inamhi.gob.ec" value={newAreaUser} onChange={(e) => setNewAreaUser(e.target.value)} required />
                                        </div>
                                        <div className="form-group">
                                            <label>Contraseña</label>
                                            <input type="text" placeholder="Contraseña segura" value={newAreaPass} onChange={(e) => setNewAreaPass(e.target.value)} required />
                                        </div>
                                    </div>

                                    <button type="submit" className="btn-save-area" disabled={isCreating}>
                                        {isCreating ? 'Procesando...' : '💾 Guardar Área'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    ) : (
                        /* DASHBOARD PRINCIPAL */
                        <>
                            <div className="stats-grid">
                                <div className="stat-card">
                                    <div className="stat-icon bg-green">📅</div>
                                    <div className="stat-info">
                                        <h3>Actividad de Hoy</h3>
                                        <p>{stats.hoy} <span className="stat-label">registros</span></p>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon bg-blue">🏢</div>
                                    <div className="stat-info">
                                        <h3>Áreas Activas</h3>
                                        <p>{stats.areas} <span className="stat-label">departamentos</span></p>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon bg-purple">📝</div>
                                    <div className="stat-info">
                                        <h3>Total Histórico</h3>
                                        <p>{auditLogs.length} <span className="stat-label">eventos</span></p>
                                    </div>
                                </div>
                            </div>

                            <div className="table-card">
                                <div className="table-header">
                                    <h2>Logs Recientes</h2>
                                    <button className="btn-refresh" onClick={fetchLogs}>🔄 Actualizar</button>
                                </div>
                                <div className="table-responsive">
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
                                                auditLogs.map(log => (
                                                    <tr key={log.id}>
                                                        <td>
                                                            <span className="area-badge">{log.area || 'General'}</span>
                                                        </td>
                                                        <td className="user-cell">{log.user || 'Desconocido'}</td>
                                                        <td>
                                                            {/* AQUÍ ESTABA EL ERROR: AGREGADO CHEQUEO DE NULOS */}
                                                            <span className={`action-tag ${(log.action || '').toLowerCase().includes('login') ? 'blue' : 'gray'}`}>
                                                                {log.action || 'Acción'}
                                                            </span>
                                                        </td>
                                                        <td className="detail-cell">{log.detail}</td>
                                                        <td className="time-cell">{formatTimeAgo(log.time)}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={5} style={{textAlign: 'center', padding: '30px', color: '#94a3b8'}}>No hay registros disponibles.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
