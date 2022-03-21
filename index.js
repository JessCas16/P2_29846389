const express = require("express")

const app = express()

app.listen(3000, () => {
console.log("Escuchando el puerto 3000")
})

app.use(express.static("public"))
