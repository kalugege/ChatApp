import jwt from "jsonwebtoken";

const signJWT = async (user) => {
  let timeSinceEpoch = new Date().getTime();
  let expirationTime = timeSinceEpoch + Number(3200) * 100000;
  let expirationTimeInSeconds = Math.floor(expirationTime / 1000);

  try {
    const token = jwt.sign(
      {
        email: user.email,
        role: user.role,
      },
      process.env.TOKEN_SECRET,
      {
        issuer: process.env.ISSUER,
        algorithm: "HS256",
        expiresIn: expirationTimeInSeconds,
      }
    );
    return token;
  } catch (error) {
    return;
  }
};

export { signJWT };
