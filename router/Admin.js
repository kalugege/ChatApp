import { Router } from "express";
import { getAllUsers,deleteUser, login, createChat, deleteChat, deleteMessage, createPost, updateUser, createUser, updateMessage, deletePost, updatePost } from "../controller/Admin";
const adminRouter = Router();
import Post from '../model/Post'
import  path  from "path";
import adminAuth from "../middleware/AdminAuth";
import User from "../model/User";
import Chat from "../model/Chat";
import Msg from "../model/Msg";
import multer from "multer";
const __dirname = path.resolve();
const upload = multer({dest: __dirname + '/uploads/images'});

adminRouter.get('/', adminAuth,(req,res) => {
    console.log(req.user);
    res.render('dashboard', { title: 'Hey', message: 'Hello there!'});
});
adminRouter.get('/chats', adminAuth,async (req,res) => {
    const chats = await Chat.find({}).populate('sender').populate('receiver').populate('messages');
    console.log(chats)
    res.render('chat', {chats: chats});
});

adminRouter.get('/messages', adminAuth,async (req,res) => {
    console.log(req.user);
    const messages = await Msg.find({});
    res.render('messages', {messages: messages});
});

adminRouter.post('/login', login);

adminRouter.get('/login', (req,res) => {
    res.render('login')
});
adminRouter.get('/allUsers',adminAuth, getAllUsers);

adminRouter.post('/user/:id/delete',adminAuth, deleteUser);
adminRouter.post('/user/:id/update',adminAuth, updateUser);


adminRouter.get('/user/create',adminAuth, (req,res) => {
    res.render('userCreate');
});
adminRouter.post('/user/create',adminAuth, createUser);
adminRouter.get('/posts',adminAuth,async (req,res) => {
    const posts = await Post.find({}).populate('user');
    res.render('post', {posts: posts});
});

adminRouter.get('/chat/create',adminAuth, async (req,res) => {
    const users = await User.find();
    res.render('createChat', {users: users});
});

adminRouter.get('/post/create',adminAuth, async (req,res) => {
    const users = await User.find();
    res.render('createPost', {users: users});
});
adminRouter.post('/post/create',adminAuth, createPost);

adminRouter.post('/chat/create',adminAuth, upload.single('photo'),createChat);


adminRouter.post('/chat/:id/delete',adminAuth, deleteChat);

adminRouter.post('/message/:id/delete',adminAuth, deleteMessage);

adminRouter.post('/post/:id/delete',adminAuth, deletePost);
adminRouter.post('/post/:id/update',adminAuth, updatePost);

adminRouter.post('/message/:id/update',adminAuth, updateMessage);



export { adminRouter };
