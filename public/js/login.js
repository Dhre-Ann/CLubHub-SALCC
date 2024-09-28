import { firebaseApp, database } from './firebaseConfig';
import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc, getDocs, onSnapshot, writeBatch, deleteDoc } from 'firebase/firestore';
import { updateDashboard } from './dashboard';

export const auth = getAuth(firebaseApp);
const provider = new GoogleAuthProvider();

// Declaring user variables
let user;
let userEmail;
let userDispName;
let userPic;
export let username;

//sign in with google
function signInWithGoogle() {
    signInWithPopup(auth, provider)
        .then(async (result) => {
            console.log('result: ',result);
            console.log('user',result.user);
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const token = credential.accessToken;
            

            // The signed-in user info
            user = result.user;
            
            
            // Verification to make sure its a salcc user
            userEmail = user.email;

            //creating username from email
            let emailArr = userEmail.split("@");
            username = emailArr[0];

            if (userEmail.includes('@apps.salcc.edu.lc')) {
                // call function to create/update user doc
                await createUserDoc(user);

                // Check if there is a stored target URL
                const targetUrl = sessionStorage.getItem('targetUrl');
                if (targetUrl) {
                    console.log("There is a target URL: ", targetUrl);
                    // Redirect to the originally requested page
                    window.location.href = (targetUrl);

                    // Clear the stored target URL
                    sessionStorage.removeItem('targetUrl');
                } else {
                    // redirect to dashboard
                    console.log("There is no target URL, goin to dashboard");;
                    window.location.href = ('../pages/dashboard.html');
                    console.log("at dashboard");
                }                 
                
                
                setSessionExpiry();

            } else {
                console.log("Sign out function called from google login");
                // signOutFunction();
                alert("You cannot access this platform without a valid Sir Arthur Lewis Community College email address.");
            }
        }).catch((error) => {
            // const errorMessage = error.message;
            // console.log("Error: ", errorMessage);
            // Log the entire error object for further investigation
            console.error("Error object: ", error);
            
            // Check if the error object has a 'message' property
            const errorMessage = error.message || "An unknown error occurred";
            console.log("Error: ", errorMessage);
        });
}


// Function to create a document for user on first login
async function createUserDoc(user) {

    // getting values from user object
    const displayName = user.displayName;
    let nameArr = displayName.split(" ");
    let firstName = nameArr[0];
    let lastName = nameArr[1];

    //getting time
    const today = new Date();
    let formattedDate = today.toISOString().split('T')[0] + " at " + today.getHours() + ":"
        + today.getMinutes() + ":" + today.getSeconds();
    console.log("today: ", formattedDate);

    //check if user has a document
    const docRef = doc(database, "Students", username);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        //update last login time if it does exist
        await setDoc(docRef, {
            lastLogin: formattedDate
        },
            { merge: true });

        console.log("Document updated successfully.");
    } else {
        //document does not exist, create document
        try {
            await setDoc(doc(database, "Students", username), {
                displayName: displayName,
                email: userEmail,
                firstName: firstName,
                lastName: lastName,
                status: "member",
                clubCount: 0,
                clubs: [],
                lastLogin: formattedDate
            });
            console.log("Document successfully written.");
            // Send email to welcome new user
            const subject = "Welcome to ClubHub!";
            const messageBody = `<h4>Dear ${firstName},</h4><br><p>Welcome to ClubHub!</p><p>Your one-stop-shop for all of your extra-curricular needs at SALCC!</p><p>It time to Find Where <b>You</b> Fit In!</p><br><p>Kind regards,</p><p>ClubHub</p>`;
            await sendNewEmail(subject, messageBody, userEmail);
        } catch (error) {
            console.error("Error writing document: ", error);
        }
    }
}




