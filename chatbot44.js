import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
import { getFirestore, collection, query, where, getDocs, addDoc, orderBy, deleteDoc } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js";

(function () {
function loadScript(src) {
    return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.type = 'module';
    script.onload = () => resolve();
    script.onerror = () => reject();
    document.head.appendChild(script);
    });
}

Promise.all([
    loadScript('https://cdn.jsdelivr.net/npm/emoji-mart@latest/dist/browser.js'),
]).then(() => {
    const firebaseConfig = {
    apiKey: 'AIzaSyBz-gI6Pmwvsp09_Qp_Q6qS3ECxAfxsAC4',
    authDomain: 'chatbot-9ee0f.firebaseapp.com',
    projectId: 'chatbot-9ee0f',
    storageBucket: 'chatbot-9ee0f.appspot.com',
    messagingSenderId: '127978721082',
    appId: '1:127978721082:web:6de1daa276b0fa12928a03',
    measurementId: 'G-BP73ZG0D4Z',
    };

    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const storage = getStorage(app);

    const getBrowserId = () => {
    let browserId = localStorage.getItem('chatbot_browser_id');
    if (!browserId) {
        browserId = 'browser_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15);
        localStorage.setItem('chatbot_browser_id', browserId);
    }
    return browserId;
    };

    const currentBrowserId = getBrowserId();
    console.log("Browser ID:", currentBrowserId);

    const chatbotHTML = `
    <button id="chatbot-toggler">
        <span class="material-symbols-rounded">mode_comment</span>
        <span class="material-symbols-rounded">close</span>
    </button>
    <div class="chatbot-popup">
        <div class="chat-interface" id="chat-interface">
        <div class="chat-header">
            <div class="header-info">
            <img class="chatbot-logo" src="https://khadargroups.com/storage/users/whatsapp-image-2024-07-26-at-53505-pm.jpeg" alt="Chatbot Logo" width="50" height="50">
            <h2 class="logo-text">Khadar    Groups</h2>
            </div>
            <div> 
            <button id="resetChatHistory" class="material-symbols-rounded">delete</button>
            <button id="close-chatbot" class="material-symbols-rounded">keyboard_arrow_down</button>
            </div>
        </div>
        <div class="chat-body" id="chat-body"></div>
        <div class="chat-footer">
            <form action="#" class="chat-form" id="chat-form">
            <textarea placeholder="Message..." class="message-input" id="message-input" required></textarea>
            <div class="chat-controls">
                
                <div class="file-upload-wrapper" hidden>
                <input type="file" accept="image/*,application/pdf" id="file-input" hidden />
                <button type="button" id="file-upload" class="material-symbols-rounded">attach_file</button>
                <button type="button" id="file-cancel" class="material-symbols-rounded">close</button>
                </div>
                <button type="submit" id="send-message" class="material-symbols-rounded">arrow_upward</button>
            </div>
            </form>
        </div>
        </div>
    </div>
    `;

    const style = document.createElement('style');
    style.innerHTML = `@import url('https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,100..900&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; font-family: "Inter", sans-serif; }
    body { width: 100%; min-height: 100vh; }
    
    .quick-replies { display: flex; flex-direction: column; gap: 5px; flex-wrap: wrap; width: 280px; margin-left: 38px; }
    .quick-reply { border: 1px solid #ee5d27; color: #ee5d27; padding: 8px 10px; border-radius: 20px; cursor: pointer; font-size: 13px; transition: background-color 0.3s; }
    .quick-reply:hover { background-color: rgb(236, 245, 255); }
    
    .user-info-form { padding: 10px; background: #fff; border-radius: 10px; max-width: 100%; }
    .form-header { text-align: center; margin-bottom: 10px; }
    .form-header h2 { color: #ee5d27; font-size: 1.2rem; }
    .form-header p { color: #666; font-size: 0.8rem; }
    .info-form { display: flex; flex-direction: column; gap: 10px; }
    .form-field { display: flex; flex-direction: column; }
    .form-field label { font-size: 0.8rem; color: #333; margin-bottom: 3px; }
    .form-field input { padding: 8px; border: 1px solid #ccc; border-radius: 5px; font-size: 0.9rem; outline: none; }
    .form-field input:focus { border-color: #ee5d27; }
    .submit-btn { background: #ee5d27; color: #fff; border: none; padding: 8px; border-radius: 5px; cursor: pointer; font-size: 0.9rem; transition: background 0.2s ease; }
    .submit-btn:hover { background: #d54b1f; }
    
    .message-time { font-size: 12px; color: gray; margin-top: 5px; text-align: left; }
    #chatbot-toggler { position: fixed; bottom: 10px; right: 35px; border: none; height: 60px; width: 60px; display: flex; cursor: pointer; align-items: center; justify-content: center; border-radius: 50%; background: #ee5d27; box-shadow: 0 0 20px rgba(0, 0, 0, 0.1); transition: all 0.2s ease; z-index: 10000; }
    
    @media (max-width: 768px) { #chatbot-toggler { bottom: 100px; right: 40px; height: 50px; width: 50px; } }
    @media only screen and (max-width: 480px) { #chatbot-toggler { bottom: 120px !important; right: 10px !important; height: 50px !important; width: 50px !important; } }
    #chatbot-toggler.page-specific { bottom: 160px !important; }
    
    .message-box { max-width: 100%; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; }
    .bot-link { color: blue; text-decoration: underline; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; }
    .dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: #949494; margin: 0 2px; animation: bounce 1.4s infinite ease-in-out; }
    .dot:nth-child(2) { animation-delay: 0.2s; }
    .dot:nth-child(3) { animation-delay: 0.4s; }
    
    .bot-avatar-wrapper { position: absolute; top: 0; left: 0; display: inline-block; }
    .avatar-wrapper { position: absolute; top: 0; right: 0; display: inline-block; }
    .bot-avatar { width: 50px; height: 50px; border-radius: 50%; }
    .online-indicator { position: absolute; bottom: 0; right: 0; width: 10px; height: 10px; background-color: green; border-radius: 50%; border: 2px solid white; }
    
    @keyframes bounce { 0%, 80%, 100% { transform: translateY(0); } 40% { transform: translateY(-10px); } }
    .message { position: relative; padding-left: 40px; }
    body.show-chatbot #chatbot-toggler { transform: rotate(90deg); }
    #chatbot-toggler span { color: #fff; position: absolute; }
    #chatbot-toggler span:last-child, body.show-chatbot #chatbot-toggler span:first-child { opacity: 0; }
    body.show-chatbot #chatbot-toggler span:last-child { opacity: 1; }
    
   .chatbot-popup {
  position: fixed;
  right: 35px;
  bottom: 10px;
  width: 380px; /* Initial width */
  height: 95vh;
  overflow: hidden;
  background: #ececec;
  border-radius: 15px;
  opacity: 0;
  pointer-events: none;
  transform: scale(0.2);
  transform-origin: bottom right;
  box-shadow: 0 0 128px 0 rgba(0, 0, 0, 0.1), 0 32px 64px -48px rgba(0, 0, 0, 0.5);
  transition: all 0.3s ease; /* Smooth transition for all properties */
  z-index: 2220000;
}

.chatbot-popup.expanded {
  width: 600px; /* Expanded width when the class is applied */
}

.chat-expand-button {
  padding: 8px 12px;
  background: #4a90e2;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin: 10px;
}
  @media screen and (max-width: 768px) {
  .chat-container {
    width: 100%;
    height: 100vh;
    border-radius: 0;
    margin: 0;
  }

  .chat-body {
    height: calc(100vh - 130px);
  }

  .message {
    max-width: 85%;
    margin: 8px;
  }

  .quick-replies {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 8px;
  }

  .quick-reply {
    font-size: 14px;
    padding: 6px 12px;
    white-space: nowrap;
  }

  .user-info-form {
    width: 90%;
    padding: 15px;
  }

  .chat-form {
    padding: 10px;
  }

  .message-input {
    font-size: 14px;
  }

  .bot-avatar-wrapper img,
  .patient-avatar {
    width: 40px;
    height: 40px;
  }

  .file-upload-wrapper {
    max-width: 200px;
  }
}

@media screen and (max-width: 480px) {
  .message {
    max-width: 90%;
    font-size: 14px;
  }

  .quick-reply {
    font-size: 12px;
    padding: 5px 10px;
  }

  .chat-header {
    padding: 10px;
  }

  .chat-header h2 {
    font-size: 16px;
  }

  .bot-avatar-wrapper img,
  .patient-avatar {
    width: 35px;
    height: 35px;
  }

  .upload-buttons-container {
    flex-direction: column;
    gap: 5px;
  }

  .upload-btn,
  .skip-btn {
    width: 100%;
  }
}
    body.show-chatbot .chatbot-popup { opacity: 1; pointer-events: auto; transform: scale(1); }
    
    .chat-interface { display: flex; flex-direction: column; height: 100%; }
    
    .chat-header { display: flex; align-items: center; padding: 5px 15px; background: #ee5d27; justify-content: space-between; }
    .chat-header .header-info { display: flex; gap: 10px; align-items: center; }
    .header-info .chatbot-logo { width: 30px; height: 30px; padding: 6px; fill: #ee5d27; flex-shrink: 0; background: #fff; border-radius: 50%; }
    .header-info .logo-text { color: #fff; font-weight: 600; font-size: 1.20rem;margin:15px; margin-left:25px; letter-spacing: 0.02rem; }
    .chat-header #close-chatbot, .chat-header #resetChatHistory { border: none; color: #fff; height: 40px; width: 40px; font-size: 1.9rem; margin-right: -10px; padding-top: 2px; cursor: pointer; border-radius: 50%; background: none; transition: 0.2s ease; }
    .chat-header #close-chatbot:hover { background: #005f63; }
    
    .chat-body { 
    padding: 15px 22px; 
    gap: 10px; 
    display: flex; 
    height: 460px; 
    overflow-y: auto; 
    margin-bottom: 78px; 
    flex-direction: column; 
    
    scrollbar-color: rgb(235, 230, 230) transparent;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior: contain;
    }
    @media (max-width: 600px) {
    .chat-body {
        margin-bottom: 34px;
    }
    }
    .chat-body, .chat-form .message-input:hover { scrollbar-color: rgb(200, 202, 202) transparent; }
    
    .chat-body .message { display: flex; gap: 2px; align-items: center; }
    .chat-body .message .bot-avatar { width: 30px; height: 30px; fill: #fff; flex-shrink: 0; margin-bottom: 2px; align-self: flex-end; border-radius: 50%; }
    .chat-body .message .message-text { padding: 12px 14px; max-width: 95%; font-size: 0.85rem; }
    .chat-body .bot-message.thinking .message-text { padding: 2px 6px; }
    .chat-body .bot-message .message-text { background: #fffdfd; border-radius: 13px 13px 13px 3px; margin-bottom: 5px; }
    .chat-body .user-message { flex-direction: column; align-items: flex-end; }
    .chat-body .user-message .message-text { color: #fff; background: #ee5d27; border-radius: 13px 13px 3px 13px; }
    
    .message-text {
    font-size: 0.85rem;
    line-height: 1.4;
    max-width: 90%;
    padding: 8px 12px;
    margin-bottom: 5px;
    border-radius: 13px 13px 3px 13px;
    color: black;
    background: rgb(248, 245, 244);
    transition: all 0.2s ease;
    }
    
    .message-text:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    
    .chat-body .user-message .attachment { width: 50%; margin-top: -7px; border-radius: 13px 3px 13px 13px; }
    .chat-body .bot-message .thinking-indicator { display: flex; gap: 4px; padding-block: 15px; }
    .chat-body .bot-message .thinking-indicator .dot { height: 7px; width: 7px; opacity: 0.7; border-radius: 50%; background: #ee5d27; animation: dotPulse 1.8s ease-in-out infinite; }
    .chat-body .bot-message .thinking-indicator .dot:nth-child(1) { animation-delay: 0.2s; }
    .chat-body .bot-message .thinking-indicator .dot:nth-child(2) { animation-delay: 0.3s; }
    .chat-body .bot-message .thinking-indicator .dot:nth-child(3) { animation-delay: 0.4s; }
    @keyframes dotPulse { 0%, 44% { transform: translateY(0); } 28% { opacity: 0.4; transform: translateY(-4px); } 44% { opacity: 0.2; } }
    
    .chat-footer { 
    position: absolute; 
    bottom: 0; 
    width: 100%; 
    background: #ececec; 
    padding: 5px 6px 19px; 
    }
    
    .chat-footer .chat-form { display: flex; align-items: center; position: relative; background: #fff; border-radius: 32px; outline: 1px solid #CCCCE5; box-shadow: 0 0 8px rgba(0, 0, 0, 0.06); transition: 0s ease, border-radius 0s; }
    .chat-form:focus-within { outline: 2px solid #ee5d27; }
    .chat-form .message-input { width: 100%; height: 47px; outline: none; resize: none; border: none; max-height: 180px; scrollbar-width: thin; border-radius: inherit; font-size: 0.95rem; padding: 14px 0 12px 18px; scrollbar-color: transparent transparent; }
    .chat-form .chat-controls { gap: 3px; height: 47px; display: flex; padding-right: 6px; align-items: center; align-self: flex-end; }
    .chat-form .chat-controls button { height: 35px; width: 35px; border: none; cursor: pointer; color: #ee5d27; border-radius: 50%; font-size: 1.15rem; background: none; transition: 0.2s ease; }
    .chat-form .chat-controls button:hover, body.show-emoji-picker .chat-controls #emoji-picker { color: #ee5d27; background: #f1f1ff; }
    .chat-form .chat-controls #send-message { color: #fff;  background: #ee5d27; }
    .chat-form .chat-controls #send-message:hover { background: #ee5d27; }
    .chat-form .message-input:valid~.chat-controls #send-message { display: block; }
    .chat-form .file-upload-wrapper { position: relative; height: 35px; width: 35px; }
    .chat-form .file-upload-wrapper :where(button, img) { position: absolute; }
    
    .chat-form .file-upload-wrapper #file-cancel { color: #ff0000; background: #fff; }
    .chat-form .file-upload-wrapper :where(img, #file-cancel), .chat-form .file-upload-wrapper.file-uploaded #file-upload { display: none; }
    .chat-form .file-upload-wrapper.file-uploaded img, .chat-form .file-upload-wrapper.file-uploaded:hover #file-cancel { display: block; }
    
    em-emoji-picker { position: absolute; left: 50%; top: -337px; width: 100%; max-width: 350px; visibility: hidden; max-height: 330px; transform: translateX(-50%); }
    body.show-emoji-picker em-emoji-picker { visibility: visible; }
    
    .file-icon { display: flex; align-items: center; gap: 5px; margin-top: 5px; color: #666; }
    .file-icon img { vertical-align: middle; }
    .file-icon span { font-size: 0.9em; }
    .welcome-file-upload { margin-bottom: 5px; }
    .welcome-file-upload button { width: 100%; text-align: center; }
    
    .message-content {
    padding: 20px;
    background-color: #ffffff;
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
    max-width: 300px;
    margin: 0 auto;
    }
    
    .welcome-heading {
    color: #1e40af;
    font-size: 18px;
    margin: 0 0 12px 0;
    font-weight: 600;
    }
    
    .welcome-text {
    color: #475569;
    font-size: 14px;
    line-height: 1.5;
    margin: 0 0 0;
    }
    
    .welcome-options {
    display: flex;
    flex-direction: column;
    gap: 15px;
    }
    
    .file-upload-wrapper {
    width: 100%;
    }
    
    .primary-button {
    background-color: #0ea5e9;
    color: white;
    padding: 11px 16px;
    border-radius: 8px;
    border: none;
    font-weight: 500;
    width: 86%;
    cursor: pointer;
    transition: background-color 0.2s ease;
    margin-left: 36px;
    margin-top: 20px;
    }
    
    .primary-button:hover {
    background-color: #0284c7;
    }
    
    .quick-replies {
    display: flex;
    flex-direction: row;
    gap: 8px;
    }
    
    .secondary-button {
    background-color: #e0f2fe;
    color: #0284c7;
    padding: 12px 16px;
    border-radius: 8px;
    border: none;
    font-weight: 500;
    width: 80%;
    cursor: pointer;
    transition: background-color 0.2s ease;
    }
    
    .secondary-button:hover {
    background-color: #bae6fd;
    }
    
    /* Responsive adjustments */
    @media (min-width: 480px) {
    .quick-replies {
    flex-direction: row;
    gap: 10px;
    }
    
    .message-text {
    max-width: 95%;
    font-size: 0.8rem;
    }
    }
    
    /* Mobile-specific styles */
    @media (max-width: 520px) {
    #chatbot-toggler { right: 20px; bottom: 20px; }
    
    .chatbot-popup { 
    right: 0; 
    bottom: 10; 
    height: 90%; 
    width: 100%; 
    border-radius: 0; 
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    }
    
    .chat-interface {
    flex: 1;
    overflow-y: auto;
    }
    
    .chat-header { padding: 12px 15px; }
    
    .chat-body { 
    height: calc(70vh - 120px);
    padding: 15px;
    position: relative;
    -webkit-overflow-scrolling: touch;
    touch-action: pan-y;
    -ms-touch-action: pan-y;
    -webkit-user-select: text;
    user-select: text;
    }
    
    .chat-footer {
    position: relative;
    padding: 10px 15px 15px;
    }
    
    .chat-form .file-upload-wrapper.file-uploaded #file-cancel { opacity: 0; }
    
    body.show-chatbot {
    overflow: hidden;
    height: 100vh;
    }
    } 
    .message-container {
                display: flex;
                
                align-items: center;
                margin-bottom: 15px;
                font-family: Arial, sans-serif;
            }
            
            .patient-avatar {
                width: 35px;
                height: 35px;
                border-radius: 50%;
                margin-right: 10px;
                margin-left :3px;
            }
            
            .message-text {
                background-color: #f0f0f0;
                padding: 10px 15px;
                border-radius: 18px;
                max-width: 80%;
            }
    
    `;
    document.head.appendChild(style);

    const chatbotContainer = document.createElement('div');
    chatbotContainer.innerHTML = chatbotHTML;
    document.body.appendChild(chatbotContainer);

    const storedToken = localStorage.getItem("chatbotToken");
    if (!storedToken || storedToken !== "199908") {
    console.warn("Unauthorized access! Token is missing or invalid.");
    } else {
    console.log("Token validated. Chatbot is active.");

    const chatBody = document.querySelector(".chat-body");
    const messageInput = document.querySelector(".message-input");
    const sendMessage = document.querySelector("#send-message");
    const fileInput = document.querySelector("#file-input");
    const fileUploadWrapper = document.querySelector(".file-upload-wrapper");
    const fileCancelButton = fileUploadWrapper.querySelector("#file-cancel");
    const chatbotToggler = document.querySelector("#chatbot-toggler");
    const closeChatbot = document.querySelector("#close-chatbot");

    const userData = {
        message: null,
        file: null,
    };

    const createMessageElement = (content, ...classes) => {
        const div = document.createElement("div");
        div.classList.add("message", ...classes);
        div.innerHTML = content;
        return div;
    };

    const storeChatMessage = async (message, sender, file = null) => {
        try {
        const chatRef = collection(db, "chats");
        await addDoc(chatRef, {
            message: message,
            sender: sender,
            timestamp: new Date(),
            browserId: currentBrowserId,
        });
        } catch (error) {
        console.error("Error storing chat message:", error);
        }
    };

    const createUserInfoFormMessage = () => {
        // Hide the message input
        const messageInput = document.querySelector(".message-input");
        if (messageInput) {
            messageInput.style.display = "none";
        }
        
        return `
        <div class="bot-avatar-wrapper">
            <img class="bot-avatar" src="https://cdn-icons-png.flaticon.com/512/3774/3774299.png" alt="Chatbot Logo" width="50" height="50">
            <span class="online-indicator"></span>
        </div>
        <div class="message-text">
            <div class="user-info-form" id="user-info-form">
            <div class="form-header">
                <h2>Welcome to KhadarGroups</h2>
                <p>Please provide your details to start chatting</p>
            </div>
            <form id="user-info-submit" class="info-form">
                <div class="form-field">
                <input type="text" id="user-name" placeholder="Enter your name"  />
                </div>
                <div class="form-field">
                <input type="tel" id="user-phone" placeholder="Enter your phone number" pattern="[0-9]{10}" required />
                </div>
                <div class="form-field">
                <input type="number" id="user-age" placeholder="Enter your age" min="1" max="120" required />
                </div>
                <button type="submit" class="submit-btn">Start Chat</button>
            </form>
            </div>
        </div>
        `;
    };
    
    const getUserName = async () => {
        try {
        const userRef = collection(db, "users");
        const q = query(userRef, where("browserId", "==", currentBrowserId));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            const name = userDoc.data().name || "User";
            console.log("Fetched username:", name);
            return name;
        }
        console.log("No user found, defaulting to 'User'");
        return "User";
        } catch (error) {
        console.error("Error fetching user name:", error);
        return "User";
        }
    };
    const updateSendButtonVisibility = () => {
        const hasMessage = messageInput.value.trim() !== "";
        const hasFile = userData.file !== null;
       
      };
    const showWelcomeMessage = async (chatBody) => {
        const userName = await getUserName();
        const welcomeMessage = `
        <div class="bot-avatar-wrapper">
            <img class="bot-avatar" src="https://cdn-icons-png.flaticon.com/512/3774/3774299.png" alt="Chatbot Logo" width="50" height="50">
            <span class="online-indicator"></span>
        </div>
        <div class="message-text">Welcome ${userName}, What health issue are you facing?</div>`;
        const welcomeMessageDiv = createMessageElement(welcomeMessage, "bot-message");
        chatBody.appendChild(welcomeMessageDiv);

        const quickMessage = `
        <div class="quick-replies">
            <button class="quick-reply" onclick="sendQuickReply('Dialysis')">Dialysis</button>
            <button class="quick-reply" onclick="sendQuickReply('Diabetes')">Diabetes</button>
            <button class="quick-reply" onclick="sendQuickReply('Thyroid')">Thyroid</button>
            <button class="quick-reply" onclick="sendQuickReply('B.P')">B.P</button>
            <button class="quick-reply" onclick="sendQuickReply('Obesity / Weight loss')">Obesity / Weight loss</button>
            <button class="quick-reply" onclick="sendQuickReply('Weight gain')">Weight gain</button>
            <button class="quick-reply" onclick="sendQuickReply('Asthma')">Asthma</button>
            <button class="quick-reply" onclick="sendQuickReply('Paralysis')">Paralysis</button>
            <button class="quick-reply" onclick="sendQuickReply('Acidity')">Acidity</button>
            <button class="quick-reply" onclick="sendQuickReply('Urine infection')">Urine infection</button>
            <button class="quick-reply" onclick="sendQuickReply('HIV')">HIV</button>
            <button class="quick-reply" onclick="sendQuickReply('Physically disabled')">Physically disabled</button>
            <button class="quick-reply" onclick="sendQuickReply('After delivery')">After delivery</button>
            <button class="quick-reply" onclick="sendQuickReply('other')">other</button>
        </div>`;
        const quickMessageDiv = document.createElement("div");
        quickMessageDiv.classList.add("bot-message");
        quickMessageDiv.innerHTML = quickMessage;
        chatBody.appendChild(quickMessageDiv);

        chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
        localStorage.setItem('welcomeShown', 'true'); // Set flag after showing welcome
    };

    // Modify your form submission handler in the loadChatHistory function
   const loadChatHistory = async () => {
    try {
        console.log("Loading chat history with browserId:", currentBrowserId);
        const userId = localStorage.getItem('userId');
        const chatRef = collection(db, "chats");
        let q;
        if (userId) {
            console.log("Querying with userId:", userId);
            q = query(chatRef, where("userId", "==", userId), orderBy("timestamp", "asc"));
        } else {
            console.log("Querying with browserId:", currentBrowserId);
            q = query(chatRef, where("browserId", "==", currentBrowserId), orderBy("timestamp", "asc"));
        }
        const querySnapshot = await getDocs(q);
        console.log(`Found ${querySnapshot.size} messages in history`);
        
        const chatBody = document.querySelector(".chat-body");
        if (!chatBody) {
            console.error("Chat body element not found in DOM");
            return;
        }
    
        chatBody.innerHTML = "";
        const welcomeShown = localStorage.getItem('welcomeShown');
        console.log("Welcome shown status:", welcomeShown);
        
        const userInfoSubmitted = await checkUserInfoSubmitted();
        console.log("User info submitted status:", userInfoSubmitted);
    
        const messageInput = document.querySelector(".message-input");
    
        if (!welcomeShown) {
            if (!userInfoSubmitted) {
                console.log("Showing user info form");
                const welcomeMessageDiv = createMessageElement(createUserInfoFormMessage(), "bot-message");
                chatBody.appendChild(welcomeMessageDiv);
                chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
                
                if (messageInput) messageInput.style.display = "none";
                
                setTimeout(() => {
                    const form = document.getElementById("user-info-submit");
                    if (form) {
                        console.log("Adding form submit listener");
                        const newForm = form.cloneNode(true);
                        form.parentNode.replaceChild(newForm, form);
                        
                        newForm.addEventListener("submit", async (e) => {
                            e.preventDefault();
                            console.log("Form submitted");
                            const name = document.getElementById("user-name").value.trim();
                            const phone = document.getElementById("user-phone").value.trim();
                            const age = document.getElementById("user-age").value.trim();
                            
                            if (name && phone && age) {
                                console.log("Storing user info:", name, phone, age);
                                const { userId, isNewUser } = await storeUserInfo(name, phone, age);
                                
                                chatBody.innerHTML = "";
                                if (isNewUser) {
                                    console.log("New user: showing welcome message");
                                    await showWelcomeMessage(chatBody);
                                    localStorage.setItem('welcomeShown', 'true');
                                } else {
                                    console.log("Existing user: loading chat history");
                                    await loadChatHistory(); // Reload with userId
                                }
                                
                                if (messageInput) messageInput.style.display = "block";
                                document.body.classList.add("show-chatbot");
                                document.getElementById("chat-interface").style.display = "block";
                                localStorage.setItem('chatbotOpen', 'true');
                            }
                        });
                    } else {
                        console.error("User info form not found in DOM");
                    }
                }, 100);
            } else {
                console.log("Showing welcome message");
                await showWelcomeMessage(chatBody);
                if (messageInput) messageInput.style.display = "block";
                document.body.classList.add("show-chatbot");
                document.getElementById("chat-interface").style.display = "block";
                localStorage.setItem('chatbotOpen', 'true');
                localStorage.setItem('welcomeShown', 'true');
            }
        } else {
            console.log("Loading chat history messages");
            if (querySnapshot.size === 0 && !userId) {
                console.log("No messages found, showing welcome message instead");
                localStorage.removeItem('welcomeShown');
                await showWelcomeMessage(chatBody);
            } else {
                let needsUploadButtons = false;
                
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    if (data.sender === "user") {
                        const messageContent = `<div class="message-text">${data.message}</div>`;
                        chatBody.appendChild(createMessageElement(messageContent, "user-message"));
                    } else {
                        if (data.message.includes('upload-buttons-container')) {
                            needsUploadButtons = true;
                        }
                        const messageContent = `
                            <div class="bot-avatar-wrapper">
                            <img class="bot-avatar" src="https://cdn-icons-png.flaticon.com/512/3774/3774299.png" alt="Chatbot Logo" width="50" height="50">
                            <span class="online-indicator"></span>
                            </div>
                            <div class="message-text">${data.message}</div>`;
                        chatBody.appendChild(createMessageElement(messageContent, "bot-message"));
                    }
                });
                chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
                
                if (needsUploadButtons) {
                    setTimeout(() => {
                        const uploadBtn = document.getElementById('uploadFileBtn');
                        const skipBtn = document.getElementById('skipUploadBtn');
                        const browserIdString = String(currentBrowserId);
                        const pendingUploadKey = `pending_upload_${browserIdString}`;
                        localStorage.setItem(pendingUploadKey, 'true');
                        
                        if (uploadBtn) {
                            uploadBtn.addEventListener('click', () => {
                                const fileInput = document.createElement('input');
                                fileInput.type = 'file';
                                fileInput.style.display = 'none';
                                document.body.appendChild(fileInput);
                                
                                fileInput.addEventListener('change', (e) => {
                                    if (e.target.files.length > 0) {
                                        const selectedFile = e.target.files[0];
                                        sendMessage('this is the report', selectedFile);
                                        document.body.removeChild(fileInput);
                                        localStorage.removeItem(pendingUploadKey);
                                    }
                                });
                                fileInput.click();
                            });
                        }
                        
                        if (skipBtn) {
                            skipBtn.addEventListener('click', () => {
                                sendMessage('skip ');
                                localStorage.removeItem(pendingUploadKey);
                            });
                        }
                    }, 300);
                }
            }
        }
    } catch (error) {
        console.error("Error loading chat history:", error);
        const chatBody = document.querySelector(".chat-body");
        if (chatBody) {
            chatBody.innerHTML = "";
            showWelcomeMessage(chatBody);
        }
    }
};
// Update the storeUserInfo function to ensure we capture the user info correctly
const storeUserInfo = async (name, phone, age) => {
try {
const userRef = collection(db, "users");
const docRef = await addDoc(userRef, {
    name: name,
    phone: phone,
    age: age,
    browserId: currentBrowserId,
    timestamp: new Date(),
});
console.log("User info stored successfully with ID:", docRef.id);

// Make sure the browserId is properly saved after user registration
localStorage.setItem('browserId', currentBrowserId);

return docRef.id;
} catch (error) {
console.error("Error storing user info:", error);
throw error;
}
};

