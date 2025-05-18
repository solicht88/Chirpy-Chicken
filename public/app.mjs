// Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { 
    getAuth, 
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
    AuthErrorCodes
} from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

import firebaseConfig from './firebaseConfig.mjs';

//import { getGeminiResponse } from '../';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// get elements from the DOM
const loginDiv = document.getElementById('login');
const appDiv = document.getElementById('application');

// login elements
const txtEmail = document.getElementById('txtEmail');
const txtPassword = document.getElementById('txtPassword');
const divLoginError = document.getElementById('divLoginError');
const loginErrorMessage = document.getElementById('loginErrorMessage');
const btnLogin = document.getElementById('btnLogin');
const btnSignup = document.getElementById('btnSignup');
const btnLogout = document.getElementById('btnLogout');

// chicken interactions
const chickenButton = document.getElementById('btnChicken');
const userInputTextarea = document.getElementById('userInput');
const sendButton = document.getElementById('btnSend');
const outputArea = document.getElementById('speechOutput');
let currentScenario = null;

// function to clear error messages
const clearErrors = () => {
    divLoginError.style.display = 'none';
    loginErrorMessage.textContent = '';
};

// message log
const chatLogButton = document.getElementById('btnChatLog');
const chatLogPopup = document.getElementById('chatLogPopup');
const closeChatLogButton = document.getElementById('closeChatLog');
const chatLogMessagesDiv = document.getElementById('chatLogMessages');

// store messages
const messageLog = [];

// cloud function URL
const GENERATE_TEXT_URL = "https://generatetext-4ynsnxomfq-uc.a.run.app";

// helper function to call cloud function
async function callGenerateText(prompt) {
    try {
        const response = await fetch(GENERATE_TEXT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt: prompt }),
        });
        const data = await response.json();
        if (data && data.result) {
            return data.result;
        } else if (data && data.error) {
            console.error("Error from Cloud Function:", data.error);
            return "The chicken is having trouble.";
        } else {
            return "No response from the chicken.";
        }
    } catch (error) {
        console.error("Error calling Cloud Function:", error);
        return "Network error with the chicken.";
    }
}

// add a message to log
function addMessageToLog(sender, text) {
  messageLog.push({ sender, text });
  updateChatLogDisplay();
}

// update the chat log display
function updateChatLogDisplay() {
  if (!chatLogMessagesDiv) return;
  if (messageLog.length > 6) {
      messageLog.splice(0, messageLog.length - 6); // keep only the last 6 messages
  }
  chatLogMessagesDiv.innerHTML = '';
  for (const msg of messageLog.slice().reverse()) { // reverse to show newest first
      const messageElement = document.createElement('p');
      messageElement.textContent = msg.text;
      if (msg.sender === 'user') {
          messageElement.classList.add('user-message');
      }
      chatLogMessagesDiv.appendChild(messageElement);
  }
}

// login function
btnLogin.addEventListener('click', (e) => {
    e.preventDefault();
    clearErrors();

    // get inputs
    const email = txtEmail.value;
    const password = txtPassword.value;

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // user signed in successfully
            const user = userCredential.user;
            console.log('User logged in:', user);
            // update to show logged-in state
            loginDiv.style.display = 'none';
            appDiv.style.display = 'block';
        })
        .catch((error) => {
            const errorCode = error.code;
            // display error message
            if (errorCode == AuthErrorCodes.invalidCredential) {
                loginErrorMessage.textContent = "Invalid password or email. Please try again.";
            }
            else {
                loginErrorMessage.textContent = `Error: ${error.message}`;
            }
            const errorMessage = error.message;
            console.error('Login error:', errorCode, errorMessage);
            divLoginError.style.display = 'block';
        });
});

// sign up function
btnSignup.addEventListener('click', (e) => {
    e.preventDefault();
    clearErrors();
    
    // get inputs
    const email = txtEmail.value;
    const password = txtPassword.value;

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // user signed up successfully
            const user = userCredential.user;
            console.log('User signed up:', user);
            // sign in the user immediately after signup
            return signInWithEmailAndPassword(auth, email, password);
        })
        .then((userCredential) => {
            // user signed in after signup
            const user = userCredential.user;
            console.log('User logged in after signup:', user);
            // update to show logged-in state
            loginDiv.style.display = 'none';
            appDiv.style.display = 'block';        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            // display error message
            if (errorCode == AuthErrorCodes.emailAlreadyInUse) {
                loginErrorMessage.textContent = "Email already in use.";
            }
            else {
                loginErrorMessage.textContent = `Error: ${error.message}`;
            }
            console.error('Signup error:', errorCode, errorMessage);
            divLoginError.style.display = 'block';
        });
});