//logout function
function signOutFunction() {
    console.log("I am signing out from main");
    signOut(auth).then(() => {
        // Sign-out successful.
        console.log("Sign out successfull");
        // Clear session data
        
        localStorage.removeItem('expiryTimestamp');
        // sessionStorage.removeItem('clubName');

        const signInBtn = document.querySelector("#login-logout-btn-dropdown-menu");
    if (signInBtn) {
        if (signInBtn.classList.contains('out')){
            signInBtn.classList.remove('out');
        }
        signInBtn.innerHTML = ``;
        signInBtn.innerHTML = `LOGIN`;
    }
    const signInBtn2 = document.querySelector("#login-logout-btn");
    if (signInBtn2) {
        if (signInBtn2.classList.contains('out')){
            signInBtn2.classList.remove('out');
        }
        signInBtn2.innerHTML = ``;
        signInBtn2.innerHTML = `LOGIN`;
    }

        // Redirect to Login page
        window.location.replace("/public/index.html");
        console.log("User has been signed out from function");
        // history.replaceState(null, '', '/');
    }).catch((error) => {
        console.log(error);
    });

}
function signOutFunctionSub() {
    console.log("I am signing out from sub");
    signOut(auth).then(() => {
        // Sign-out successful.
        console.log("Sign out successfull");
        // Clear session data
        
        localStorage.removeItem('expiryTimestamp');
        sessionStorage.removeItem('clubName');

        const signInBtn = document.querySelector("#login-logout-btn-dropdown-menu");
    if (signInBtn) {
        if (signInBtn.classList.contains('out-sub')){
            signInBtn.classList.remove('out-sub');
        }
        signInBtn.innerHTML = ``;
        signInBtn.innerHTML = `LOGIN`;
    }
    const signInBtn2 = document.querySelector("#login-logout-btn");
    if (signInBtn2) {
        if (signInBtn2.classList.contains('out-sub')){
            signInBtn2.classList.remove('out-sub');
        }
        signInBtn2.innerHTML = ``;
        signInBtn2.innerHTML = `LOGIN`;
    }

        // Redirect to Login page
        window.location.replace("../index.html");
        console.log("User has been signed out from function");
        // history.replaceState(null, '', '/');
    }).catch((error) => {
        console.log(error);
    });

}








// Function that changes button when user attempts to login
function changeLogoutToLogin(){
    console.log("There is no user here! From the function to try to change button to login");
    const signInBtn = document.querySelector("#login-logout-btn-dropdown-menu");
    if (signInBtn) {
        if (signInBtn.classList.contains('out')){
            signInBtn.classList.remove('out');
        }
        if (!signInBtn.classList.contains('in')){
            signInBtn.classList.add('in');
        }
        signInBtn.innerHTML = ``;
        signInBtn.innerHTML = `LOGIN`;
        signInBtn.addEventListener("click", ()=>{
            console.log("Sign in button clicked, log in");
            window.location.replace('/public/index.html');
        });
    }
    const signInBtn2 = document.querySelector("#login-logout-btn");
    if (signInBtn2) {
        if (signInBtn2.classList.contains('out')){
            signInBtn2.classList.remove('out');
        }
        if (!signInBtn2.classList.contains('in')){
            signInBtn2.classList.add('in');
        }
        signInBtn2.innerHTML = ``;
        signInBtn2.innerHTML = `LOGIN`;
        signInBtn2.addEventListener("click", ()=>{
            console.log("Sign in button clicked, log in");
            window.location.replace('../auth/login.html');
        });
    }
}

// Function that changes button when user attempts to login
function changeLogoutToLoginSub(){
    console.log("There is no user here! From the function to try to change button to login");
    const signInBtn = document.querySelector("#login-logout-btn-dropdown-menu");
    if (signInBtn) {
        if (signInBtn.classList.contains('out-sub')){
            signInBtn.classList.remove('out-sub');
        }
        if (!signInBtn.classList.contains('in-sub')){
            signInBtn.classList.add('in-sub');
        }
        signInBtn.innerHTML = ``;
        signInBtn.innerHTML = `LOGIN`;
        signInBtn.addEventListener("click", ()=>{
            console.log("Sign in button clicked, log in");
            window.location.replace('/public/index.html');
        });
    }
    const signInBtn2 = document.querySelector("#login-logout-btn");
    if (signInBtn2) {
        if (signInBtn2.classList.contains('out-sub')){
            signInBtn2.classList.remove('out-sub');
        }
        if (!signInBtn2.classList.contains('in-sub')){
            signInBtn2.classList.add('in-sub');
        }
        signInBtn2.innerHTML = ``;
        signInBtn2.innerHTML = `LOGIN`;
        signInBtn2.addEventListener("click", ()=>{
            console.log("Sign in button clicked, log in");
            window.location.replace('../auth/login.html');
        });
    }
}

