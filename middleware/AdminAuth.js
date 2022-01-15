import jwt from "jsonwebtoken";

const adminAuth = (req, res, next) => {
  let token = req.headers?.cookie?.split(" ")[1]?.split("=")[1]
  console.log(token);
  if (!token) {
    return res.redirect('http://localhost:1337/admin/login');
  }

  const data = jwt.verify(token, process.env.TOKEN_SECRET);
  console.log(data)
  if (data.role == 1 || data.role == 2) {
    req.user = data;
    return next();
  } else if(data.role == 0){
    return res.sendStatus(403);
  } else {
    res.redirect('http://localhost:1337/admin/login');
  }
};

export default adminAuth;
