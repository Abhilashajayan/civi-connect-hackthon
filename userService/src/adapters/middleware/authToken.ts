import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import UserModel from "../../frameworks/models/user.model";

interface AuthenticatedRequest extends Request {
  user?: any;
}

const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  console.log(authHeader);
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res
      .status(401)
      .json({ message: "Unauthorized: Token not provided" });
  }
  jwt.verify(token, "secret_key" as string, async (err, decodedToken: any) => {
    if (err) {
      console.log(err);
      return res.status(403).json({ message: "Forbidden: Invalid token" });
    }
    const userId = decodedToken.id;
    try {
      const user = await UserModel.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      if (user.status === true) {
        return res.status(403).json({ message: "Forbidden: User is blocked" });
      }
      req.user = user;
      next();
    } catch (error) {
      console.error("Error fetching user status:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  });
};

export default authenticateToken;
