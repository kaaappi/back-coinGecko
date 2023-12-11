import {Router} from 'express';
import controller from "./authController.js"
import {check} from "express-validator"
import authMiddleware from './middleware/authMiddleware.js'

const router = Router()


router.post('/registration', [
    check('username', "Username cannot be empty").notEmpty(),
    check('password', "The password must be more than 4 and less than 10 characters").isLength({min: 4, max: 10})
  ],
  controller.registration)
router.post('/login', controller.login)


export default router


