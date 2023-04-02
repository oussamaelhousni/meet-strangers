const express = require("express");
const socketIO = require("socket.io");
const path = require("path");

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.static(path.join(__dirname, "public")));
app.get("/", (req, res) => {
    return res.sendFile(path.join(__dirname, "public", "index.html"));
});

const server = app.listen(PORT, () => {
    console.log("Server starts at PORT :" + PORT);
});

let connectedPeers = [];

const io = socketIO(server);

io.on("connection", (socket) => {
    console.log("user connected to socket server, ", socket.id);
    // 1 - add new user to connected user
    connectedPeers.push(socket.id);

    // 2 - listen for pre-offer event from the caller
    socket.on("pre-offer", (data) => {
        const { calleePersonalCode, callType } = data;
        const connectedPeer = connectedPeers.find(
            (socketId) => socketId === calleePersonalCode
        );
        //  2 - 1 - if the user is connected send to him the pre-offer
        if (connectedPeer) {
            const sendedData = {
                callerSocketId: socket.id,
                callType,
            };
            io.to(calleePersonalCode).emit("pre-offer", sendedData);
        } else {
            io.to(socket.id).emit("pre-offer-answer", {
                preOfferAnswer: "CALLEE_NOT_FOUND",
            });
        }
    });

    // 3 - listen to pre-offer-asnwer event from the callee
    socket.on("pre-offer-answer", (data) => {
        const { callerSocketId } = data;

        // see if the caller still connected
        const caller = connectedPeers.find(
            (socketId) => socketId === callerSocketId
        );

        if (caller) {
            io.to(callerSocketId).emit("pre-offer-answer", data);
        }
    });

    socket.on("webRTC-signaling", (data) => {
        console.log("web rtc signlaing came");
        const { connectedUserSocketId } = data;
        const connectedPeer = connectedPeers.find(
            (socketId) => socketId === connectedUserSocketId
        );
        if (connectedPeer) {
            console.log("inside the f from webrtc");
            io.to(connectedPeer).emit("webRTC-signaling", data);
        }
    });
    // if the connection is failed we remove the user from the connected users
    socket.on("disconnect", () => {
        console.log(`user with id == ${socket.id} disconnected`);
        connectedPeers = connectedPeers.filter((id) => id !== socket.id);
        console.log("the connected users ", []);
    });
});
