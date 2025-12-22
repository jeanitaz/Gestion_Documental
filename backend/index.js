const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process'); 
const multer = require('multer');

const app = express();
app.use(cors());
app.use(express.json());

// Configuración temporal de Multer
const upload = multer({ dest: 'uploads/' });

// ==========================================
// CONFIGURACIÓN ADMINISTRATIVA
// ==========================================
const SERVIDOR_IP = '10.0.5.20';
const SERVER_USER = 'Administrator';
const SERVER_PASS = 'In@mH12021'; 
const RUTA_LOGS = path.join(__dirname, 'audit_logs.json'); 

// Mapeo de IDs a nombres reales (Asegúrate de que coincidan con tus carpetas en el servidor)
const MAPEO_NOMBRES = { 
    'tic': 'tics', 
    'rrhh': 'direccion talento humano',
    'hidro': 'direccion de informacion hidrometeorologica',
    'admin-fin': 'direccion administrativa financiera',
    'ejecutiva': 'direccion ejecutiva',
    'juridica': 'direccion de asesoria juridica',
    'com-social': 'direccion de comunicacion social',
    'planificacion': 'direccion de planificacion',
    'pronosticos': 'direccion de pronosticos y alertas',
    'estudios': 'direccion de estudios investigacion y desarrollo',
    'red-obs': 'direccion de la red nacional de observacion',
    'calidad-agua': 'laboratorio nacional de calidad de agua'
};

// ==========================================
// FUNCIÓN PARA REGISTRAR AUDITORÍA
// ==========================================
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
        if (fs.existsSync(RUTA_LOGS)) {
            const data = fs.readFileSync(RUTA_LOGS, 'utf8');
            logs = JSON.parse(data);
        }
    } catch (error) {
        console.error("Creando nuevo archivo de logs.");
    }

    logs.unshift(nuevoLog);
    if (logs.length > 500) logs = logs.slice(0, 500);

    try {
        fs.writeFileSync(RUTA_LOGS, JSON.stringify(logs, null, 2));
    } catch (error) {
        console.error("Error guardando log:", error);
    }
}