// Also add this code to the top of your script to ensure page load initialization
document.addEventListener("DOMContentLoaded", () => {
console.log("DOM loaded, initializing chat...");

// Make sure currentBrowserId is set
if (!window.currentBrowserId) {
window.currentBrowserId = localStorage.getItem('browserId');
if (!window.currentBrowserId) {
    window.currentBrowserId = Date.now().toString() + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('browserId', window.currentBrowserId);
}
console.log("Browser ID initialized:", window.currentBrowserId);
}

// Initialize the chat
loadChatHistory();
});

    const checkUserInfoSubmitted = async () => {
        const userRef = collection(db, "users");
        const q = query(userRef, where("browserId", "==", currentBrowserId));
        const querySnapshot = await getDocs(q);
        return !querySnapshot.empty;
    };

    window.sendQuickReply = function (message) {
        messageInput.value = message;
        document.querySelector('#send-message').click();
    };
    
// Add this new function to handle sending messages from buttons
// Add this function to check for pending uploads on page load
const checkForPendingUploads = async () => {
    try {
    const browserIdString = String(currentBrowserId);
    const pendingUploadKey = `pending_upload_${browserIdString}`;
    const isPendingUpload = localStorage.getItem(pendingUploadKey);
    
    if (isPendingUpload === 'true') {
        // There was a pending upload before refresh
        setTimeout(() => {
        // Add a message indicating upload is needed
        const botMessage = "I was waiting for a file upload. Please upload your file or click 'Skip' if you don't want to upload anything.";
        
        const botMessageContent = `
            <div class="bot-avatar-wrapper">
            <img class="bot-avatar" src="https://cdn-icons-png.flaticon.com/512/3774/3774299.png" alt="Chatbot Logo" width="50" height="50">
            <span class="online-indicator"></span>
            </div>
            <div class="message-text">${botMessage}
            <div class="upload-buttons-container" style="margin-top: 15px; display: flex; gap: 10px;">
                <button id="uploadFileBtn" class="upload-btn" style="padding: 8px 16px; background-color: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;">Upload File</button>
                <button id="skipUploadBtn" class="skip-btn" style="padding: 8px 16px; background-color: #f1f1f1; color: #333; border: none; border-radius: 4px; cursor: pointer;">Skip</button>
            </div>
            </div>`;
        
        const incomingMessageDiv = createMessageElement(botMessageContent, "bot-message");
        chatBody.appendChild(incomingMessageDiv);
        chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
        
        // Add event listeners
        const uploadBtn = document.getElementById('uploadFileBtn');
        const skipBtn = document.getElementById('skipUploadBtn');
        
        if (uploadBtn) {
            uploadBtn.addEventListener('click', () => {
            // Create and trigger file input
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.style.display = 'none';
            document.body.appendChild(fileInput);
            
            fileInput.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                // Handle the file upload with the message "this is the report"
                const selectedFile = e.target.files[0];
                // Call sendMessage function with the file and specific message
                sendMessage1('this is the report', selectedFile);
                document.body.removeChild(fileInput);
                // Clear the pending upload flag
                localStorage.removeItem(pendingUploadKey);
                }
            });
            
            fileInput.click();
            });
        }
        
        if (skipBtn) {
            skipBtn.addEventListener('click', () => {
            // Send a skip message
            sendMessage1('skip ');
            // Clear the pending upload flag
            localStorage.removeItem(pendingUploadKey);
            });
        }
        }, 500);
    }
    } catch (error) {
    console.error("Error checking for pending uploads:", error);
    }
};

