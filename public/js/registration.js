import { collection, doc, setDoc, getDoc} from 'firebase/firestore'
import { username, user, getStoredClubName, sendNewEmail, getClubName} from './login';
import { database } from './firebaseConfig';
import { addClub, addToClub, createPopup } from './dashboard'

if (user){
    console.log("My email: " + user.email);
}

//function to handle join club form submission
async function handleFormSubmission() {
    try {
        if (user && user.email) {
            console.log("Username:", username);
            const userEmail = user.email;

            // Get the selected club value from cookies
            const clubName = getStoredClubName();

            // log club name as shown in db //for testing purposes
            console.log("Selected Club: ", clubName);

            // Call function to store form input as application in the club's collection
            await storeApplication(clubName, user);

            // Retrieve recipient(executive) email addresses from the database based on positions
            const positionEmails = await getPositionEmails(clubName);

            // Get club display name
            const clubDisplayName = await getClubName(clubName);

            // Send email to the club executives
            const subject = "New Application Submitted";
            const messageBody = `<h4>Dear Executive,</h4><br><p>A new application has been submitted for ${clubDisplayName}. Check the club's admin panel for more details.<p><br><p>Kind regards,</p><p>ClubHub.</p>`;
            for (const position in positionEmails) {
                await sendNewEmail(subject, messageBody, positionEmails[position]);
            }

            // Clear and close registration form
            const regForms = document.querySelectorAll('.registration-card-form');
            regForms.forEach(form => {
                form.reset();
            });

            const regFormDiv = document.getElementById("registrationModal");
            regFormDiv.style.display = "none";

            // create and show popup to display successful registration message
            await createPopup("registration", clubName);

            // Call function to add user to the club members subcollection
            // This function can only be called if user has been accepted
            // await addToClub(clubName, username);

            //call function to add club to the array in user doc
            // This function can only be called if user has been accepted
            // await addClub(username, clubName);

            //delay 3 seconds then redirect to dashboard
            // a popup should appear at this time informing the user that they have joined successfully.
            // setTimeout(() => { window.location.href = "../dashboard.html"; }, 3000);
        } else {
            console.log("No user, no email");
        }
    } catch (error) {
        console.error("Error handling form submission:", error);
    }
}


// Add event listener to the form for submission
const registrationForm = document.querySelector("#submit");
if (registrationForm) {
    registrationForm.addEventListener("submit", async (event) => {
        event.preventDefault(); // Prevent default form submission
        console.log("Form submitted");
        await handleFormSubmission(); // Handle form submission asynchronously
        console.log("Form submission handled");
    });
}

async function storeApplication(clubName, user) {
    try {
       
        if (!user || !user.email) {
            console.error("User email is undefined or null.");
            return;
        }

        // Get form input values
        const major = document.querySelector("#major").value;
        const yearOfStudy = document.querySelector("#yearOfStudy").value;
        const motivation = document.querySelector("#motivation").value;
        const skills = document.querySelector("#skills").value;
        const expectations = document.querySelector("#expectations").value;
        const leadershipRoles = document.querySelector("#leadershipRoles").value;
        const availability = document.querySelector("#availability").value;

        // Create a formData object with the form input values
        const formData = {
            email: user.email,
            name: user.displayName,
            major: major,
            yearOfStudy: yearOfStudy,
            motivation: motivation,
            skills: skills,
            expectations: expectations,
            leadershipRoles: leadershipRoles,
            availability: availability
        };
        
        const applicationsRef = collection(database, "Clubs", clubName, "Applications");
        // Set the document ID as the user's email
        const docRef = doc(applicationsRef, username);       
        await setDoc(docRef, formData);
        console.log("Application stored successfully.");

    } catch (error) {
        console.error("Error storing application:", error);
    }
}

// Function to retrieve recipient email addresses from the database based on positions
async function getPositionEmails(clubName) {
    try {
        const positions = ['President', 'Vice President', 'Treasurer', 'Secretary', 'Public Relations Officer'];
        const positionEmails = {}; // Initialize positionEmails as an empty object

        for (const position of positions) {
            // Get the document reference for the executive position
            const positionDocRef = doc(database, "Clubs", clubName, "Executives", position);
            const positionDocSnap = await getDoc(positionDocRef);
            if (positionDocSnap.exists()) {
                // Get the student reference from the executive position document
                const studentRef = positionDocSnap.data().student;
                // Get the student document
                const studentDocSnap = await getDoc(studentRef);
                if (studentDocSnap.exists()) {
                    // Get the email from the student document and add it to the positionEmails object
                    positionEmails[position] = studentDocSnap.data().email;
                }
            }
        }
        return positionEmails;
    } catch (error) {
        console.error("Error retrieving position emails:", error);
        return {};
    }
}


