import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface JwtPayload {
  userId: string;
}

export const authMiddleware = (req: any, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    const secret = process.env.JWT_SECRET || "demo";
    const decoded = jwt.verify(token, secret) as JwtPayload;
    req.userId = decoded.userId; // Add userId to request object
    next();
  } catch (error) {
    res.status(400).json({ error: "Invalid token." });
  }
};