// Add this new function to handle sending messages from buttons
const sendMessage1 = (message, file = null) => {
    // Set the message and file in userData
    userData.message = message;
    userData.file = file;
    
    // Create a synthetic event to pass to handleOutgoingMessage
    const syntheticEvent = { preventDefault: () => {} };
    
    // Call the existing message handler
    handleOutgoingMessage(syntheticEvent);
};

const handleOutgoingMessage = async (e) => {
    e.preventDefault();
    const hasFile = userData.file !== null;
    // Only update userData.message from the input if we're not using the sendMessage function
    // If sendMessage was called, userData.message is already set
    if (!userData.message) {
    userData.message = messageInput.value.trim();
    messageInput.value = "";
    messageInput.dispatchEvent(new Event("input"));
    }
    
    fileUploadWrapper.classList.remove("file-uploaded");

    let messageContent = `
<div class="message-container">
            
            <div class="message-text">${userData.message || "[Empty message]"}</div>
            <div class="-avatar-wrapper">
            <img class="patient-avatar" src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" alt="Patient Avatar">
    
    </div>
            </div>`;
    if (userData.file) {
    messageContent += `<div class="file-icon">
        <img src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" alt="File Icon" width="20" height="20">
        <span>File attached</span>
    </div>`;
    }

    const outgoingMessageDiv = createMessageElement(messageContent, "user-message");
    chatBody.appendChild(outgoingMessageDiv);
    chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });

    await storeChatMessage(userData.message || "this is report", "user");

    // Store current message and file before clearing them
    const currentMessage = userData.message;
    const fileToSend = userData.file;
    
    // Clear userData message to prepare for next input
    userData.message = "";

    setTimeout(async () => {
    const thinkingContent = `
        <div class="bot-avatar-wrapper">
        <img class="bot-avatar" src="https://cdn-icons-png.flaticon.com/512/3774/3774299.png" alt="Chatbot Logo" width="50" height="50">
        <span class="online-indicator"></span>
        </div>
        <div class="message-text">
        <div class="thinking-indicator">
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
        </div>
        </div>`;
    const incomingMessageDiv = createMessageElement(thinkingContent, "bot-message", "thinking");
    chatBody.appendChild(incomingMessageDiv);
    chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });

    const botResponse = await generateBotResponse(incomingMessageDiv, currentMessage, fileToSend);

    let botMessageContent = `
        <div class="bot-avatar-wrapper">
        <img class="bot-avatar" src="https://cdn-icons-png.flaticon.com/512/3774/3774299.png" alt="Chatbot Logo" width="50" height="50">
        <span class="online-indicator"></span>
        </div>
        <div class="message-text">${botResponse}</div>`;
    if (fileToSend) {
        botMessageContent += `<div class="file-icon">
        <img src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" alt="File Icon" width="20" height="20">
        <span>Pdf</span>
        </div>`;
    }
    incomingMessageDiv.innerHTML = botMessageContent;
    incomingMessageDiv.classList.remove("thinking");

    await storeChatMessage(botResponse, "bot");
    userData.file = null;
    }, 100);
};

