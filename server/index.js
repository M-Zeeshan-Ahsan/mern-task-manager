import express from "express";
import cors from "cors";
import { ObjectId } from "mongodb";
import taskRoutes from "./routes/taskRoutes.js";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js";
import errorHandler from "./middleware/errorHandler.js";

const app = express();
app.use(express.json());
app.use(cors());
app.use("/uploads", express.static("uploads"));
app.use(taskRoutes);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(errorHandler);

app.listen(3000);
