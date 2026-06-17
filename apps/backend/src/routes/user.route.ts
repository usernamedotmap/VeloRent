import { Router } from "express";
import { authenticate } from "../middleware/authenticate";
import { registerRfidController } from "../controllers/user.controller";


const userRoutes = Router();


userRoutes.patch('/rfid', authenticate, registerRfidController);

export default userRoutes;