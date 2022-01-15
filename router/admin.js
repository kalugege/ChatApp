import { Router } from "express";
import { getAllUsers,deleteUser, login, createChat, deleteChat, deleteMessage, createPost } from "../controller/Admin";
const adminRouter = Router();
import  path  from "path";
import adminAuth from "../middleware/AdminAuth";
import User from "../model/User";
import Chat from "../model/Chat";
import Msg from "../model/Msg";
import multer from "multer";
const __dirname = path.resolve();
const upload = multer({
    dest: "./upload"
  });
adminRouter.get('/', adminAuth,(req,res) => {
    console.log(req.user);
    res.render('dashboard', { title: 'Hey', message: 'Hello there!'});
});
adminRouter.get('/chats', adminAuth,async (req,res) => {
    const chats = await Chat.find({}).populate('sender').populate('receiver').populate('messages');
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

adminRouter.get('/user/create',adminAuth, (req,res) => {
    res.render('userCreate');
});
adminRouter.get('/posts',adminAuth, (req,res) => {
    res.render('post');
});

adminRouter.get('/chat/create',adminAuth, async (req,res) => {
    const users = await User.find();
    res.render('createChat', {users: users});
});

adminRouter.get('/post/create',adminAuth, async (req,res) => {
    const users = await User.find();
    res.render('createPost', {users: users});
});
adminRouter.post('/chat/create',adminAuth, createChat);
adminRouter.post('/post/create',adminAuth, upload.single("file"), (req, res) => {
  console.log(req.body);
  const tempPath = req.file?.path;
  
  const targetPath = path.join(__dirname, "./uploads/image.png");

  if (path.extname(req.file.originalname).toLowerCase() === ".png") {
    fs.rename(tempPath, targetPath, err => {
      if (err) return handleError(err, res);

      res
        .status(200)
        .contentType("text/plain")
        .end("File uploaded!");
    });
  } else {
    fs.unlink(tempPath, err => {
      if (err) return handleError(err, res);

      res
        .status(403)
        .contentType("text/plain")
        .end("Only .png files are allowed!");
    });
  }
});

adminRouter.post('/chat/:id/delete',adminAuth, deleteChat);

adminRouter.post('/message/:id/delete',adminAuth, deleteMessage);


export { adminRouter };