const generateBotResponse = async (incomingMessageDiv, query = null, file = null) => {
    const userMessage = query || "";
    try {
        const browserIdString = String(currentBrowserId);
        const cacheKey = `${userMessage}_${file ? file.name : "no-file"}_${browserIdString}`;
        const userName1 = await getUserName();
        const formData = new FormData();
        formData.append("query", userMessage);
        formData.append("session_id", browserIdString);
        formData.append("user_name", userName1)
        
        if (file) {
            formData.append("file", file, file.name);
        }

        const apiResponse = await fetch("https://khadargroups-ai-chatbot.vercel.app/chat", {
            method: "POST",
            body: formData,
        });

        const data = await apiResponse.json();
        console.log(data);
        let botResponseText = data.message || "Sorry, I don't understand that yet.";
        if (file && data.url) {
            botResponseText += ` File uploaded: ${data.url}`;
        }

        // Process image links and create product containers
    
        
        // Check if response expects a file upload
        if (data.show_upload_prompt === true) {
            const pendingUploadKey = `pending_upload_${browserIdString}`;
            localStorage.setItem(pendingUploadKey, 'true');
            
            // Add upload and skip buttons with proper event delegation
            botResponseText += `
            <div class="upload-buttons-container" style="margin-top: 15px; display: flex; gap: 10px;">
                <button class="upload-btn" style="padding: 8px 16px; background-color: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;">Upload File</button>
                <button class="skip-btn" style="padding: 8px 16px; background-color: #f1f1f1; color: #333; border: none; border-radius: 4px; cursor: pointer;">Skip</button>
            </div>`;
        }

        return botResponseText;
    } catch (error) {
        console.error("Error in generateBotResponse:", error);
        return `Sorry, there was an error: ${error.message}`;
    }
};

