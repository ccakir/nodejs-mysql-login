const express = require("express");
const mysql = require("mysql");
const dotenv = require("dotenv");
const path = require("path");
const cookieParser = require("cookie-parser");

dotenv.config({ path: './.env'});



const app = express();

app.use(express.urlencoded());
app.use(express.json());

app.use(cookieParser());

//Route definieren
app.use('/', require('./routes/pages'));
app.use('/auth', require('./routes/auth'));


//public folder definieren
const publicDirectory = path.join(__dirname, './public');
app.use(express.static(publicDirectory));




app.set('view engine', 'hbs');



const con = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASS,
    database: process.env.DATABASE
})


con.connect((err) => {
    if(err) {
        console.log("ERRORRRRRRR : " + err)
    } else {
        console.log("Mysql Database connected!!!!")
    }
})

app.listen(5000, () => {
    console.log("Server started on Port 5000!!!!");
});