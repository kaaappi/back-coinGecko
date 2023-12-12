var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import bcrypt from "bcryptjs";
import User from './models/User.js';
import { validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import secretKey from "./config.js";
const generateAccessToken = (id) => {
    const payload = {
        id
    };
    return jwt.sign(payload, secretKey.secret, { expiresIn: "24h" });
};
class authController {
    registration(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const errors = validationResult(req);
                if (!errors.isEmpty()) {
                    return res.status(400).json({ message: "Error in registration", errors });
                }
                const { username, password } = req.body;
                const candidate = yield User.findOne({ username });
                if (candidate) {
                    return res.status(400).json({ message: "User already exists" });
                }
                const hashPassword = bcrypt.hashSync(password, 3);
                const user = new User({ username, password: hashPassword });
                yield user.save();
                return res.json({ message: "User registered successfully" });
            }
            catch (e) {
                console.log(e);
                res.status(400).json({ message: "Registration error" });
            }
        });
    }
    login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { username, password } = req.body;
                const user = yield User.findOne({ username });
                if (!user) {
                    return res.status(400).json({ message: `User ${username} not found` });
                }
                const validPassword = bcrypt.compareSync(password, user.password);
                if (!validPassword) {
                    return res.status(400).json({ message: `invalid password` });
                }
                const token = generateAccessToken(user._id);
                return res.json({ token });
            }
            catch (e) {
                console.log(e);
                res.status(400).json({ message: "Login error" });
            }
        });
    }
}
export default new authController;
//# sourceMappingURL=authController.js.map