import { Request, Response } from "express";
import { login } from "../../service/authService";
import jwt from "jsonwebtoken";

export const LoginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    const user = await login(email, password);

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        roleId: user.roleId,
      },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "1d",
      }
    );

    res.status(200).json({
      message: "Login successful",
      user,
      token,
    });
  } catch (error) {
    const err = error as Error;
    res.status(401).json({
      message: err.message || "Login failed",
    });
  }
};
