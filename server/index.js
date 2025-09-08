const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
require('dotenv').config()
const rateLimit = require("express-rate-limit");


const app = express()
const PORT = process.env.PORT || 5000
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 mins
    max: 100, // 100 requests per 15 mins
    message: "Too many requests, please try again later.",
});


app.use(express.json())
app.use(cors({
    origin: ["https://web-x-zeta.vercel.app"],
    methods: ["POST", "GET", "DELETE", "UPDATE", "PUT"],
    credentials: true
}))
app.use(limiter)

mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err))

app.use('/api/auth', require('./routes/auth'));

app.listen(PORT, () => console.log(`Port is running on:${PORT}`))