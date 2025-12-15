import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/AreaHome.css'; 

// --- DEFINICIÓN DE DATOS ---
// Usamos una lista simple. Esto evita problemas de tipado estricto.
const CREDENTIALS_LIST = [
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

const areas: Area[] = [
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
    const [selectedArea, setSelectedArea] = useState<Area | null>(null);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        setTimeout(() => {
            if (selectedArea) {
                // Buscamos las credenciales correctas en la lista
                const validCreds = CREDENTIALS_LIST.find(c => c.id === selectedArea.id);

                if (validCreds && validCreds.user === username && validCreds.pass === password) {
                    localStorage.setItem('userSession', JSON.stringify({ area: selectedArea.id, user: username }));
                    navigate(`/dashboard/${selectedArea.id}`); 
                } else {
                    setError('Usuario o contraseña incorrectos.');
                    setIsLoading(false);
                }
            }
        }, 800);
    };

    const closeModal = () => {
        setSelectedArea(null);
        setUsername('');
        setPassword('');
        setError('');
        setIsLoading(false);
    };

    return (
        <div className="area-home-container">
            <div className="weather-bg-animation"></div>
            <div className="particles">
                <span></span><span></span><span></span><span></span><span></span>
            </div>

            <div className={`area-glass-container animate-entry ${selectedArea ? 'blur-background' : ''}`}>
                <div className="area-header">
                    <h2 className="area-title">Selecciona tu Área</h2>
                    <p className="area-subtitle">Elige el departamento para acceder a la gestión documental</p>
                </div>

                <div className="area-grid">
                    {areas.map((area) => (
                        <div key={area.id} className="area-card" onClick={() => setSelectedArea(area)}>
                            <div className="card-icon">{area.icon}</div>
                            <div className="card-text">{area.name}</div>
                            <div className="card-shine"></div>
                        </div>
                    ))}
                </div>

                <div className="area-footer">
                    <Link to="/" className="btn-back">← Regresar al Inicio</Link>
                </div>
            </div>

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
                                <input 
                                    type="text" 
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    autoFocus
                                    required
                                />
                            </div>
                            
                            <div className="input-group">
                                <label>Contraseña</label>
                                <input 
                                    type="password" 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>

                            {error && <div className="error-message">⚠️ {error}</div>}

                            <button type="submit" className="btn-login-glow" disabled={isLoading}>
                                {isLoading ? 'ACCEDIENDO...' : 'INGRESAR AL SISTEMA'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AreaHome;