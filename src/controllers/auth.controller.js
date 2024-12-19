import User from '../models/user.model.js'
import bcrypt from 'bcryptjs';
import { createAccessToken } from '../libs/jwt.js';


export const register = async (req,res) => {
    const {email, password, username, isAdmin} = req.body
    try {
        const userFound = await User.findOne({ email });
    if (userFound) {
    return res.status(400).json({ errors: ["El correo electrónico ya está en uso"] });
    }


        const passwordHash =  await bcrypt.hash(password, 10)
        const newUser = new User ({
            username,
            email,
            password: passwordHash,
            isAdmin,
        })
        
       //console.log(newUser)
        const userSaved = await newUser.save();
        const token = await createAccessToken({ id: userSaved._id})
        res.cookie('token', token)
        //res.json({ message: "User created successfully" })

        res.json({
            id: userSaved._id,
            username: userSaved.username,
            email: userSaved.email,
            isAdmin: userSaved.isAdmin,
            createdAt: userSaved.createdAt,
            updatedAt: userSaved.updatedAt,
        })
    } catch (error) {
        res.status(500).json({ message: error.message })
        
    }
    
    
};




export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        // Buscar usuario por email
        const userFound = await User.findOne({ email });
        if (!userFound) {
            return res.status(400).json({ message: "Email no registrado" });
        }

        // Comparar contraseñas
        const isMatch = await bcrypt.compare(password, userFound.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Contraseña incorrecta" });
        }

        // Crear y devolver el token
        const token = await createAccessToken({ id: userFound._id });
        res.cookie("token", token);

        res.json({
            id: userFound._id,
            username: userFound.username,
            email: userFound.email,
            isAdmin: userFound.isAdmin,
            createdAt: userFound.createdAt,
            updatedAt: userFound.updatedAt,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error del servidor" });
    }
};


export const logout = (req, res) => {
    res.cookie('token', "", {
        expires: new Date(0)
    })
    return res.sendStatus(200);
}


export const profile = async (req, res) => {
    const userFound = await User.findById(req.user.id)

    if (!userFound) return res.status(400).json({ message: "User not found"});

    return res.json({
        id: userFound._id,
        username: userFound.username,
        email: userFound.email,
        isAdmin: userFound.isAdmin,
        createdAt: userFound.createdAt,
        updatedAt : userFound.updatedAt,
    })
    
}

export const getUsers = async (req, res) => {
    try {
        // Verificar que el usuario autenticado existe
        const authenticatedUser = await User.findById(req.user.id);
        if (!authenticatedUser) {
            return res.status(400).json({ message: "Authenticated user not found" });
        }

        // Si el usuario es administrador, devolver todos los usuarios
        if (authenticatedUser.isAdmin) {
            const users = await User.find();
            return res.json({
                authenticatedUser: {
                    id: authenticatedUser._id,
                    username: authenticatedUser.username,
                    email: authenticatedUser.email,
                    isAdmin: authenticatedUser.isAdmin,
                    createdAt: authenticatedUser.createdAt,
                    updatedAt: authenticatedUser.updatedAt,
                },
                users: users // Devuelve todos los usuarios si es admin
            });
        } 

        // Si no es administrador, devolver solo el perfil del usuario autenticado
        return res.json({
            authenticatedUser: {
                id: authenticatedUser._id,
                username: authenticatedUser.username,
                email: authenticatedUser.email,
                isAdmin: authenticatedUser.isAdmin,
                createdAt: authenticatedUser.createdAt,
                updatedAt: authenticatedUser.updatedAt,
            }
        });

    } catch (error) {
        res.status(500).json({ message: "Error retrieving users", error: error.message });
    }
};





