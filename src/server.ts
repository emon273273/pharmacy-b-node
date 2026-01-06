import express, { Application } from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";

// Routes
import userRoutes from "./routes/user/user.routes";
import settingRoutes from "./routes/settings/setting.routes";
import categoryRoutes from "./routes/category/category.routes";
import supplierRoutes from "./routes/supplier/supplier.routes";
import medicineRoutes from "./routes/medicine/medicine.routes";

// Load environment variables
dotenv.config();

const app: Application = express();

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

// Middleware
app.use(limiter);
app.use(helmet());
app.use(express.json());
app.use(morgan("dev"));

// Routes
app.use("/user", userRoutes);
app.use("/settings", settingRoutes);
app.use("/category", categoryRoutes);
app.use("/supplier", supplierRoutes);
app.use("/medicine", medicineRoutes);

// Server Listen
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
