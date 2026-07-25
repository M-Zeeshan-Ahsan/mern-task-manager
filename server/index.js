import express from "express";
import cors from "cors";
import { ObjectId } from "mongodb";
import authRoutes from "./routes/authRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js";
import errorHandler from "./middleware/errorHandler.js";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import morgan from "morgan";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests, please try again later.",
});

const app = express();
app.use(helmet());
app.use(limiter);
app.use(morgan("dev"));
app.use(express.json());
app.use(cors());
// app.use(
//   cors({
//     origin: "http://localhost:5173",
//   }),
// );
app.use("/uploads", express.static("uploads"));
app.use(authRoutes);
app.use(taskRoutes);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(errorHandler);

app.listen(3000);