export const getUser = async (req, res) => {
    try {
        // Verificar si el ID está presente en los parámetros
        const { id } = req.params;
        if (!id) return res.status(400).json({ message: "User ID is required" });

        // Buscar el usuario autenticado
        const authenticatedUser = await User.findById(req.user.id);
        if (!authenticatedUser) {
            return res.status(400).json({ message: "Authenticated user not found" });
        }

        // Verificar si el usuario autenticado es un administrador
        if (!authenticatedUser.isAdmin && id !== req.user.id.toString()) {
            return res.status(403).json({ message: "You are not authorized to view this user" });
        }

        // Buscar el usuario solicitado por ID
        const user = await User.findById(id);
        if (!user) return res.status(404).json({ message: "User not found" });

        // Retornar tanto el usuario autenticado como el usuario solicitado
        res.json({
            authenticatedUser: {
                id: authenticatedUser._id,
                username: authenticatedUser.username,
                email: authenticatedUser.email,
                createdAt: authenticatedUser.createdAt,
                updatedAt: authenticatedUser.updatedAt,
                isAdmin: authenticatedUser.isAdmin
            },
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                isAdmin: user.isAdmin
            },
        });
    } catch (error) {
        // Manejo de error en caso de ID inválido
        if (error.name === "CastError") {
            return res.status(400).json({ message: "Invalid User ID format" });
        }

        // Manejo general de errores
        res.status(500).json({ message: "Error retrieving the user", error: error.message });
    }
};




export const updateUser = async (req, res) => {
    try {
        const { username, email, isAdmin } = req.body;

        // Validar campos que se pueden actualizar
        const updates = { username, email, isAdmin };
        Object.keys(updates).forEach((key) => {
            if (!updates[key]) delete updates[key];  // Eliminar campos vacíos o no enviados
        });

        // Verifica si el ID está en los parámetros
        if (!req.params.id) {
            return res.status(400).json({ message: "User ID is required" });
        }

        // Buscar el usuario autenticado
        const authenticatedUser = await User.findById(req.user.id);
        if (!authenticatedUser) {
            return res.status(400).json({ message: "Authenticated user not found" });
        }

        // Verifica si el usuario está intentando actualizarse a sí mismo o está autorizado
        if (req.params.id !== req.user.id.toString() && !authenticatedUser.isAdmin) {
            return res.status(403).json({ message: "You are not authorized to update this user" });
        }

        // Actualizar usuario
        const user = await User.findByIdAndUpdate(req.params.id, updates, {
            new: true, // Retornar el documento actualizado
            runValidators: true, // Validar las entradas antes de guardar
        });

        // Si el usuario no existe
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({
            message: "User updated successfully",
            authenticatedUser: {
                id: authenticatedUser._id,
                username: authenticatedUser.username,
                email: authenticatedUser.email,
                isAdmin: authenticatedUser.isAdmin
            },
            updatedUser: {
                id: user._id,
                username: user.username,
                email: user.email,
                isAdmin: user.isAdmin
            },
        });
    } catch (error) {
        // Manejar errores específicos
        if (error.name === "ValidationError") {
            return res.status(400).json({ message: "Validation error", error: error.message });
        }

        // Manejo general de errores
        res.status(500).json({ message: "Error updating user", error: error.message });
    }
};



export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Validar que el ID esté presente y tenga un formato válido
        if (!id) return res.status(400).json({ message: "User ID is required" });
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: "Invalid User ID format" });
        }

        // Verificar si el usuario autenticado existe
        const authenticatedUser = await User.findById(req.user.id);
        if (!authenticatedUser) {
            return res.status(400).json({ message: "Authenticated user not found" });
        }

        // Verificar si el usuario está autorizado a eliminar el usuario solicitado
        // Aquí asumimos que el usuario puede eliminar solo su propio perfil, o un administrador puede eliminar cualquier usuario
        if (req.params.id !== req.user.id.toString() && !authenticatedUser.isAdmin) {
            return res.status(403).json({ message: "You are not authorized to delete this user" });
        }

        // Intentar eliminar el usuario
        const user = await User.findByIdAndDelete(id);

        // Si no se encuentra el usuario
        if (!user) return res.status(404).json({ message: "User not found" });

        // Respuesta exitosa
        return res.sendStatus(204);
    } catch (error) {
        // Manejo de errores
        res.status(500).json({ message: "Error deleting the user", error: error.message });
    }
};


