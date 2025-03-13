import db from '../config/db.js';
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from 'uuid';
//import sendVerificationEmail from '../helpers/emailAcount.js';
//import sendLinkPassword from '../helpers/emailPassword.js';
import generarJWT from '../helpers/generarJWT.js';

// Registrar un nuevo usuario
const registerUser = async (req, res) => { // Declarar la función como async
    const { 
        nombre_usuario, 
        correo_usuario,
        password_usuario,
    } = req.body;

    if (!correo_usuario || !password_usuario || !nombre_usuario) {
        return res.status(400).json({ message: 'Todos los campos son requeridos', type: 'error'  });
    }

    // Verificar si el correo o el usuario ya existen
    const checkUserQuery = 'SELECT * FROM usuarios WHERE correo_usuario = ?';
    db.query(checkUserQuery, [correo_usuario], (err, result) => {
        if (err) throw err;

        if (result.length > 0) {
            const existingUser = result[0];
            if (existingUser.correo_usuario === correo_usuario) {
                return res.status(409).json({ message: 'El correo ya está registrado', type: 'error' });
            }
        }

        // Encriptar la contraseña
        bcrypt.hash(password_usuario, 10, async (err, hash) => { // Agregar async aquí también si usas await dentro
            if (err) throw err;

            const id = uuidv4().slice(0, 10);
            //const token = uuidv4().slice(0, 10);

            const insertUserQuery = "INSERT INTO usuarios (usuario_id, nombre_usuario, correo_usuario, password_usuario, tipo_usuario, nombre_escuela_usuario, telefono_usuario) VALUES (?, ?, ?, ?, 'admin', ?, ?)";
            db.query(insertUserQuery, [id, nombre_usuario, correo_usuario, hash, '', ''], async (err, result) => {
                if (err) throw err;
                
                // Enviar correo de verificación
                //await sendVerificationEmail(correo, nombre, token); // Aquí ahora el await es válido

                res.status(201).json({ message: 'Usuario registrado exitosamente.', type: 'success' });
            });
        });
    });
};

// Registrar un nuevo estudiante
const registerStudent = async (req, res) => { // Declarar la función como async
    const { 
        nombre_usuario,
        correo_usuario,
        password_usuario,
        escuela_usuario,
        telefono_usuario
    } = req.body;

    if (!correo_usuario || !password_usuario || !nombre_usuario) {
        return res.status(400).json({ message: 'Todos los campos son requeridos', type: 'error' });
    }

    // Verificar si el correo del estudiante ya existen
    const checkUserQuery = 'SELECT * FROM usuarios WHERE correo_usuario = ?';
    db.query(checkUserQuery, [correo_usuario], (err, result) => {
        if (err) throw err;

        if (result.length > 0) {
            const existingUser = result[0];
            if (existingUser.correo_usuario === correo_usuario) {
                return res.status(409).json({ message: 'El correo ya está registrado', type: 'error' });
            }
        }

        // Encriptar la contraseña
        bcrypt.hash(password_usuario, 10, async (err, hash) => { // Agregar async aquí también si usas await dentro
            if (err) throw err;

            const id = uuidv4().slice(0, 10);
            //const token = uuidv4().slice(0, 10);

            const insertUserQuery = "INSERT INTO usuarios (usuario_id, nombre_usuario, correo_usuario, password_usuario, tipo_usuario, nombre_escuela_usuario, telefono_usuario) VALUES (?, ?, ?, ?, 'estudiante', ?, ?)";
            db.query(insertUserQuery, [id, nombre_usuario, correo_usuario, hash, escuela_usuario, telefono_usuario], async (err, result) => {
                if (err) throw err;
                
                // Enviar correo de verificación
                //await sendVerificationEmail(correo, nombre, token); // Aquí ahora el await es válido

                res.status(201).json({ message: 'Registrado exitosamente.', type: 'success' });
            });
        });
    });
};

