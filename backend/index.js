const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());

const CARPETAS_AREAS = {
    'tic': 'tics', 
    'rrhh': 'direccion talento humano',
    'hidro': 'direccion observacion hm', 
    'admin-fin': 'escaneados daf',
    'planificacion': 'direccion-de-informacion',
    'procesamiento': 'procesamiento_modelos',
    'e': 'e',
    'f': 'f',
    'default': 'tics'
};

const SERVIDOR_IP = '\\\\10.0.5.20'; 

app.get('/api/archivos/:areaId', (req, res) => {
    const { areaId } = req.params;
    const subpath = req.query.subpath || ''; 
    const nombreCarpetaRaiz = CARPETAS_AREAS[areaId] || CARPETAS_AREAS['default'];
    
    // 1. CONSTRUCCIÓN MANUAL DE RUTA UNC (Más segura que path.join para redes)
    // Forzamos el uso de barras invertidas de Windows
    let rutaCompleta = `${SERVIDOR_IP}\\${nombreCarpetaRaiz}\\${subpath}`.replace(/\//g, '\\').replace(/\\+/g, '\\');
    
    // Corregir el inicio para que siempre tenga exactamente \\
    if (!rutaCompleta.startsWith('\\\\')) {
        rutaCompleta = '\\\\' + rutaCompleta.replace(/^\\+/, '');
    }

    console.log("-----------------------------------------");
    console.log(`INTENTANDO ACCEDER A: ${rutaCompleta}`);

    // 2. VERIFICACIÓN DE EXISTENCIA ANTES DE LEER
    if (!fs.existsSync(rutaCompleta)) {
        console.error(`ERROR: La ruta no existe o el servidor no tiene permiso: ${rutaCompleta}`);
        return res.status(404).json({ error: "Ruta no encontrada", path: rutaCompleta });
    }

    fs.readdir(rutaCompleta, (err, files) => {
        if (err) {
            // Log detallado para diagnosticar en la terminal
            console.error(`ERROR DE LECTURA (${err.code}): ${err.message}`);
            return res.json([]); 
        }

        console.log(`ÉXITO: Se encontraron ${files.length} elementos en ${areaId}`);

        const fileList = files.map((file, index) => {
            try {
                const fullPath = path.join(rutaCompleta, file);
                if (file.startsWith('$') || file.startsWith('~') || file === 'System Volume Information') return null;

                let stats;
                try {
                    stats = fs.statSync(fullPath);
                } catch (e) {
                    // Si falla el stat (archivo bloqueado), lo enviamos como carpeta por defecto
                    return {
                        id: `err-${index}`,
                        name: file,
                        date: '---',
                        size: '-',
                        type: 'FOLDER', 
                        relativePath: path.join(subpath, file)
                    };
                }

                const esCarpeta = stats.isDirectory();
                return {
                    id: `${areaId}-${index}`,
                    name: file,
                    date: stats.mtime.toISOString().split('T')[0],
                    size: esCarpeta ? '-' : (stats.size / 1024 / 1024).toFixed(2) + ' MB',
                    type: esCarpeta ? 'FOLDER' : path.extname(file).replace('.', '').toUpperCase() || 'FILE',
                    relativePath: path.join(subpath, file) 
                };
            } catch (e) { return null; }
        }).filter(item => item !== null);

        // Ordenar: Carpetas primero
        fileList.sort((a, b) => {
            if (a.type === 'FOLDER' && b.type !== 'FOLDER') return -1;
            if (a.type !== 'FOLDER' && b.type === 'FOLDER') return 1;
            return a.name.localeCompare(b.name);
        });

        res.json(fileList);
    });
});

// Endpoint de descarga corregido
app.get('/api/descargar/:areaId', (req, res) => {
    const { areaId } = req.params;
    const relativePath = req.query.path;
    const nombreCarpetaRaiz = CARPETAS_AREAS[areaId] || CARPETAS_AREAS['default'];
    
    let rutaArchivo = `${SERVIDOR_IP}\\${nombreCarpetaRaiz}\\${relativePath}`.replace(/\//g, '\\').replace(/\\+/g, '\\');
    if (!rutaArchivo.startsWith('\\\\')) {
        rutaArchivo = '\\\\' + rutaArchivo.replace(/^\\+/, '');
    }

    res.download(rutaArchivo, (err) => {
        if (err) {
            console.error("Error descarga:", err.message);
            if(!res.headersSent) res.status(404).send("Archivo no disponible");
        }
    });
});

app.listen(3001, () => {
    console.log('Servidor de Auditoría corriendo en puerto 3001');
});