const express = require('express');
const app = express();
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
});

//middleware
dotenv.config();
app.use(limiter);
app.use(helmet());
app.use(express.json());


//routes

app.use('/user', require("./routes/user/user.routes"));

app.use('/settings', require("./routes/settings/setting.routes"));





// server Listen

app.listen(process.env.PORT || 3000, () => {

    console.log(`Server is running on port ${process.env.PORT || 3000}`);
})


