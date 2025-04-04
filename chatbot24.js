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
              <img class="chatbot-logo" src="https://cdn-icons-png.flaticon.com/512/3774/3774299.png" alt="Chatbot Logo" width="50" height="50">
              <h2 class="logo-text">KhadarGroups</h2>
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
                <button type="button" id="emoji-picker" class="material-symbols-outlined">sentiment_satisfied</button>
                <div class="file-upload-wrapper">
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
    style.innerHTML = `
      @import url('https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,100..900&display=swap');
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
      .bot-avatar { width: 50px; height: 50px; border-radius: 50%; }
      .online-indicator { position: absolute; bottom: 0; right: 0; width: 10px; height: 10px; background-color: green; border-radius: 50%; border: 2px solid white; }
      @keyframes bounce { 0%, 80%, 100% { transform: translateY(0); } 40% { transform: translateY(-10px); } }
      .message { position: relative; padding-left: 60px; }
      body.show-chatbot #chatbot-toggler { transform: rotate(90deg); }
      #chatbot-toggler span { color: #fff; position: absolute; }
      #chatbot-toggler span:last-child, body.show-chatbot #chatbot-toggler span:first-child { opacity: 0; }
      body.show-chatbot #chatbot-toggler span:last-child { opacity: 1; }
      .chatbot-popup { position: fixed; right: 35px; bottom: 80px; width: 420px; overflow: hidden; background: #ececec; border-radius: 15px; opacity: 0; pointer-events: none; transform: scale(0.2); transform-origin: bottom right; box-shadow: 0 0 128px 0 rgba(0, 0, 0, 0.1), 0 32px 64px -48px rgba(0, 0, 0, 0.5); transition: all 0.1s ease; z-index: 20000; }
      body.show-chatbot .chatbot-popup { opacity: 1; pointer-events: auto; transform: scale(1); }
      .chat-header { display: flex; align-items: center; padding: 5px 15px; background: #ee5d27; justify-content: space-between; }
      .chat-header .header-info { display: flex; gap: 10px; align-items: center; }
      .header-info .chatbot-logo { width: 30px; height: 30px; padding: 6px; fill: #ee5d27; flex-shrink: 0; background: #fff; border-radius: 50%; }
      .header-info .logo-text { color: #fff; font-weight: 600; font-size: 1.20rem; letter-spacing: 0.02rem; }
      .chat-header #close-chatbot, .chat-header #resetChatHistory { border: none; color: #fff; height: 40px; width: 40px; font-size: 1.9rem; margin-right: -10px; padding-top: 2px; cursor: pointer; border-radius: 50%; background: none; transition: 0.2s ease; }
      .chat-header #close-chatbot:hover { background: #005f63; }
      .chat-body { padding: 15px 22px; gap: 10px; display: flex; height: 360px; overflow-y: auto; margin-bottom: 78px; flex-direction: column; scrollbar-width: thin; scrollbar-color: rgb(235, 230, 230) transparent; }
      .chat-body, .chat-form .message-input:hover { scrollbar-color: rgb(200, 202, 202) transparent; }
      .chat-body .message { display: flex; gap: 2px; align-items: center; }
      .chat-body .message .bot-avatar { width: 35px; height: 35px; fill: #fff; flex-shrink: 0; margin-bottom: 2px; align-self: flex-end; border-radius: 50%; }
      .chat-body .message .message-text { padding: 12px 14px; max-width: 95%; font-size: 0.85rem; }
      .chat-body .bot-message.thinking .message-text { padding: 2px 6px; }
      .chat-body .bot-message .message-text { background: #fffdfd; border-radius: 13px 13px 13px 3px; margin-bottom: 5px; }
      .chat-body .user-message { flex-direction: column; align-items: flex-end; }
      .chat-body .user-message .message-text { color: #fff; background: #ee5d27; border-radius: 13px 13px 3px 13px; }
      .chat-body .user-message .attachment { width: 50%; margin-top: -7px; border-radius: 13px 3px 13px 13px; }
      .chat-body .bot-message .thinking-indicator { display: flex; gap: 4px; padding-block: 15px; }
      .chat-body .bot-message .thinking-indicator .dot { height: 7px; width: 7px; opacity: 0.7; border-radius: 50%; background: #ee5d27; animation: dotPulse 1.8s ease-in-out infinite; }
      .chat-body .bot-message .thinking-indicator .dot:nth-child(1) { animation-delay: 0.2s; }
      .chat-body .bot-message .thinking-indicator .dot:nth-child(2) { animation-delay: 0.3s; }
      .chat-body .bot-message .thinking-indicator .dot:nth-child(3) { animation-delay: 0.4s; }
      @keyframes dotPulse { 0%, 44% { transform: translateY(0); } 28% { opacity: 0.4; transform: translateY(-4px); } 44% { opacity: 0.2; } }
      .chat-footer { position: absolute; bottom: 0; width: 100%; background: #ececec; padding: 15px 22px 20px; }
      .chat-footer .chat-form { display: flex; align-items: center; position: relative; background: #fff; border-radius: 32px; outline: 1px solid #CCCCE5; box-shadow: 0 0 8px rgba(0, 0, 0, 0.06); transition: 0s ease, border-radius 0s; }
      .chat-form:focus-within { outline: 2px solid #ee5d27; }
      .chat-form .message-input { width: 100%; height: 47px; outline: none; resize: none; border: none; max-height: 180px; scrollbar-width: thin; border-radius: inherit; font-size: 0.95rem; padding: 14px 0 12px 18px; scrollbar-color: transparent transparent; }
      .chat-form .chat-controls { gap: 3px; height: 47px; display: flex; padding-right: 6px; align-items: center; align-self: flex-end; }
      .chat-form .chat-controls button { height: 35px; width: 35px; border: none; cursor: pointer; color: #ee5d27; border-radius: 50%; font-size: 1.15rem; background: none; transition: 0.2s ease; }
      .chat-form .chat-controls button:hover, body.show-emoji-picker .chat-controls #emoji-picker { color: #ee5d27; background: #f1f1ff; }
      .chat-form .chat-controls #send-message { color: #fff; display: none; background: #ee5d27; }
      .chat-form .chat-controls #send-message:hover { background: #ee5d27; }
      .chat-form .message-input:valid~.chat-controls #send-message { display: block; }
      .chat-form .file-upload-wrapper { position: relative; height: 35px; width: 35px; }
      .chat-form .file-upload-wrapper :where(button, img) { position: absolute; }
      .chat-form .file-upload-wrapper img { height: 100%; width: 100%; object-fit: cover; border-radius: 50%; }
      .chat-form .file-upload-wrapper #file-cancel { color: #ff0000; background: #fff; }
      .chat-form .file-upload-wrapper :where(img, #file-cancel), .chat-form .file-upload-wrapper.file-uploaded #file-upload { display: none; }
      .chat-form .file-upload-wrapper.file-uploaded img, .chat-form .file-upload-wrapper.file-uploaded:hover #file-cancel { display: block; }
      em-emoji-picker { position: absolute; left: 50%; top: -337px; width: 100%; max-width: 350px; visibility: hidden; max-height: 330px; transform: translateX(-50%); }
      body.show-emoji-picker em-emoji-picker { visibility: visible; }
      @media (max-width: 520px) { 
        #chatbot-toggler { right: 20px; bottom: 20px; } 
        .chatbot-popup { right: 0; bottom: 0; height: 100%; border-radius: 0; width: 100%; } 
        .chatbot-popup .chat-header { padding: 12px 15px; } 
        .chat-body { height: calc(90% - 55px); padding: 25px 15px; } 
        .chat-footer { padding: 10px 15px 15px; } 
        .chat-form .file-upload-wrapper.file-uploaded #file-cancel { opacity: 0; } 
      }
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
  margin: 0 0   0;
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

.upload-icon {
  display: inline-block;
  width: 16px;
  height: 16px;
  background-image: url('path-to-your-icon.svg');
  margin-right: 8px;
}

.quick-replies {
  display: flex;
  flex-direction: column;
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
                
                  <input type="text" id="user-name" placeholder="Enter your name" required />
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

      const showWelcomeMessage = (chatBody) => {
        const welcomeMessage = `
          <div class="bot-avatar-wrapper">
              <img class="bot-avatar" src="https://cdn-icons-png.flaticon.com/512/3774/3774299.png" alt="Chatbot Logo" width="50" height="50">
              <span class="online-indicator"></span>
            </div>
            <div class="message-text">What health issue are you facing?</div>`;
        
        const welcomeMessageDiv = createMessageElement(welcomeMessage, "bot-message");
        chatBody.appendChild(welcomeMessageDiv);
        const quickMessage = `<div class="quick-replies">
        <button class="quick-reply" onclick="sendQuickReply('Dialysis')">Dialysis</button>
        <button class="quick-reply" onclick="sendQuickReply('Diabetes ')">Diabetes </button>
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
      </div>`;
      const quickMessageDiv = document.createElement("div");
      quickMessageDiv.classList.add("bot-message");
      quickMessageDiv.innerHTML = quickMessage;
      chatBody.appendChild(quickMessageDiv);
        const fileInput = welcomeMessageDiv.querySelector("#welcome-file-input");
        const fileUploadBtn = welcomeMessageDiv.querySelector("#welcome-file-upload-btn");

        fileUploadBtn.addEventListener("click", () => fileInput.click());
        
        fileInput.addEventListener("change", () => {
          const file = fileInput.files[0];
          if (!file) return;

          userData.file = file;

          const fileConfirmation = `
            <div class="bot-avatar-wrapper">
              <img class="bot-avatar" src="https://cdn-icons-png.flaticon.com/512/3774/3774299.png" alt="Chatbot Logo" width="50" height="50">
              <span class="online-indicator"></span>
            </div>
            <div class="message-text">
              File "${file.name}" uploaded successfully. Please tell me about your health concern or type "Continue" to proceed.
            </div>`;
          const confirmationDiv = createMessageElement(fileConfirmation, "bot-message");
          chatBody.appendChild(confirmationDiv);
          chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });

          fileInput.value = "";
        });
      };

      const loadChatHistory = async () => {
        try {
          const chatRef = collection(db, "chats");
          const q = query(
            chatRef,
            where("browserId", "==", currentBrowserId),
            orderBy("timestamp", "asc")
          );
      
          const querySnapshot = await getDocs(q);
          const chatBody = document.querySelector(".chat-body");
          if (!chatBody) {
            console.error("Chat body not found!");
            return;
          }
      
          // Use sessionStorage instead of localStorage for firstConversationDone
          const isFirstConversation = !sessionStorage.getItem('firstConversationDone');
      
          // Clear existing messages
          chatBody.innerHTML = "";
      
          // Show welcome message and quick replies if it's the first conversation or no history exists
          if (isFirstConversation || querySnapshot.empty) {
            const welcomeMessage = ` <div class="bot-avatar-wrapper">
              <img class="bot-avatar" src="https://cdn-icons-png.flaticon.com/512/3774/3774299.png" alt="Chatbot Logo" width="50" height="50">
              <span class="online-indicator"></span>
            </div>
            <div class="message-text">What health issue are you facing?</div>`;
      
            const welcomeMessageDiv = createMessageElement(welcomeMessage, "bot-message");
            chatBody.appendChild(welcomeMessageDiv);
      
            const quickMessage = `<div class="quick-replies">
        <button class="quick-reply" onclick="sendQuickReply('Dialysis')">Dialysis</button>
        <button class="quick-reply" onclick="sendQuickReply('Diabetes ')">Diabetes </button>
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
      </div>`;
      
            const quickMessageDiv = document.createElement("div");
            quickMessageDiv.classList.add("bot-message");
            quickMessageDiv.innerHTML = quickMessage;
            chatBody.appendChild(quickMessageDiv);
      
            // Set the flag in sessionStorage instead of localStorage
            sessionStorage.setItem('firstConversationDone', 'true');
          }
      
          // Load existing messages
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            console.log("Displaying message:", data.message);
      
            if (data.sender === "user") {
              const messageContent = `<div class="message-text">${data.message}</div>
                ${data.file && data.file.data ? `<img src="data:${data.file.mime_type};base64,${data.file.data}" class="attachment" />` : ""}`;
              const outgoingMessageDiv = createMessageElement(messageContent, "user-message");
              chatBody.appendChild(outgoingMessageDiv);
            } else {
              const messageContent = `<div class="bot-avatar-wrapper">
                <img class="bot-avatar" src="https://cdn-icons-png.flaticon.com/512/3774/3774299.png" alt="Chatbot Logo" width="50" height="50">
                <span class="online-indicator"></span>
              </div>
              <div class="message-text">${data.message}</div>`;
              const incomingMessageDiv = createMessageElement(messageContent, "bot-message");
              chatBody.appendChild(incomingMessageDiv);
            }
          });
      
          chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
        } catch (error) {
          console.error("Error loading chat history:", error);
        }
      };

      const storeUserInfo = async (name, phone, age) => {
        try {
          const userRef = collection(db, "users");
          await addDoc(userRef, {
            name: name,
            phone: phone,
            age: age,
            browserId: currentBrowserId,
            timestamp: new Date(),
          });
          console.log("User info stored successfully");
        } catch (error) {
          console.error("Error storing user info:", error);
        }
      };

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
      const showWelcomeMessage2 = (chatBody) => {
        // Directly set the last user message to "Continue"
        const lastUserMessage = "Continue";
    
        // Welcome message with the file upload option
        const welcomeMessage = `
            <div class="message-container" style="display: flex; align-items: flex-start;">
                <div class="bot-avatar-wrapper" style="flex-shrink: 0; margin-right: 8px;">
                    <img class="bot-avatar" src="https://cdn-icons-png.flaticon.com/512/3774/3774299.png" alt="Chatbot Logo" width="50" height="50">
                    <span class="online-indicator" style="position: absolute; bottom: 0; right: 0;"></span>
                </div>
                <div class="message-content" style="flex-grow: 1;">
                    <h3 class="welcome-heading">Welcome to Health Assistant</h3>
                    <p class="welcome-text">I'm here to provide personalized health guidance. Would you like to upload your health reports for more accurate recommendations?</p>
                    
                    <div class="welcome-options" style="display: flex; flex-wrap: wrap; gap: 10px; margin-top: 12px;">
                        <div class="file-upload-wrapper">
                            <input type="file" accept="image/*,application/pdf" id="welcome-file-input" hidden />
                            <button type="button" id="welcome-file-upload-btn" class="primary-button">
                                <i class="upload-icon"></i> Upload 
                            </button>
                        </div>
                        
                        <div class="quick-replies" style="display: flex; gap: 8px;">
                            <button class="secondary-button" style="background-color: #f0f0f0;" onclick="sendQuickReply('${lastUserMessage}')">Skip</button>
                        </div>
                    </div>
                </div>
            </div>`;
    
        // Append the welcome message to the chat body
        const welcomeMessageDiv = createMessageElement(welcomeMessage, "bot-message");
        chatBody.appendChild(welcomeMessageDiv);
    
        // Handle file upload
        const fileInput = welcomeMessageDiv.querySelector("#welcome-file-input");
        const fileUploadBtn = welcomeMessageDiv.querySelector("#welcome-file-upload-btn");
    
        fileUploadBtn.addEventListener("click", () => fileInput.click());
    
        fileInput.addEventListener("change", () => {
            const file = fileInput.files[0];
            if (!file) return;
    
            // Store the file in userData (if needed)
            userData.file = file;
    
            // Notify the user that the file has been uploaded
            const confirmationMessage = ``;
            const confirmationDiv = createMessageElement(confirmationMessage, "bot-message");
            chatBody.appendChild(confirmationDiv);
            chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
    
            // Automatically proceed with the "Continue" action
            sendQuickReply(lastUserMessage);
    
            // Clear the file input
            fileInput.value = "";
        });
    };
      // Add a message counter variable at the beginning of your script
let messageCount = 0;

// Modify the handleOutgoingMessage function to track messages and show welcomeMessage2
const handleOutgoingMessage = async (e) => {
    e.preventDefault();
    userData.message = messageInput.value.trim();
    messageInput.value = "";
    messageInput.dispatchEvent(new Event("input"));
    fileUploadWrapper.classList.remove("file-uploaded");
  
    // Fetch the user's name from a query
    let userName = "User"; // Default to "User" if the name is not available
    try {
      const userQuery = query(collection(db, "users"), where("browserId", "==", currentBrowserId));
      const querySnapshot = await getDocs(userQuery);
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0]; // Get the first matching document
        userName = userDoc.data().name; // Extract the user's name
      }
    } catch (error) {
      console.error("Error fetching user name:", error);
    }
  
    // Add patient icon with inline styling and user name
    let messageContent = `
      <div class="patient-avatar-wrapper" style="display: flex; gap: 15px; align-items: center;">
        <span class="online-indicator" style="display: inline-block; margin-left: -15px; vertical-align: bottom;"></span>
        <div style="display: flex; flex-direction: column; align-items: flex-start;">
          <div class="user-name" style="font-weight: bold; margin-bottom: 5px;">${userName}</div>
          <div class="message-text">${userData.message || "[Empty message]"}</div>
        </div>
        <img class="patient-avatar" src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" alt="Patient Avatar" width="40" height="40" style="display: inline-block; vertical-align: middle;">
      </div>`;
  
    // Add file icon if a file is attached
    if (userData.file) {
      messageContent += `<div class="file-icon">
        <img src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" alt="File Icon" width="20" height="20">
        <span>File attached</span>
      </div>`;
    }
  
    // Append the outgoing message to the chat body
    const outgoingMessageDiv = createMessageElement(messageContent, "user-message");
    chatBody.appendChild(outgoingMessageDiv);
    chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
  
    // Store the user's message
    await storeChatMessage(userData.message || "[Empty message]", "user");
  
    // Increment message counter
    messageCount++;
    console.log(messageContent);
  
    setTimeout(async () => {
      // Check if this is the first message from the user
      if (messageCount === 1) {
        // Skip API call entirely for the first message
        // Instead, immediately show the welcome message 2
        setTimeout(() => {
          showWelcomeMessage2(chatBody);
        }, 1000); // Wait a second to show the welcome message
      } else {
        // Normal processing for subsequent messages
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
  
        // Generate bot response
        const fileToSend = userData.file;
        const botResponse = await generateBotResponse(incomingMessageDiv, null, fileToSend);
  
        // Construct bot message content
        let botMessageContent = `
          <div class="bot-avatar-wrapper">
            <img class="bot-avatar" src="https://cdn-icons-png.flaticon.com/512/3774/3774299.png" alt="Chatbot Logo" width="50" height="50">
            <span class="online-indicator"></span>
          </div>
          <div class="message-text">${botResponse}</div>`;
        if (fileToSend) {
          botMessageContent += `
            <div class="file-icon">
              <img src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" alt="File Icon" width="20" height="20">
              <span>Pdf</span>
            </div>`;
        }
  
        // Update the bot message with the response
        incomingMessageDiv.innerHTML = botMessageContent;
        incomingMessageDiv.classList.remove("thinking");
  
        // Store the bot's response
        await storeChatMessage(botResponse, "bot");
      }
  
      // Clear the file from userData
      userData.file = null;
    }, 100);
  };
      const generateBotResponse = async (incomingMessageDiv, query = null, file = null) => {
        const userMessage = query || userData.message || "";
        try {
          const browserIdString = String(currentBrowserId);
          const cacheKey = `${userMessage}_${file ? file.name : "no-file"}_${browserIdString}`;
          const cachedResponse = localStorage.getItem(cacheKey);
          if (cachedResponse) {
            return cachedResponse;
          }

          const formData = new FormData();
          formData.append("query", userMessage);
          formData.append("session_id", browserIdString);
          if (file) {
            formData.append("file", file, file.name);
          }

          const apiResponse = await fetch("https://khadargroups-ai-chatbot.vercel.app/chat", {
            method: "POST",
            body: formData,
          });

          if (!apiResponse.ok) {
            throw new Error(`API Error (${apiResponse.status}): ${await apiResponse.text()}`);
          }

          const data = await apiResponse.json();
          let botResponseText = data.message || "Sorry, I don't understand that yet.";
          if (file && data.url) {
            botResponseText += ` File uploaded: ${data.url}`;
          }

          localStorage.setItem(cacheKey, botResponseText);
          botResponseText = botResponseText
          .replace(/(- Link$|\[Link\]\()/g, '') // Remove "- Link" and "[Link]("
          .replace(/https?:\/\/[^\s\]]+/g, url => 
              `<a href="${url}" target="_blank" class="bot-link">[Link]</a>`) // Fix URL formatting
          .replace(/(\n|^)[\s\u200B\u00A0]*-\s+/g, '$1• ') // Convert "- " into bullet points
          .replace(/\n/g, '<br>') // Convert new lines to <br>
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Convert **bold** to <strong>
          .replace(/• LINK_PLACEHOLDER/g, (_, index, fullText) => {
              const productName = fullText.match(/<strong>(.*?)<\/strong>/)?.[1] || "Product";
              return `• <a href="#" class="product-link">View ${productName}</a>`;
          })
          .replace(/[>\])]+botresponse/g, '');
          return botResponseText;
        } catch (error) {
          console.error("Error in generateBotResponse:", error);
          return `Sorry, there was an error: ${error.message}`;
        }
      };

      const resetChatHistory = async () => {
        const chatBody = document.querySelector(".chat-body");
        if (!chatBody) return;
        
        const userConfirmed = confirm("Are you sure you want to reset the chat? This will delete all previous messages.");
        if (!userConfirmed) return;
        
        chatBody.innerHTML = "";
        await deleteChatHistory();
        showWelcomeMessage(chatBody);
        sessionStorage.removeItem('firstConversationDone');
        localStorage.removeItem('skipLoadingChatHistory');
        
        // Reset message counter to 0
  
      };

      const deleteChatHistory = async () => {
        try {
          const chatRef = collection(db, "chats");
          const q = query(chatRef, where("browserId", "==", currentBrowserId));
          const querySnapshot = await getDocs(q);
          querySnapshot.forEach(async (doc) => {
            await deleteDoc(doc.ref);
            messageCount = 0;
          });
          console.log("Chat history deleted from Firestore successfully.");
        } catch (error) {
          console.error("Error deleting chat history from Firestore:", error);
        }
      };

      sendMessage.addEventListener("click", (e) => handleOutgoingMessage(e));
      messageInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          if (messageInput.value.trim() !== "") {
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