// Function that changes button when user attempts to logout
function changeLoginToLogout(){
    const signOutBtn = document.querySelector("#login-logout-btn-dropdown-menu");
    if (signOutBtn) {
        if (!signOutBtn.classList.contains('out')){
            signOutBtn.classList.add('out');
        }
        if (signOutBtn.classList.contains('in')){
            signOutBtn.classList.remove('in');
        }
        signOutBtn.innerHTML = ``;
        signOutBtn.innerHTML = `LOGOUT`;
        signOutBtn.addEventListener("click", signOutFunction);
        console.log("login changed to logout main1");
    }
    const signOutBtn2 = document.querySelector("#login-logout-btn");
    if (signOutBtn2) {
        if (!signOutBtn2.classList.contains('out')){
            signOutBtn2.classList.add('out');
        }
        if (signOutBtn2.classList.contains('in')){
            signOutBtn2.classList.remove('in');
        }
        signOutBtn2.innerHTML = ``;
        signOutBtn2.innerHTML = `LOGOUT`;
        signOutBtn2.addEventListener("click", ()=>{
            console.log("main logout button clicked, signing out");
            signOutFunction();
        });
        console.log("login changed to logout main2");
    }
}

// For super nested pages?
function changeLoginToLogoutSub(){
    const signOutBtn = document.querySelector("#login-logout-btn-dropdown-menu");
    if (signOutBtn) {
        if (!signOutBtn.classList.contains('out-sub')){
            signOutBtn.classList.add('out-sub');
        }
        if (signOutBtn.classList.contains('in-sub')){
            signOutBtn.classList.remove('in-sub');
        }
        signOutBtn.innerHTML = ``;
        signOutBtn.innerHTML = `LOGOUT`;
        signOutBtn.addEventListener("click", signOutFunctionSub);
        console.log("login changed to logout sub1");
    }
    const signOutBtn2 = document.querySelector("#login-logout-btn");
    if (signOutBtn2) {
        if (!signOutBtn2.classList.contains('out-sub')){
            signOutBtn2.classList.add('out-sub');
        }
        if (signOutBtn2.classList.contains('in-sub')){
            signOutBtn2.classList.remove('in-sub');
        }
        signOutBtn2.innerHTML = ``;
        signOutBtn2.innerHTML = `LOGOUT`;
        signOutBtn2.addEventListener("click", ()=>{
            console.log("sub logout button clicked, signing out");
            signOutFunctionSub();
        });
        console.log("login changed to logout sub2");
    }
}


// C A L L I N G    F U N C T I O N S
//call google login function
const googleLoginbtn = document.getElementById('google');
if (googleLoginbtn) {
    googleLoginbtn.addEventListener("click", signInWithGoogle);
}

// Call sign out on signout btn
const signOutBtn = document.querySelector(".out");
if (signOutBtn){
    signOutBtn.addEventListener('click', ()=>{
        console.log("About to sign out from button");
        signOutFunction;
    });
}

// Call sign in on signin btn
const signInBtn = document.querySelector(".in");
if (signInBtn){
    signInBtn.addEventListener('click', ()=> {
        console.log("Redirecting to login");
        window.location.replace('../auth/login.html');
    });
}
const nestedSignInBtn = document.querySelector(".in-sub");
if (nestedSignInBtn){
    nestedSignInBtn.addEventListener('click', ()=> {
        console.log("Redirecting to login");
        window.location.replace('../../auth/login.html');
    });
}



// Function to get club displayname from database
export async function getClubName(clubName) {
    const docRef = doc(database, "Clubs", clubName);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        //store status
        const clubDisplayName = docSnap.data().name;
        console.log("Club name: " + clubDisplayName);
        return clubDisplayName;
    } else {
        console.log("Document does not exist");
    }
}

export function storeClubName(clubName) {
    sessionStorage.setItem('clubName', clubName);
}

// Function to retrieve club name from sessionStorage
export function getStoredClubName() {
    return sessionStorage.getItem('clubName');
}



