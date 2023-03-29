const express = require("express")
const socketIO = require("socket.io")
const path = require("path")

const PORT = process.env.PORT || 3000
const app = express()

app.use(express.static(path.join(__dirname,'public')))
app.get("/",(req,res)=>{
    return res.sendFile(path.join(__dirname,'public','index.html'))
})

const server = app.listen(PORT,()=>{
    console.log("Server starts at PORT :" + PORT)
})

let connectedPeers = []

const io = socketIO(server)

io.on("connection",(socket)=>{
    console.log("user connected to socket server, ",socket.id)
    // add new user to connected user
    connectedPeers.push(socket.id)

    // if the connection is failed we remove the user from the connected users
    socket.on("disconnect",()=>{
        console.log(`user with id == ${socket.id} disconnected`)
        connectedPeers = connectedPeers.filter(id=>id!==socket.id)
        console.log("the connected users ",[])
    })

})