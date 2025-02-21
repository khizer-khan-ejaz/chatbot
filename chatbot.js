import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
import { getFirestore, collection, query, where, getDocs } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';

(function() {
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
      loadScript('https://cdn.jsdelivr.net/npm/emoji-mart@latest/dist/browser.js'),
    ]).then(() => {
      // Initialize Firebase
      const firebaseConfig = {
        apiKey: 'AIzaSyBz-gI6Pmwvsp09_Qp_Q6qS3ECxAfxsAC4',
        authDomain: 'chatbot-9ee0f.firebaseapp.com',
        projectId: 'chatbot-9ee0f',
        storageBucket: 'chatbot-9ee0f.firebasestorage.app',
        messagingSenderId: '127978721082',
        appId: '1:127978721082:web:6de1daa276b0fa12928a03',
        measurementId: 'G-BP73ZG0D4Z',
      };
  
      // Initialize Firebase app and get Firestore instance
      const app = initializeApp(firebaseConfig);
      const db = getFirestore(app);
  
      // Inject HTML structure for the chatbot
      const chatbotHTML = `
<button id="chatbot-toggler">
  <span class="material-symbols-rounded">mode_comment</span>
  <span class="material-symbols-rounded">close</span>
</button>

<div class="chatbot-popup">
  <div class="chat-header">
    <div class="header-info">
      <img class="chatbot-logo" src="robotic.png" alt="Chatbot Logo" width="50" height="50">
      <h2 class="logo-text">Chatbot</h2>
    </div>
    <button id="close-chatbot" class="material-symbols-rounded">keyboard_arrow_down</button>
  </div>

  <div class="chat-body" id="chat-body">
    <div class="message bot-message">
      <div class="bot-avatar-wrapper">
        <img class="bot-avatar" src="robotic.png" alt="Chatbot Logo" width="50" height="50">
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
    style.innerHTML =`
    /* Importing Google Fonts - Inter */
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
      gap: 10px;
      margin-top: 10px;
      flex-wrap: wrap;
     
    }
    .quick-reply {
      border:1px solid #039297;
      
      color: #039297;
      
      padding: 10px 15px;
      border-radius: 20px;
      cursor: pointer;
      font-size: 12px;
      transition: background-color 0.3s;
    }
    .quick-reply:hover {
      background-color: #0056b3;
    }
    .message-time {
      font-size: 12px;
      color: gray;
      margin-top: 5px;
      text-align: left;
    }
#chatbot-toggler {
  position: fixed;
  bottom: 30px;
  right: 35px;
  border: none;
  height: 50px;
  width: 50px;
  display: flex;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #00abb1;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
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
}.bot-avatar-wrapper {
  position: relative;
  display: inline-block;
}

.online-indicator {
  display: block;
  width: 12px;
  height: 12px;
  background-color: #4caf50; /* Green color for online status */
  border-radius: 50%;
  border: 2px solid #fff; /* White border to make it stand out */
  position: absolute;
  bottom: 0;
  right: 0;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.2); /* Optional: Add a subtle shadow */
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
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
  bottom: 90px;
  width: 420px;
  overflow: hidden;
  background: #ececec;
  border-radius: 15px;
  opacity: 0;
  pointer-events: none;
  transform: scale(0.2);
  transform-origin: bottom right;
  box-shadow: 0 0 128px 0 rgba(0, 0, 0, 0.1),
    0 32px 64px -48px rgba(0, 0, 0, 0.5);
  transition: all 0.1s ease;
}

body.show-chatbot .chatbot-popup {
  opacity: 1;
  pointer-events: auto;
  transform: scale(1);
}

.chat-header {
  display: flex;
  align-items: center;
  padding: 15px 22px;
  background: #00abb1;
  justify-content: space-between;
}

.chat-header .header-info {
  display: flex;
  gap: 10px;
  align-items: center;
}

