import * as store from './store.js'
import * as wws from './wss.js'

const socket = io("/");

// register the socket connection
wws.registerSocketEvents(socket)


// copy personalCode to clipBoard functionality
const copyPersonalCodeBtn = document.getElementById("personal_code_copy_button")
copyPersonalCodeBtn.addEventListener("click",()=>{
  const personalCode = store.getState().socketId
  navigator.clipboard && navigator.clipboard.writeText(personalCode)
})