import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/AreaHome.css'; 

// Las credenciales fijas se mantienen como respaldo
const FIXED_CREDENTIALS = [
    { id: 'tic',          user: 'tic@inamhi.gob.ec', pass: 'tic123' },
    { id: 'hidro',        user: 'hidro@inamhi.gob.ec', pass: 'hidro123' },
    { id: 'rrhh',         user: 'recursosh@inamhi.gob.ec', pass: 'recursos123' },
    { id: 'admin-fin',    user: 'finanzas@inamhi.gob.ec', pass: 'fin123' },
    { id: 'ejecutiva',    user: 'ejecutiva@inamhi.gob.ec', pass: 'dir123' },
    { id: 'juridica',     user: 'juridica@inamhi.gob.ec', pass: 'jur123' },
    { id: 'com-social',   user: 'comunicacion@inamhi.gob.ec', pass: 'com123' },
    { id: 'planificacion', user: 'planificacion@inamhi.gob.ec', pass: 'plan123' },
    { id: 'pronosticos',  user: 'pronosticos@inamhi.gob.ec', pass: 'pron123' },
    { id: 'estudios',     user: 'estudioInv@inamhi.gob.ec', pass: 'est123' },
    { id: 'red-obs',      user: 'redobs@inamhi.gob.ec', pass: 'red123' },
    { id: 'calidad-agua', user: 'laboratorio@inamhi.gob.ec', pass: 'lab123' },
];

interface Area {
    id: string;
    name: string;
    icon: string;
    user?: string; // Opcional, viene del backend
    pass?: string; // Opcional, viene del backend
}

