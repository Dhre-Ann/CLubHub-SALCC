import { doc, setDoc, getDoc, onSnapshot, deleteDoc } from 'firebase/firestore'
import {username, storeClubName, getClubName} from './login';
import { database } from './firebaseConfig';

let processedClubIds = []; // Array to store IDs of processed clubs

// ______________________________________________________________________________________________
// Function to reindex divs? Not sure if this is needed, grid works dynamically
    // Confirmed - not needed

// Function to create popups - THIS IS IMPORTANT!!!!!!!!
// ______________________________________________________________________________________________


// Function to handle club deletes
async function leaveClub(clubId, userName) {
    try {
        // get clubcount and decrement it
        let clubCount = await getClubCount(userName);
        clubCount -= 1;
        console.log("New club count: ", clubCount);

        // Get a reference to the user's document in the database
        const userDocRef = doc(database, "Students", userName);

        // Fetch the user's document data
        const userDocSnapshot = await getDoc(userDocRef);
        if (userDocSnapshot.exists()) {
            // Get the current clubs array from the user's document
            const userData = userDocSnapshot.data();
            let clubsArr = userData.clubs || [];

            // Find the index of the club to leave in the clubs array
            const index = clubsArr.findIndex(clubRef => clubRef.id === clubId);

            if (index !== -1) {
                // Remove the club from the clubs array
                clubsArr.splice(index, 1);

                // Update the user's document in the database with the modified clubs array
                await setDoc(userDocRef, { 
                    clubs: clubsArr, 
                    clubCount: clubCount 
                }, 
                { merge: true });
                console.log("Club successfully removed from the user's clubs.");

            } else {
                console.log("Club not found in the user's clubs.");
            }
        } else {
            console.log("User document does not exist.");
        }

        // removing user from members document
        // Create a reference to the club document
        const memDocRef = doc(database, "Clubs", clubId, "Members", userName);
        await deleteDoc(memDocRef);
        console.log("User is no longer a member of " + clubId);

    } catch (error) {
        console.error("Error leaving club:", error);
    }
}

//function to pull clubcount from db
async function getClubCount(username) {
    const docRef = doc(database, "Students", username);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists) {
        //store club count
        const clubCount = docSnap.data().clubCount;
        console.log(clubCount);
        return clubCount;
    } else {
        console.log("Document does not exist");
    }
}

//function to pull clubs from db
async function getClubsFromStudent(username) {
    const docRef = doc(database, "Students", username);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists) {
        //store clubs in an array
        const clubNames = docSnap.data().clubs;
        console.log(clubNames);
        return clubNames;
    } else {
        console.log("Document does not exist");
    }
}

//this function gets the clubcount, increments it, sets new value
//it also gets the clubs a user is a part of, stores in an array, appends it, updates appended array
export async function addClub(username, clubName) {
    try {
        //get clubcount from db
        let clubCount = await getClubCount(username);
        //checking if club count is less than 4
        if (clubCount == 4) {
            alert("You have reached the maximum club limit. Leave a club in order to join a new one.");
            return;
        } else {
            //increment club count
            clubCount += 1;
            console.log("New club count: ", clubCount);

            //get clubs array
            let studentClubs = await getClubsFromStudent(username);
            console.log(studentClubs);

            // Create a reference to the club document
            const clubRef = doc(database, "Clubs", clubName);

            // Add the club reference to the clubs array
            studentClubs.push(clubRef);

            //updating student's document
            const docRef = doc(database, "Students", username);

            await setDoc(docRef, {
                clubs: studentClubs,
                clubCount: clubCount
            },
                { merge: true });
            // console.log("Username", username);
            // console.log("ClubName", clubName);

            console.log("Club added successfully.");
        }
    } catch (error) {
        console.error("Error adding club ", error);
    }
}

//add user to club's members in database
export async function addToClub(clubName, userName) {
    let today = new Date();
    let formattedDate = today.toISOString().split('T')[0];
    const userRef = doc(database, "Students", userName);
    try {
        await setDoc(doc(database, "Clubs", clubName, "Members", userName), {
            user: userRef,
            joinedDate: formattedDate,
            status: "member",
            hasVoted: false
        });
        console.log("Document successfully written");
    } catch (error) {
        console.error("Error writing document: ", error);
    }
}

