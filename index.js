const express = require("express")
const bodyParser = require('body-parser')
const app = express()
const port = process.env.PORT || '3000'
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }))


const sqlite3 = require('sqlite3')

const db = new sqlite3.Database('database.sqlite')
db.run("CREATE TABLE IF NOT EXISTS contactos (nombre VARCHAR, email VARCHAR, comentario TEXT)")





app.get('/', function(req,res) {
    res.render("curriculum")
})

app.get('/contacto', function(req,res) {
    res.render("contacto")
})

app.post('/guardar', function(req,res) {
    
    const nombre = req.body.name
    const email = req.body.email
    const comentario = req.body.comentario

    db.run(`INSERT INTO contactos VALUES ('${nombre}','${email}','${comentario}')`)
    console.log(req.body.name)
    console.log(req.body.email)
    console.log(req.body.comentario)
    res.redirect('/contacto')

})


app.listen(port, () => {
console.log("Escuchando el puerto "+port)
})


