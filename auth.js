import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  getDatabase,
  ref,
  push,
  onChildAdded,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDoDyA9nJTif6i0XB7Gdl7cy7LHOtWmHVE",
  authDomain: "wapchat-01.firebaseapp.com",
  databaseURL: "https://wapchat-01-default-rtdb.firebaseio.com",
  projectId: "wapchat-01",
  storageBucket: "wapchat-01.appspot.com",
  messagingSenderId: "1089364408564",
  appId: "1:1089364408564:web:e0b262400dc6f2dfcd06a1",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const provider = new GoogleAuthProvider();

const auth = getAuth(app);
const db = getDatabase(app);

document.addEventListener("DOMContentLoaded", () => {
  // Initialize AOS
  AOS.init();

  const signInGoogleButton = document.getElementById("signin-google-button");
  const signInEmailButton = document.getElementById("signin-email-button");
  const signOutButton = document.getElementById("signout-button");
  const profileButton = document.getElementById("profile-button");
  const welcome = document.querySelector(".welcome");
  const chatContainer = document.querySelector(".chat-container");

  signInGoogleButton.addEventListener("click", () => {
    signInWithGoogle();
  });
  
  signInEmailButton.addEventListener("click", () => {
    signInWithGoogle();
  });

  signOutButton.addEventListener("click", () => {
    signOutUser();
  });

  // check the authentication state of the user
  auth.onAuthStateChanged((user) => {
    // check if user is logged in
    if (user) {
      welcome.className = "d-none";
      chatContainer.className = "d-block";
      displayChat(user);
      getMessage();
    } else {
      chatContainer.className = "d-none";
    }
  });
});

// function to signup /signin using google
async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    console.log(user);
  } catch (error) {
    // Handle Errors here.
    console.error(error.code, error.message);
  }
}

// createUserWithEmailAndPassword(auth, email, password)
//   .then((userCredential) => {
//     // Signed up 
//     const user = userCredential.user;
//     // ...
//   })
//   .catch((error) => {
//     const errorCode = error.code;
//     const errorMessage = error.message;
//     // ..
//   });
function signOutUser() {
  signOut(auth)
    .then(() => {
      console.log("Sign-out successful");

      // Check if the elements exist in the document
      const welcome = document.querySelector(".welcome");
      const chatContainer = document.querySelector(".chat-container");

      if (welcome && chatContainer) {
        // Set the display property directly
        welcome.style.display = "block";
        chatContainer.style.display = "none";
      } else {
        console.error("Welcome or chatContainer element not found.");
      }
    })
    .catch((error) => {
      // Handle errors here.
      console.error(error);
    });
}



// Arrow Function to display chat content
const displayChat = (user) => {
  const chatContent = document.querySelector(".chat-content");
  if (chatContent) {
    chatContent.innerHTML = `
      <div class="container mt-5">
        <div class="row">
          <div class="col-md-12">
            <div class="card">
              <div class="card-header">
                <a href="javascript:void(0)" class="view-profile text-decoration-none">
                  <img src="${user.photoURL}" alt="User Photo" class="rounded-circle img-thumbnail img-fluid"> Group Chat
                  </a>
              </div>
              <div class="card-body bg-secondary">
                <div class="messages" id="messages">
                  <!-- Messages will be displayed here -->
                </div>
              </div>
              <form class="send-message">
                <div class="input-group my-3 px-3">
                  <input type="text" class="form-control" placeholder="Type your message" id="message">
                  <button type="submit" class="btn-submit btn btn-primary">Send</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>`;
  }
};

// function to get the messages
const getMessage = () => {
  const messageInput = document.getElementById("message");
  const messages = document.getElementById("messages");

  // Reference to the "messages" node in the database
  const messagesRef = ref(db, "messages");

  // listen for changes in the database
  onChildAdded(messagesRef, (snapshot) => {
    const messageData = snapshot.val();
    const userName = messageData.userName;
    const messageText = messageData.message;

    // display the message with user name
    displayMessage(userName, messageText);

    // Scroll to the last message
    messages.scrollTop = messages.scrollHeight;
  });

  document.querySelector(".send-message").addEventListener("submit", (event) => {
    event.preventDefault();

    //get message value
    const message = messageInput.value;

    // Get the current user
    const user = auth.currentUser;

    // Check if the user is signed in
    if (user) {
      // if meassage is not null
      if (message != "") {
        // Save the message to the database
        saveMessage(user.displayName, message);
      } else {
        console.log("Invalid Input");
      }
    }

    // Clear the message input field
    messageInput.value = "";
  });
};

// Function to display user messages
const displayMessage = (userName, message) => {
  const messages = document.getElementById("messages");
  const messageElement = document.createElement("div");
  if (userName === auth.currentUser.displayName) {
    // Message from the current user
    messageElement.className = "alert alert-success";
  } else {
    // Message from other users
    messageElement.className = "alert alert-primary";
  }
  messageElement.innerHTML = `<strong>${userName}:</strong> ${message}`;
  messages.appendChild(messageElement);
  messageElement.scrollIntoView({ behavior: "smooth", block: "end" });
};

const saveMessage = (userName, message) => {
  // Push a new message to the "messages" node in the database
  const messagesRef = ref(db, "messages");
  push(messagesRef, {
    userName: userName,
    message: message,
  });
};

// const getAllUserNames = () => {
//   // Add this code in your script to initialize the database reference
//   const usersRef = ref(db, "users");

//   onChildAdded(usersRef, (snapshot) => {
//     const userData = snapshot.val();
//     const userName = userData.displayName;
//     console.log(userName);
//     // You can store the user names in an array or use them as needed
//   });

//   const user = auth.currentUser;
//   saveUser(user.displayName)
// };

// const saveUser = (userName) => {
//   // Push a new message to the "messages" node in the database
//   const usersRef = ref(db, "users");
//   push(usersRef, {
//     userName: userName,
//   });
// };
