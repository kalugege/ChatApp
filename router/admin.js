import { Router } from "express";
import { getAllUsers,deleteUser, login, createChat } from "../controller/Admin";
const adminRouter = Router();
import  path  from "path";
import adminAuth from "../middleware/AdminAuth";
import User from "../model/User";
import Chat from "../model/Chat";
const __dirname = path.resolve();

adminRouter.get('/', adminAuth,(req,res) => {
    console.log(req.user);
    res.render('dashboard', { title: 'Hey', message: 'Hello there!'});
});
adminRouter.get('/chats', adminAuth,async (req,res) => {
    const chats = await Chat.find({}).populate('sender').populate('receiver').populate('messages');
    res.render('chat', {chats: chats});
});

adminRouter.post('/login', login);

adminRouter.get('/login', (req,res) => {
    res.render('login')
});
adminRouter.get('/allUsers',adminAuth, getAllUsers);

adminRouter.post('/user/:id/delete',adminAuth, deleteUser);

adminRouter.get('/user/create',adminAuth, (req,res) => {
    res.render('userCreate');
});
adminRouter.get('/chat/create',adminAuth, async (req,res) => {
    const users = await User.find();
    res.render('createChat', {users: users});
});
adminRouter.post('/chat/create',adminAuth, createChat);

export { adminRouter };
