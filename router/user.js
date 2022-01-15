import { Router } from "express";
import { register, confirmEmail } from "../controller/Users";
const router = Router();
import  path  from "path";
const __dirname = path.resolve();
router.get('/register',(req,res) => {
    res.render('register');
})
router.post("/register", register);
router.get('/confirmation/:email/:token', confirmEmail);

export { router };
