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
    
    // Estados para MODAL CREAR ÁREA (¡AQUÍ ESTABAN FALTANDO LOS DEL ÍCONO!)
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newAreaName, setNewAreaName] = useState('');
    const [newAreaUser, setNewAreaUser] = useState('');
    const [newAreaPass, setNewAreaPass] = useState('');
    const [newAreaIcon, setNewAreaIcon] = useState('📂'); // <--- AGREGADO
    const [showEmojiPicker, setShowEmojiPicker] = useState(false); // <--- AGREGADO
    const [isCreating, setIsCreating] = useState(false);

    // 2. FUNCIONES
    const formatTimeAgo = (isoDate: string) => {
        const date = new Date(isoDate);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
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
                setAuditLogs(data);
                
                const todayStr = new Date().toISOString().split('T')[0];
                const countHoy = data.filter((log: LogEntry) => log.time.startsWith(todayStr)).length;
                
                setStats({ hoy: countHoy, areas: areasData.length });
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
            <div className="admin-sidebar">
                <div className="admin-logo">🛡️ AUDITORÍA</div>
                <nav className="admin-nav">
                    <button className={!showCreateModal ? "active" : ""} onClick={() => setShowCreateModal(false)}>
                        📊 Panel General
                    </button>
                    <button 
                        className={showCreateModal ? "active" : ""} 
                        onClick={() => setShowCreateModal(true)}
                        style={{ color: '#10b981', fontWeight: 'bold' }}
                    >
                        ➕ Crear Nueva Área
                    </button>
                </nav>
                <button className="btn-admin-logout" onClick={handleLogout}>Cerrar Auditoría</button>
            </div>

            <div className="admin-content">
                <header className="admin-header">
                    <h1>{showCreateModal ? 'Gestión de Áreas' : 'Registro de Actividad'}</h1>
                    <div className="admin-badge">Super Admin</div>
                </header>

                {showCreateModal ? (
                    <div className="logs-table-container" style={{ maxWidth: '600px', margin: '0 auto' }}>
                        <h2 style={{ color: '#10b981', marginBottom: '20px' }}>Nueva Área</h2>
                        <form className="login-form" onSubmit={handleCreateArea}>
                            
                            {/* Selector de Icono */}
                            <div className="input-group">
                                <label>Ícono</label>
                                <div 
                                    style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '5px', cursor: 'pointer', textAlign: 'center', fontSize: '1.5rem' }}
                                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                >
                                    {newAreaIcon} <span style={{fontSize: '0.8rem'}}>▼</span>
                                </div>
                                {showEmojiPicker && (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '5px', marginTop: '5px', border: '1px solid #ddd', padding: '10px', background: '#fff' }}>
                                        {EMOJI_LIST.map(emoji => (
                                            <div key={emoji} onClick={() => { setNewAreaIcon(emoji); setShowEmojiPicker(false); }} style={{cursor: 'pointer', fontSize: '1.5rem'}}>
                                                {emoji}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="input-group">
                                <label>Nombre del Área</label>
                                <input type="text" value={newAreaName} onChange={(e) => setNewAreaName(e.target.value)} required style={{width: '100%', padding: '10px'}} />
                            </div>
                            <div className="input-group">
                                <label>Usuario</label>
                                <input type="email" value={newAreaUser} onChange={(e) => setNewAreaUser(e.target.value)} required style={{width: '100%', padding: '10px'}} />
                            </div>
                            <div className="input-group">
                                <label>Contraseña</label>
                                <input type="text" value={newAreaPass} onChange={(e) => setNewAreaPass(e.target.value)} required style={{width: '100%', padding: '10px'}} />
                            </div>
                            <button type="submit" className="btn-login-glow" disabled={isCreating} style={{width: '100%', padding: '10px', background: '#10b981', color: 'white', border: 'none', borderRadius: '5px'}}>
                                {isCreating ? 'Creando...' : 'Guardar Área'}
                            </button>
                        </form>
                    </div>
                ) : (
                    <>
                        <div className="stats-grid">
                            <div className="stat-card"><h3>Hoy</h3><p>{stats.hoy}</p></div>
                            <div className="stat-card"><h3>Áreas</h3><p>{stats.areas}</p></div>
                        </div>
                        <div className="logs-table-container">
                            <h2>Logs Recientes</h2>
                            <table className="admin-table">
                                <thead><tr><th>Área</th><th>Usuario</th><th>Acción</th><th>Detalle</th><th>Tiempo</th></tr></thead>
                                <tbody>
                                    {auditLogs.map(log => (
                                        <tr key={log.id}>
                                            <td style={{fontWeight:'bold', color:'#10b981'}}>{log.area}</td>
                                            <td>{log.user}</td>
                                            <td>{log.action}</td>
                                            <td>{log.detail}</td>
                                            <td>{formatTimeAgo(log.time)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;