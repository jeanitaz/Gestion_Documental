const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process'); 
const multer = require('multer');

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: 'uploads/' });

// ==========================================
// CONFIGURACIÓN DEL SERVIDOR
// ==========================================
const SERVIDOR_IP = '10.0.153.189';
const SERVER_USER = 'INAMHI\\dominio'; 
const SERVER_PASS = 'Tics2025@@'; 
const CARPETA_BASE = 'prueba'; 

const RUTA_LOGS = path.join(__dirname, 'audit_logs.json'); 
const RUTA_AREAS = path.join(__dirname, 'areas.json'); 

// Áreas base (Solo metadatos para el frontend)
const AREAS_INICIALES = [
    { id: 'tic', name: 'Tecnologías de la Información y Comunicación', icon: '💻', folder: 'tics' },
    { id: 'hidro', name: 'Dirección de Información Hidrometeorológica', icon: '🌧️', folder: 'direccion de informacion hidrometeorologica' },
    { id: 'rrhh', name: 'Dirección de Administración de Recursos Humanos', icon: '👥', folder: 'direccion talento humano' },
    { id: 'admin-fin', name: 'Dirección Administrativa Financiera', icon: '📊', folder: 'direccion administrativa financiera' },
    { id: 'ejecutiva', name: 'Dirección Ejecutiva', icon: '👔', folder: 'direccion ejecutiva' },
    { id: 'juridica', name: 'Dirección de Asesoría Jurídica', icon: '⚖️', folder: 'direccion de asesoria juridica' },
    { id: 'com-social', name: 'Dirección de Comunicación Social', icon: '📢', folder: 'direccion de comunicacion social' },
    { id: 'planificacion', name: 'Dirección de Planificación', icon: '📅', folder: 'direccion de planificacion' },
    { id: 'pronosticos', name: 'Dirección de Pronósticos y Alertas', icon: '⚠️', folder: 'direccion de pronosticos y alertas' },
    { id: 'estudios', name: 'Dirección de Estudios, investigación y Desarollo', icon: '🔬', folder: 'direccion de estudios investigacion y desarrollo' },
    { id: 'red-obs', name: 'Direccion de la Red Nacional de Observación', icon: '📡', folder: 'direccion de la red nacional de observacion' },
    { id: 'calidad-agua', name: 'Laboratorio Nacional Calidad de Agua', icon: '💧', folder: 'laboratorio nacional de calidad de agua' }
];

// --- FUNCIONES AUXILIARES ÁREAS ---
function getAreas() {
    try {
        if (fs.existsSync(RUTA_AREAS)) {
            const data = fs.readFileSync(RUTA_AREAS, 'utf8');
            return JSON.parse(data);
        }
    } catch (e) { console.error("Error leyendo areas.json", e); }
    return AREAS_INICIALES;
}

function saveArea(newArea) {
    const areas = getAreas();
    if (!areas.find(a => a.id === newArea.id)) {
        areas.push(newArea);
        fs.writeFileSync(RUTA_AREAS, JSON.stringify(areas, null, 2));
    }
}

// Obtener ruta física
function getNetworkPath(areaId, subpath = '') {
    const areas = getAreas();
    const area = areas.find(a => a.id === areaId);
    const folderName = area ? (area.folder || area.id) : areaId;
    const cleanSubpath = (subpath && subpath !== 'undefined' && subpath !== 'null') ? subpath : '';
    return `\\\\${SERVIDOR_IP}\\${CARPETA_BASE}\\${folderName}\\${cleanSubpath}`;
}

// --- AUDITORÍA ---
function registrarAuditoria(area, usuario, accion, detalle) {
    const nuevoLog = {
        id: Date.now(),
        area: area || 'General',
        user: usuario || 'Usuario Web',
        action: accion,
        detail: detalle,
        time: new Date().toISOString()
    };
    let logs = [];
    try {
        if (fs.existsSync(RUTA_LOGS)) logs = JSON.parse(fs.readFileSync(RUTA_LOGS, 'utf8'));
    } catch (error) {}
    logs.unshift(nuevoLog);
    if (logs.length > 500) logs = logs.slice(0, 500);
    try { fs.writeFileSync(RUTA_LOGS, JSON.stringify(logs, null, 2)); } catch (e) {}
}

// --- ENDPOINTS ---

app.get('/api/areas', (req, res) => {
    res.json(getAreas());
});

app.get('/api/auditoria', (req, res) => {
    try {
        if (!fs.existsSync(RUTA_LOGS)) return res.json([]);
        res.json(JSON.parse(fs.readFileSync(RUTA_LOGS, 'utf8')));
    } catch (e) { res.status(500).json([]); }
});

