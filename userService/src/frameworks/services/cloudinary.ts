import {v2 as cloudinary} from 'cloudinary'
import { configDotenv } from 'dotenv';
configDotenv();


cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API,
    api_secret: process.env.API,
  });
  
export default cloudinary;