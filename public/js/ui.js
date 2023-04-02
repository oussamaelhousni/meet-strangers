import * as constants from "./constants.js";
import * as elements from "./elements.js";
export const updatePersonalCode = (personalCode) => {
    const postalCodeElement = document.getElementById(
        "personal_code_paragraph"
    );
    postalCodeElement.innerText = personalCode;
};

export const showIncomingCallDialog = (
    connectedUserDetails,
    acceptCallHandler,
    rejectCallHandler
) => {
    const { callType, socketId } = connectedUserDetails;
    const callTypeInfo =
        callType === constants.callType.CHAT_PERSONAl_CODE ? "Chat" : "Video";
    const incomingCallDialog = elements.getIncomingCallDialog(
        { callTypeInfo, callerSocketId: socketId, callType },
        acceptCallHandler,
        rejectCallHandler
    );

    const dialogContainer = document.getElementById("dialog");
    dialogContainer.innerHTML = "";
    dialogContainer.appendChild(incomingCallDialog);
};

export const showCallingDialog = (rejectCallHandler) => {
    const callingDialog = elements.getCallingDialog(rejectCallHandler);

    // removing all dialogs inside HTML dialog element
    const dialog = document.getElementById("dialog");
    dialog.querySelectorAll("*").forEach((dialog) => dialog.remove());

    dialog.appendChild(callingDialog);
};

export const removeAllDialogs = () => {
    const dialog = document.getElementById("dialog");
    dialog.querySelectorAll("*").forEach((dialog) => dialog.remove());
};

export const showInfoDialog = (preOfferAnswer) => {
    let infoDialog = null;

    if (preOfferAnswer === constants.preOfferAnswer.CALL_REJECTED) {
        infoDialog = elements.getInfoDialog(
            "Call rejected",
            "Callee rejected your call"
        );
    }

    if (preOfferAnswer === constants.preOfferAnswer.CALLEE_NOT_FOUND) {
        infoDialog = elements.getInfoDialog(
            "Callee not found",
            "Please check personal code"
        );
    }

    if (preOfferAnswer === constants.preOfferAnswer.CALL_UNAVAILABLE) {
        infoDialog = elements.getInfoDialog(
            "Call is not possible",
            "Probably callee is busy. Please try againg later"
        );
    }

    if (infoDialog) {
        const dialog = document.getElementById("dialog");
        dialog.appendChild(infoDialog);

        setTimeout(() => {
            removeAllDialogs();
        }, [4000]);
    }
};

export const showCallElements = (callType) => {
    console.log("show elemets", callType);
    if (callType === constants.callType.CHAT_PERSONAl_CODE) {
        showChatCallElements();
    }

    if (callType === constants.callType.VIDEO_PERSONAL_CODE) {
        showVideoCallElements();
    }
};

const showChatCallElements = () => {
    const finishConnectionChatButtonContainer = document.getElementById(
        "finish_chat_button_container"
    );
    showElement(finishConnectionChatButtonContainer);

    const newMessageInput = document.getElementById("new_message");
    showElement(newMessageInput);
    //block panel
    disableDashboard();
};

const showVideoCallElements = () => {
    const callButtons = document.getElementById("call_buttons");
    showElement(callButtons);

    const placeholder = document.getElementById("video_placeholder");
    hideElement(placeholder);

    const remoteVideo = document.getElementById("remote_video");
    showElement(remoteVideo);

    const newMessageInput = document.getElementById("new_message");
    showElement(newMessageInput);
    //block panel
    disableDashboard();
};

// ui helper functions

const enableDashboard = () => {
    const dashboardBlocker = document.getElementById("dashboard_blur");
    if (!dashboardBlocker.classList.contains("display_none")) {
        dashboardBlocker.classList.add("display_none");
    }
};

const disableDashboard = () => {
    const dashboardBlocker = document.getElementById("dashboard_blur");
    if (dashboardBlocker.classList.contains("display_none")) {
        dashboardBlocker.classList.remove("display_none");
    }
};

const hideElement = (element) => {
    if (!element.classList.contains("display_none")) {
        element.classList.add("display_none");
    }
};

const showElement = (element) => {
    if (element.classList.contains("display_none")) {
        element.classList.remove("display_none");
    }
};

export const updateLocalVideo = (stream) => {
    const localVideo = document.getElementById("local_video");
    localVideo.srcObject = stream;
    localVideo.addEventListener("loadedmetadata", () => {
        localVideo.play();
    });
};

export const updateRemoteVideo = (stream) => {
    console.log("remote video called", stream);
    const remoteVideo = document.getElementById("remote_video");
    remoteVideo.srcObject = stream;
};
