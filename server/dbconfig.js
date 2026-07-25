import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();
const dbName = "task-manager";
export const collectionName = "tasks";
const url = process.env.MONGODB_URI;
console.log(url);
const client = new MongoClient(url);

export const connection = async () => {
  const connect = await client.connect();
  return await connect.db(dbName);
};