// Obtener todos los usuarios
const getUsers = (req, res) => {
    const query = 'SELECT u.nombre_usuario, u.correo_usuario, u.tipo_usuario, u.nombre_escuela_usuario, u.telefono_usuario, u.usuario_id, re.resultados FROM usuarios u LEFT JOIN resultados_examen re ON re.usuario_sid = u.usuario_id';
    db.query(query, (err, result) => {
        if (err) throw err;
        res.json(result);
    });
};

// Obtener todos los usuarios
const getIndividualUser = (req, res) => {
    const { id } = req.params;

    const query = 'SELECT nombre_usuario, correo_usuario, nombre_escuela_usuario, telefono_usuario, usuario_id FROM usuarios WHERE usuario_id = ?';

    db.query(query, [id], async (err, result) => {
        if (err) throw err;
        res.json(result);
    });
};

// Editar un usuario por su ID
const editUser = (req, res) => {
    const { id } = req.params;
    const { nombre_usuario, correo_usuario, password_usuario } = req.body;

    const dataActualizada = { ...req.body, id };

    // Verificar si el ID y los campos requeridos fueron proporcionados
    if (!id || !nombre_usuario || !correo_usuario || !password_usuario) {
        return res.status(400).json({ message: 'Todos los campos son requeridos', type: 'error'  });
    }

    try {
        // Encriptar la contraseña
        bcrypt.hash(password_usuario, 10, async (err, hash) => { // Agregar async aquí también si usas await dentro
            if (err) throw err;

            // Obtener la fecha de actualizacion actual
            //const fechaRegistro = new Date().toISOString().slice(0, 19).replace('T', ' ');

            // Consulta para actualizar la usuario según el ID
            const updateQuery = 'UPDATE usuarios SET nombre_usuario = ?, correo_usuario = ?, password_usuario = ? WHERE usuario_id = ?';
            db.query(updateQuery, [nombre_usuario, correo_usuario, hash, id], (err, result) => {
                if (err) throw err;

                if (result.affectedRows === 0) {
                    return res.status(404).json({ message: 'Usuario no encontrada', type: 'error'  });
                }

                res.status(200).json({ message: 'Usuario actualizado exitosamente', type: 'success' , dataActualizada});
            });
        });
        
    } catch (error) {
        console.error('Error encriptando la contraseña:', error);
        res.status(500).json({ message: 'Error al editar usuario', type: 'error'  });
    }
};

