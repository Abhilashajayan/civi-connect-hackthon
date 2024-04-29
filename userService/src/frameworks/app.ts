import express from 'express';
import cors from 'cors';
import nocache from 'nocache';
import { dbConnection } from './database/database.conn';
import { UserRouter, userRouter } from '../adapters/routes/user.routes';
const userRouterObj = new UserRouter();


const app = express();
const port =  process.env.PORT || 3003;
userRouterObj.rabbitMq();
app.use(cors());


app.use(nocache());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
dbConnection();
app.use(userRouter);
app.listen(port, () => {
    console.log(`Server Running on ${port}`);
  });