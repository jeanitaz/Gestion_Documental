const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());

// --- MAPA DE CARPETAS ---
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

// --- ENDPOINT LISTAR (MODO FUERZA BRUTA) ---
app.get('/api/archivos/:areaId', (req, res) => {
    const { areaId } = req.params;
    const subpath = req.query.subpath || ''; 
    const nombreCarpetaRaiz = CARPETAS_AREAS[areaId] || CARPETAS_AREAS['default'];
    
    const rutaCompleta = path.join(SERVIDOR_IP, nombreCarpetaRaiz, subpath);

    console.log(`Leyendo: ${rutaCompleta}`);

    fs.readdir(rutaCompleta, (err, files) => {
        if (err) {
            console.error("ERROR LEYENDO:", err.message);
            // Devolvemos lista vacía para no romper el frontend
            return res.json([]); 
        }

        const fileList = files.map((file, index) => {
            try {
                const fullPath = path.join(rutaCompleta, file);
                
                // --- TRUCO PARA REDES WINDOWS ---
                let stats;
                try {
                    stats = fs.statSync(fullPath);
                } catch (e) {
                    // Si falla leer los detalles, ASUMIMOS QUE ES CARPETA para que aparezca
                    return {
                        id: index,
                        name: file,
                        date: '---',
                        size: '-',
                        type: 'FOLDER', 
                        relativePath: path.join(subpath, file)
                    };
                }

                // Filtrar archivos de sistema
                if (file.startsWith('$') || file.startsWith('~') || file === 'System Volume Information') return null;

                const esCarpeta = stats.isDirectory();
                
                return {
                    id: index,
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

// --- ENDPOINT DESCARGAR (SOLUCIÓN ERROR #) ---
app.get('/api/descargar/:areaId', (req, res) => {
    const { areaId } = req.params;
    const relativePath = req.query.path; // Express ya decodifica esto automáticamente
    
    const nombreCarpetaRaiz = CARPETAS_AREAS[areaId] || CARPETAS_AREAS['default'];
    const rutaArchivo = path.join(SERVIDOR_IP, nombreCarpetaRaiz, relativePath);

    console.log(`Descargando: ${rutaArchivo}`); // Veremos qué archivo intenta bajar

    res.download(rutaArchivo, (err) => {
        if (err) {
            console.error("Error descarga:", err.message);
            res.status(404).send("No se encontró el archivo");
        }
    });
});

app.listen(3001, () => {
    console.log('Servidor CORREGIDO en puerto 3001');
});