//Update dashboard on dom
document.addEventListener('DOMContentLoaded', async function () {
    //function to update according to user
    user = auth.currentUser;
    
    function updateUserProfile(user) {
        if (user) {
            // User is signed in
            console.log("User is signed in, updating user profile");
            console.log("User object: ", user);
    
            userDispName = user.displayName || 'Unknown';
            userEmail = user.email || 'N/A';
            userPic = user.photoURL || 'default-profile-picture.jpg';
    
            console.log("User email: ", userEmail);
            console.log("User Display name: ", userDispName);
            console.log("Image url", userPic);
    
            //updating DOM elements with user data
            const usernameElement = document.querySelector("#username");
            if (usernameElement) {
                usernameElement.innerHTML = `Hello ${userDispName}`;
            }
    
            const profilePicElement = document.querySelector("#profile-pic");
            if (profilePicElement) {
                profilePicElement.src = userPic;
            }
    
            //creating username
            let emailArr = userEmail.split("@");
            username = emailArr[0];
    
            //updating dashboard with users clubs
            updateDashboard(username);
    
        } else {
            // No user is signed in
            console.log("No user is signed in.");
            console.log("Cannot update user profile");
            // changing logout to login
            changeLogoutToLogin();
            changeLogoutToLoginSub();
        }
    }
    
    // Listen for changes in authentication state
    onAuthStateChanged(auth, (userData) => {
        console.log("Auth state is changed.");
        user = userData;
        if (user){
            console.log("USer logged in data: ", user);
            console.log("Last check: User is present");
            setTimeout(() => {
                updateUserProfile(user);
                // change login buttons to logout ones
                console.log("auth state has changed");
                console.log("Changing login to logout");
                changeLoginToLogout();
                changeLoginToLogoutSub();
            }, 2000);
        }else {
            console.log("Last check: No user", user);
            console.log("User logged out data:");
        }
              
    });

    
    // Function to handle nav link redirects
    function handleRedirectLinkClickMain(event) {
        // Check if user is signed in
        if (!user) {
            // No user is signed in, prevent default nav behaviour
            event.preventDefault();

            // Store the target URL for later redirect
            if (this.href){
                const targetUrl = this.href.substring(this.href.indexOf('Club-Hub/') + 'Club-Hub/'.length);
                console.log("Target URL: ", targetUrl);
                sessionStorage.setItem('targetUrl', targetUrl);

                //Redirect to login
                window.location.href = "./auth/login.html";
            }
        }
    }

    // Get links that require same behaviour
    const links = document.querySelectorAll(".auth-required-link-main");
    links.forEach(function (link) {
        link.addEventListener('click', handleRedirectLinkClickMain);
    });

    // Event listener on join club buttons for auth required
    const joinClubButtons = document.querySelectorAll(".join-club-button");
    joinClubButtons.forEach(function (button){
        button.addEventListener('click', ()=>{
            console.log("Join button clicked, event listener triggered");
            handleRedirectLinkClickMainSubBtn();
        });
    });

    function handleRedirectLinkClickMainSubBtn(){
        console.log("Button event listener triggered");

        // Check if user is signed in
        if (!user) {

            // Store the target URL for later redirect   
            const url = getClubNameFromURL(); 
            const targetUrl = `clubs/${getStoredClubName()}.html`;                              
            
            console.log("Target URL: ", targetUrl);
            sessionStorage.setItem('targetUrl', targetUrl);

            //Redirect to login
            window.location.href = "../login.html";
        }          
    }

    // Function to handle nav link redirects
    function handleRedirectLinkClickMainSub(event) {
        // Check if user is signed in
        if (!user) {
            // No user is signed in, prevent default nav behaviour
            event.preventDefault();         

            // Store the target URL for later redirect                                  
            const targetUrl = this.href.substring(this.href.indexOf('Club-Hub/') + 'Club-Hub/'.length);
            console.log("Target URL: ", targetUrl);
            sessionStorage.setItem('targetUrl', targetUrl);

            //Redirect to login
            window.location.href = "../login.html";
        }
    }

    // Get links that require same behaviour
    const subLinks = document.querySelectorAll(".auth-required-link-main-sub");
    subLinks.forEach(function (link) {
        link.addEventListener('click', handleRedirectLinkClickMainSub);
    });
});