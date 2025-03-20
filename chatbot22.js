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
      <!-- User Info Form -->
      <div class="user-info-form" id="user-info-form">
        <div class="form-header">
          <h2>Welcome to KhadarGroups</h2>
          <p>Please provide your details to start chatting</p>
        </div>
        <form id="user-info-submit" class="info-form">
          <div class="form-field">
            <label for="user-name">Name</label>
            <input type="text" id="user-name" placeholder="Enter your name" required />
          </div>
          <div class="form-field">
            <label for="user-phone">Phone Number</label>
            <input type="tel" id="user-phone" placeholder="Enter your phone number" pattern="[0-9]{10}" required />
          </div>
          <div class="form-field">
            <label for="user-age">Age</label>
            <input type="number" id="user-age" placeholder="Enter your age" min="1" max="120" required />
          </div>
          <button type="submit" class="submit-btn">Start Chat</button>
        </form>
      </div>
  
      <!-- Chat Interface -->
      <div class="chat-interface" id="chat-interface" style="display: none;">
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
  
        <div class="chat-body" id="chat-body">
          <div class="message bot-message">
            <div class="bot-avatar-wrapper">
              <img class="bot-avatar" src="https://cdn-icons-png.flaticon.com/512/3774/3774299.png" alt="Chatbot Logo" width="50" height="50">
              <span class="online-indicator"></span>
            </div>
            <div class="message-text">Hey there <br /> Tell me about your health concern! Would you like to upload your health reports for better recommendations or would you like to continue without health reports? </div>
            <div class="message-time" id="bot-message-time"></div>
          </div>
  
          <!-- Quick Reply Buttons -->
          <div class="quick-replies">
            <button class="quick-reply" onclick="sendQuickReply('Continue with report')">Continue</button>
            <button class="quick-reply" onclick="sendQuickReply('Continue Without report')">Continue Without report</button>
           
          </div>
        </div>
  
        <div class="chat-footer">
          <form action="#" class="chat-form" id="chat-form">
            <textarea placeholder="Message..." class="message-input" id="message-input" required></textarea>
            <div class="chat-controls">
              <button type="button" id="emoji-picker" class="material-symbols-outlined">sentiment_satisfied</button>
              <div class="file-upload-wrapper">
                <input type="file" action="https://chatbot-mongo-db.vercel.app/chat"  accept="image/*,application/pdf" id="file-input" hidden />
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
  width: 280px; /* Set desired width here */
margin-left:38px;
}

.quick-reply {
  border: 1px solid #ee5d27;
  color: #ee5d27;
  padding: 8px 10px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 13px;
  transition: background-color 0.3s;
}

.quick-reply:hover {
  background-color: rgb(236, 245, 255);
}
/* Add these styles to your existing style block */
.user-info-form {
  padding: 20px;
  background: #ececec;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.form-header {
  text-align: center;
  margin-bottom: 20px;
}

.form-header h2 {
  color: #ee5d27;
  font-size: 1.5rem;
}

.form-header p {
  color: #666;
  font-size: 0.9rem;
}

.info-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.form-field {
  display: flex;
  flex-direction: column;
}

.form-field label {
  font-size: 0.9rem;
  color: #333;
  margin-bottom: 5px;
}

.form-field input {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 0.95rem;
  outline: none;
}

.form-field input:focus {
  border-color: #ee5d27;
}

.submit-btn {
  background: #ee5d27;
  color: #fff;
  border: none;
  padding: 10px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.2s ease;
}

.submit-btn:hover {
  background: #d54b1f;
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
    bottom: 120px !important;
    right: 10px !important;
    height: 50px !important;
    width: 50px !important;
  }
}   
#chatbot-toggler.page-specific {
  bottom: 160px !important; /* Set different bottom position */
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
}
.file-icon {
        display: flex;
        align-items: center;
        gap: 5px;
        margin-top: 5px;
        color: #666;
    }
    .file-icon img {
        vertical-align: middle;
    }
    .file-icon span {
        font-size: 0.9em;
    }  

