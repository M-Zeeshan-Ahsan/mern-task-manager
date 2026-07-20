import { MongoClient } from "mongodb";

const dbName = "task-manager";
export const collectionName = "tasks";
const url = "mongodb://127.0.0.1:27017";

const client = new MongoClient(url);

export const connection = async () => {
  const connect = await client.connect();
  return await connect.db(dbName);
};
