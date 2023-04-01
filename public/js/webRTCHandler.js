import * as constants from "./constants.js";
import * as ui from "./ui.js";
import * as wss from "./wss.js";

// send the preoffer to callee
// show callDialog ui
export const sendPreOffer = (callType, calleePersonalCode) => {
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
    const connectedUserDetails = {
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

export const handlePreOfferAnswer = (data) => {
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
    }
};
