import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { bookRouter } from "./routes/booksRoute.js";
import { otpRouter } from "./routes/otpRoute.js";

export const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.get('/', (req, res) => {
    res.send('Hello World');
});

app.use('/api/books', bookRouter);
app.use('/api/otp', otpRouter);

