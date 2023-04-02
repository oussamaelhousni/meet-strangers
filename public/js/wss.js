import * as store from "./store.js";
import * as ui from "./ui.js";
import * as webRTCHandler from "./webRTCHandler.js";
import * as constants from "./constants.js";
let socketIO = null;

export const registerSocketEvents = (socket) => {
    socket.on("connect", () => {
        socketIO = socket;
        console.log("succesfully connected to socket.io server");
        // 1 - set the socket variable to the connected socket
        store.setSocketId(socket.id);
        // 2 - show the socket id as the personal code
        ui.updatePersonalCode(store.getState().socketId);
    });

    // 3 - handle the pre-offer
    socket.on("pre-offer", (data) => {
        webRTCHandler.handlePreOffer(data);
    });

    // 4 - handle pre-offer asnser ( call acppted,call rejected,call unavailable,calle_notFound)
    socket.on("pre-offer-answer", (data) => {
        const { preOfferAnswer, callType } = data;
        console.log("anser comme", data);
        webRTCHandler.handlePreOfferAnswer(data);
    });

    socket.on("webRTC-signaling", (data) => {
        console.log("offer asat", data);
        switch (data.type) {
            case constants.webRTCSignaling.OFFER: {
                webRTCHandler.handleWebRTCOffer(data);
                break;
            }
            case constants.webRTCSignaling.ANSWER: {
                webRTCHandler.handleWebRTCAnswer(data);
                break;
            }
            case constants.webRTCSignaling.ICE_CANDIDATE: {
                webRTCHandler.handlewebRTCCandidate(data);
                break;
            }
            default:
                console.log("in default a sat", data);
                return;
        }
    });
};

export const sendPreOffer = (data) => {
    socketIO.emit("pre-offer", data);
};

export const sendPreOfferAnswer = (data) => {
    socketIO.emit("pre-offer-answer", data);
};

export const sendDataUsingWebRTCSignaling = (data) => {
    socketIO.emit("webRTC-signaling", data);
};
