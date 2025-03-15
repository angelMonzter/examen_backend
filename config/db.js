import mysql from 'mysql';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const db = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER, // Tu usuario MySQL
    password: process.env.PASSWORD, // Tu contraseña MySQL
    database: process.env.DATABASE
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL');
});

export default db;


/*
import mysql from 'mysql';

const connection = mysql.createConnection({
  host: 'localhost',  // Cambia si tu BD está en otro servidor
  user: 'vocaqnif_examen',       // Usuario de la base de datos
  password: 'Z(nUAIj}&yYi',       // Contraseña de la base de datos
  database: 'vocaqnif_examen' // Nombre de la base de datos
});

connection.connect((err) => {
  if (err) {
    console.error('❌ Error al conectar a la base de datos:', err.message);
  } else {
    console.log('✅ Conexión exitosa a la base de datos MySQL');
  }
  connection.end(); // Cierra la conexión después de verificar
});

*/