// Eliminar un administrador/terapeuta por su ID
const deleteUser = (req, res) => {
    const { id } = req.params;

    // Consulta para eliminar administrador/terapeuta según el ID
    const deleteQuery = 'DELETE FROM usuarios WHERE usuario_id = ?';
    db.query(deleteQuery, [id], (err, result) => {
        if (err) throw err;

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado', type: 'error'  });
        }

        res.status(200).json({ message: 'Usuario eliminado exitosamente.', type: 'success' });
    });
};
/*
// Ruta para confirmar el usuario
const confirmUser = (req, res) => {
    const { token } = req.params;
    console.log(req.params);
    
    // Verificar si el token existe en la base de datos
    const query = 'SELECT * FROM usuario WHERE token = ?';
    db.query(query, [token], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: 'Error del servidor' });
        }

        // Si el token no es válido
        if (result.length === 0) {
            return res.status(400).json({ success: false, message: 'Token no válido' });
        }

        // Actualizar la base de datos para confirmar al usuario y eliminar el token
        const updateQuery = 'UPDATE usuario SET token = "", confirmado = 1 WHERE token = ?';
        db.query(updateQuery, [token], (err, updateResult) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ success: false, message: 'Error al confirmar la cuenta' });
            }

            // Confirmación exitosa
            return res.status(200).json({ success: true, message: 'Cuenta confirmada exitosamente' });
        });
    });
};

const forgotPassword = async (req, res) => {
    const { correo } = req.body;

    // Verificar si el correo ya existen
    const checkUserQuery = 'SELECT * FROM usuario WHERE correo = ?';
    db.query(checkUserQuery, [correo], async (err, result) => {
        if (err) throw err;

        if (result.length > 0) {
            const existingUser = result[0];
            const { correo, nombre } = existingUser;
            if (correo) {
                const token = uuidv4().slice(0, 10);

                // Actualizar la base de datos para confirmar al correo y crear token 
                const updateQuery = 'UPDATE usuario SET token = ? WHERE correo = ?';
                db.query(updateQuery, [token, correo], (err, updateResult) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).json({ success: false, message: 'Error' });
                    }

                    // Confirmación exitosa
                    return res.status(200).json({ success: true, message: 'Token creado' });
                });

                // Enviar correo de restablecer contraseña
                //await sendLinkPassword(correo, nombre, token); // Aquí ahora el await es válido
            }else{
                return res.status(409).json({ message: 'El correo no está registrado' });
            }
        }
        
    });
  
};

const tokenPasswordValidation = async (req, res) => {
    // Leer los datos
    const { token } = req.params;
    
        const query = 'SELECT * FROM usuario WHERE token = ?';
        db.query(query, [token], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ success: false, message: 'Error del servidor' });
            }

            // Si el token no es válido
            if (result.length === 0) {
                return res.status(400).json({ success: false, message: 'Token no válido' });
            }

            return res.status(200).json({ success: true, message: 'Token válido' });

        });
};

const recoberyPassword = async (req, res) => {
    // Leer los datos
    const { password, passsword_confirmar, token } = req.body;
    console.log(req.body);
    if (password === passsword_confirmar){
        // Encriptar la contraseña
        bcrypt.hash(passsword_confirmar, 10, async (err, hash) => { // Agregar async aquí también si usas await dentro
            if (err) throw err;

            // Actualizar la base de datos para confirmar password y eliminar el token
            const updateQuery = 'UPDATE usuario SET password = ?, token = "" WHERE token = ?';
            db.query(updateQuery, [hash, token], (err, updateResult) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ success: false, message: 'Error al actualizar la cuenta' });
                }

                // Confirmación exitosa
                return res.status(200).json({ success: true, message: 'Contraseña actualizada exitosamente' });
            });
        });
    }else{
        return res.status(400).json({ success: false, message: 'Las contraseñas no coniciden' });
    }
};
*/

const loginUser = async (req, res) => {

    const password_input = req.body.password;
    const correo_input = req.body.correo;

    // Comprobar si el usuario existe
    const query = 'SELECT * FROM usuarios WHERE correo_usuario = ?';
    db.query(query, [correo_input], async (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: 'Error del servidor' });
        }

        if (result.length === 0) {
            return res.status(400).json({ success: false, message: 'Correo no registrado' });
        }

        // Comprobar si el usuario esta confirmado
        /*if (!result[0].confirmado ) {
            return res.status(400).json({ success: false, message: 'Tu Cuenta no ha sido confirmada' });
        }*/

        // Verificar la contraseña ingresada con la almacenada en la base de datos
        const validPassword = await bcrypt.compare(password_input, result[0].password_usuario);

        if (!validPassword) {
            return res.status(400).json({ success: false, message: 'Datos incorrectos' });
        }
        
        const { password_usuario, ...perfil } = result[0];

        //return res.status(200).json({ success: true, message: 'cuenta ' + result[0].confirmado + ' confirmada' });
        return res.status(200).json({ token: generarJWT(result[0].usuario_id), perfil });
    });
};

const perfilUser = async (req, res) => {
    const { usuario } = req;

    return res.status(200).json({ perfil: usuario });
};

export {
    registerUser,
    registerStudent,
    getUsers,
    perfilUser,
    //confirmUser,
    //forgotPassword,
    //recoberyPassword,
    //tokenPasswordValidation,
    editUser,
    deleteUser,
    loginUser,
    getIndividualUser
};
  