// ==========================================
// ENDPOINT: OBTENER AUDITORÍA
// ==========================================
app.get('/api/auditoria', (req, res) => {
    try {
        if (!fs.existsSync(RUTA_LOGS)) return res.json([]);
        const data = fs.readFileSync(RUTA_LOGS, 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        res.status(500).json({ error: "Error leyendo auditoría" });
    }
});

// ==========================================
// ENDPOINT: SUBIR ARCHIVO
// ==========================================
app.post('/api/subir', upload.single('archivo'), (req, res) => {
    const { areaId, rutaActual, usuario } = req.body;
    const file = req.file;

    if (!file) return res.status(400).json({ error: "No se envió ningún archivo" });

    const nombreAreaReal = MAPEO_NOMBRES[areaId] || areaId;
    const subpath = (rutaActual && rutaActual !== 'undefined' && rutaActual !== 'null') ? rutaActual : '';
    const destinoRed = `\\\\${SERVIDOR_IP}\\${nombreAreaReal}\\${subpath}\\${file.originalname}`;
    
    // Conectamos y copiamos
    exec(`net use "\\\\${SERVIDOR_IP}\\IPC$" /user:${SERVER_USER} "${SERVER_PASS}"`, (err) => {
        fs.copyFile(file.path, destinoRed, (errCopy) => {
            // Borramos el temporal siempre
            fs.unlink(file.path, () => {}); 

            if (errCopy) {
                console.error("Error subida:", errCopy);
                return res.status(500).json({ error: "Error al guardar en el servidor remoto" });
            }

            registrarAuditoria(nombreAreaReal.toUpperCase(), usuario || 'Empleado', 'Subida de Archivo', `Archivo: ${file.originalname}`);
            res.json({ success: true, message: "Archivo subido correctamente" });
        });
    });
});

// ==========================================
// ENDPOINT: CREAR CARPETA (CORREGIDO Y POTENCIADO)
// ==========================================
app.post('/api/crear-carpeta', (req, res) => {
    const { areaId, rutaActual, nombreCarpeta, usuario } = req.body;

    if (!nombreCarpeta) return res.status(400).json({ error: "Nombre requerido" });

    const nombreAreaReal = MAPEO_NOMBRES[areaId] || areaId;
    // Limpiamos la ruta actual para evitar problemas con 'undefined'
    const subpath = (rutaActual && rutaActual !== 'undefined' && rutaActual !== 'null') ? rutaActual : '';
    
    // Ruta completa
    const rutaNuevaCarpeta = `\\\\${SERVIDOR_IP}\\${nombreAreaReal}\\${subpath}\\${nombreCarpeta}`;

    console.log(`Intentando crear: ${rutaNuevaCarpeta}`);

    // COMANDO PODEROSO: Autentica y ejecuta mkdir en la misma línea de comandos
    // El "&&" asegura que si conecta, ejecuta el mkdir
    const comando = `net use "\\\\${SERVIDOR_IP}\\IPC$" /user:${SERVER_USER} "${SERVER_PASS}" && cmd /c mkdir "${rutaNuevaCarpeta}"`;

    exec(comando, (error, stdout, stderr) => {
        if (error) {
            console.error("Error al crear carpeta:", stderr || error.message);
            // Si el error dice que ya existe, avisamos
            if (stderr && stderr.includes('exist')) {
                return res.status(400).json({ success: false, message: "La carpeta ya existe" });
            }
            return res.status(500).json({ error: "No se pudo crear la carpeta (Permisos o Red)" });
        }

        console.log("Carpeta creada:", stdout);

        registrarAuditoria(
            nombreAreaReal.toUpperCase(), 
            usuario || 'Empleado', 
            'Creación de Carpeta', 
            `Carpeta: ${nombreCarpeta}`
        );

        res.json({ success: true, message: "Carpeta creada exitosamente" });
    });
});

// ==========================================
// ENDPOINT: LISTAR ARCHIVOS
// ==========================================
app.get('/api/archivos/:areaId', (req, res) => {
    const { areaId } = req.params;
    const subpath = req.query.subpath || ''; 
    const nombreReal = MAPEO_NOMBRES[areaId] || areaId;
    const rutaCompleta = `\\\\${SERVIDOR_IP}\\${nombreReal}\\${subpath}`; 

    exec(`net use "\\\\${SERVIDOR_IP}\\IPC$" /user:${SERVER_USER} "${SERVER_PASS}"`, () => {
        if (!fs.existsSync(rutaCompleta)) {
            return res.status(404).json({ error: "Carpeta no encontrada", path: rutaCompleta });
        }
        fs.readdir(rutaCompleta, (err, files) => {
            if (err) return res.json([]);
            const fileList = files.map((file, i) => {
                try {
                    const fullPath = path.join(rutaCompleta, file);
                    if (file.startsWith('$') || file === 'System Volume Information') return null;
                    let stats = fs.statSync(fullPath);
                    return {
                        id: `${areaId}-${i}`,
                        name: file,
                        date: stats.mtime.toISOString().split('T')[0],
                        size: stats.isDirectory() ? '-' : (stats.size/1024/1024).toFixed(2) + ' MB',
                        type: stats.isDirectory() ? 'FOLDER' : 'FILE',
                        relativePath: path.join(subpath, file)
                    };
                } catch (e) { return null; }
            }).filter(Boolean);
            
            fileList.sort((a, b) => (a.type === 'FOLDER' ? -1 : 1));
            res.json(fileList);
        });
    });
});

// ==========================================
// ENDPOINT: DESCARGAR
// ==========================================
app.get('/api/descargar/:areaId', (req, res) => {
    const { areaId } = req.params;
    const relativePath = req.query.path;
    const nombreReal = MAPEO_NOMBRES[areaId] || areaId;
    res.download(`\\\\${SERVIDOR_IP}\\${nombreReal}\\${relativePath}`);
});

app.listen(3001, () => {
    console.log('✅ Servidor 3001 LISTO');
    if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');
});
