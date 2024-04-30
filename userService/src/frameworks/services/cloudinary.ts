import {v2 as cloudinary} from 'cloudinary'
import { configDotenv } from 'dotenv';
configDotenv();


cloudinary.config({
    cloud_name: 'drpmfgb5x',
    api_key: '391749527228236',
    api_secret: 'usDlTdEtlOisMRhG_HeWUtcae',
  });
  
export default cloudinary;