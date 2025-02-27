import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
import { getFirestore, collection, query, where, getDocs, addDoc, orderBy,deleteDoc} from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js";
(function () {
  // Function to load scripts dynamically
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

  // Load required scripts (only for non-module scripts)
  Promise.all([
    loadScript('https://cdn.jsdelivr.net/npm/emoji-mart@latest/dist/browser.js'),
  ]).then(() => {
    // Initialize Firebase
    const firebaseConfig = {
      apiKey: 'AIzaSyBz-gI6Pmwvsp09_Qp_Q6qS3ECxAfxsAC4',
      authDomain: 'chatbot-9ee0f.firebaseapp.com',
      projectId: 'chatbot-9ee0f',
      storageBucket: 'chatbot-9ee0f.appspot.com',
      messagingSenderId: '127978721082',
      appId: '1:127978721082:web:6de1daa276b0fa12928a03',
      measurementId: 'G-BP73ZG0D4Z',
    };

    // Initialize Firebase app and get Firestore instance
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const storage = getStorage(app);
    
    // Generate or retrieve browser ID
    const getBrowserId = () => {
      let browserId = localStorage.getItem('chatbot_browser_id');
      if (!browserId) {
        browserId = 'browser_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15);
        localStorage.setItem('chatbot_browser_id', browserId);
      }
      return browserId;
    };

    // Get the current browser ID
    const currentBrowserId = getBrowserId();
    console.log("Browser ID:", currentBrowserId);

    // Inject HTML structure for the chatbot
    
    // Get the collection reference

    const chatbotHTML = `
      <button id="chatbot-toggler">
        <span class="material-symbols-rounded">mode_comment</span>
        <span class="material-symbols-rounded">close</span>
      </button>

      <div class="chatbot-popup">
        <div class="chat-header">
          <div class="header-info">
            <img class="chatbot-logo" src="https://khadargroups.com/storage/fav.png" alt="Chatbot Logo" width="50" height="50">
            <h2 class="logo-text">KhadarGroups</h2>
          </div>
         <div> 
          <button id="resetChatHistory" class="material-symbols-rounded">refresh</button>
         <button id="close-chatbot" class="material-symbols-rounded">keyboard_arrow_down</button>
         
        </div>
          </div>

        <div class="chat-body" id="chat-body">
          <div class="message bot-message">
            <div class="bot-avatar-wrapper">
              <img class="bot-avatar" src="https://khadargroups.com/storage/fav.png" alt="Chatbot Logo" width="50" height="50">
              <span class="online-indicator"></span>
            </div>
            <div class="message-text">Hey there <br /> How can I help you today?</div>
            <div class="message-time" id="bot-message-time"></div>
          </div>

            <!-- Quick Reply Buttons -->
            <div class="quick-replies">
              <button class="quick-reply" onclick="sendQuickReply('What are your services?')">What are your services?</button>
              <button class="quick-reply" onclick="sendQuickReply('Tell me a joke!')">Tell me a joke!</button>
              <button class="quick-reply" onclick="sendQuickReply('How can I contact support?')">Contact Support</button>
            </div>
          </div>

        <div class="chat-footer">
          <form action="#" class="chat-form" id="chat-form">
            <textarea placeholder="Message..." class="message-input" id="message-input" required></textarea>
            <div class="chat-controls">
              <button type="button" id="emoji-picker" class="material-symbols-outlined">sentiment_satisfied</button>
              <div class="file-upload-wrapper">
                <input type="file" accept="image/*" id="file-input" hidden />
                <button type="button" id="file-upload" class="material-symbols-rounded">attach_file</button>
                <button type="button" id="file-cancel" class="material-symbols-rounded">close</button>
              </div>
              <button type="submit" id="send-message" class="material-symbols-rounded">arrow_upward</button>
            </div>
          </form>
        </div>
      </div>
    `;

    // Add some basic styles for the chatbot (this can be expanded as needed)
    const style = document.createElement('style');
    style.innerHTML =`/* Importing Google Fonts - Inter */
@import url('https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,100..900&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: "Inter", sans-serif;
}

body {
  width: 100%;
  min-height: 100vh;
}

.quick-replies {
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex-wrap: wrap;
  width: 140px; /* Set desired width here */
 margin-left:38px;
}

.quick-reply {
  border: 1px solid #ee5d27;
  color: #ee5d27;
  padding: 8px 10px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 11px;
  transition: background-color 0.3s;
}

.quick-reply:hover {
  background-color: rgb(236, 245, 255);
}

.message-time {
  font-size: 12px;
  color: gray;
  margin-top: 5px;
  text-align: left;
}

#chatbot-toggler {
  position: fixed;
  bottom: 10px;
  right: 35px;
  border: none;
  height: 60px;
  width: 60px;
  display: flex;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #ee5d27;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  z-index: 10000;
}
@media (max-width: 768px) {
  #chatbot-toggler {
    bottom: 100px;  /* Increased from 190px to move it higher */
    right: 40px;
    height: 50px;
    width: 50px;
  }
}

@media only screen and (max-width: 480px) {
  #chatbot-toggler {
    bottom: 30px !important;
    right: 10px !important;
    height: 50px !important;
    width: 50px !important;
  }
}   

.message-box {
  max-width: 100%;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
}

.bot-link {
  color: blue;
  text-decoration: underline;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
}

.dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #949494; /* Change color as needed */
  margin: 0 2px;
  animation: bounce 1.4s infinite ease-in-out;
}

.dot:nth-child(2) {
  animation-delay: 0.2s;
}

.dot:nth-child(3) {
  animation-delay: 0.4s;
}

.bot-avatar-wrapper {
  position: absolute; /* Position the avatar absolutely */
  top: 0; /* Place it at the top */
  left: 0; /* Align it to the left */
  display: inline-block; /* Keep it inline */
}

.bot-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%; /* Optional: Make the avatar circular */
}

.online-indicator {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 10px;
  height: 10px;
  background-color: green; /* Online indicator color */
  border-radius: 50%; /* Make it circular */
  border: 2px solid white; /* Optional: Add a border */
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
}

.message {
  position: relative; /* Make the container a positioning context */
  padding-left: 40px; /* Add padding to prevent text overlap with the avatar */
}

body.show-chatbot #chatbot-toggler {
  transform: rotate(90deg);
}

#chatbot-toggler span {
  color: #fff;
  position: absolute;
}

#chatbot-toggler span:last-child,
body.show-chatbot #chatbot-toggler span:first-child {
  opacity: 0;
}

body.show-chatbot #chatbot-toggler span:last-child {
  opacity: 1;
}

.chatbot-popup {
  position: fixed;
  right: 35px;
  bottom: 80px;
  width: 420px;
  overflow: hidden;
  background: #ececec;
  border-radius: 15px;
  opacity: 0;
  pointer-events: none;
  transform: scale(0.2);
  transform-origin: bottom right;
  box-shadow: 0 0 128px 0 rgba(0, 0, 0, 0.1), 0 32px 64px -48px rgba(0, 0, 0, 0.5);
  transition: all 0.1s ease;
  z-index: 20000;
}

body.show-chatbot .chatbot-popup {
  opacity: 1;
  pointer-events: auto;
  transform: scale(1);
}

.chat-header {
  display: flex;
  align-items: center;
  padding: 5px 15px;
  background: #ee5d27;
  justify-content: space-between;
}

.chat-header .header-info {
  display: flex;
  gap: 10px;
  align-items: center;
}

.header-info .chatbot-logo {
  width: 30px;
  height: 30px;
  padding: 6px;
  fill: #ee5d27;
  flex-shrink: 0;
  background: #fff;
  border-radius: 50%;
}

.header-info .logo-text {
  color: #fff;
  font-weight: 600;
  font-size: 1.20rem;
  letter-spacing: 0.02rem;
}

.chat-header #close-chatbot {
  border: none;
  color: #fff;
  height: 40px;
  width: 40px;
  font-size: 1.9rem;
  margin-right: -10px;
  padding-top: 2px;
  cursor: pointer;
  border-radius: 50%;
  background: none;
  transition: 0.2s ease;
}

.chat-header #resetChatHistory {
  border: none;
  color: #fff;
  height: 40px;
  width: 40px;
  font-size: 1.9rem;
  margin-right: -10px;
  padding-top: 2px;
  cursor: pointer;
  border-radius: 50%;
  background: none;
  transition: 0.2s ease;
}

.chat-header #close-chatbot:hover {
  background: #005f63);
}

.chat-body {
  padding: 15px 22px;
  gap: 10px;
  display: flex;
  height: 360px;
  overflow-y: auto;
  margin-bottom: 78px;
  flex-direction: column;
  scrollbar-width: thin;
  scrollbar-color: rgb(235, 230, 230) transparent;
}

.chat-body,
.chat-form .message-input:hover {
  scrollbar-color: rgb(200, 202, 202) transparent;
}

.chat-body .message {
  display: flex;
  gap: 2px;
  align-items: center;
}

.chat-body .message .bot-avatar {
  width: 35px;
  height: 35px;
  fill: #fff;
  flex-shrink: 0;
  margin-bottom: 2px;
  align-self: flex-end;
  border-radius: 50%;
}

.chat-body .message .message-text {
  padding: 12px 14px;
  max-width: 95%;
  font-size: 0.85rem;
}

.chat-body .bot-message.thinking .message-text {
  padding: 2px 6px;
}

.chat-body .bot-message .message-text {
  background: #fffdfd;
  border-radius: 13px 13px 13px 3px;
  margin-bottom: 5px;
}

.chat-body .user-message {
  flex-direction: column;
  align-items: flex-end;
}

.chat-body .user-message .message-text {
  color: #fff;
  background: #ee5d27;
  border-radius: 13px 13px 3px 13px;
}

.chat-body .user-message .attachment {
  width: 50%;
  margin-top: -7px;
  border-radius: 13px 3px 13px 13px;
}

.chat-body .bot-message .thinking-indicator {
  display: flex;
  gap: 4px;
  padding-block: 15px;
}

.chat-body .bot-message .thinking-indicator .dot {
  height: 7px;
  width: 7px;
  opacity: 0.7;
  border-radius: 50%;
  background: #ee5d27;
  animation: dotPulse 1.8s ease-in-out infinite;
}

.chat-body .bot-message .thinking-indicator .dot:nth-child(1) {
  animation-delay: 0.2s;
}

.chat-body .bot-message .thinking-indicator .dot:nth-child(2) {
  animation-delay: 0.3s;
}

.chat-body .bot-message .thinking-indicator .dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes dotPulse {

  0%,
  44% {
    transform: translateY(0);
  }

  28% {
    opacity: 0.4;
    transform: translateY(-4px);
  }

  44% {
    opacity: 0.2;
  }
}

.chat-footer {
  position: absolute;
  bottom: 0;
  width: 100%;
  background: #ececec;
  padding: 15px 22px 20px;
}

.chat-footer .chat-form {
  display: flex;
  align-items: center;
  position: relative;
  background: #fff;
  border-radius: 32px;
  outline: 1px solid #CCCCE5;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.06);
  transition: 0s ease, border-radius 0s;
}

.chat-form:focus-within {
  outline: 2px solid #ee5d27;
}

.chat-form .message-input {
  width: 100%;
  height: 47px;
  outline: none;
  resize: none;
  border: none;
  max-height: 180px;
  scrollbar-width: thin;
  border-radius: inherit;
  font-size: 0.95rem;
  padding: 14px 0 12px 18px;
  scrollbar-color: transparent transparent;
}

.chat-form .chat-controls {
  gap: 3px;
  height: 47px;
  display: flex;
  padding-right: 6px;
  align-items: center;
  align-self: flex-end;
}

.chat-form .chat-controls button {
  height: 35px;
  width: 35px;
  border: none;
  cursor: pointer;
  color: #ee5d27;
  border-radius: 50%;
  font-size: 1.15rem;
  background: none;
  transition: 0.2s ease;
}

.chat-form .chat-controls button:hover,
body.show-emoji-picker .chat-controls #emoji-picker {
  color: #ee5d27;
  background: #f1f1ff;
}

.chat-form .chat-controls #send-message {
  color: #fff;
  display: none;
  background: #ee5d27;
}

.chat-form .chat-controls #send-message:hover {
  background: #ee5d27;
}

.chat-form .message-input:valid~.chat-controls #send-message {
  display: block;
}

.chat-form .file-upload-wrapper {
  position: relative;
  height: 35px;
  width: 35px;
}

.chat-form .file-upload-wrapper :where(button, img) {
  position: absolute;
}

.chat-form .file-upload-wrapper img {
  height: 100%;
  width: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.chat-form .file-upload-wrapper #file-cancel {
  color: #ff0000;
  background: #fff;
}

.chat-form .file-upload-wrapper :where(img, #file-cancel),
.chat-form .file-upload-wrapper.file-uploaded #file-upload {
  display: none;
}

.chat-form .file-upload-wrapper.file-uploaded img,
.chat-form .file-upload-wrapper.file-uploaded:hover #file-cancel {
  display: block;
}

em-emoji-picker {
  position: absolute;
  left: 50%;
  top: -337px;
  width: 100%;
  max-width: 350px;
  visibility: hidden;
  max-height: 330px;
  transform: translateX(-50%);
}

body.show-emoji-picker em-emoji-picker {
  visibility: visible;
}

/* Responsive media query for mobile screens */
@media (max-width: 520px) {
  #chatbot-toggler {
    right: 20px;
    bottom: 20px;
  }

  .chatbot-popup {
    right: 0;
    bottom: 0;
    height: 100%;
    border-radius: 0;
    width: 100%;
  }

  .chatbot-popup .chat-header {
    padding: 12px 15px;
  }

  .chat-body {
    height: calc(90% - 55px);
    padding: 25px 15px;
  }

  .chat-footer {
    padding: 10px 15px 15px;
  }

  .chat-form .file-upload-wrapper.file-uploaded #file-cancel {
    opacity: 0;
  }
}`
    document.head.appendChild(style);


    const chatbotContainer = document.createElement('div');
    chatbotContainer.innerHTML = chatbotHTML;
    document.body.appendChild(chatbotContainer);
    const storedToken = localStorage.getItem("chatbotToken");

    if (!storedToken || storedToken !== "199908") {
        console.warn("Unauthorized access! Token is missing or invalid.");
    }
    else {
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
        file: { data: null, mime_type: null },
      };

      const createMessageElement = (content, ...classes) => {
        const div = document.createElement("div");
        div.classList.add("message", ...classes);
        div.innerHTML = content;
        return div;
      };

      // Function to store chat message with browser ID
      const storeChatMessage = async (message, sender, file = null) => {
        try {
          const chatRef = collection(db, "chats");
          await addDoc(chatRef, {
            message: message,
            sender: sender,
            timestamp: new Date(),
            browserId: currentBrowserId, // Add browser ID to each message
            file: file ? { data: file.data, mime_type: file.mime_type } : null,
          });
        } catch (error) {
          console.error("Error storing chat message:", error);
        }
      };

      // Function to load chat history for the current browser
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
            const welcomeMessage = `<div class="bot-avatar-wrapper">
              <img class="bot-avatar" src="https://khadargroups.com/storage/fav.png" alt="Chatbot Logo" width="50" height="50">
              <span class="online-indicator"></span>
            </div>
            <div class="message-text">Welcome! How can I assist you today?</div>`;
      
            const welcomeMessageDiv = createMessageElement(welcomeMessage, "bot-message");
            chatBody.appendChild(welcomeMessageDiv);
      
            const quickMessage = `<div class="quick-replies">
              <button class="quick-reply" onclick="sendQuickReply('Menu')">Menu</button>
              <button class="quick-reply" onclick="sendQuickReply('Famous product ')">Famous product</button>
              <button class="quick-reply" onclick="sendQuickReply('How can I contact support?')">Contact Support</button>
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
                <img class="bot-avatar" src="https://khadargroups.com/storage/fav.png" alt="Chatbot Logo" width="50" height="50">
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
      // Handle outgoing user messages
      const handleOutgoingMessage = async (e) => {
        e.preventDefault();
        userData.message = messageInput.value.trim();
        messageInput.value = "";
        messageInput.dispatchEvent(new Event("input"));
        fileUploadWrapper.classList.remove("file-uploaded");
      
        if (!userData.message && !userData.file.data) return; // Ensure we send something
      
        // Create and display user message
        const messageContent = `<div class="message-text"></div>
                              ${userData.file.data ? `<img src="data:${userData.file.mime_type};base64,${userData.file.data}" class="attachment" />` : ""}`;
      
        const outgoingMessageDiv = createMessageElement(messageContent, "user-message");
        outgoingMessageDiv.querySelector(".message-text").innerText = userData.message;
        chatBody.appendChild(outgoingMessageDiv);
        chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
      
        // Store the user's message in Firestore with browser ID
        await storeChatMessage(userData.message, "user", userData.file);
      
        // Clear the file data after uploading to prevent it from being used in the next message
        userData.file = { data: null, mime_type: null };
      
        // Simulate bot response with thinking indicator
        setTimeout(async () => {
          const messageContent = `<div class="bot-avatar-wrapper">
                <img class="bot-avatar" src="https://khadargroups.com/storage/fav.png" alt="Chatbot Logo" width="50" height="50">
                <span class="online-indicator"></span>
              </div>
              <div class="message-text">
                <div class="thinking-indicator">
                  <div class="dot"></div>
                  <div class="dot"></div>
                  <div class="dot"></div>
                </div>
              </div>`;
      
          const incomingMessageDiv = createMessageElement(messageContent, "bot-message", "thinking");
          chatBody.appendChild(incomingMessageDiv);
          chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
          const botResponse = await generateBotResponse(incomingMessageDiv);
      
          // Store the bot's response in Firestore with browser ID
          await storeChatMessage(botResponse, "bot");
        }, 100);
      };
    
      window.sendQuickReply = function (message) {
        messageInput.value = message; // Set the quick reply message
        document.querySelector('#send-message').click(); // Trigger send message
      };
      
      messageInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault(); // Prevents new line in the input field
          console.log("Enter key pressed, attempting to send message...");
          
          if (messageInput.value.trim() !== "") {
            handleOutgoingMessage(e); // Call the function to send the message
          } else {
            console.log("Message input is empty, not sending.");
          }
        }
      });        
      
      // Generate bot response using API
      const uploadImageToFirebase = async (file) => {
        if (!file) return null;
      
        const storageRef = ref(storage, `chat_images/${currentBrowserId}/${Date.now()}_${file.name}`);
        try {
          // Upload file to Firebase Storage
          const snapshot = await uploadBytes(storageRef, file);
          
          // Get the file URL after upload
          const downloadURL = await getDownloadURL(snapshot.ref);
          
          return downloadURL;
        } catch (error) {
          console.error("Error uploading file:", error);
          return null;
        }
      };
      
      const generateBotResponse = async (incomingMessageDiv) => {
        const messageElement = incomingMessageDiv.querySelector(".message-text");
    
        // Show typing effect for the bot
        messageElement.innerHTML = `<span class="dot"></span><span class="dot"></span><span class="dot"></span>`;
    
        const userMessage = userData.message.toLowerCase();
    
        try {
            // API call to FastAPI endpoint
            const apiResponse = await fetch('https://fastapi-vercel-iota.vercel.app/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMessage, browserId: currentBrowserId }),
            });
    
            if (!apiResponse.ok) {
                throw new Error('Failed to fetch bot response');
            }
    
            const data = await apiResponse.json();
            let botResponseText = data.response || "Sorry, I don't understand that yet.";
    
            // Convert "Link" text to actual hyperlinks
            botResponseText = botResponseText.replace(/- Link$/gm, "• LINK_PLACEHOLDER");
            botResponseText = botResponseText.replace(/\[Link\]\(/g, "");
    
            // Convert URLs to clickable links
            botResponseText = botResponseText.replace(
                /https?:\/\/[^\s()]+(?:\([^\)]*\)|[^\s]*)*/g,
                (url) => {
                    if (url.endsWith(')') && !url.includes('(')) {
                        url = url.slice(0, -1);
                    }
                    return `<a href="${url}" target="_blank" class="bot-link">[Link]</a>`;
                }
            );
            botResponseText = botResponseText.replace(/(\n|^)[\s\u200B\u00A0]*-\s+/g, "$1• ");
            // Replace newlines with <br> tags for HTML display
            botResponseText = botResponseText.replace(/\n/g, '<br>');
    
            // Convert **text** to <strong>text</strong> for bold formatting
            botResponseText = botResponseText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
            // Replace "-" with "•" (bullet point)
           
            // Replace "LINK_PLACEHOLDER" with actual links
            botResponseText = botResponseText.replace(/• LINK_PLACEHOLDER/g, (match, index, fullText) => {
                const previousText = fullText.substring(0, index);
                const productNameMatch = previousText.match(/<strong>(.*?)<\/strong>/);
                const productName = productNameMatch ? productNameMatch[1] : "Product";
                return `• <a href="#" class="product-link">View ${productName}</a>`;
            });
    
            // Display bot's response after a small delay
            await new Promise((resolve) => setTimeout(resolve, 1500));
            messageElement.innerHTML = botResponseText;
    
            return botResponseText;
        } catch (error) {
            console.error("Error fetching bot response:", error);
            messageElement.innerText = "Error fetching response";
            messageElement.style.color = "#ff0000";
            return "Error fetching response";
        } finally {
            incomingMessageDiv.classList.remove("thinking");
            chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
        }
    };
    
    
    const resetChatHistory = async () => {
      const chatBody = document.querySelector(".chat-body"); // Changed from .chat-messages
      if (chatBody) {
        // Clear chat messages
        chatBody.innerHTML = "";
    
        // Delete chat history from Firestore
        await deleteChatHistory();
    
        // Add welcome message
        const welcomeMessage = `<div class="bot-avatar-wrapper">
          <img class="bot-avatar" src="https://khadargroups.com/storage/fav.png" alt="Chatbot Logo" width="50" height="50">
          <span class="online-indicator"></span>
        </div>
        <div class="message-text">Welcome! How can I assist you today?</div>`;
    
        const welcomeMessageDiv = createMessageElement(welcomeMessage, "bot-message");
        chatBody.appendChild(welcomeMessageDiv);
    
        // Add quick replies
        const quickMessage = `<div class="quick-replies">
          <button class="quick-reply" onclick="sendQuickReply('Menu')">Menu</button>
          <button class="quick-reply" onclick="sendQuickReply('Famous product')">Famous product</button>
          <button class="quick-reply" onclick="sendQuickReply('How can I contact support?')">Contact Support</button>
        </div>`;
    
        const quickMessageDiv = document.createElement("div");
        quickMessageDiv.classList.add("bot-message");
        quickMessageDiv.innerHTML = quickMessage;
        chatBody.appendChild(quickMessageDiv);
    
        // Clear sessionStorage flag to reset first conversation state
        sessionStorage.removeItem('firstConversationDone');
        localStorage.removeItem('skipLoadingChatHistory');
    
        console.log("Chat display reset successfully. Chat history deleted from Firestore.");
      } else {
        console.error("Chat body container not found!");
      }
    };
  
  
  
    // Function to delete chat history from Firestore
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

  
  
  // Add event listener to the reset button
  document.getElementById("resetChatHistory").addEventListener("click", resetChatHistory);
      // Event listeners
      sendMessage.addEventListener("click", (e) => handleOutgoingMessage(e));
      document.querySelector("#file-upload").addEventListener("click", () => fileInput.click());
      closeChatbot.addEventListener("click", () => document.body.classList.remove("show-chatbot"));
      chatbotToggler.addEventListener("click", () => {
        document.body.classList.toggle("show-chatbot");
        
        // Load chat history when the chatbot is opened, but check the skip flag
        if (document.body.classList.contains("show-chatbot")) {
          // Check if we should skip loading history
          const skipLoading = localStorage.getItem('skipLoadingChatHistory') === 'true';
          
          if (skipLoading) {
            // Clear the flag so we'll load history next time
            localStorage.removeItem('skipLoadingChatHistory');
            console.log("Skipping chat history load as requested by reset function");
          } else {
            // Load chat history normally
            loadChatHistory();
          }
        }
      });
      // Handle file input change and preview the selected file
      fileInput.addEventListener("change", () => {
        const file = fileInput.files[0];
        if (!file) return;
      
        const reader = new FileReader();
        reader.onload = (e) => {
          fileInput.value = "";
      
          // Check if an <img> tag exists inside fileUploadWrapper
          let imgElement = fileUploadWrapper.querySelector("img");
          
          if (!imgElement) {
            imgElement = document.createElement("img");
            imgElement.classList.add("preview-image"); // Optional: Add a class for styling
            fileUploadWrapper.appendChild(imgElement);
          }
      
          imgElement.src = e.target.result;
          fileUploadWrapper.classList.add("file-uploaded");
      
          const base64String = e.target.result.split(",")[1];
      
          // Store file data in userData
          userData.file = {
            data: base64String,
            mime_type: file.type,
          };
        };
      
        reader.readAsDataURL(file);
      });

      // Cancel file upload
      fileCancelButton.addEventListener("click", () => {
        userData.file = {};
        fileUploadWrapper.classList.remove("file-uploaded");
      });

      // Initialize emoji picker
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
      
      // When the document loads, check if the chatbot should load history
      document.addEventListener('DOMContentLoaded', () => {
        if (document.body.classList.contains("show-chatbot")) {
          loadChatHistory();
        }
      });
    }
  });
})();