 import { Router } from "express";
import { getMeController, loginController, logoutController, refreshController, registerController } from "../controllers/auth.controller";
import { validate } from "../middleware/validate";
import { LoginSchema, RegisterSchema } from "@velorent/shared";
import { authLimiter } from "../middleware/rateLimiter";
import { authenticate } from "../middleware/authenticate";

const authRoutes = Router();

authRoutes.post('/register', authLimiter, validate(RegisterSchema), registerController)
authRoutes.post("/login", authLimiter, validate(LoginSchema), loginController);
authRoutes.post('/refresh', refreshController);
authRoutes.post('/logout', authenticate, logoutController);
authRoutes.get('/me', authenticate, getMeController);

export default authRoutes;


// if (status === 401 && (code === 'NO_TOKEN' || code === 'INVALID_TOKEN') && !isAuthEndpoint) {
//       await forceLogout();
//       return Promise.reject(error);
//     }