import { useNavigate } from 'react-router-dom';
import '../styles/AdminDashboard.css';
import { useEffect, useState } from 'react';

// Interfaces (Modificada para aceptar claves en español e inglés)
interface LogEntry {
    id: number;
    area: string;
    
    // Soporte para inglés y español (Frontend vs Backend)
    action?: string;
    accion?: string;
    
    detail?: string;
    detalle?: string;
    
    usuario?: string;
    user?: string;
    
    fecha?: string;
    time?: string;
}

interface AreaData {
    id: string;
    name: string;
    icon: string;
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
    const [existingAreas, setExistingAreas] = useState<AreaData[]>([]); 
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
    const formatTimeAgo = (isoDate: string | undefined) => {
        if (!isoDate) return 'Fecha desconocida';
        const date = new Date(isoDate);
        if (isNaN(date.getTime())) return 'Fecha inválida';
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const handleLogout = () => {
        localStorage.removeItem('userSession');
        navigate('/area');
    };

    // Función unificada para cargar todo
    const fetchAllData = async () => {
        try {
            const logsRes = await fetch('/api/auditoria');
            const areasRes = await fetch('/api/areas');
            
            if (logsRes.ok && areasRes.ok) {
                const logsData = await logsRes.json();
                const areasData = await areasRes.json();
                
                // Actualizar Logs
                if (Array.isArray(logsData)) {
                    setAuditLogs(logsData);
                    const todayStr = new Date().toISOString().split('T')[0];
                    // Cuenta los registros de hoy (soporta 'fecha' y 'time')
                    const countHoy = logsData.filter((log: any) => (log.fecha || log.time || '').startsWith(todayStr)).length;
                    setStats({ hoy: countHoy, areas: areasData.length });
                }

                // Actualizar Lista de Áreas
                if (Array.isArray(areasData)) {
                    setExistingAreas(areasData);
                }
            }
        } catch (error) { console.error(error); }
    };

    // --- ELIMINAR HISTORIAL ---
    const handleClearLogs = async () => {
        if (!confirm('⚠️ ¿Estás seguro de que quieres BORRAR TODO el historial? Esta acción no se puede deshacer.')) return;

        try {
            const res = await fetch('/api/auditoria', { method: 'DELETE' });
            if (res.ok) {
                alert('Historial eliminado correctamente');
                fetchAllData(); 
            } else {
                alert('Error al intentar eliminar');
            }
        } catch (error) {
            console.error(error);
            alert('Error de conexión');
        }
    };

    // --- ELIMINAR ÁREA ---
    const handleDeleteArea = async (areaId: string, areaName: string) => {
        if (!confirm(`🛑 PELIGRO CRÍTICO 🛑\n\n¿Estás seguro de ELIMINAR el área "${areaName}"?\n\n1. Se borrará la carpeta de archivos del servidor.\n2. Se borrarán las credenciales de acceso.\n3. Esta acción es IRREVERSIBLE.`)) return;

        const confirmacion = prompt(`Escribe "ELIMINAR" para confirmar el borrado de ${areaName}:`);
        if (confirmacion !== "ELIMINAR") return;

        try {
            const response = await fetch('/api/eliminar-area', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ areaId })
            });

            const data = await response.json();
            if (response.ok && data.success) {
                alert('✅ Área eliminada correctamente.');
                fetchAllData();
            } else {
                alert('❌ Error: ' + (data.error || 'No se pudo eliminar'));
            }
        } catch (e) {
            alert('Error de conexión con el servidor');
        }
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
            const response = await fetch('/api/crear-area', {
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
                fetchAllData(); 
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
                fetchAllData();
                const interval = setInterval(fetchAllData, 5000);
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

                            {/* --- SECCIÓN 1: GESTIÓN DE ÁREAS --- */}
                            <div className="table-card" style={{ marginBottom: '30px' }}>
                                <div className="table-header">
                                    <h2>Gestión de Áreas</h2>
                                </div>
                                <div className="table-responsive" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                    <table className="admin-table">
                                        <thead>
                                            <tr>
                                                <th>Ícono</th>
                                                <th>Nombre del Departamento</th>
                                                <th>ID Sistema</th>
                                                <th>Acción</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {existingAreas.length > 0 ? existingAreas.map(area => (
                                                <tr key={area.id}>
                                                    <td style={{ fontSize: '1.5rem', textAlign: 'center' }}>{area.icon}</td>
                                                    <td style={{ fontWeight: 'bold', color: '#334155' }}>{area.name}</td>
                                                    <td style={{ color: '#94a3b8', fontFamily: 'monospace' }}>{area.id}</td>
                                                    <td>
                                                        <button 
                                                            className="btn-clear" 
                                                            style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                                                            onClick={() => handleDeleteArea(area.id, area.name)}
                                                        >
                                                            🗑️ Eliminar
                                                        </button>
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr><td colSpan={4} style={{ textAlign: 'center', padding: '20px' }}>No hay áreas registradas.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* --- SECCIÓN 2: LOGS DE AUDITORÍA --- */}
                            <div className="table-card">
                                <div className="table-header">
                                    <h2>Logs Recientes</h2>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button className="btn-clear" onClick={handleClearLogs} style={{
                                            background: '#fee2e2', color: '#ef4444', border: 'none', padding: '10px 15px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer'
                                        }}>
                                            🗑️ Limpiar Historial
                                        </button>
                                        <button className="btn-refresh" onClick={fetchAllData}>🔄 Actualizar</button>
                                    </div>
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
                                                auditLogs.map((log, index) => (
                                                    <tr key={index}>
                                                        <td>
                                                            <span className="area-badge">{log.area || 'General'}</span>
                                                        </td>
                                                        <td className="user-cell" style={{ fontWeight: '600', color: '#475569' }}>
                                                            {/* SOLUCIÓN: Lee ambos campos (usuario O user) */}
                                                            {log.usuario || log.user || 'Desconocido'}
                                                        </td>
                                                        <td>
                                                            <span className={`action-tag ${(log.action || log.accion || '').toLowerCase().includes('login') ? 'blue' : 'gray'}`}>
                                                                {/* SOLUCIÓN: Lee ambos campos (action O accion) */}
                                                                {log.action || log.accion || 'Acción'}
                                                            </span>
                                                        </td>
                                                        <td className="detail-cell">
                                                            {/* SOLUCIÓN: Lee ambos campos (detail O detalle) */}
                                                            {log.detail || log.detalle || '-'}
                                                        </td>
                                                        <td className="time-cell">
                                                            {/* SOLUCIÓN: Lee ambos campos (fecha O time) */}
                                                            {formatTimeAgo(log.fecha || log.time)}
                                                        </td>
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
