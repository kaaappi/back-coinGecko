import { Router } from 'express';
import controller from "./authController.js";
const router = Router();
router.post('/registration', controller.registration);
router.post('/login', controller.login);
router.get('/test', controller.test);
export default router;
//# sourceMappingURL=authRouter.js.map