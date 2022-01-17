import { Router } from "express";
import { register, confirmEmail } from "../controller/Users";
const standardRouter = Router();
import  path  from "path";
const __dirname = path.resolve();
standardRouter.get('/',(req,res) => {
    res.render('register');
})


export { standardRouter };
