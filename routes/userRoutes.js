import express from "express";
import { 
    registerUser,
    registerStudent,
    getUsers,
    loginUser,
    editUser,
    deleteUser,
    perfilUser,
    getIndividualUser
    //checkauthAdmin,
    //confirmUser,
    //forgotPassword,
    //recoberyPassword,
    //tokenPasswordValidation,
} from '../controllers/userController.js'; 
import checkAuth from "../middleware/authMiddleware.js";

const router = express.Router();

//Ruta para login de administrador/estudiante
router.post('/login', loginUser);
// Ruta para registrar un nuevo estudiante
router.post('/register-student', registerStudent);
// Ruta para registrar un nuevo administrador
router.post('/register', checkAuth, registerUser);
// Ruta para obtener todos los administrador/estudiante
router.get('/users', checkAuth, getUsers);
// Ruta para obtener todos los administrador/estudiante
router.get('/user/:id', checkAuth, getIndividualUser);
// Ruta para editar un administrador/estudiante
router.put('/user-update/:id', checkAuth, editUser);
// Ruta para eliminar un administrador/estudiante
router.delete('/user-delete/:id', checkAuth, deleteUser);
//Ruta del perfil de usuario
router.get('/profile', checkAuth, perfilUser);

// Ruta de confirmación de cuenta
/*router.get('/confirmar/:token', confirmUser);
// Ruta para enviar link restablecer contraseña
router.post('/password', forgotPassword);
// Ruta para verificar token de contraseña
router.get('/password/:token', tokenPasswordValidation);
// Ruta para actualizar contraseña
router.put('/update-password', recoberyPassword);*/

// Exporta el router por defecto
export default router;