.header-info .chatbot-logo {
  width: 35px;
  height: 35px;
  padding: 6px;
  fill: #00abb1;
  flex-shrink: 0;
  background: #fff;
  border-radius: 50%;
}

.header-info .logo-text {
  color: #fff;
  font-weight: 600;
  font-size: 1.31rem;
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

.chat-header #close-chatbot:hover {
  background: #005f63;
}   

.chat-body {
  padding: 25px 22px;
  gap: 20px;
  display: flex;
  height: 420px;
  overflow-y: auto;
  margin-bottom: 42px;
  flex-direction: column;
  scrollbar-width: thin;
  scrollbar-color: #b9fdff transparent;
}

.chat-body,
.chat-form .message-input:hover {
  scrollbar-color: #b9fdff transparent;
}

.chat-body .message {
  display: flex;
  gap: 11px;
  align-items: center;
}

.chat-body .message .bot-avatar {
  width: 35px;
  height: 35px;
  padding: 6px;
  fill: #fff;
  flex-shrink: 0;
  margin-bottom: 2px;
  align-self: flex-end;
  border-radius: 50%;
  background: #ffba6a;
}

.chat-body .message .message-text {
  padding: 12px 16px;
  max-width: 75%;
  font-size: 0.95rem;
}

.chat-body .bot-message.thinking .message-text {
  padding: 2px 16px;
}

.chat-body .bot-message .message-text {
  background: #fffdfd;
  border-radius: 13px 13px 13px 3px;
  margin-bottom: 30px;
}

.chat-body .user-message {
  flex-direction: column;
  align-items: flex-end;
}

.chat-body .user-message .message-text {
  color: #fff;
  background: #00abb1;
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
  background: #00abb1;
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
  outline: 2px solid #00abb1;
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
  color: #00abb1;
  border-radius: 50%;
  font-size: 1.15rem;
  background: none;
  transition: 0.2s ease;
}

.chat-form .chat-controls button:hover,
body.show-emoji-picker .chat-controls #emoji-picker {
  color: #00abb1;
  background: #f1f1ff;
}

.chat-form .chat-controls #send-message {
  color: #fff;
  display: none;
  background: #00abb1;
}

