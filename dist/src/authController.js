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
import User from "../models/User.ts";
class authController {
    registration(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
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
            }
            catch (e) {
                console.log(e);
                res.status(400).json({ message: "Login error" });
            }
        });
    }
    test(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                res.json("server work");
            }
            catch (e) {
            }
        });
    }
}
export default new authController;
//# sourceMappingURL=authController.js.map