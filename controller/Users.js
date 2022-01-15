import mongoose from "mongoose";
import bcryptjs from "bcryptjs";
import User from "../model/User";
import Token from "../model/Token";
import nodemailer from "nodemailer";
import { signJWT } from "../middleware/JWT";
import crypto from "crypto";

export async function register(req, res, next) {
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
      name: req.body.name,
      username: req.body.username,
      email: req.body.email,
      username: req.body.username,
      password: req.body.password,
    });

    await user.save();
    let token = new Token({
      _userId: user._id,
      token: crypto.randomBytes(16).toString("hex"),
    });
    await token.save();
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL, pass: process.env.PASSWORD },
    });
    let mailOptions = {
      from: "no-reply@example.com",
      to: user.email,
      subject: "Account Verification Link",
      text:
        "Hello " +
        req.body.name +
        ",\n\n" +
        "Please verify your account by clicking the link: \n" +
        process.env.CLIENT_URL +
        "user/confirmation/" +
        user.email +
        "/" +
        token.token +
        "\n\nThank You!\n",
    };
    transporter.sendMail(mailOptions, function (err) {
      if (err) {
        console.log(err);
        return res.status(500).send({
          msg: "Technical Issue!, Please click on resend for verify your Email.",
        });
      }
      return res
        .status(200)
        .send(
          "A verification email has been sent to " +
            user.email +
            ". It will be expire after one day. If you not get verification Email click on resend token."
        );
    });
  }
}



export async function confirmEmail(req, res, next) {
  const token = await Token.findOne({ token: req.params.token });
  if (!token) {
    return res.status(400).send({
      msg: "Your verification link may have expired. Please click on resend for verify your Email.",
    });
  } else {
    let user = await User.findOne({ _id: token._userId, email: req.params.email });
    if (!user) {
      return res.status(401).send({
        msg: "We were unable to find a user for this verification. Please SignUp!",
      });
    } else {
      user.emailVerify = true;
      await user.save();
      try {
        const token = await signJWT(user, next);
        console.log(token);
        if (token) {
          res.cookie("access_token", token, {
            maxAge: 3200 * 1000,
          });
          delete user.password;
          console.log(user);
          return res.redirect(`${process.env.CLIENT_URL}admin`);
        }
      } catch (err) {
        console.log(err);
      }
      console.log(process.env.CLIENT_URL);
    }
  }
}

const resendLink = function (req, res, next) {
  User.findOne({ email: req.body.email }, function (err, user) {
    if (!user) {
      return res.status(400).send({
        msg: "We were unable to find a user with that email. Make sure your Email is correct!",
      });
    } else if (user.emailVerify) {
      return res.status(200).send("This account has been already verified. Please log in.");
    } else {
      let token = new Token({
        _userId: user._id,
        token: crypto.randomBytes(16).toString("hex"),
      });
      token.save(function (err) {
        if (err) {
          return res.status(500).send({ msg: err.message });
        }

        let transporter = nodemailer.createTransport({
          service: "gmail",
          auth: { user: process.env.EMAIL, pass: process.env.PASSWORD },
        });
        let mailOptions = {
          from: "no-reply@example.com",
          to: user.email,
          subject: "Account Verification Link",
          text:
            "Hello " +
            req.body.name +
            ",\n\n" +
            "Please verify your account by clicking the link: \n" +
            process.env.CLIENT_URL +
            "user/confirmation/" +
            user.email +
            "/" +
            token.token +
            "\n\nThank You!\n",
        };
        transporter.sendMail(mailOptions, function (err) {
          if (err) {
            console.log(err);
            return res.status(500).send({
              msg: "Technical Issue!, Please click on resend for verify your Email.",
            });
          }
          return res
            .status(200)
            .send(
              "A verification email has been sent to " +
                user.email +
                ". It will be expire after one day. If you not get verification Email click on resend token."
            );
        });
      });
    }
  });
};

const sendReset = async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email: email });
  if (!user) {
    return res.status(400).send("user not found");
  }

  let resetToken = crypto.randomBytes(16).toString("hex");
  const hash = await bcryptjs.hash(resetToken, Number(process.env.BCRYPTSALT));
  let token = await Token.findOne({ _userId: user._id });
  if (token) await token.deleteOne();
  await new Token({
    _userId: user._id,
    token: hash,
  }).save();
  const link = `${process.env.CLIENT_URL}/change?token=${resetToken}&id=${user._id}`;
  console.log(link);

  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAIL, pass: process.env.PASSWORD },
  });
  let mailOptions = {
    from: "no-reply@penguin.com",
    to: user.email,
    subject: "Password reset",
    text: "Hello " + user.name + ",\n\n" + "Password reset link " + link + "\n\nThank You!\n",
  };
  transporter.sendMail(mailOptions, function (err) {
    if (err) {
      console.log(err);
      return res.status(500).send({
        msg: "Technical Issue!, Please click on resend for verify your Email.",
      });
    }
    return res
      .status(200)
      .send(
        "A Password reset email has been sent to " +
          user.email +
          ". It will be expire after one day. If you not get password reset Email click on resend token."
      );
  });
};

const resetPassword = async (req, res) => {
  let { token } = req.query;
  let { id } = req.query;
  let { password } = req.body;
  if (!password) {
    throw new Error("bad password");
  }
  if (!token) {
    throw new Error("Invalid or expired password reset token");
  }
  if (!id) {
    throw new Error("id required");
  }
  let database_token = await Token.findOne({ _userId: id.toString() });
  if (!database_token) {
    return res.status(400).send("Invalid or expired password reset token");
  }
  const isValid = await bcryptjs.compare(token.toString(), database_token?.token.toString());
  console.log(isValid);
  if (!isValid) {
    throw new Error("Invalid or expired password reset token");
  }
  req.body.password = bcryptjs.hashSync(req.body.password, 10);
  console.log(database_token);
  await User.updateOne({ _id: id }, { $set: { password: req.body.password } });
  res.send("ok");
};