// Add event delegation for the skip button
document.addEventListener('click', function(e) {
    if (e.target && e.target.classList.contains('skip-btn')) {
        e.preventDefault();
        // Clear the pending upload flag
        const browserIdString = String(currentBrowserId);
        const pendingUploadKey = `pending_upload_${browserIdString}`;
        localStorage.removeItem(pendingUploadKey);
        
        // Send the skip message
        sendMessage1('skip');
    }
    
    if (e.target && e.target.classList.contains('upload-btn')) {
        e.preventDefault();
        // Create and trigger file input
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.style.display = 'none';
        document.body.appendChild(fileInput);
        
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                const selectedFile = e.target.files[0];
                sendMessage1('this is the report', selectedFile);
                document.body.removeChild(fileInput);
                
                // Clear the pending upload flag
                const browserIdString = String(currentBrowserId);
                const pendingUploadKey = `pending_upload_${browserIdString}`;
                localStorage.removeItem(pendingUploadKey);
            }
        });
        
        fileInput.click();
    }
});
// Call this function when the page loads
// Add to your initialization code
document.addEventListener('DOMContentLoaded', () => {
    // Your existing initialization code...
    
    // Check for pending uploads
    checkForPendingUploads();
});
const resetChatHistory = async () => {
    const chatBody = document.querySelector(".chat-body");
    if (!chatBody) return;

    const userConfirmed = confirm("Are you sure you want to reset the chat? This will delete all previous messages and show the welcome message again.");
    if (!userConfirmed) return;

    try {
        // Clear UI immediately
        chatBody.innerHTML = "";
        const browser = String(currentBrowserId);
        
        // Handle local clear first
        await deleteChatHistory();
        localStorage.removeItem('welcomeShown');
        
        // Try JSON approach first as it seems more reliable
        let response = await fetch("https://khadargroups-ai-chatbot.vercel.app/clear", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                session_id: browser
            })
        });

        // If JSON approach fails, try FormData as fallback
        if (!response.ok) {
            console.log("JSON approach failed, trying FormData...");
            
            let formData = new FormData();
            formData.append("session_id", browser);
            
            console.log("Sending FormData with session_id:", browser); // Debug log
            
            response = await fetch("https://khadargroups-ai-chatbot.vercel.app/clear", {
                method: "POST",
                body: formData
            });
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`API Error: ${response.status} - ${JSON.stringify(errorData)}`);
        }

        console.log("Chat reset successfully");
        // Reload chat history after successful reset
        loadChatHistory();
    } catch (error) {
        console.error("Reset failed:", error);
        alert(`Failed to reset chat: ${error.message}`);
        loadChatHistory(); // Restore previous messages
    }
};

    const deleteChatHistory = async () => {
        try {
        const chatRef = collection(db, "chats");
        const q = query(chatRef, where("browserId", "==", currentBrowserId));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach(async (doc) => {
            await deleteDoc(doc.ref);
        });
        console.log("Chat history deleted from Firestore successfully.");
        } catch (error) {
        console.error("Error deleting chat history from Firestore:", error);
        }
    };

    sendMessage.addEventListener("click", (e) => handleOutgoingMessage(e));
    messageInput.addEventListener("input", () => {
        const hasContent = messageInput.value.trim() !== "" || userData.file !== null;
        
      });
      
      fileInput.addEventListener("change", () => {
        const hasFile = fileInput.files.length > 0;
        sendMessage.style.display = hasFile ? "block" : "none";
      });
      
      fileCancelButton.addEventListener("click", () => {
        sendMessage.style.display = messageInput.value.trim() !== "" ? "block" : "none";
      });
      messageInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          if (messageInput.value.trim() !== ""|| userData.file !== null) {
            handleOutgoingMessage(e);
          }
        }
      });
    document.querySelector("#file-upload").addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", () => {
        const file = fileInput.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
        fileInput.value = "";
        let imgElement = fileUploadWrapper.querySelector("img");
        if (!imgElement) {
            imgElement = document.createElement("img");
            fileUploadWrapper.appendChild(imgElement);
        }
        imgElement.src = e.target.result;
        fileUploadWrapper.classList.add("file-uploaded");
        };
        reader.readAsDataURL(file);
        userData.file = file;
    });
    fileCancelButton.addEventListener("click", () => {
        userData.file = null;
        fileUploadWrapper.classList.remove("file-uploaded");
    });
    closeChatbot.addEventListener("click", () => document.body.classList.remove("show-chatbot"));
    chatbotToggler.addEventListener("click", async () => {
        document.body.classList.toggle("show-chatbot");
        if (document.body.classList.contains("show-chatbot")) {
        document.getElementById("chat-interface").style.display = "block";
        loadChatHistory();
        }
    });
    document.getElementById("resetChatHistory").addEventListener("click", resetChatHistory);

    const picker = new EmojiMart.Picker({
        theme: "light",
        skinTonePosition: "none",
        previewPosition: "none",
        onEmojiSelect: (emoji) => {
        const { selectionStart: start, selectionEnd: end } = messageInput;
        messageInput.setRangeText(emoji.native, start, end, "end");
        messageInput.focus();
        },
        onClickOutside: (e) => {
        if (e.target.id === "emoji-picker") {
            document.body.classList.toggle("show-emoji-picker");
        } else {
            document.body.classList.remove("show-emoji-picker");
        }
        },
    });
    document.querySelector(".chat-form").appendChild(picker);
    }
});
})();