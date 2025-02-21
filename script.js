import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
import { getFirestore, collection, addDoc, query, where, getDocs, serverTimestamp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';

// Firebase config
const firebaseConfig = {
  apiKey: 'AIzaSyBz-gI6Pmwvsp09_Qp_Q6qS3ECxAfxsAC4',
  authDomain: 'chatbot-9ee0f.firebaseapp.com',
  projectId: 'chatbot-9ee0f',
  storageBucket: 'chatbot-9ee0f.firebasestorage.app',
  messagingSenderId: '127978721082',
  appId: '1:127978721082:web:6de1daa276b0fa12928a03',
  measurementId: 'G-BP73ZG0D4Z',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const chatBody = document.querySelector(".chat-body");
const messageInput = document.querySelector(".message-input");
const sendMessage = document.querySelector("#send-message");
const fileInput = document.querySelector("#file-input");
const fileUploadWrapper = document.querySelector(".file-upload-wrapper");
const fileCancelButton = fileUploadWrapper.querySelector("#file-cancel");
const chatbotToggler = document.querySelector("#chatbot-toggler");
const closeChatbot = document.querySelector("#close-chatbot");

// API setup

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

function sendQuickReply(message) {
  document.querySelector('.message-input').value = message;
  document.querySelector('#send-message').click();
}

function updateMessageTime() {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  document.getElementById('bot-message-time').innerText = `${hours}:${minutes}`;
}

window.onload = updateMessageTime;
// Adjust input field height dynamically
// Adjust input field height dynamically
messageInput.addEventListener("input", () => {
  messageInput.style.height = `${initialInputHeight}px`;
  messageInput.style.height = `${messageInput.scrollHeight}px`;
  document.querySelector(".chat-form").style.borderRadius = messageInput.scrollHeight > initialInputHeight ? "15px" : "32px";
});


// Handle Enter key press
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
          <span class="online-indicator"></span> <!-- Online icon -->
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

// Ensure the send button also triggers the handleOutgoingMessage function
sendMessage.addEventListener("click", (e) => handleOutgoingMessage(e));

// Handle file input change and preview the selected file
fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    fileInput.value = "";
    fileUploadWrapper.querySelector("img").src = e.target.result;
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

// Initialize emoji picker and handle emoji selection
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

sendMessage.addEventListener("click", (e) => handleOutgoingMessage(e));
document.querySelector("#file-upload").addEventListener("click", () => fileInput.click());
closeChatbot.addEventListener("click", () => document.body.classList.remove("show-chatbot"));
chatbotToggler.addEventListener("click", () => document.body.classList.toggle("show-chatbot"));