.chat-form .chat-controls #send-message:hover {
  background: #00abb1;
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
    
    
    `

    
    document.head.appendChild(style);
      // Inject chatbot HTML into the body
      const chatbotContainer = document.createElement('div');
      chatbotContainer.innerHTML = chatbotHTML;
      document.body.appendChild(chatbotContainer);
  
      // Cache DOM elements
      const chatBody = document.querySelector(".chat-body");
      const messageInput = document.querySelector(".message-input");
      const sendMessage = document.querySelector("#send-message");
      const fileInput = document.querySelector("#file-input");
      const fileUploadWrapper = document.querySelector(".file-upload-wrapper");
      const fileCancelButton = fileUploadWrapper.querySelector("#file-cancel");
      const chatbotToggler = document.querySelector("#chatbot-toggler");
      const closeChatbot = document.querySelector("#close-chatbot");
  

      // Initialize user message and file data

      const userData = {
        message: null,
        file: {
          data: null,
          mime_type: null,
        },
      };
  
      // Store chat history
      const chatHistory = [];
      const initialInputHeight = messageInput.scrollHeight;
  
      // Create message element with dynamic classes and return it
      const createMessageElement = (content, ...classes) => {
        const div = document.createElement("div");
        div.classList.add("message", ...classes);
        div.innerHTML = content;
        return div;
      };
  
      // Generate bot response using API
      const generateBotResponse = async (incomingMessageDiv) => {
        const messageElement = incomingMessageDiv.querySelector(".message-text");
        
        // Show typing effect for the bot
        messageElement.innerHTML = `<span class="dot"></span><span class="dot"></span><span class="dot"></span>`;
  
        const userMessage = userData.message.toLowerCase();
  
        try {
          // Query Firestore for a response
          const botQuery = query(
            collection(db, "bot_responses"),
            where("question", "==", userMessage)
          );
          const querySnapshot = await getDocs(botQuery);
  
          let botResponseText = "Sorry, I don't understand that yet.";
  
          querySnapshot.forEach((doc) => {
            botResponseText = doc.data().response;
          });
  
          // Display bot's response
          await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate typing delay
          messageElement.innerText = botResponseText;
  
        } catch (error) {
          console.error("Error fetching bot response:", error);
          messageElement.innerText = "Error fetching response";
          messageElement.style.color = "#ff0000";
        } finally {
          incomingMessageDiv.classList.remove("thinking");
          chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
        }
      };
  
      // Handle outgoing user messages
      const handleOutgoingMessage = (e) => {
        e.preventDefault();
        userData.message = messageInput.value.trim();
        messageInput.value = "";
        messageInput.dispatchEvent(new Event("input"));
        fileUploadWrapper.classList.remove("file-uploaded");
      
        if (!userData.message) return;
      
        // Create and display user message
        const messageContent = `<div class="message-text"></div>
                                ${userData.file.data ? `<img src="data:${userData.file.mime_type};base64,${userData.file.data}" class="attachment" />` : ""}`;
      
        const outgoingMessageDiv = createMessageElement(messageContent, "user-message");
        outgoingMessageDiv.querySelector(".message-text").innerText = userData.message;
        chatBody.appendChild(outgoingMessageDiv);
        chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
      
        // Simulate bot response with thinking indicator
        setTimeout(() => {
          const messageContent = `<div class="bot-avatar-wrapper">
                    <img class="bot-avatar" src="robotic.png" alt="Chatbot Logo" width="50" height="50">
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
          generateBotResponse(incomingMessageDiv);
        }, 600);
      };
      
      // Ensure the send button also triggers the form submission
      sendMessage.addEventListener("click", (e) => {
        document.querySelector(".chat-form").dispatchEvent(new Event("submit"));
      });
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
  
      // Event listeners
      sendMessage.addEventListener("click", (e) => handleOutgoingMessage(e));
      document.querySelector("#file-upload").addEventListener("click", () => fileInput.click());
      closeChatbot.addEventListener("click", () => document.body.classList.remove("show-chatbot"));
      chatbotToggler.addEventListener("click", () => document.body.classList.toggle("show-chatbot"));
  
      // Quick reply function
      window.sendQuickReply = function(message) {
        messageInput.value = message;
        sendMessage.click();
      };
  
      // Update message time
      function updateMessageTime() {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        document.getElementById('bot-message-time').innerText = `${hours}:${minutes}`;
      }
  
      // Initialize message time
      updateMessageTime();
  
      // Add message input event listener for auto-resize
      messageInput.addEventListener("input", () => {
        messageInput.style.height = `${initialInputHeight}px`;
        messageInput.style.height = `${messageInput.scrollHeight}px`;
        document.querySelector(".chat-form").style.borderRadius = 
          messageInput.scrollHeight > initialInputHeight ? "15px" : "32px";
      });
  
      // File input change handler
      fileInput.addEventListener("change", () => {
        const file = fileInput.files[0];
        if (!file) return;
  
        const reader = new FileReader();
        reader.onload = (e) => {
          fileInput.value = "";
          fileUploadWrapper.querySelector("img").src = e.target.result;
          fileUploadWrapper.classList.add("file-uploaded");
          const base64String = e.target.result.split(",")[1];
  
          userData.file = {
            data: base64String,
            mime_type: file.type,
          };
        };
  
        reader.readAsDataURL(file);
      });
  
      // File cancel button handler
      fileCancelButton.addEventListener("click", () => {
        userData.file = {};
        fileUploadWrapper.classList.remove("file-uploaded");
      });
  
    }).catch(error => {
      console.error('Error loading scripts:', error);
    });
  })();