export async function createPopup(popupType, clubId, nomPost){
    const popupDiv = document.createElement('div');
    popupDiv.setAttribute('id','popup');
    popupDiv.setAttribute('class','fixed mx-auto my-auto z-50 w-1/3 min-h-52 max-h-fit top-0 bottom-0 left-0 right-0 p-12 bg-[rgb(14,14,36)] text-white rounded-3xl border-2 border-white border-solid shadow-lg text-center justify-center');

    const popupTextDiv = document.createElement('div');
    popupTextDiv.setAttribute('id','popup-text');
    popupTextDiv.setAttribute('class','relative flex flex-wrap text-white font-medium text-lg text-center');
    

    const popupButtonsDiv = document.createElement('div');
    popupButtonsDiv.setAttribute('id','session-popup-buttons');
    popupButtonsDiv.setAttribute('class','relative gap-4 flex text-center items-center justify-center mx-auto my-auto w-full p-2 transform');
    
    if (popupType == "leaveClub"){
        // add text
        popupTextDiv.innerHTML = `<p class="relative float-start">Are you sure you would like to leave this club? <br> You will need to go through the entire registration process again if you wish to rejoin.</p>`;
        // add specific button content
        popupButtonsDiv.innerHTML = `
        <button type="button" id="leave-club" class="px-2 py-1 rounded-md text-white bg-[rgb(87,22,22)] border-none hover:border-2 hover:border-solid hover:border-[rgb(87,22,22)] hover:text-[rgb(87,22,22)] hover:bg-white transform transition-colors transition-opacity ">Leave</button>
        <button type="button" id="cancel-leave-club" class="text-center px-2 py-1 min-w-16 bg-[#fff] border-none font-semibold text-[rgb(14,14,36)] rounded-md hover:border-2 hover:border-solid hover:border-white hover:text-[#fff] hover:bg-[rgb(14,14,36)] transform transition-colors transition-opacity ">Cancel</button>`;

    } else if (popupType == "registration"){
        const clubName = await getClubName(clubId);
        //add text
        popupTextDiv.innerHTML = `
        <p class="relative float-start">Your application for ${clubName} has be submitted successfully.</p> <p class="relative float-start">Please wait for email notification for acceptance.</p>
        `;

        //add button content
        popupButtonsDiv.innerHTML = `
        <button id="okay" class="class="px-2 py-1 rounded-md text-white bg-[rgb(87,22,22)] border-none hover:border-2 hover:border-solid hover:border-[rgb(87,22,22)] hover:text-[rgb(87,22,22)] hover:bg-white transform transition-colors transition-opacity ">Okay</button>
        `;
    } else if (popupType == "dupNomination"){
        // add text
        popupTextDiv.innerHTML = `
        <p class="relative float-start">This member has already been nominated for ${nomPost}.</p> <p>Feel free to nominate them for something else.</p>
        `;
        //add button content
        popupButtonsDiv.innerHTML = `
        <button id="okay" class="class="px-2 py-1 rounded-md text-white bg-[rgb(87,22,22)] border-none hover:border-2 hover:border-solid hover:border-[rgb(87,22,22)] hover:text-[rgb(87,22,22)] hover:bg-white transform transition-colors transition-opacity ">Okay</button>
        `;
    }

    // Append popup elements to body
    popupDiv.appendChild(popupTextDiv);
    popupDiv.appendChild(popupButtonsDiv);

    // Create popup overlay
    const popupOverlayDiv = document.createElement('div');
    popupOverlayDiv.setAttribute('id', 'popup-overlay');
    popupOverlayDiv.setAttribute('class', 'fixed top-0 left-0 w-full h-full bg-[rgba(0,0,0,0.8)] z-40');
    popupOverlayDiv.addEventListener('click', function (event) {
        // Prevent click events from propagating to underlying elements
        event.stopPropagation();
    });

    // Append popup and overlay to body
    document.body.appendChild(popupOverlayDiv);
    document.body.appendChild(popupDiv);


    // Add event listeners to buttons based on popup type
    if (popupType == "leaveClub") {
        const confirmButton = popupDiv.querySelector('#leave-club');
        const cancelButton = popupDiv.querySelector('#cancel-leave-club');

        confirmButton.addEventListener('click', async function () {

            // Call leave club function
            console.log("username: " + username);
            await leaveClub(clubId, username);
            // Remove session popup and overlay from the DOM, then end function
            document.body.removeChild(popupDiv);
            document.body.removeChild(popupOverlayDiv);
        });

        cancelButton.addEventListener('click', function () {
            // Close popup 
            document.body.removeChild(popupDiv);
            document.body.removeChild(popupOverlayDiv);
        });
    } else {
        const okayBtn = popupDiv.querySelector('.okay');
        okayBtn.addEventListener('click', function() {
            // Close popup 
            document.body.removeChild(popupDiv);
            document.body.removeChild(popupOverlayDiv);
        });
    }
}