const AreaHome: React.FC = () => {
    const navigate = useNavigate();
    
    // Estados
    const [areaList, setAreaList] = useState<Area[]>([]);
    const [selectedArea, setSelectedArea] = useState<Area | null>(null);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showLoginPass, setShowLoginPass] = useState(false); 

    // Admin Modal State
    const [showAdminModal, setShowAdminModal] = useState(false);
    const [adminUser, setAdminUser] = useState('');
    const [adminPass, setAdminPass] = useState('');
    const [showAdminPass, setShowAdminPass] = useState(false);

    // --- CARGAR ÁREAS DESDE EL SERVIDOR ---
    useEffect(() => {
        const fetchAreas = async () => {
            try {
                const response = await fetch('http://localhost:3001/api/areas');
                if (response.ok) {
                    const data = await response.json();
                    setAreaList(data);
                } else {
                    console.error("Error al cargar áreas");
                }
            } catch (error) {
                console.error("Error de conexión:", error);
            }
        };
        fetchAreas();
    }, []);

    // 1. LOGIN DE ÁREA
    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        setTimeout(() => {
            if (selectedArea) {
                let isValid = false;

                // 1. Verificar credenciales que vienen del backend (áreas nuevas)
                if (selectedArea.user === username && selectedArea.pass === password) {
                    isValid = true;
                }
                
                // 2. Verificar credenciales hardcodeadas (áreas antiguas)
                const fixedCred = FIXED_CREDENTIALS.find(c => c.id === selectedArea.id);
                if (fixedCred && fixedCred.user === username && fixedCred.pass === password) {
                    isValid = true;
                }

                // 3. Backdoor admin
                if (username === 'admin' && password === 'admin') isValid = true;

                if (isValid) {
                    localStorage.setItem('userSession', JSON.stringify({ area: selectedArea.id, user: username, role: 'area_admin' }));
                    navigate(`/dashboard/${selectedArea.id}`); 
                } else {
                    setError('Usuario o contraseña incorrectos.');
                    setIsLoading(false);
                }
            }
        }, 800);
    };

    // 2. LOGIN SUPER ADMIN
    const handleAdminLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        setTimeout(() => {
            if (adminUser === 'admin' && adminPass === 'admin') {
                localStorage.setItem('userSession', JSON.stringify({ area: 'general', user: 'Super Admin', role: 'super_admin' }));
                navigate('/admin-dashboard');
            } else {
                setError('Credenciales inválidas.');
                setIsLoading(false);
            }
        }, 800);
    };

    const closeModal = () => {
        setSelectedArea(null);
        setShowAdminModal(false);
        setUsername(''); setPassword(''); setAdminUser(''); setAdminPass(''); setError(''); setIsLoading(false);
        setShowLoginPass(false); setShowAdminPass(false);
    };

    return (
        <div className="area-home-container">
            {/* Fondo animado (se ocultará por CSS si pones imagen de fondo) */}
            <div className="weather-bg-animation"></div>
            <div className="particles"><span></span><span></span><span></span><span></span><span></span></div>

            <div className={`area-glass-container animate-entry ${selectedArea || showAdminModal ? 'blur-background' : ''}`}>
                <div className="area-header-container">
                    <h2 className="area-title">Selecciona tu Área</h2>
                    <button className="btn-audit-corner" onClick={() => setShowAdminModal(true)}>
                        🛡️ AUDITORÍA
                    </button>
                    <p className="area-subtitle">Elige el departamento para acceder a la gestión documental</p>
                </div>

                <div className="area-grid">
                    {areaList.length > 0 ? (
                        areaList.map((area) => (
                            <div key={area.id} className="area-card" onClick={() => setSelectedArea(area)}>
                                <div className="card-icon">{area.icon}</div>
                                <div className="card-text">{area.name}</div>
                                <div className="card-shine"></div>
                            </div>
                        ))
                    ) : (
                        <p style={{color: '#64748b'}}>Cargando áreas...</p>
                    )}
                </div>
                
                <div className="area-footer">
                    <Link to="/" className="btn-back">← Regresar al Inicio</Link>
                </div>
            </div>

            {/* MODAL LOGIN ÁREA */}
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
                            <button type="submit" className="btn-login-glow" disabled={isLoading}>{isLoading ? 'ACCEDIENDO...' : 'INGRESAR'}</button>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL LOGIN ADMIN */}
            {showAdminModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-glass" onClick={(e) => e.stopPropagation()} style={{ borderColor: '#10b981' }}>
                        <button className="btn-close-modal" onClick={closeModal}>✕</button>
                        <div className="modal-header">
                            <div className="modal-icon-wrapper" style={{ filter: 'drop-shadow(0 0 15px rgba(16, 185, 129, 0.4))' }}>🛡️</div>
                            <h3 className="modal-area-name" style={{ backgroundImage: 'linear-gradient(to right, #059669, #10b981)' }}>Auditoría General</h3>
                        </div>
                        <form className="login-form" onSubmit={handleAdminLogin}>
                            <div className="input-group">
                                <label style={{ color: '#10b981' }}>Usuario Admin</label>
                                <input type="text" value={adminUser} onChange={(e) => setAdminUser(e.target.value)} autoFocus required />
                            </div>
                            <div className="input-group password-group">
                                <label style={{ color: '#10b981' }}>Contraseña</label>
                                <div style={{ position: 'relative' }}>
                                    <input type={showAdminPass ? "text" : "password"} value={adminPass} onChange={(e) => setAdminPass(e.target.value)} required style={{ width: '100%', paddingRight: '40px' }} />
                                    <span className="password-toggle" onClick={() => setShowAdminPass(!showAdminPass)}>{showAdminPass ? '👁️' : '🔒'}</span>
                                </div>
                            </div>
                            {error && <div className="error-message" style={{ borderColor: '#10b981', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)' }}>⚠️ {error}</div>}
                            <button type="submit" className="btn-login-glow" disabled={isLoading} style={{ background: 'linear-gradient(90deg, #059669, #10b981)', color: 'white' }}>
                                {isLoading ? 'VERIFICANDO...' : 'ACCEDER'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AreaHome;
