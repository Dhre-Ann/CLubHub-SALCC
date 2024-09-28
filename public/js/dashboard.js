import { doc, setDoc, getDoc, onSnapshot, deleteDoc } from 'firebase/firestore'
import {username, storeClubName, getClubName} from './login';
import { database } from './firebaseConfig';

let processedClubIds = []; // Array to store IDs of processed clubs

// ______________________________________________________________________________________________
// Function to reindex divs? Not sure if this is needed, grid works dynamically

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
                                clubContainer.setAttribute("class", `potato w-full min-h-1/2 border-2 border-solid border-gray-400 shadow-lg p-5 text-center rounded-md`);
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
                                <h2 class="p-3 font-medium">${name}</h2>
                                <img alt="club image" src="${image}" class="relative mx-auto my-auto w-11/12 rounded-xl">
                                <p class="py-7">${description}</p>
                                <div id="dashboard-clubs-buttons" class="items-center justify-center text-center flex gap-4">
                            <button id="goToManageBtn" type="button" data-club-id="${clubDocId}" class="px-2 py-1 rounded-md text-white bg-[rgb(20,20,66)] border-solid border-2 border-[rgb(20,20,66)]">View More</button>
                            <button id="leaveClubBtn" type="button" data-club-id="${clubDocId}" class="px-2 py-1 rounded-md text-white bg-[rgb(87,22,22)] border-solid border-2 border-[rgb(87,22,22)]">Leave Club</button>
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


                                const leaveClubBtns = document.querySelectorAll(".leaveClubBtn");
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