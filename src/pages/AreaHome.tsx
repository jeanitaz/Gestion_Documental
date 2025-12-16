import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/AreaHome.css'; 

// --- LISTA DE EMOJIS ---
const EMOJI_LIST = [
    '📂', '💻', '🌧️', '👥', '📊', '👔', '⚖️', '📢', '📅', '⚠️', 
    '🔬', '📡', '💧', '🚀', '🛠️', '🔒', '📈', '📝', '📞', '🚒',
    '🌍', '🌡️', '⚡', '💡', '🏗️', '🏥', '🚌', '✈️', '🚢', '🛂'
];

// --- DATOS INICIALES ---
const INITIAL_CREDENTIALS = [
    { id: 'tic',          user: 'admin_tic@inamhi.gob.ec', pass: 'tic123' },
    { id: 'hidro',        user: 'admin_hidro@inamhi.gob.ec', pass: 'hidro123' },
    { id: 'rrhh',         user: 'admin_rrhh@inamhi.gob.ec', pass: 'rrhh123' },
    { id: 'admin-fin',    user: 'admin_fin@inamhi.gob.ec', pass: 'fin123' },
    { id: 'ejecutiva',    user: 'admin_dir@inamhi.gob.ec', pass: 'dir123' },
    { id: 'juridica',     user: 'admin_jur@inamhi.gob.ec', pass: 'jur123' },
    { id: 'com-social',   user: 'admin_com@inamhi.gob.ec', pass: 'com123' },
    { id: 'planificacion', user: 'admin_plan@inamhi.gob.ec', pass: 'plan123' },
    { id: 'pronosticos',  user: 'admin_pron@inamhi.gob.ec', pass: 'pron123' },
    { id: 'estudios',     user: 'admin_est@inamhi.gob.ec', pass: 'est123' },
    { id: 'red-obs',      user: 'admin_red@inamhi.gob.ec', pass: 'red123' },
    { id: 'calidad-agua', user: 'admin_lab@inamhi.gob.ec', pass: 'lab123' },
];

interface Area {
    id: string;
    name: string;
    icon: string;
}

const INITIAL_AREAS: Area[] = [
    { id: 'tic', name: 'Tecnologías de la Información y Comunicación', icon: '💻' },
    { id: 'hidro', name: 'Dirección de Información Hidrometeorológica', icon: '🌧️' },
    { id: 'rrhh', name: 'Dirección de Admin. de Recursos Humanos', icon: '👥' },
    { id: 'admin-fin', name: 'Dirección Administrativa Financiera', icon: '📊' },
    { id: 'ejecutiva', name: 'Dirección Ejecutiva', icon: '👔' },
    { id: 'juridica', name: 'Dirección de Asesoría Jurídica', icon: '⚖️' },
    { id: 'com-social', name: 'Dirección de Comunicación Social', icon: '📢' },
    { id: 'planificacion', name: 'Dirección de Planificación', icon: '📅' },
    { id: 'pronosticos', name: 'Dirección de Pronósticos y Alertas', icon: '⚠️' },
    { id: 'estudios', name: 'Dirección de Estudios e Investigación', icon: '🔬' },
    { id: 'red-obs', name: 'Red Nacional de Observación', icon: '📡' },
    { id: 'calidad-agua', name: 'Lab. Nacional Calidad de Agua', icon: '💧' },
];

