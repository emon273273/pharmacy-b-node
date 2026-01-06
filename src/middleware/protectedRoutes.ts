import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

interface DecodedToken extends JwtPayload {
  id: number;
  email: string;
  roleId: number;
}

export function protectedRoutes(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).send({
      message: "Authorization required",
    });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as DecodedToken;

    req.user = { roleId: decoded.roleId };

    next();
  } catch (error) {
    const err = error as Error;
    console.error("JWT Verification Error:", err.message);
    res.status(401).send({
      message: "Invalid or expired token",
    });
    return;
  }
}
