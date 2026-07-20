import express from "express";
import cors from "cors";
import { collectionName, connection } from "./dbconfig.js";
import { ObjectId } from "mongodb";
import taskRoutes from "./routes/taskRoutes.js";

const app = express();
app.use(express.json());
app.use(cors());

app.use(taskRoutes);

app.listen(3000);
