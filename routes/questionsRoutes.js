import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import checkAuth from "../middleware/authMiddleware.js";
import mysql from "mysql2/promise"; // Asegúrate de tener MySQL conectado
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(new URL(import.meta.url).pathname);

const router = express.Router();

// Función para obtener preguntas según la sección
const getPreguntasPorSeccion = (seccion) => {
    try {
        // Ruta correcta para acceder a los archivos JSON
        const filePath = path.join(process.cwd(), "data", `../preguntas_${seccion}.json`);

        if (!fs.existsSync(filePath)) {
            console.error(`Archivo no encontrado: ${filePath}`);
            return null;
        }

        const data = fs.readFileSync(filePath, "utf-8");
        return JSON.parse(data);
    } catch (error) {
        console.error("Error cargando las preguntas:", error);
        return null;
    }
};

// ✅ Ruta segura con `checkAuth` para obtener preguntas por sección
router.get("/preguntas/:seccion", checkAuth, (req, res) => {
    const { seccion } = req.params;
    console.log(`📌 Solicitando preguntas de la sección: ${seccion}`);

    const preguntas = getPreguntasPorSeccion(seccion);
    if (!preguntas) {
        return res.status(404).json({ error: "Sección no encontrada" });
    }

    res.json({ seccion, preguntas });
});

// Cargar variables de entorno
dotenv.config();

// Configurar Multer para guardar los PDFs en la carpeta "uploads"
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join(process.cwd(), "uploads"); // Asegurar que se guarde en la raíz del proyecto
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const filename = `resultados_${Date.now()}.pdf`;
      cb(null, filename);
    }
});

const upload = multer({ storage });

// Configuración de la conexión a MySQL
const db = await mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER, // Tu usuario MySQL
    password: process.env.PASSWORD, // Tu contraseña MySQL
    database: process.env.DATABASE
});

// Ruta para recibir y guardar el PDF
router.post("/upload-pdf", upload.single("pdf"), async (req, res) => {
    try {
      const { usuario_id } = req.body;
      const filePath = `/uploads/${req.file.filename}`;
      console.log("📂 Archivo guardado en:", filePath); // Verificar en consola
      const id = uuidv4().slice(0, 10);
      const fechaRegistro = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  
      // Guardar en la BD
      const query = "INSERT INTO resultados_examen (resultados_examen_id, usuario_sid, resultados, fecha_resultados) VALUES (?, ?, ?, ?)";
      await db.execute(query, [id, usuario_id, filePath, fechaRegistro]);
  
      res.json({ message: "PDF guardado exitosamente", filePath });
    } catch (error) {
      console.error("Error al guardar el PDF:", error);
      res.status(500).json({ error: "Error al guardar el PDF" });
    }
  });

export default router;