const AreaHome = () => {
    const navigate = useNavigate();
    
    // Estados Globales
    const [areaList, setAreaList] = useState<Area[]>(INITIAL_AREAS);
    const [credentialsList, setCredentialsList] = useState(INITIAL_CREDENTIALS);

    // Estados Login Área
    const [selectedArea, setSelectedArea] = useState<Area | null>(null);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showLoginPass, setShowLoginPass] = useState(false); 

    // Estados Login Admin (Auditoría)
    const [showAdminModal, setShowAdminModal] = useState(false);
    const [adminUser, setAdminUser] = useState('');
    const [adminPass, setAdminPass] = useState('');
    const [showAdminPass, setShowAdminPass] = useState(false);

    // Estados Crear Área
    const [showAddModal, setShowAddModal] = useState(false);
    const [newAreaName, setNewAreaName] = useState('');
    const [newAreaId, setNewAreaId] = useState('');
    const [newAreaIcon, setNewAreaIcon] = useState('📂');
    const [newAreaUser, setNewAreaUser] = useState('');
    const [newAreaPass, setNewAreaPass] = useState('');
    const [showCreatePass, setShowCreatePass] = useState(false); 
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    // 1. LOGIN DE ÁREA
    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        setTimeout(() => {
            if (selectedArea) {
                const validCreds = credentialsList.find(c => c.id === selectedArea.id);
                if (validCreds && validCreds.user === username && validCreds.pass === password) {
                    localStorage.setItem('userSession', JSON.stringify({ area: selectedArea.id, user: username, role: 'area_admin' }));
                    navigate(`/dashboard/${selectedArea.id}`); 
                } else {
                    setError('Usuario o contraseña incorrectos.');
                    setIsLoading(false);
                }
            }
        }, 800);
    };

    // 2. LOGIN SUPER ADMIN (AUDITORÍA)
    const handleAdminLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        setTimeout(() => {
            if (adminUser === 'admin' && adminPass === 'admin') {
                localStorage.setItem('userSession', JSON.stringify({ area: 'general', user: 'Super Admin', role: 'super_admin' }));
                navigate('/admin-dashboard');
            } else {
                setError('Credenciales de auditoría inválidas.');
                setIsLoading(false);
            }
        }, 800);
    };

    // 3. GUARDAR NUEVA ÁREA
    const handleSaveNewArea = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newAreaName || !newAreaId || !newAreaUser || !newAreaPass) return;
        const safeId = newAreaId.toLowerCase().replace(/\s+/g, '-');
        const newArea: Area = { id: safeId, name: newAreaName, icon: newAreaIcon };
        const newCredential = { id: newArea.id, user: newAreaUser, pass: newAreaPass };
        setAreaList([...areaList, newArea]);
        setCredentialsList([...credentialsList, newCredential]);
        alert('¡Área creada exitosamente!');
        closeModal();
    };

    const closeModal = () => {
        setSelectedArea(null);
        setShowAddModal(false);
        setShowAdminModal(false);
        setUsername(''); setPassword(''); setAdminUser(''); setAdminPass(''); setError(''); setIsLoading(false);
        setNewAreaName(''); setNewAreaId(''); setNewAreaIcon('📂'); setNewAreaUser(''); setNewAreaPass('');
        setShowLoginPass(false); setShowCreatePass(false); setShowAdminPass(false); setShowEmojiPicker(false);
    };

    return (
        <div className="area-home-container">
            <div className="weather-bg-animation"></div>
            <div className="particles"><span></span><span></span><span></span><span></span><span></span></div>

            <div className={`area-glass-container animate-entry ${selectedArea || showAddModal || showAdminModal ? 'blur-background' : ''}`}>
                
                {/* HEADER */}
                <div className="area-header-container">
                    <h2 className="area-title">Selecciona tu Área</h2>
                    {/* Botón Auditoría (Ahora es verde) */}
                    <button className="btn-audit-corner" onClick={() => setShowAdminModal(true)}>
                        🛡️ AUDITORÍA
                    </button>
                    <p className="area-subtitle">Elige el departamento para acceder a la gestión documental</p>
                </div>

                <div className="area-grid">
                    {areaList.map((area) => (
                        <div key={area.id} className="area-card" onClick={() => setSelectedArea(area)}>
                            <div className="card-icon">{area.icon}</div>
                            <div className="card-text">{area.name}</div>
                            <div className="card-shine"></div>
                        </div>
                    ))}
                    <div className="area-card add-new-card" onClick={() => setShowAddModal(true)}>
                        <div className="card-icon">➕</div>
                        <div className="card-text" style={{ color: 'var(--cyan-water)' }}>Agregar Nueva Área</div>
                        <div className="card-shine"></div>
                    </div>
                </div>
                <div className="area-footer">
                    <Link to="/" className="btn-back">← Regresar al Inicio</Link>
                </div>
            </div>

            {/* --- MODAL 1: LOGIN DE ÁREA --- */}
            {selectedArea && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-glass" onClick={(e) => e.stopPropagation()}>
                        <button className="btn-close-modal" onClick={closeModal}>✕</button>
                        <div className="modal-header">
                            <div className="modal-icon-wrapper">{selectedArea.icon}</div>
                            <h3 className="modal-area-name">{selectedArea.name}</h3>
                            <p className="modal-instruction">Administrador de Área</p>
                        </div>
                        <form className="login-form" onSubmit={handleLogin}>
                            <div className="input-group">
                                <label>Usuario</label>
                                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} autoFocus required />
                            </div>
                            <div className="input-group password-group">
                                <label>Contraseña</label>
                                <div style={{ position: 'relative' }}>
                                    <input type={showLoginPass ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', paddingRight: '40px' }} />
                                    <span className="password-toggle" onClick={() => setShowLoginPass(!showLoginPass)}>{showLoginPass ? '👁️' : '🔒'}</span>
                                </div>
                            </div>
                            {error && <div className="error-message">⚠️ {error}</div>}
                            <button type="submit" className="btn-login-glow" disabled={isLoading}>{isLoading ? 'ACCEDIENDO...' : 'INGRESAR AL SISTEMA'}</button>
                        </form>
                    </div>
                </div>
            )}

            {/* --- MODAL 2: LOGIN ADMIN (AUDITORÍA - VERDE) --- */}
            {showAdminModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    {/* Borde Verde */}
                    <div className="modal-glass" onClick={(e) => e.stopPropagation()} style={{ borderColor: '#10b981' }}>
                        <button className="btn-close-modal" onClick={closeModal}>✕</button>
                        <div className="modal-header">
                            <div className="modal-icon-wrapper" style={{ filter: 'drop-shadow(0 0 15px rgba(16, 185, 129, 0.4))' }}>🛡️</div>
                            {/* Título Gradiente Verde */}
                            <h3 className="modal-area-name" style={{ backgroundImage: 'linear-gradient(to right, #fff, #10b981)' }}>Auditoría General</h3>
                            <p className="modal-instruction">Acceso exclusivo Super Administrador</p>
                        </div>
                        <form className="login-form" onSubmit={handleAdminLogin}>
                            <div className="input-group">
                                {/* Labels Verdes */}
                                <label style={{ color: '#10b981' }}>Usuario Admin</label>
                                {/* Inputs con Borde Verde Tenue */}
                                <input type="text" value={adminUser} onChange={(e) => setAdminUser(e.target.value)} autoFocus required style={{ borderColor: 'rgba(16, 185, 129, 0.3)' }} />
                            </div>
                            <div className="input-group password-group">
                                <label style={{ color: '#10b981' }}>Contraseña</label>
                                <div style={{ position: 'relative' }}>
                                    <input type={showAdminPass ? "text" : "password"} value={adminPass} onChange={(e) => setAdminPass(e.target.value)} required style={{ width: '100%', paddingRight: '40px', borderColor: 'rgba(16, 185, 129, 0.3)' }} />
                                    <span className="password-toggle" onClick={() => setShowAdminPass(!showAdminPass)}>{showAdminPass ? '👁️' : '🔒'}</span>
                                </div>
                            </div>
                            {/* Mensaje de Error Verde/Rojo */}
                            {error && <div className="error-message" style={{ borderColor: '#10b981', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)' }}>⚠️ {error}</div>}
                            {/* Botón con Gradiente Verde */}
                            <button type="submit" className="btn-login-glow" disabled={isLoading} style={{ background: 'linear-gradient(90deg, #059669, #10b981)', color: 'white' }}>
                                {isLoading ? 'VERIFICANDO...' : 'ACCEDER AL PANEL'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* --- MODAL 3: CREAR ÁREA --- */}
            {showAddModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-glass modal-large" onClick={(e) => e.stopPropagation()}>
                        <button className="btn-close-modal" onClick={closeModal}>✕</button>
                        <div className="modal-header">
                            <div className="modal-icon-wrapper">✨</div>
                            <h3 className="modal-area-name">Crear Nueva Área</h3>
                            <p className="modal-instruction">Ingresa los datos y credenciales</p>
                        </div>
                        <form className="login-form scroll-form" onSubmit={handleSaveNewArea}>
                            <div className="input-group">
                                <label>Nombre del Área</label>
                                <input type="text" placeholder="Ej: Dirección de Transportes" value={newAreaName} onChange={(e) => setNewAreaName(e.target.value)} autoFocus required />
                            </div>
                            <div className="input-group">
                                <label>ID Único (sin espacios)</label>
                                <input type="text" placeholder="Ej: transportes" value={newAreaId} onChange={(e) => setNewAreaId(e.target.value)} required />
                            </div>
                            <div className="input-group">
                                <label>Ícono</label>
                                <div className="emoji-input-trigger" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                                    <span>{newAreaIcon}</span>
                                    <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>▼ Elegir Emoji</span>
                                </div>
                                {showEmojiPicker && (
                                    <div className="emoji-picker-grid">
                                        {EMOJI_LIST.map((emoji) => (
                                            <div key={emoji} className="emoji-item" onClick={() => { setNewAreaIcon(emoji); setShowEmojiPicker(false); }}>{emoji}</div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <hr className="divider" />
                            <div className="input-group">
                                <label>Usuario Asignado</label>
                                <input type="email" placeholder="admin_area@inamhi.gob.ec" value={newAreaUser} onChange={(e) => setNewAreaUser(e.target.value)} required />
                            </div>
                            <div className="input-group password-group">
                                <label>Contraseña Asignada</label>
                                <div style={{ position: 'relative' }}>
                                    <input type={showCreatePass ? "text" : "password"} placeholder="Define una contraseña" value={newAreaPass} onChange={(e) => setNewAreaPass(e.target.value)} required style={{ width: '100%', paddingRight: '40px' }} />
                                    <span className="password-toggle" onClick={() => setShowCreatePass(!showCreatePass)}>{showCreatePass ? '👁️' : '🔒'}</span>
                                </div>
                            </div>
                            <button type="submit" className="btn-login-glow" style={{ marginTop: '15px' }}>GUARDAR NUEVA ÁREA</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AreaHome;