import jwt from "jsonwebtoken";
import db from "../config/db.js";  

const checkAuth = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const query = "SELECT usuario_id, nombre_usuario, correo_usuario, tipo_usuario FROM usuarios WHERE usuario_id = ?";
      db.query(query, [decoded.id], (err, result) => {
        if (err) {
          return res.status(500).json({ success: false, message: 'Error en la base de datos' });
        }

        if (result.length === 0) {
          return res.status(400).json({ success: false, message: 'Usuario no encontrado' });
        }

        req.usuario = result[0];  // Guardamos usuario en la request
        return next();
      });
    } catch (error) {
      return res.status(400).json({ success: false, message: 'Token no válido' });
    }
  } else {
    return res.status(401).json({ success: false, message: 'No autorizado' });
  }
};

export default checkAuth;