`
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
        file: null, // Changed from { data: null, mime_type: null } to store File object or null
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
            
          });
        } catch (error) {
          console.error("Error storing chat message:", error);
        }
      };
      document.addEventListener('DOMContentLoaded', () => {
        const chatbotToggler = document.querySelector('#chatbot-toggler');
        
        // Check if the current page is a specific one
        if (window.location.pathname === '/specific-page') {
          chatbotToggler.classList.add('page-specific');
        }
      });
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
              <img class="bot-avatar" src="https://cdn-icons-png.flaticon.com/512/3774/3774299.png" alt="Chatbot Logo" width="50" height="50">
              <span class="online-indicator"></span>
            </div>
            <div class="message-text">Tell me about your health concern! Would you like to upload your health reports for better recommendations or would you like to continue without health reports?</div>`;
      
            const welcomeMessageDiv = createMessageElement(welcomeMessage, "bot-message");
            chatBody.appendChild(welcomeMessageDiv);
      
            const quickMessage = `<div class="quick-replies">
                      <button class="quick-reply" onclick="sendQuickReply('Continue with report')">Continue</button>
            <button class="quick-reply" onclick="sendQuickReply('Continue Without report')">Continue Without report</button>
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
      // Function to store user info in Firestore
      
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

// Check if user info is already submitted
const checkUserInfoSubmitted = async () => {
  const userRef = collection(db, "users");
  const q = query(userRef, where("browserId", "==", currentBrowserId));
  const querySnapshot = await getDocs(q);
  return !querySnapshot.empty;
};

// Handle form submission
const handleUserInfoSubmit = async (e) => {
  e.preventDefault();
  const name = document.getElementById("user-name").value.trim();
  const phone = document.getElementById("user-phone").value.trim();
  const age = document.getElementById("user-age").value.trim();

  if (name && phone && age) {
    await storeUserInfo(name, phone, age);
    document.getElementById("user-info-form").style.display = "none";
    document.getElementById("chat-interface").style.display = "block";
    loadChatHistory(); // Load chat history after form submission
  }
};

// Modify the chatbot toggler logic

// Close chatbot button

// Add event listener for form submission
document.getElementById("user-info-submit").addEventListener("submit", handleUserInfoSubmit);
      // Handle outgoing user messages
      
    // Define uploadFileToServer function
  
    
    // File input event listener (unchanged from last revision)
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
          imgElement.src = e.target.result; // Base64 for preview
          fileUploadWrapper.classList.add("file-uploaded");
        };
        reader.readAsDataURL(file);
        userData.file = file; // Stores the raw File object
      });
    

// Handle outgoing user messages

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
     
  
/**
 * Handles sending a message
 */
const handleOutgoingMessage = async (e) => {
    e.preventDefault();
  
    userData.message = messageInput.value.trim();
    messageInput.value = "";
    messageInput.dispatchEvent(new Event("input"));
    fileUploadWrapper.classList.remove("file-uploaded");
  
    // Create message content with file icon if file exists
    let messageContent = `<div class="message-text">${userData.message || "[Empty message]"}</div>`;
    if (userData.file) {
        messageContent += `<div class="file-icon">
            <img src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" alt="File Icon" width="20" height="20">
            <span>File attached</span>
        </div>`;
    }
    
    const outgoingMessageDiv = createMessageElement(messageContent, "user-message");
    chatBody.appendChild(outgoingMessageDiv);
    chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
  
    await storeChatMessage(userData.message || "[Empty message]", "user");
  
    // Log the file to verify it exists
    console.log("File to be sent:", userData.file);
  
    setTimeout(async () => {
      const thinkingContent = `<div class="bot-avatar-wrapper">
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
  
      const fileToSend = userData.file; // Capture the file reference
      const botResponse = await generateBotResponse(incomingMessageDiv, null, fileToSend);
      
      // Optionally show file icon in bot response if needed
      let botMessageContent = `<div class="message-text">${botResponse}</div>`;
      if (fileToSend) {
        botMessageContent += `<div class="file-icon">
            <img src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" alt="File Icon" width="20" height="20">
            <span>File processed</span>
        </div>`;
      }
      incomingMessageDiv.innerHTML = botMessageContent;
      incomingMessageDiv.classList.remove("thinking");
      
      await storeChatMessage(botResponse, "bot");
  
      userData.file = null; // Clear after use
    }, 100);
};
  
  const generateBotResponse = async (incomingMessageDiv, query = null, file = null, session_id,fileToSend) => {
    const messageElement = incomingMessageDiv.querySelector(".message-text");
    const userMessage = query || userData.message || "";
    messageElement.innerHTML = "";
   
    console.log(file)
  
    try {
      console.log("Starting bot response generation");
  
      const browserIdString = session_id || String(currentBrowserId);
      const cacheKey = `${userMessage}_${file ? file.name : "no-file"}_${browserIdString}`;
  
      const cachedResponse = localStorage.getItem(cacheKey);
      if (cachedResponse) {
        console.log("Using cached response");
      
        return cachedResponse;
      }
  
      // Build FormData object
      const formData = new FormData();
      formData.append("query", userMessage);
      formData.append("session_id", browserIdString);
  
      // Append file if it exists and is a File object
      if (file) {
        if (file instanceof File) {
          console.log(`Appending file: ${file.name}, type: ${file.type}, size: ${file.size} bytes`);
          formData.append("file", file, file.name);
        } 
        else if (file.data && file.mime_type) {
          // Convert base64 data to a Blob then to a File
          const binaryData = atob(file.data);
          const bytes = new Uint8Array(binaryData.length);
          for (let i = 0; i < binaryData.length; i++) {
            bytes[i] = binaryData.charCodeAt(i);
          }
          
          const blob = new Blob([bytes], { type: file.mime_type });
          const fileFromBlob = new File([blob], "document.pdf", { type: file.mime_type });
          
          console.log(`Appending converted file: type: ${fileFromBlob.type}, size: ${fileFromBlob.size} bytes`);
          formData.append("file", fileFromBlob);
        } else {
          console.log("File object has invalid format:", file);
        }
      } else {
        console.log("No file to append");
      }
  
      // Log FormData contents for debugging
      console.log("Sending FormData payload:", Object.fromEntries(formData.entries()));
  
      // Send request to API
      const apiResponse = await fetch("https://chatbot-mongo-db.vercel.app/chat", {
        method: "POST",
        body: formData,
      });
  
      if (!apiResponse.ok) {
        let errorMessage = apiResponse.statusText || "Unknown error";
        try {
          const errorData = await apiResponse.json();
          errorMessage = errorData.message || errorData.error || JSON.stringify(errorData);
        } catch (e) {
          console.warn("No JSON error response available");
        }
        throw new Error(`API Error (${apiResponse.status}): ${errorMessage}`);
      }
  
      const data = await apiResponse.json();
      console.log("Received API response:", data);
  
      var botResponseText = data.message || "Sorry, I don't understand that yet.";
      if (file && data.url) {
        botResponseText += ` File uploaded: ${data.url}`;
      }
  
      localStorage.setItem(cacheKey, botResponseText);
      console.log(botResponseText);
      botResponseText = botResponseText
            .replace(/(- Link$|\[Link\]\()/g, (_, match) => match === '- Link' ? '• LINK_PLACEHOLDER' : '')
            .replace(/https?:\/\/[^\s()]+(?:\([^\)]*\)|[^\s]*)*/g, url => `<a href="${url}" target="_blank" class="bot-link">[Link]</a>`)
            .replace(/(\n|^)[\s\u200B\u00A0]*-\s+|\n/g, match => match.includes('\n') ? '<br>' : '$1• ')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/• LINK_PLACEHOLDER/g, (_, index, fullText) => {
              const productName = fullText.match(/<strong>(.*?)<\/strong>/)?.[1] || "Product";
              return `• <a href="#" class="product-link">View ${productName}</a>`;
            });
      return botResponseText;
  
    } catch (error) {
      console.error("Error in generateBotResponse:", error);
      const errorMessage = `Sorry, there was an error: ${error.message}`;
      
      return errorMessage;
    }
  
  
  };
