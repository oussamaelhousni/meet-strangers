import * as constants from "./constants.js";
import * as ui from "./ui.js";
import * as wss from "./wss.js";
import * as store from "./store.js";
let connectedUserDetails;
let peerConnection = null;
let dataChannel = null;
const configuration = {
    iceServers: [
        {
            urls: "stun:stun.l.google.com:13902",
        },
    ],
};
export const getLocalPreview = () => {
    navigator.mediaDevices
        .getUserMedia({ audio: true, video: true })
        .then((stream) => {
            ui.updateLocalVideo(stream);
            store.setLocalStream(stream);
        })
        .catch((error) => {
            console.log(error);
        });
};
// send the preoffer to callee
// show callDialog ui
export const sendPreOffer = (callType, calleePersonalCode) => {
    connectedUserDetails = {
        callType,
        socketId: calleePersonalCode,
    };
    const data = {
        callType,
        calleePersonalCode,
    };
    if (
        callType === constants.callType.CHAT_PERSONAl_CODE ||
        callType === constants.callType.VIDEO_PERSONAL_CODE
    ) {
        const data = {
            callType,
            calleePersonalCode,
        };
        ui.showCallingDialog(callingDialogRejectCallHandler);
        wss.sendPreOffer(data);
    }
};

// getting the call preoffer
// showing incoming call dialog
// based on the call type
export const handlePreOffer = (data) => {
    console.log("welcome pre offer");
    const { callerSocketId, callType } = data;
    connectedUserDetails = {
        socketId: callerSocketId,
        callType: callType,
    };

    if (
        callType === constants.callType.CHAT_PERSONAl_CODE ||
        callType === constants.callType.VIDEO_PERSONAL_CODE
    ) {
        ui.showIncomingCallDialog(
            connectedUserDetails,
            acceptCallHandler,
            rejectCallHandler
        );
    }
};

const acceptCallHandler = (callerSocketId, callType) => {
    console.log("call accepted", callType);
    console.log(callerSocketId);
    createPeerConnection();
    ui.showCallElements(callType);
    sendPreOfferAnswer(
        constants.preOfferAnswer.CALL_ACCEPTED,
        callerSocketId,
        callType
    );
};

const rejectCallHandler = (callerSocketId) => {
    console.log("call rejected");
    sendPreOfferAnswer(constants.preOfferAnswer.CALL_REJECTED, callerSocketId);
};

const callingDialogRejectCallHandler = () => {
    console.log("rej");
};

const sendPreOfferAnswer = (preOfferAnswer, callerSocketId, callType) => {
    const data = {
        callerSocketId,
        preOfferAnswer,
        callType,
    };
    ui.removeAllDialogs();
    wss.sendPreOfferAnswer(data);
};

export const handlePreOfferAnswer = async (data) => {
    const { preOfferAnswer, callType } = data;

    if (preOfferAnswer === constants.preOfferAnswer.CALLEE_NOT_FOUND) {
        // shwoing dialog that call has not been found
        ui.showInfoDialog(preOfferAnswer);
    }

    if (preOfferAnswer === constants.preOfferAnswer.CALL_UNAVAILABLE) {
        // showing dialog that callee is not able to connect
        ui.showInfoDialog(preOfferAnswer);
    }

    if (preOfferAnswer === constants.preOfferAnswer.CALL_REJECTED) {
        // showing dialog that callee rejcted the pre-offer
        ui.showInfoDialog(preOfferAnswer);
    }

    if (preOfferAnswer === constants.preOfferAnswer.CALL_ACCEPTED) {
        ui.removeAllDialogs();
        ui.showCallElements(callType);
        createPeerConnection();
        await sendWebRTCOffer();
    }
};
/*
const createPeerConnection = () => {
    peerConnection = new RTCPeerConnection(configuration);

    peerConnection.onicecandidate = (e) => {
        console.log("getting ice candidates from stun server");
        if (e.candidate) {
            // senf our ice candidates to other peer
            wss.sendDataUsingWebRTCSignaling({
                connectedUserSocketId: connectedUserDetails.socketId,
                type: constants.webRTCSignaling.ICE_CANDIDATE,
                candidate: e.candidate,
            });
        }
    };

    peerConnection.onconnectionstatechange = (e) => {
        if (peerConnection.connectionState == "connected") {
            console.log("succusfully connected with other peer");
        }
    };

    // receiving tracks
    const remoteStream = new MediaStream();
    store.setRemoteStream(remoteStream);
    ui.updateRemoteVideo(remoteStream);

    peerConnection.ontrack = (e) => {
        remoteStream.addTrack = e.track;
    };

    // add our stream to peerConnection
    if (
        connectedUserDetails.callType === constants.callType.VIDEO_PERSONAL_CODE
    ) {
        const localStream = store.getState().localStream;
        for (const track of localStream.getTracks()) {
            peerConnection.addTrack(track, localStream);
        }
    }
};*/
const createPeerConnection = () => {
    peerConnection = new RTCPeerConnection(configuration);

    peerConnection.onicecandidate = (event) => {
        console.log("geeting ice candidates from stun server");
        if (event.candidate) {
            // send our ice candidates to other peer
            wss.sendDataUsingWebRTCSignaling({
                connectedUserSocketId: connectedUserDetails.socketId,
                type: constants.webRTCSignaling.ICE_CANDIDATE,
                candidate: event.candidate,
            });
        }
    };

    peerConnection.onconnectionstatechange = (event) => {
        if (peerConnection.connectionState === "connected") {
            console.log("succesfully connected with other peer");
        }
    };

    // receiving tracks
    const remoteStream = new MediaStream();
    store.setRemoteStream(remoteStream);
    ui.updateRemoteVideo(remoteStream);

    peerConnection.ontrack = (event) => {
        remoteStream.addTrack(event.track);
    };

    // add our stream to peer connection

    if (
        connectedUserDetails.callType === constants.callType.VIDEO_PERSONAL_CODE
    ) {
        const localStream = store.getState().localStream;

        for (const track of localStream.getTracks()) {
            peerConnection.addTrack(track, localStream);
        }
    }
};

const sendWebRTCOffer = async () => {
    //to make offer we need to exchange sdp
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    wss.sendDataUsingWebRTCSignaling({
        connectedUserSocketId: connectedUserDetails.socketId,
        type: constants.webRTCSignaling.OFFER,
        offer,
    });
};

export const handleWebRTCOffer = async (data) => {
    await peerConnection.setRemoteDescription(data.offer);
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    wss.sendDataUsingWebRTCSignaling({
        connectedUserSocketId: connectedUserDetails.socketId,
        type: constants.webRTCSignaling.ANSWER,
        answer: answer,
    });
};

export const handleWebRTCAnswer = async (data) => {
    console.log("handling web rtc answer ", data);
    await peerConnection.setRemoteDescription(data.answer);
};

export const handlewebRTCCandidate = async (data) => {
    console.log("handling web rtc candidate");
    try {
        await peerConnection.addIceCandidate(data.candidate);
    } catch (error) {
        console.error("error ocured in ice candidate");
    }
};
