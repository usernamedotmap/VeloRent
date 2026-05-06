import { Router } from "express";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";
import { getNotificationsController, getUnreadCountController, markAllReadController, markOneReadController } from "../controllers/notificationEvent.controller";


const notificationRoutes = Router();

notificationRoutes.use(authenticate, authorize('admin', 'operator'));

notificationRoutes.get('/', getNotificationsController); // fechst list
notificationRoutes.get('/unread-count', getUnreadCountController); // badge count
notificationRoutes.patch('/read-all', markAllReadController);
notificationRoutes.patch('/:id/read', markOneReadController);

export default notificationRoutes;