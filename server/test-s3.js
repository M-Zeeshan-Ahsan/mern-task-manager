import dotenv from "dotenv";
import { ListBucketsCommand } from "@aws-sdk/client-s3";
import s3 from "./config/s3.js";

dotenv.config();

try {
  const data = await s3.send(new ListBucketsCommand({}));

  console.log("✅ S3 Connected Successfully");
  console.log(data.Buckets);
} catch (error) {
  console.log("❌ Connection Failed");
  console.log(error);
}