app.get('/api/archivos/:areaId', (req, res) => {
    const { areaId } = req.params;
    const subpath = req.query.subpath || ''; 
    const rutaCompleta = getNetworkPath(areaId, subpath);

    exec(`net use "\\\\${SERVIDOR_IP}\\IPC$" /user:${SERVER_USER} "${SERVER_PASS}"`, () => {
        if (!fs.existsSync(rutaCompleta)) {
            // Ya no intentamos crearla automáticamente al entrar, solo reportamos error si no existe
            // a menos que sea una subcarpeta creada por la app, pero la raíz debe existir.
            return res.status(404).json({ error: "Carpeta no encontrada o sin acceso" });
        }
        
        fs.readdir(rutaCompleta, (err, files) => {
            if (err) return res.json([]);
            const fileList = files.map((file, i) => {
                try {
                    const fullPath = path.join(rutaCompleta, file);
                    if (file.startsWith('$') || file === 'System Volume Information' || file === 'Thumbs.db') return null;
                    let stats = fs.statSync(fullPath);
                    return {
                        id: `${areaId}-${i}-${Date.now()}`,
                        name: file,
                        date: stats.mtime.toISOString().split('T')[0],
                        size: stats.isDirectory() ? '-' : (stats.size/1024/1024).toFixed(2) + ' MB',
                        type: stats.isDirectory() ? 'FOLDER' : path.extname(file).replace('.', '').toUpperCase() || 'FILE',
                        relativePath: path.join(subpath, file)
                    };
                } catch (e) { return null; }
            }).filter(Boolean);
            fileList.sort((a, b) => (a.type === 'FOLDER' ? -1 : 1));
            res.json(fileList);
        });
    });
});

app.post('/api/subir', upload.single('archivo'), (req, res) => {
    const { areaId, rutaActual, usuario } = req.body;
    const file = req.file;
    if (!file) return res.status(400).json({ error: "Falta archivo" });

    const directorioDestino = getNetworkPath(areaId, rutaActual);
    const destinoFinal = path.join(directorioDestino, file.originalname);
    
    exec(`net use "\\\\${SERVIDOR_IP}\\IPC$" /user:${SERVER_USER} "${SERVER_PASS}"`, (err) => {
        // Aquí sí creamos carpetas recursivas si es necesario para guardar el archivo
        if (!fs.existsSync(directorioDestino)) {
             try { fs.mkdirSync(directorioDestino, { recursive: true }); } catch(e){}
        }
        
        fs.copyFile(file.path, destinoFinal, (errCopy) => {
            fs.unlink(file.path, () => {}); 
            if (errCopy) return res.status(500).json({ error: "Error escritura" });
            registrarAuditoria(areaId, usuario, 'Subida', `Archivo: ${file.originalname}`);
            res.json({ success: true });
        });
    });
});

app.post('/api/crear-carpeta', (req, res) => {
    const { areaId, rutaActual, nombreCarpeta, usuario } = req.body;
    const rutaBase = getNetworkPath(areaId, rutaActual);
    const nuevaRuta = path.join(rutaBase, nombreCarpeta);
    
    exec(`net use "\\\\${SERVIDOR_IP}\\IPC$" /user:${SERVER_USER} "${SERVER_PASS}" && cmd /c mkdir "${nuevaRuta}"`, (error) => {
        if (error) return res.status(500).json({ error: "Falló crear carpeta" });
        registrarAuditoria(areaId, usuario, 'Carpeta Nueva', nombreCarpeta);
        res.json({ success: true });
    });
});

app.post('/api/crear-area', (req, res) => {
    const { nombreCarpeta, nombreVisible, icono, usuario, pass } = req.body;
    // Crear carpeta física en raíz de 'prueba'
    const rutaNueva = `\\\\${SERVIDOR_IP}\\${CARPETA_BASE}\\${nombreCarpeta}`;
    
    exec(`net use "\\\\${SERVIDOR_IP}\\IPC$" /user:${SERVER_USER} "${SERVER_PASS}" && cmd /c mkdir "${rutaNueva}"`, (error) => {
        if (error) return res.status(500).json({ success: false, details: "Error al crear carpeta física" });
        
        // Guardar metadata en JSON
        const newArea = { 
            id: nombreCarpeta, 
            name: nombreVisible, 
            icon: icono, 
            user: usuario, 
            pass: pass 
        };
        saveArea(newArea);
        res.json({ success: true });
    });
});

app.get('/api/descargar/:areaId', (req, res) => {
    const { areaId } = req.params;
    const relativePath = req.query.path;
    const directorioBase = getNetworkPath(areaId);
    res.download(path.join(directorioBase, relativePath), (err) => { if(err) console.error(err); });
});

// SIN INICIALIZACIÓN AUTOMÁTICA DE CARPETAS
app.listen(3001, () => {
    console.log('✅ Servidor 3001 LISTO - (Sin auto-creación de carpetas)');
    if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');
    
    // Aseguramos que exista el archivo de áreas para que el frontend no falle
    if (!fs.existsSync(RUTA_AREAS)) {
        fs.writeFileSync(RUTA_AREAS, JSON.stringify(AREAS_INICIALES, null, 2));
    }
});
