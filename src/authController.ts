import bcrypt from "bcryptjs"
import User from './models/User.js'
import {validationResult} from "express-validator";
import jwt from "jsonwebtoken";
import secretKey from "./config.js"

const generateAccessToken = (id) => {
  const payload = {
    id
  }
  return jwt.sign(payload, secretKey.secret, {expiresIn: "24h"})
}

class authController {
  async registration(req, res) {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        console.log(errors)
        return res.status(400).json({message: "Error in registration", errors})
      }
      const {username, password} = req.body;
      const candidate = await User.findOne({username});

      if (candidate) {
        return res.status(400).json({message: "User already exists"});
      }

      const hashPassword = bcrypt.hashSync(password, 3);
      const user = new User({username, password: hashPassword});
      await user.save();

      return res.json({message: "User registered successfully"});
    } catch (e) {
      console.log(e);
      res.status(400).json({message: "Registration error"});
    }
  }

  async login(req, res) {
    try {
      const {username, password} = req.body
      console.log(req.body)
      const user = await User.findOne({username})
      if (!user) {
        return res.status(400).json({message: `User ${username} not found`})
      }
      const validPassword = bcrypt.compareSync(password, user.password)
      if (!validPassword) {
        return res.status(400).json({message: `invalid password`})
      }
      const token = generateAccessToken(user._id)
      return res.json({token})
    } catch (e) {
      console.log(e)
      res.status(400).json({message: "Login error"})
    }
  }
}

export default new authController