/**
 * Handles file upload
 */
const handleFileUpload = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  
  userData.file = file;
  
  // Update UI to show file has been uploaded
  fileUploadWrapper.classList.add("file-uploaded");
  const fileNameElement = document.createElement("div");
  fileNameElement.className = "file-name";
  fileNameElement.textContent = file.name;
  
  // Clear any previous file name element
  const existingFileName = fileUploadWrapper.querySelector(".file-name");
  if (existingFileName) {
    fileUploadWrapper.removeChild(existingFileName);
  }
  
  fileUploadWrapper.appendChild(fileNameElement);
  
  // Add remove button
  const removeButton = document.createElement("button");
  removeButton.className = "remove-file";
  removeButton.textContent = "×";
  removeButton.onclick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    clearFileUpload();
  };
  fileNameElement.appendChild(removeButton);
};

/**
 * Clears the file upload
 */
const clearFileUpload = () => {
  userData.file = null;
  fileInput.value = "";
  fileUploadWrapper.classList.remove("file-uploaded");
  const fileNameElement = fileUploadWrapper.querySelector(".file-name");
  if (fileNameElement) {
    fileUploadWrapper.removeChild(fileNameElement);
  }
};

/**
 * Initializes the chat application
 */
const initChat = () => {
  // Set up event listeners
  fileInput.addEventListener("change", handleFileUpload);
  sendButton.addEventListener("click", handleOutgoingMessage);
  messageInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      handleOutgoingMessage(e);
    }
  });
  
  // Load chat history
  loadChatHistory();
  
  console.log("Chat initialized");
};

