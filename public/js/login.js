import { firebaseApp } from './firebaseConfig';
import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

export const auth = getAuth(firebaseApp);
const provider = new GoogleAuthProvider();

//sign in with google
function signInWithGoogle() {
    signInWithPopup(auth, provider)
        .then(async (result) => {
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
                signOutFunction();
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


//call google login function
const googleLoginbtn = document.getElementById('google');
if (googleLoginbtn) {
    googleLoginbtn.addEventListener("click", signInWithGoogle);
}