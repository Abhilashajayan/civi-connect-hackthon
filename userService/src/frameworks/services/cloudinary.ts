import {v2 as cloudinary} from 'cloudinary'
import dotenv from 'dotenv';
dotenv.config()

cloudinary.config({
    cloud_name: 'drpmfgb5x',
    api_key: "391749527228236",
    api_secret: "usDlTdEtlOisMRhG_HeWUtcae-E",
  });
  
export default cloudinary;