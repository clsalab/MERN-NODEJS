import { Router } from "express";
import { deleteUser, getUser, getUsers, login, logout, profile, register, updateUser } from "../controllers/auth.controller.js";
import { authRequiered } from '../middlewares/validateToken.js'
import { validateSchema } from "../middlewares/validador.middleware.js";
import { loginSchema, registerSchema, updateSchema } from "../schemas-validator/auth.schema.js";
const router = Router()

router.post('/register', validateSchema(registerSchema),  register )
router.post('/login', validateSchema(loginSchema), login)
router.post('/logout', logout)
router.get('/profile', authRequiered , profile )
router.get('/users', authRequiered, getUsers  )
router.get('/user/:id', authRequiered, getUser  )
router.put('/user/:id', authRequiered, validateSchema(updateSchema), updateUser  )
router.delete('/user/:id', authRequiered, deleteUser )


export default router