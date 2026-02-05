import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/HomeInamhi.css'; 
// Asegúrate de tener declarado el módulo de imágenes en tu archivo vite-env.d.ts o similar si te marca error en el png
import logoInamhi from '../assets/lgo.png';

const HomePage: React.FC = () => {
    return (
        <div className="inamhi-home-container">
            {/* Elementos de fondo para la animación */}
            <div className="weather-bg-animation"></div>
            <div className="particles">
                <span></span><span></span><span></span><span></span><span></span>
                <span></span><span></span><span></span><span></span><span></span>
            </div>

            {/* Contenido Principal (Efecto Cristal Claro) */}
            <div className="glass-card animate-entry">
                
                <div className="logo-area">
                    <div className="logo-glow">
                        <img src={logoInamhi} alt="Logo INAMHI" className="main-logo" />
                    </div>
                </div>

                <div className="text-content">
                    <h1 className="main-title">
                        Sistema de Gestión Documental
                    </h1>
                    <h2 className="sub-title">INAMHI</h2>
                    
                    {/* Descripción resumida */}
                    <p className="description">
                        Gestión y control de acceso al repositorio institucional, permitiendo visualizar y cargar archivos únicamente en sus áreas autorizadas.
                    </p>

                    <div className="action-buttons">
                        {/* Botón con ícono de carpeta */}
                        <Link to="/area" className="btn-primary-glow">
                            <span className="btn-icon">📂</span> INGRESA A TU ÁREA
                        </Link>
                    </div>
                </div>
            </div>

            <footer className="simple-footer">
                <p>&copy; {new Date().getFullYear()} Instituto Nacional de Meteorología e Hidrología</p>
            </footer>
        </div>
    );
};

export default HomePage;
