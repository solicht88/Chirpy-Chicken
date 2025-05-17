// Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-app.js";
import { 
    getAuth, 
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
    AuthErrorCodes
} from "https://www.gstatic.com/firebasejs/11.7.1/firebase-auth.js";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

import { firebaseConfig } from './firebaseConfig.js';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const loginDiv = document.getElementById('login');
const appDiv = document.getElementById('app');
const txtEmail = document.getElementById('txtEmail');
const txtPassword = document.getElementById('txtPassword');
const divLoginError = document.getElementById('divLoginError');
const loginErrorMessage = document.getElementById('loginErrorMessage');
const btnLogin = document.getElementById('btnLogin');
const btnSignup = document.getElementById('btnSignup');
//const lblAuthState = document.getElementById('lblAuthState');
const btnLogout = document.getElementById('btnLogout');

// function to clear error messages
const clearErrors = () => {
    divLoginError.style.display = 'none';
    loginErrorMessage.textContent = '';
};

// login function
btnLogin.addEventListener('click', (e) => {
    e.preventDefault();
    clearErrors();

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
            //lblAuthState.textContent = `Logged in as: ${user.email}`;
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

    const email = txtEmail.value;
    const password = txtPassword.value;

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // User signed up successfully
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
            appDiv.style.display = 'block';
            //lblAuthState.textContent = `Logged in as: ${user.email}`;
        })
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

auth.onAuthStateChanged((user) => {
    if (user) {
        console.log('Auth state changed: User is signed in:', user);
        loginDiv.style.display = 'none';
        appDiv.style.display = 'block';
        //lblAuthState.textContent = `Logged in as: ${user.email}`;
    } else {
        console.log('Auth state changed: User is signed out');
        loginDiv.style.display = 'block';
        appDiv.style.display = 'none';
    }
});

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