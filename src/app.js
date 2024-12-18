//Expres nos conecta al servidor
import express from 'express'
//Devuelve las peticiones
import morgan from 'morgan';
//Leer rutas
import authRoutes from "./routes/auth.routes.js"
import taskRoutes from "./routes/tasks.routes.js"
import cookieParser from 'cookie-parser';
import cors from 'cors';


const app = express()

app.use(cors());
app.use(morgan('dev'));

//Convertir a json las peticiones
app.use(express.json());
app.use(cookieParser());

//Prefijo api antes de las rutas
app.use("/api", authRoutes);
app.use("/api", taskRoutes);

export default app;