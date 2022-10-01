const express = require("express"),
      app = express(),
      http = require("http"),
      server = http.createServer(app),
      ejs = require("ejs"),
      io = require("socket.io")(server)

app.use(express.static(__dirname+"/src/"))
app.set("views",__dirname+"/src/")
app.engine("html",ejs.renderFile)
app.set("view engine", "html")
app.get("/",(req,res)=>{
    res.render(__dirname+"/src/index.html")
})

io.on("connection",socket=>{
    console.log(`Socket connected: ${socket.id}`)
})

server.listen(8080, ()=>{
    console.log("Server is running in: localhost:8080")
})