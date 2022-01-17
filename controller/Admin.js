import User from "../model/User";
import path from "path";
import mongoose from "mongoose";
import bcryptjs from "bcryptjs";
import { signJWT } from "../middleware/JWT";
import Chat from "../model/Chat";
import Msg from "../model/Msg";
import formidable from "formidable";
import multer from "multer";
const __dirname = path.resolve();

export async function updateUser(req,res) {
  console.log(req.body);
  const role = req.body.role == 'Admin' ? 2 : req.body.role == 'Moderator' ? 1 : 0;
  console.log(role);
  await User.findOneAndUpdate({email: req.body.email}, {name: req.body.name, email:req.body.email,role:role,username: req.body.username});
  res.redirect(`${process.env.CLIENT_URL}admin/allUsers`)
}

export async function login(req, res, next) {
  console.log(req.body)
  let { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.sendStatus(400);
  }
  const result = await bcryptjs.compare(password, user?.password);
  if (!result) {
    return res.status(401).json({
      message: "Invalid email or password",
    });
  } else if (result) {
    try {
      const token = await signJWT(user, next);
      console.log(token);
      if (token) {
        res.cookie("access_token", token, {
          maxAge: 3200 * 1000,
        });
        delete user.password;
        console.log(user);
        res.redirect('http://localhost:1337/admin')
      }
    } catch (err) {
      console.log(err);
    }
  }
}
export async function getAllUsers(req, res) {
  const users = await User.find({});
  res.render("users", { users: users });
}

export async function deleteUser(req, res) {
  const { id } = req.params;
  await User.deleteOne({ _id: mongoose.Types.ObjectId.createFromHexString(id) });

  res.redirect("http://localhost:1337/admin/allUsers");
}

export async function createUser(req, res) {
  console.log(req.body);
  let user;
  let username;
  try {
    username = await User.findOne({ username: req.body.username });
    user = await User.findOne({ email: req.body.email });
  } catch (err) {
    console.log(err);
  }
  if (user) {
    return res.status(400).send({ msg: "This email address is already associated with another account." });
  }
  if (username) {
    return res.status(401).send({
      msg: "Username alredy exist",
    });
  } else {
    req.body.password = bcryptjs.hashSync(req.body.password, 10);

    user = new User({
      role: req.body.role,
      name: req.body.name,
      username: req.body.username,
      email: req.body.email,
      username: req.body.username,
      password: req.body.password,
    });

    await user.save();
    res.redirect('http://localhost:1337/admin/allUsers')
  }
}

export async function createChat(req,res) {
  if(req.user.role == 1) {
    return res.send('you are moderator');
  }
  const {sender , receiver,message} = req.body;
  const senderDb = await User.findOne({_id: sender});
  const receiverDb = await User.findOne({_id: sender});
  let chat = await Chat.findOne( { $and: [ { sender: sender }, { receiver: receiver } ] } );
  console.log(chat);
  if(chat) {
    res.status(500).send('chat aleredy exist')
  }
  const msg = new Msg({
    message: message
  });
  console.log(msg);
  await msg.save()
  let messages = [];
  messages.push(msg);
  chat = new Chat({
    sender: senderDb,
    receiver: receiverDb,
    messages: messages
  });
  await chat.save();

  res.redirect('http://localhost:1337/admin/chats');
}
export async function updateChat(req,res) {

}
export async function deleteChat(req,res) {
  console.log(req.user.role)
  if(req.user.role == 1) {
    return res.send('you are moderator');
  }
  const { id } = req.params;
  await Chat.deleteOne({ _id: mongoose.Types.ObjectId.createFromHexString(id)});
  res.redirect("http://localhost:1337/admin/chats");
}

export async function deleteMessage(req,res) {
  if(req.user.role == 1) {
    return res.send('you are moderator');
  }
  const { id } = req.params;
  await Msg.deleteOne({ _id: mongoose.Types.ObjectId.createFromHexString(id)});
  res.redirect("http://localhost:1337/admin/messages");
}
export async function updateMessage(req,res) {
  if(req.user.role == 1) {
    return res.send('you are moderator');
  }
  const { id } = req.params;
  console.log(id);
  await Msg.updateOne({ _id: mongoose.Types.ObjectId.createFromHexString(id)},{message: req.body.message});
  res.redirect(`${process.env.CLIENT_URL}admin/messages`);
}
export async function createPost(req,res) {
  
}