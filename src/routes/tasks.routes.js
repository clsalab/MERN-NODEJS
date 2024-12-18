import { Router } from "express";

import { authRequiered } from '../middlewares/validateToken.js'
import { createTasks, deleteTasks, getTask, getTasks, updateTasks } from "../controllers/tasks.controller.js";
import { validateSchema } from "../middlewares/validador.middleware.js";
import { createTaskSchema, updateTaskSchema } from "../schemas-validator/task.shema.js";
import { adminSchema } from "../schemas-validator/auth.schema.js";

const router = Router()


router.get('/tasks', authRequiered, getTasks )
router.get('/task/:id', authRequiered, getTask)
router.post('/tasks', authRequiered, validateSchema (createTaskSchema), createTasks)
router.delete('/tasks/:id', authRequiered,validateSchema(adminSchema), deleteTasks)
router.put('/tasks/:id', authRequiered, validateSchema(updateTaskSchema), updateTasks)


export default router