// site state based on auth state
auth.onAuthStateChanged((user) => {
    if (user) {
        // signed in, show app
        console.log('Auth state changed: User is signed in:', user);
        loginDiv.style.display = 'none';
        appDiv.style.display = 'block';
    } else {
        // signed out, show login
        console.log('Auth state changed: User is signed out');
        loginDiv.style.display = 'block';
        appDiv.style.display = 'none';
    }
});

// logout button
if (btnLogout) {
    btnLogout.addEventListener('click', () => {
        signOut(auth)
            .then(() => {
                console.log('User signed out');
                // onAuthStateChanged listener updates to login page
            })
            .catch((error) => {
                console.error('Sign out error:', error);
            });
    });
}

// hey chicken! button
if (chickenButton) {
  chickenButton.addEventListener('click', async () => {
      if (outputArea) outputArea.textContent = 'Thinking...';
      try {
          // generate a random social scenario
          const scenario = await callGenerateText("Generate a very short, random social scenario where someone initiates a conversation or interaction and the reader must respond in some way.");
          if (outputArea) {
              // display the scenario
              outputArea.textContent = scenario;
              // add chicken's message to log
              addMessageToLog('chicken', `chicken: ${scenario}`);
          }
          // keep track of social scenario
          currentScenario = scenario;
          if (userInputTextarea) userInputTextarea.placeholder = "How would you respond?";
      } catch (error) {
          console.error("Error getting scenario:", error);
          if (outputArea) outputArea.textContent = 'Oops, the chicken is having a moment.';
      }
  });
}

// hey chicken! button (use callGenerateText)
if (chickenButton) {
    chickenButton.addEventListener('click', async () => {
        if (outputArea) outputArea.textContent = 'Thinking...';
        try {
            const scenario = await callGenerateText("Generate a very short, random social scenario where someone initiates a conversation or interaction and the reader must respond in some way.");
            if (outputArea) {
                outputArea.textContent = scenario;
                addMessageToLog('chicken', `chicken: ${scenario}`);
            }
            currentScenario = scenario;
            if (userInputTextarea) userInputTextarea.placeholder = "How would you respond?";
        } catch (error) {
            console.error("Error getting scenario:", error);
            if (outputArea) outputArea.textContent = 'Oops, the chicken is having a moment.';
        }
    });
}
// check user input and send to chicken
const inputForm = document.querySelector('#inputForm');
if (inputForm) {
    inputForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        // stop if user has entered nothing
        if (!userInputTextarea) return;
        // get user input, get rid of leading and running white space, clear the textarea
        const userResponse = userInputTextarea.value.trim();
        userInputTextarea.value = '';

        if (currentScenario && userResponse) {
            // review the given social scenario and give feedback
            if (outputArea) outputArea.textContent = 'Getting feedback...';
            // add user's response to log
            addMessageToLog('user', `user: ${userResponse}`);
            try {
                // get feedback from chicken
                const feedbackPrompt = `The following is a social scenario: ${currentScenario}. The user responded with: ${userResponse}. Provide brief feedback on the user's response in terms of social appropriateness and effectiveness.`;
                const feedback = await callGenerateText(feedbackPrompt);
                // display feedback
                if (outputArea) outputArea.innerHTML = `${feedback}`;
                currentScenario = null;
                userInputTextarea.placeholder = "Send a message to the chicken...";
            } catch (error) {
                // handle error
                console.error("Error getting feedback:", error);
                if (outputArea) outputArea.textContent = 'The chicken seems confused by your response.';
            }

        } else if (userResponse) {
            // send user's message to chicken
            if (outputArea) outputArea.textContent = 'Sending message...';
            // add user's message to log
            addMessageToLog('user', `user: ${userResponse}`);
            try {
                // get chicken's response
                const chickenResponse = await callGenerateText(userResponse);
                outputArea.innerHTML = `${chickenResponse}`;
                // add chicken's response to log
                addMessageToLog('chicken', `chicken: ${chickenResponse}`);
            } catch (error) { 
                console.error("Error sending message:", error);
                if (outputArea) outputArea.textContent = 'The chicken didn\'t quite understand that.';
            }

        } else {
            // user input is empty
            if (outputArea) outputArea.textContent = 'Please enter a message first!';
        }
    });
}

// chat log button
if (chatLogButton && chatLogPopup) {
  chatLogButton.addEventListener('click', () => {
      updateChatLogDisplay();
      chatLogPopup.style.display = 'block';
  });
}

// close chat log button
if (closeChatLogButton && chatLogPopup) {
  closeChatLogButton.addEventListener('click', () => {
      chatLogPopup.style.display = 'none';
  });
}