//function to add and delete clubs to and from in user dashboard in real time.
export async function updateDashboard(userName) {
    let currentIndex = 0;
    try {
        const docRef = doc(database, "Students", userName);
        console.log("See docRef: ", docRef);
        const unsubscribe = onSnapshot(docRef, async (doc) => {
            if (doc.exists()) {
                const data = doc.data(); // Store doc data in variable
                const clubsArr = data.clubs || []; // Ensure clubsArr is an array

                // Initialize the index of the deleted club
                let deletedClubIndex = -1;

                // Check for removed clubs
                const removedClubs = processedClubIds.filter(clubId => !clubsArr.some(clubRef => clubRef.id === clubId));
                removedClubs.forEach(removedClubId => {
                    const removedClubIndex = processedClubIds.indexOf(removedClubId);
                    if (removedClubIndex !== -1) {
                        const clubContainer = document.querySelectorAll(".potato")[removedClubIndex];
                        if (clubContainer) {
                            // Remove the potato div
                            clubContainer.remove();
                        }
                        // Remove from processedClubIds array
                        processedClubIds.splice(removedClubIndex, 1);
                        // Re-index the remaining divs
                        reIndexDivs(deletedClubIndex);
                    }
                });                

                // Process new clubs
                for (const clubRef of clubsArr) {
                    const clubId = clubRef.id;
                    // Check if club has not been processed
                    if (!processedClubIds.includes(clubId)) {
                        const clubDoc = await getDoc(clubRef);
                        if (clubDoc.exists()) {
                            // store club doc name
                            const clubDocId = clubDoc.id;
                            console.log("Testing club id to make sure it is document name: " + clubDocId);
                            const clubData = clubDoc.data();
                            const name = clubData.name;
                            const image = clubData.image;
                            
                            const description = clubData.description;

                            // Create a new potato div
                            const clubContainer = document.createElement("div");
                            const dashBody = document.getElementById("dashboard-home");
                            if (dashBody) {
                                // club container is the 'potato' div
                                clubContainer.setAttribute("class", `potato w-full min-h-1/2 border-2 border-solid border-gray-400 shadow-lg p-5 text-center rounded-md bg-[rgba(70,117,147,0.73)]`);
                                // clubContainer.classList.add("potato w-full min-h-1/2 border-2 border-solid border-gray-400 shadow-lg p-5 text-center rounded-md");
                                document.getElementById("dashboard-my-clubs").appendChild(clubContainer);

                                // Add clubname as Id in div
                                clubContainer.setAttribute("id", clubDocId);

                                // Update club information
                                let clubHTML = "";
                                // clubHTML = `<h2>${name}</h2><br>
                                //         <img alt="club image" src="${image}"> <br><br>
                                //         <p>${description}</p> <br>
                                //         <div class="dashboard-clubs-buttons">
                                //         <button class="goToManageBtn" type="button" data-club-id="${clubDocId}">View More</button>
                                //         <button class="leaveClubBtn" type="button">Leave Club</button>
                                //         </div>`;

                                clubHTML = `
                                    <div class="flex flex-col items-center justify-between h-full">
    <h2 class="p-3 font-medium text-center">${name}</h2>
    <div class="w-full flex justify-center">
        <img alt="club image" src="${image}" class="block mx-auto w-11/12 h-40 object-cover rounded-xl">
    </div> <br>
    <p class="py-4 text-center min-h-[60px]">${description}</p> <br>
    <div class="flex flex-wrap justify-center gap-4 pb-4">
    <button class="w-28 md:w-28 px-3 py-2 text-sm md:text-base rounded-md bg-blue-900 text-white">
        View More
    </button>
    <button class="w-28 md:w-28 px-3 py-2 text-sm md:text-base rounded-md bg-red-800 text-white">
        Leave Club
    </button>
</div>
</div>


                                `;

                                clubContainer.innerHTML = clubHTML;
                                currentIndex++;
                                // Add processed club ID to the list
                                processedClubIds.push(clubId);

                                // Adding event listener to buttons
                                const manageRedirectBtns = document.querySelectorAll("#goToManageBtn");
                                manageRedirectBtns.forEach(button => {
                                    button.addEventListener("click", () => {
                                        // Retrieve the club ID associated with the clicked button
                                        const clubId = button.dataset.clubId;
                                        if (clubId) {
                                            // Store the retrieved club ID
                                            storeClubName(clubId);
                                            // Redirect to the manage.html page
                                            window.location.href = "general.html";
                                            console.log("Newest proper clubId done right: ", clubId);
                                        } else {
                                            console.error("No club ID found for the clicked button.");
                                        }
                                    });
                                });


                                const leaveClubBtns = document.querySelectorAll("#leaveClubBtn");
                                leaveClubBtns.forEach(button => {
                                    button.addEventListener("click", async () => {
                                        // Get the clubId from the parent div's id attribute
                                        const clubId = button.parentElement.parentElement.id;
                                        console.log("Club id: " + clubId);

                                        // Call function to show confirmation popup
                                        let popupType = "leaveClub";
                                        await createPopup(popupType, clubId);
                                    });

                                });
                            }
                        } else {
                            console.log("Club document does not exist:", clubId);
                        }
                    }
                }
            } else {
                console.log("Document does not exist");
            }
        });
    } catch (error) {
        console.log("Error: ", error);
    }
}