/**
 * Loads chat history from storage
 */

    
    const resetChatHistory = async () => {
        const chatBody = document.querySelector(".chat-body");
        if (!chatBody) {
            console.error("Chat body container not found!");
            return;
        }
    
        // Show a confirmation popup
        const userConfirmed = confirm("Are you sure you want to reset the chat? This will delete all previous messages.");
    
        if (!userConfirmed) {
            console.log("Chat reset canceled.");
            return; // Stop execution if the user cancels
        }
    
        // Clear chat messages
        chatBody.innerHTML = "";
    
        // Delete chat history from Firestore
        await deleteChatHistory();
    
        // Add welcome message
        const welcomeMessage = `<div class="bot-avatar-wrapper">
          <img class="bot-avatar" src="https://cdn-icons-png.flaticon.com/512/3774/3774299.png" alt="Chatbot Logo" width="50" height="50">
          <span class="online-indicator"></span>
        </div>
        <div class="message-text">Tell me about your health concern! Would you like to upload your health reports for better recommendations or would you like to continue without health reports?</div>`;
    
        const welcomeMessageDiv = createMessageElement(welcomeMessage, "bot-message");
        chatBody.appendChild(welcomeMessageDiv);
    
        // Add quick replies
        const quickMessage = `<div class="quick-replies">
          <button class="quick-reply" onclick="sendQuickReply(' Contiune with report')">Contiune</button>
          <button class="quick-reply" onclick="sendQuickReply('Contiune without report')"> continue without reports?</button>
          <button class="quick-reply" onclick="sendQuickReply('Is this product organic and chemical-free?')">Is this product organic and chemical-free?</button>
        </div>`;
    
        const quickMessageDiv = document.createElement("div");
        quickMessageDiv.classList.add("bot-message");
        quickMessageDiv.innerHTML = quickMessage;
        chatBody.appendChild(quickMessageDiv);
    
        // Clear sessionStorage flag to reset first conversation state
        sessionStorage.removeItem('firstConversationDone');
        localStorage.removeItem('skipLoadingChatHistory');
    
        console.log("Chat display reset successfully. Chat history deleted from Firestore.");
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
      chatbotToggler.addEventListener("click", async () => {
        document.body.classList.toggle("show-chatbot");
        const userInfoForm = document.getElementById("user-info-form");
        const chatInterface = document.getElementById("chat-interface");
      
        if (document.body.classList.contains("show-chatbot")) {
          const isRegistered = await checkUserInfoSubmitted();
          if (isRegistered) {
            userInfoForm.style.display = "none";
            chatInterface.style.display = "block";
            loadChatHistory(); // Show chat interface if registered
          } else {
            userInfoForm.style.display = "block";
            chatInterface.style.display = "none"; // Show form if not registered
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