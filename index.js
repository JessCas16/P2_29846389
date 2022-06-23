const express = require("express")
const bodyParser = require('body-parser')
const app = express()
const port = process.env.PORT || '3000'
const axios = require('axios')
const nodemailer = require('nodemailer')
const { RecaptchaV3 } = require('express-recaptcha')
const SECRET_KEY = '6LdEnO0fAAAAAI9ipLbp3Ew2CBXEPRBLaS_QzvRI'
const SITE_KEY = '6LdEnO0fAAAAACySJZCy4Q-vMk_IL6XS1lUSqOT-'
const recaptcha = new RecaptchaV3(SITE_KEY, SECRET_KEY)
require('dotenv').config()

const cookieParser = require('cookie-parser')
const session = require('express-session')

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}))

const { MAIL_USERNAME, MAIL_PASSWORD } = process.env 

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

const sqlite3 = require('sqlite3')

const db = new sqlite3.Database('database.sqlite')
db.run("CREATE TABLE IF NOT EXISTS contactos (nombre VARCHAR, email VARCHAR, comentario TEXT, ip VARCHAR, fechaHora DATETIME, country VARCHAR)")





app.get('/', function (req, res) {
    res.render("curriculum")
})

// app.get('/contacto', recaptcha.middleware.render, function (req, res) {
//     console.log(res.recaptcha)
//     res.render("contacto",  { captcha: res.recaptcha })

// })

app.get('/contacto', function (req, res) {

    res.render('contacto', { SITE_KEY, SECRET_KEY })
})


app.post('/contacto', recaptcha.middleware.verify, function (req, res) {
    if (!req.recaptcha.error) {
        // success code
    } else {
        // error code
    }
})


app.post('/guardar', recaptcha.middleware.verify, async function (req, res) {
    if (!req.recaptcha.error) {
        // success code

        const ip = req.header('x-forwarded-for') || req.socket.remoteAddress
        const nombre = req.body.name
        const email = req.body.email
        const comentario = req.body.comentario
        const geoip = await axios.get(`http://ip-api.com/json/${ip}`)
        const country = geoip.data.countryCode

        db.run(`INSERT INTO contactos VALUES ('${nombre}','${email}','${comentario}','${ip}',datetime('now', 'localtime'),'${country}')`)
     
     
        const to = "programacion2ais@dispostable.com";
        const message = `
            Nombre: ${nombre}
            Correo: ${email}
            Comentario: ${comentario}
            Ip: ${ip}
            Pais: ${country}
        `;
        const from = MAIL_USERNAME.trim();
        console.log({
            user: MAIL_USERNAME.trim(),
            pass: MAIL_PASSWORD.trim()
        })
        const smtpTransport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: MAIL_USERNAME.trim(),
                pass: MAIL_PASSWORD.trim()
            }
        });
        const mailOptions = {
            from,
            to, 
            subject: 'contacto',
            text: message
        }
        smtpTransport.sendMail(mailOptions, function(error, response){
            if(error){
                console.log(error);
            }else{
                res.redirect('/contacto')
            }
        });

        

    } else {
        // error code
        res.redirect('/contacto')
    }
})


app.get('/contactos', function (req, res) {
    if(!req.session.login) { 
        return res.redirect('/login')
    }
    const contactos = db.all('SELECT * FROM contactos', function (err, rows) {
        console.log(rows)
        res.render("contactos", { contactos: rows })
    })

})

app.get('/login', function (req, res){
    res.render('login', { query: req.query })
})

app.post('/login', function (req, res){
    const { email, password } = req.body
   
    if ( email == 'usuario@gmail.com' && password == '123456'){
        req.session.login = true
        res.redirect('/contactos')
    } else {
        res.redirect('/login')
    }
    
})

app.listen(port, () => {
    console.log("Escuchando el puerto " + port)
})


