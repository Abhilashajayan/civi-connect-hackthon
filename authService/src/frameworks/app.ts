import express from 'express';
import cors from 'cors';
import nocache from 'nocache';
import { dbConnection } from './database/database.conn';
import { configDotenv } from 'dotenv';
configDotenv();

// import { authRouter } from '../adapters/routes/auth.route';

const app = express();
const port =  process.env.PORT ;
app.use(cors());

app.use(nocache());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
dbConnection();
// app.use(authRouter);
app.listen(port, () => {
    console.log(`Server Running on ${port}`);
  });