import * as store from "./store.js";
import * as constants from "./constants.js";
import * as wws from "./wss.js";
import * as webRTCHandler from "./webRTCHandler.js";
const socket = io("/");

// register the socket connection
wws.registerSocketEvents(socket);

// copy personalCode to clipBoard functionality
const copyPersonalCodeBtn = document.getElementById(
    "personal_code_copy_button"
);
copyPersonalCodeBtn.addEventListener("click", () => {
    const personalCode = store.getState().socketId;
    navigator.clipboard && navigator.clipboard.writeText(personalCode);
});

// register event listeners for connextions buttons
const personalCodeChatBtn = document.getElementById(
    "personal_code_chat_button"
);
const personalCodeVideoBtn = document.getElementById(
    "personal_code_video_button"
);

personalCodeChatBtn.addEventListener("click", () => {
    const calleePersonalCode = document.getElementById(
        "personal_code_input"
    ).value;
    webRTCHandler.sendPreOffer(
        constants.callType.CHAT_PERSONAl_CODE,
        calleePersonalCode
    );
});

personalCodeVideoBtn.addEventListener("click", () => {
    const calleePersonalCode = document.getElementById(
        "personal_code_input"
    ).value;
    webRTCHandler.sendPreOffer(
        constants.callType.VIDEO_PERSONAL_CODE,
        calleePersonalCode
    );
});
