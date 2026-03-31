import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { bookRouter } from "./routes/books.route.js";
// import { otpRouter } from "./routes/otp.route.js";
// import { authRouter } from "./routes/auth.route.js";

export const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.get('/', (req, res) => {
    res.send('Hello World');
});

app.use('/api/books', bookRouter);
// app.use('/api/otp', otpRouter);
// app.use('/api/auth', authRouter);

