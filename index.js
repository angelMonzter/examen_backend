//CODIGO LOCAL
/*import express from "express";
import bodyParser from "body-parser";

import userRoutes from "./routes/userRoutes.js";
import questionsRoutes from "./routes/questionsRoutes.js";
//import categoriesRoutes from "./routes/categoriesRoutes.js";

import dotenv from 'dotenv';
import cors from "cors";
import path from "path";

// Cargar variables de entorno desde .env
dotenv.config();

const app = express();

// Middleware para analizar el cuerpo de las solicitudes
app.use(bodyParser.json());

const dominiosPermitidos = [process.env.BACKEND_URL, process.env.FRONTEND_URL];

const corsOptions = {
  origin: function (origin, callback) {
    // Permitir solicitudes sin origen, como las hechas desde herramientas como Postman o localhost
    if (!origin || dominiosPermitidos.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("No permitido por CORS"));
    }
  },
};

app.use(cors(corsOptions));

// Rutas de usuario
app.use('/api', userRoutes);
app.use('/api', questionsRoutes);
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

const port = 4000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});*/
import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import userRoutes from "./routes/userRoutes.js";
import questionsRoutes from "./routes/questionsRoutes.js";

// Configurar __dirname en ESModules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno
dotenv.config();

const app = express();

// Middleware
app.use(bodyParser.json());

const dominiosPermitidos = [process.env.BACKEND_URL, process.env.FRONTEND_URL];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || dominiosPermitidos.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("No permitido por CORS"));
    }
  },
};

app.use(cors(corsOptions));

// Rutas
app.use('/api', userRoutes);
app.use('/api', questionsRoutes);

// Archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'build')));

// Servir React (Si también tienes frontend en este servidor)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Definir puerto
const port = process.env.PORT || 4000;

// Iniciar servidor
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

