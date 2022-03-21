const express = require("express")

const app = express()
const port = process.env.PORT || '3000'

app.listen(3000, () => {
console.log("Escuchando el puerto 3000")
})

app.use(express.static("public"))
