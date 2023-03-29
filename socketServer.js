const socketIo = require("socket.io")
const server = require("./app")

const io =  socketIo(server)

io.on("connection",(socket)=>{
    console.log("user connected to socket io server, ",socket.id)
})