import { Link } from 'react-router-dom';
import '../styles/AreaHome.css'; // Asegúrate de crear este archivo

const areas = [
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
    return (
        <div className="area-home-container">
            {/* --- Fondo Animado (Mismo que el Home) --- */}
            <div className="weather-bg-animation"></div>
            <div className="particles">
                <span></span><span></span><span></span><span></span><span></span>
                <span></span><span></span><span></span><span></span><span></span>
            </div>

            {/* --- Contenedor Principal --- */}
            <div className="area-glass-container animate-entry">
                
                {/* Cabecera */}
                <div className="area-header">
                    <h2 className="area-title">Selecciona tu Área</h2>
                    <p className="area-subtitle">Elige el departamento para acceder a la gestión documental</p>
                </div>

                {/* Grid de Áreas */}
                <div className="area-grid">
                    {areas.map((area) => (
                        <Link to={`/area/${area.id}`} key={area.id} className="area-card">
                            <div className="card-icon">{area.icon}</div>
                            <div className="card-text">{area.name}</div>
                            <div className="card-shine"></div>
                        </Link>
                    ))}
                </div>

                {/* Pie de la tarjeta: Botón regresar */}
                <div className="area-footer">
                    <Link to="/" className="btn-back">
                        ← Regresar al Inicio
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AreaHome;