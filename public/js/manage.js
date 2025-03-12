import { collection, doc, setDoc, getDoc, getDocs, onSnapshot, writeBatch, query, updateDoc, deleteDoc } from 'firebase/firestore'
import { user, userPic, storeClubName, getStoredClubName, sendNewEmail, getClubName } from './login';
import { database } from './firebaseConfig';
import { addClub, addToClub, createPopup, adjustLayout } from './dashboard'

let clubName;
let username;


const potentialPositions = ["President", "Vice President", "Treasurer", "Public Relations Officer", "Secretary"];

if (user) {
    let userEmail = user.email;
    console.log("user email at beginning", userEmail);
    let emailArr = userEmail.split("@");
    username = emailArr[0];
    console.log("Username at the beginning: ", username);
}

// Set up manage and FAQ pages

// Function to get clubs tagline for dynamic update
async function getClubTagline(clubName) {
    const docRef = doc(database, "Clubs", clubName);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        //store status
        const clubTagline = docSnap.data().description;
        console.log("Club tagline: " + clubTagline);
        return clubTagline;
    } else {
        console.log("Document does not exist");
    }
}


// Function to get club from previous URL if coming from club page
function getClubFromPrevURL() {
    // Get the prev page URL
    var previousURL = document.referrer;
    console.log("Previous page: " + previousURL);

    // Extract previous page name from URL
    let startIndex = previousURL.lastIndexOf('/') + 1; // Get the index of the last '/'
    let endIndex = previousURL.lastIndexOf('.html'); // Get the index of '.html'
    let prevPage = previousURL.substring(startIndex, endIndex); // Extract the substring between the last '/' and '.html'
    console.log("Previous page name: " + prevPage);
    return prevPage;
}


// Club handler function for faq and manage page
async function clubHandler() {
    // Get the current page URL
    var currentPage = window.location.pathname;
    console.log("Current Page: " + currentPage);

    // Get club name from sessionStorage
    clubName = getStoredClubName();
    console.log("Club name from manage redirect: " + clubName);

    // Check if the current page is clubfaq.html or vote.html or general
    if (currentPage.includes("clubfaq.html") || currentPage.includes("vote.html") || currentPage.includes("general.html")) {
        // If club name is not available in sessionStorage, try to get it from the prev visited URL
        if (!clubName) {
            clubName = getClubFromPrevURL();
        }

        // If club name is still not available, log an error
        if (!clubName) {
            console.log("Club name not found.");
            return;
        }

        // Set about club link to the corresponding club page
        const aboutLink = document.querySelector("#aboutClubLink");
        aboutLink.href = `./clubs/${clubName}.html`;

        // Retrieve club's display name and tagline
        let clubDisplayName = await getClubName(clubName);
        let clubTagline = await getClubTagline(clubName);

        // Update banner container with club information
        const clubBannerContainer = document.querySelector("#club-banner-container");
        if (clubBannerContainer) {
            clubBannerContainer.innerHTML = `
              <div class="${clubName} w-full bg-cover bg-center max-h-96"
                    style="height:32rem; ">
                    <div id="club-banner-overlay" class="flex items-center justify-center h-full w-full bg-gray-900 bg-opacity-50">
                    </div>
                </div>

                <!-- Overlay div -->
                <div class="absolute top-36 w-full bg-black bg-cover bg-center opacity-60 h-96"></div>

                <!-- Banner Text -->
                <div class="absolute w-2/5 px-10 py-16 text-center shadow-2xl flex flex-col gap-4">
                    <h1 class="text-white text-6xl font-semibold">${clubDisplayName}</h1>
                    <h2 class="text-white text-2xl font-semibold">${clubTagline}</h2>
                    <button id="join-club-button" class="join-club-button text-center justify-center items-center relative w-fit mx-auto my-auto bg-[#3498db] text-[#fff] py-2 px-5 border-none rounded cursor-pointer">Join Club</button>
                </div>
              `
                ;
        }
    }
}


// Function to get club name from URL
function getClubFromURL() {
    // Get the current page URL
    var currentPage = window.location.pathname;
    console.log("Current Page: " + currentPage);

    // Check if current page is a club page
    if (currentPage.includes("/clubs/")) {
        // Extract club name from URL
        let startIndex = currentPage.lastIndexOf('/') + 1;
        let endIndex = currentPage.lastIndexOf('.html');
        const clubName = currentPage.substring(startIndex, endIndex);
        return clubName;
    } else {
        // if current page is not a club page
        console.log("This is not a club page");
        return null;
    }
}


// Function to set up club page
function setupClubPage() {
    let clubName = getClubFromURL();
    console.log("ClubName from url: " + clubName);
    if (clubName != null) {
        storeClubName(clubName);
    } else {
        console.log("club name cannot be found in url");
    }
}


// Call clubHandler when the page loads to handle clubfaq.html and vote.html and general.html

// Call setupClubPage when the page loads to store the club name if it's a club page
setupClubPage();
clubHandler();




// D R O P D O W N    M E N U

// add event listener to open menu when click
const manageBtn = document.querySelector("#mini-bar-manage-name");
if (manageBtn) {
    manageBtn.addEventListener('click', (event) => {
        event.stopPropagation(); // Prevents the click event from propagating to document body
        const dropdownContent = document.querySelector("#mini-bar-content");
        dropdownContent.style.display = "block";
    });
}

// Function to close dropdown menu
function closeDropdown() {
    const dropdownContent = document.querySelector("#mini-bar-content");
    dropdownContent.style.display = "none";
}

// Event listener to close menu when screen is clicked
document.body.addEventListener('click', (event) => {
    const dropdownContent = document.querySelector("#mini-bar-content");
    // Check if the clicked element is not inside the dropdown content and not the manage button
    if (dropdownContent) {
        if (!dropdownContent.contains(event.target) && event.target !== manageBtn) {
            closeDropdown();
        }
    }

});


// Function to change join club to leave club
async function joinLeaveClubToggle(username, clubName) {
    console.log("join/leave club button toggle function triggered");
    // Get doc ref for members
    const docRef = doc(database, "Clubs", clubName, "Members", username);

    // Subscribe to changes in the document
    const unsubscribe = onSnapshot(docRef, async (docSnapshot) => {

        if (!docSnapshot.exists()) {
            const joinClubBtn = document.querySelector("#join-club-button");
            // User is a member
            if (joinClubBtn) {
                joinClubBtn.innerHTML = `Join Club`;
                joinClubBtn.classList.remove('leaveClubBtn');
                joinClubBtn.classList.add('join-club-button');
                console.log("Button is now join club");
                joinClubBtn.addEventListener("click", async () => {
                    // Call function to show reg form
                    const registrationModal = document.getElementById("registrationModal");
                    if (registrationModal) {
                        registrationModal.style.display = "block";
                    }
                });

            }
        } else {
            const joinClubBtn = document.querySelector("#join-club-button");
            // User is not a member
            if (joinClubBtn) {
                joinClubBtn.innerHTML = `Leave Club`;
                joinClubBtn.classList.remove('join-club-button');
                joinClubBtn.classList.add('leaveClubBtn');
                console.log("Button is now leave club");
                // Add event listener for leave club action
                joinClubBtn.addEventListener("click", async () => {
                    // Call function to show confirmation popup
                    let popupType = "leaveClub";
                    await createPopup(popupType, clubName);
                });
            }
        }
    });
}





// V O T I N G    S Y S T E M

//get user status
async function getUserStatus(username, clubName) {
    const docRef = doc(database, "Clubs", clubName, "Members", username);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        //store status
        const data = docSnap.data();
        const userStatus = data.status;
        console.log("User status: ", userStatus);
        return userStatus;
    } else {
        console.log("Document does not exist");
    }
}


// FIXME
// async function populateNominees(clubName) {}
// async function isNominated(clubName) {}
// async function getNominationRequestPositions(username, clubName) {}
// async function setVotePage(username, clubName) {}
// async function handleMemberView(mainContainer, username, clubName, nominationsOpen, votingOpen) {}
// async function handleExecutiveView(mainContainer, clubName, nominationsOpen, votingOpen) {}
// function createContainer(...classes) {}
// function displayJoinClubMessage(container) {}
// function getNominationFormHTML() {}
// async function manageElections(clubName) {}
// async function fetchWinners(clubDocRef) {}
// async function updateExecutiveMembers(clubName) {}
// async function resetHasVotedForAllMembers(clubDocRef) {}
// async function clearNominationRequests(clubName) {}
// async function clearAcceptRequests(clubName) {}
// async function updateExecutives(clubDocRef, winners) {}
// async function updateMemberStatus(clubDocRef, winners) {}
// async function populateCurrentExecutives(clubName) {}
// async function populateCandidateExecutives(clubName) {}








// M A N A G E     P A G E







// G E N E R A L    P A G E

console.log("Clubname before general call", clubName);
console.log("username before general call", username);
if (clubName && username) {
    // const userStatus = await getUserStatus(username, clubName);
    console.log("Calling set general page function");
    await setGeneralPage(username, clubName);
} else {
    console.log("NO CLUB NAME IS STORED");
}


async function setGeneralPage(username, clubName) {
    // window.addEventListener("resize", );
    try {
        const mainManageContainer = document.querySelector(".general-main-container");

        if (!mainManageContainer) {
            console.log("Main manage container not found.");
            //   return;
        }

        const userStatus = await getUserStatus(username, clubName);
        console.log("User status", userStatus);
        if (userStatus === "member") {
            //M E M B E R
            console.log("i am a general member");

            // find main container
            const generalMain = document.querySelector(".general-main-container");

            // Generate Dynamic content
            const memberContainer = document.createElement('div');
            memberContainer.classList.add('member-gen');

            // Get main container
            // Append child to main

            // Get application status
            const applicationStatus = await getApplicationStatus(username, clubName);
            console.log("User application status", applicationStatus);

            if (applicationStatus == "pending") {
                // Status is pending, create pending html
                const acceptanceHolder = document.createElement('div');
                acceptanceHolder.classList.add('acceptance-status');

                const acceptanceLabelHolder = document.createElement('div');
                acceptanceLabelHolder.classList.add('acceptance-status-label');
                acceptanceLabelHolder.innerHTML = `<h2>Acceptance Status</h2>`;

                const acceptanceContent = document.createElement('div');
                acceptanceContent.classList.add('acceptance-status-status');
                acceptanceContent.innerHTML = `<br><p>Pending</p>`;

                // Append HTML to holder
                acceptanceHolder.appendChild(acceptanceLabelHolder);
                acceptanceHolder.appendChild(acceptanceContent);

                // create HTML for table content to store user's application
                const userForm = document.createElement('div');
                userForm.classList.add('user-application-form');

                const formLabel = document.createElement('div');
                formLabel.classList.add('application-form-label');
                formLabel.innerHTML = `<h2>Your Application Form</h2>`;

                const breakElement = document.createElement('br');

                // Get application data
                const applicationData = await getApplicationData(username, clubName);
                const motivation = applicationData[0];
                const skills = applicationData[1];
                const expectations = applicationData[2];
                const leadershipRoles = applicationData[3];
                const availability = applicationData[4];

                // creat form div and populate table
                const formContent = document.createElement('div');
                formContent.classList.add('application-form-content');
                formContent.innerHTML = `
              <table class="application-form-content-table">
                              <thead>
                                  <tr>
                                      <th>Motivation</th>
                                      <th>Relevant Skills</th>
                                      <th>Expectations</th>
                                      <th>Want to Lead?</th>
                                      <th>Availability</th>
                                  </tr>
                              </thead>
                              <tbody>
                                  
                                  <tr>
                                      <td class="motivation">${motivation}</td>
                                      <td class="skills">${skills}</td>
                                      <td class="expectations">${expectations}</td>
                                      <td class="leadershipRoles">${leadershipRoles}</td>
                                      <td class="availability">${availability}</td>
                                  </tr>
                              </tbody>
                          </table>
              `;

                // Append elements to form
                userForm.appendChild(formLabel);
                userForm.appendChild(breakElement);
                userForm.appendChild(formContent);


                // Append HTML to main
                memberContainer.appendChild(acceptanceHolder);
                memberContainer.appendChild(userForm);
                if (generalMain) {
                    generalMain.appendChild(memberContainer);
                }

            } else if (applicationStatus == "accepted") {

                const acceptedDiv = document.createElement('div');
                acceptedDiv.classList.add('accepted-application');

                const membersSection = document.createElement('div');
                membersSection.classList.add('club-members-section');

                const memberLabel = document.createElement('div');
                memberLabel.classList.add('club-members-label');
                memberLabel.innerHTML = `<h2>Identify Your Colleagues</h2>`;

                const colleaguesContent = document.createElement('div');
                colleaguesContent.classList.add('colleagues-content');
                colleaguesContent.innerHTML = `
              <table class="colleague-table">
              <thead>
                                  <tr>
                                      <th>Name</th>
                                      <th>Email Address</th>
                                      <th>Status</th>
                                  </tr>
                                  </thead>
                                  <tbody>
                                  </tbody>
                                                                  
                              </table>
              `;


                // Appending
                membersSection.appendChild(memberLabel);
                membersSection.appendChild(colleaguesContent);
                acceptedDiv.appendChild(membersSection);
                memberContainer.appendChild(acceptedDiv);
                if (generalMain) {
                    generalMain.appendChild(memberContainer);
                }

                // Retrieve members' information from Firestore and populate the table
                const membersRef = collection(database, "Clubs", clubName, "Members");
                const membersSnapshot = await getDocs(membersRef);
                const tableBody = colleaguesContent.querySelector('table.colleague-table tbody');
                membersSnapshot.forEach(async (memberDoc) => {
                    const { user, status } = memberDoc.data();
                    const userRef = user;
                    console.log("user ref type: ", typeof userRef);
                    console.log("user reference: ", userRef);
                    const userSnapshot = await getDoc(userRef);
                    if (userSnapshot.exists()) {
                        const { displayName, email } = userSnapshot.data();
                        const dynamicHTML = `
                          <tr>
                              <td>${displayName}</td>
                              <td>${email}</td>
                              <td>${status}</td>
                          </tr>
                      `;
                        // Append the dynamic HTML to the table body
                        if (tableBody) {
                            tableBody.innerHTML += dynamicHTML;
                        }
                    }
                });
            }

            //   mainManageContainer.innerHTML = `<p>unewqdunekddfgcvhbjnyq3</p>`;
        } else if (userStatus === "executive") {
            console.log("User is an exec");

            // --------- N E W ----------
            const generalMain = document.querySelector(".general-main-container");
            // Create main content holder

            const execGeneralContainer = document.createElement('div');
            // execGeneralContainer.classList.add('exec-gen');
            execGeneralContainer.classList = "exec-gen flex flex-row responsive-container gap-8 w-full px-3 py-5";

            // create content for the broadcast section
            const broadcastSectionContainer = document.createElement('div');
            // broadcastSectionContainer.classList.add('broadcast-section');
            broadcastSectionContainer.classList = "broadcast-section w-full md:w-1/3 min-w-0 bg-gray-800 text-white p-4 rounded-lg shadow-lg";

            const broadcastLabel = document.createElement('div');
            // broadcastLabel.classList.add('broadcast-section-label');
            broadcastLabel.classList = "broadcast-section-label bg-blue-600 p-4 rounded-t-lg text-center text-xl font-bold";
            broadcastLabel.innerHTML = `Broadcast`;

            const broadcastContent = document.createElement('div');
            broadcastContent.classList.add('broadcast-content-container');
            // The following html was originally stored in mainManageContainer.innerHTML
            broadcastContent.innerHTML = `
            <div <div class="send-notifications-container">
            <div class="send-notifications bg-gray-900 p-6 rounded-lg shadow-lg">
                <button type="button"
                    class="broadcast-collapsible bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded text-white flex items-center justify-between mx-auto">Send
                    Broadcast
                    <i class="fa fa-caret-down pl-4"></i>
                </button>

                <div class="broadcast-content mt-4" id="broadcastFormContainer" style="display: none;">
                    <form id="notificationForm" action="exec.html">
                        <label for="subject" class="block text-sm font-medium">Subject:</label>
                        <input type="text" id="subject" name="subject" required
                            class="block w-full mt-1 px-3 py-2 rounded-md bg-gray-300 text-black"><br><br>

                        <label for="messageBody" class="block text-sm font-medium">Message
                            Body:</label><br>
                        <textarea id="messageBody" name="messageBody" rows="4"
                            class="block w-full mt-1 px-3 py-2 rounded-md bg-gray-300 text-black"
                            required></textarea><br><br>

                        <label for="recipientPositions" class="block text-sm font-medium">Select
                            Recipients:</label><br>
                        <select id="recipientPositions" name="recipientPositions"
                            class="block w-full mt-1 px-3 py-2 rounded-md bg-gray-300 text-black">
                            <option value="send-to-exec">Executive members</option>
                            <option value="send-club-chat">Club Chat</option>
                        </select>
                        <br><br>

                        <input type="checkbox" id="send-email-from-exec" class="text-blue-500"
                            checked>
                        <label for="send-email-from-exec" class="text-sm font-medium">Send Email
                            Notification</label><br><br>

                        <button
                            class="send-btn bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-md text-white flex items-center justify-between mx-auto"
                            type="submit">Send</button>
                    </form>
                </div>
            </div>
            `;  // ADD BROADCAST HTML

            const applicationSectionContainer = document.createElement('div');
            // applicationSectionContainer.classList.add('application-section');
            applicationSectionContainer.classList = "application-section w-full md:w-2/3 min-w-0 bg-gray-800 text-white p-4 rounded-lg shadow-lg";

            const applicationsLabel = document.createElement('div');
            // applicationsLabel.classList.add('applications-label');
            applicationsLabel.classList = "applications-label bg-blue-600 p-4 rounded-t-lg text-center text-xl font-bold";
            applicationsLabel.innerHTML = `Applications`;

            const breakElement = document.createElement('br');

            const applicationsContent = document.createElement('div');
            applicationsContent.classList.add('applications-content');
            applicationsContent.innerHTML = `
            <table class="applications-table w-full table-auto border-collapse">
            <thead>
                <tr>
                    <th class="px-4 py-2 border-b text-left bg-[rgba(70,117,147,0.73)]">Name</th>
                    <th class="px-4 py-2 border-b text-left bg-[rgba(70,117,147,0.73)]">Motivation</th>
                    <th class="px-4 py-2 border-b text-left bg-[rgba(70,117,147,0.73)]">Relevant Skills</th>
                    <th class="px-4 py-2 border-b text-left bg-[rgba(70,117,147,0.73)]">Expectations</th>
                    <th class="px-4 py-2 border-b text-left bg-[rgba(70,117,147,0.73)]">Want to Lead?</th>
                    <th class="px-4 py-2 border-b text-left bg-[rgba(70,117,147,0.73)]">Availability</th>
                    <th class="px-4 py-2 border-b text-left bg-[rgba(70,117,147,0.73)]">Status</th>
                </tr>
            </thead>
            <tbody>
          </tbody>
      </table>
      `;

            // Append elements
            broadcastSectionContainer.appendChild(broadcastLabel);
            broadcastSectionContainer.appendChild(broadcastContent);
            applicationSectionContainer.appendChild(applicationsLabel);
            applicationSectionContainer.appendChild(breakElement);
            applicationSectionContainer.appendChild(applicationsContent);

            execGeneralContainer.appendChild(broadcastSectionContainer);
            execGeneralContainer.appendChild(applicationSectionContainer);
            if (generalMain) {
                console.log("General container accessed");
                generalMain.appendChild(execGeneralContainer);
            }
            // get applications in real time
            // Call the function to listen for applications and get the data
            listenForApplications(clubName)
                .then((applicationDataArray) => {
                    // Populate the table body with the application data
                    const tableBody = document.querySelector('.applications-table tbody');
                    applicationDataArray.forEach((applicationData) => {
                        // Create a table row for each application
                        const row = document.createElement('tr');
                        row.classList = "border-b border-gray-700";
                        // Populate the row with application data
                        row.innerHTML = `
              <td class="px-4 py-2">${applicationData.name}</td>
              <td class="px-4 py-2">${applicationData.motivation}</td>
              <td class="px-4 py-2">${applicationData.skills}</td>
              <td class="px-4 py-2">${applicationData.expectations}</td>
              <td class="px-4 py-2">${applicationData.leadershipRoles}</td>
              <td class="px-4 py-2">${applicationData.availability}</td>
              <td class="buttons px-4 py-2 text-center">
                  <button class="accept-app bg-green-600 hover:bg-green-700 text-white px-4 py-2 my-1 rounded-md">Accept</button>
                  <br>
                  <button class="decline-app bg-red-600 hover:bg-red-700 text-white px-4 py-2 my-1 rounded-md">Decline</button>
              </td>
          `;
                        // Append the row to the table body
                        if (tableBody) {
                            tableBody.appendChild(row);
                        }

                        // Add event listeners to the accept and decline buttons
                        // Add event listeners to the accept and decline buttons
                        const acceptBtns = document.querySelectorAll('.accept-app');
                        const declineBtns = document.querySelectorAll('.decline-app');

                        acceptBtns.forEach(acceptBtn => {
                            acceptBtn.addEventListener('click', async () => {
                                console.log("Accept button clicked");
                                await acceptApplication(applicationData.email, clubName);
                            });
                        });

                        declineBtns.forEach(declineBtn => {
                            declineBtn.addEventListener('click', async () => {
                                console.log("Decline button clicked");
                                await declineApplication(applicationData.email);
                            });
                        });

                    });
                })
                .catch((error) => {
                    console.error("Error retrieving application data:", error);
                });

        } else {

            //P E N D I N G
            console.log("i am a pending member");

            // find main container
            const generalMain = document.querySelector(".general-main-container");

            // Generate Dynamic content
            const memberContainer = document.createElement('div');
            memberContainer.classList.add('member-gen');

            // Get main container
            // Append child to main

            // Get application status
            const applicationStatus = await getApplicationStatus(username, clubName);
            console.log("User application status", applicationStatus);

            console.log("User application status", applicationStatus);

            if (applicationStatus == "pending") {
                // Status is pending, create pending html
                const acceptanceHolder = document.createElement('div');
                acceptanceHolder.classList.add('acceptance-status');

                const acceptanceLabelHolder = document.createElement('div');
                acceptanceLabelHolder.classList.add('acceptance-status-label');
                acceptanceLabelHolder.innerHTML = `<h2>Acceptance Status</h2>`;

                const acceptanceContent = document.createElement('div');
                acceptanceContent.classList.add('acceptance-status-status');
                acceptanceContent.innerHTML = `<br><p>Pending</p>`;

                // Append HTML to holder
                acceptanceHolder.appendChild(acceptanceLabelHolder);
                acceptanceHolder.appendChild(acceptanceContent);

                // create HTML for table content to store user's application
                const userForm = document.createElement('div');
                userForm.classList.add('user-application-form');

                const formLabel = document.createElement('div');
                formLabel.classList.add('application-form-label');
                formLabel.innerHTML = `<h2>Your Application Form</h2>`;

                const breakElement = document.createElement('br');

                // Get application data
                const applicationData = await getApplicationData(username, clubName);
                const motivation = applicationData[0];
                const skills = applicationData[1];
                const expectations = applicationData[2];
                const leadershipRoles = applicationData[3];
                const availability = applicationData[4];

                // creat form div and populate table
                const formContent = document.createElement('div');
                formContent.classList.add('application-form-content');
                formContent.innerHTML = `
              <table class="application-form-content-table">
                              <thead>
                                  <tr>
                                      <th>Motivation</th>
                                      <th>Relevant Skills</th>
                                      <th>Expectations</th>
                                      <th>Want to Lead?</th>
                                      <th>Availability</th>
                                  </tr>
                              </thead>
                              <tbody>
                                  
                                  <tr>
                                      <td class="motivation">${motivation}</td>
                                      <td class="skills">${skills}</td>
                                      <td class="expectations">${expectations}</td>
                                      <td class="leadershipRoles">${leadershipRoles}</td>
                                      <td class="availability">${availability}</td>
                                  </tr>
                              </tbody>
                          </table>
              `;

                // Append elements to form
                userForm.appendChild(formLabel);
                userForm.appendChild(breakElement);
                userForm.appendChild(formContent);


                // Append HTML to main
                memberContainer.appendChild(acceptanceHolder);
                memberContainer.appendChild(userForm);
                if (generalMain) {
                    generalMain.appendChild(memberContainer);
                }
            }
        }
    } catch (error) {
        console.error("Error setting general page:", error);
    }
}





// MAY NEED EDITING FOR TAILWIND:

// Add event listener for broadcast collapsible
const broadcastCollapsible = document.querySelector('.broadcast-collapsible');
if (broadcastCollapsible) {
    broadcastCollapsible.addEventListener('click', () => {
        console.log("Broadcast collapsible button clicked");
        toggleBroadcastCollapse();
    });
}
// Toggle broadcast collapsible
function toggleBroadcastCollapse() {
    const content = document.getElementById('broadcastFormContainer');
    console.log("Changing style display");
    content.style.display = content.style.display === 'block' ? 'none' : 'block';
    console.log("style display changed");
}


const positions = ['President', 'Vice President', 'Treasurer', 'Secretary', 'Public Relations Officer'];

// END EDITING


function setupNotificationForm() {
    console.log("set up notif form is called");

    // Event listener for form submission
    const notificationForm = document.getElementById("notificationForm");
    if (notificationForm) {
        notificationForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            const subject = document.getElementById("subject").value.trim();
            const messageBody = document.getElementById("messageBody").value.trim();
            const recipientPositions = document.getElementById("recipientPositions").value.trim();
            const sendEmail = document.getElementById("send-email-from-exec").checked;

            if (!subject || !messageBody || !recipientPositions) {
                console.error('Subject, message body, and recipient positions cannot be empty.');
                return;
            }

            try {
                if (sendEmail) {
                    if (recipientPositions === 'send-to-exec') {
                        // Send notifications to club executives
                        console.log("Sending email with:", { subject, messageBody, recipientPositions, sendEmail });
                        await sendNotifications(subject, messageBody, recipientPositions);
                    } else if (recipientPositions === 'send-club-chat') {
                        // Send notifications to club members
                        await sendNotifications(subject, messageBody, recipientPositions);
                    } else {
                        console.error('Invalid recipient positions:', recipientPositions);
                    }
                    alert("Email notifications sent successfully!");
                } else {
                    // Store notifications without sending emails
                    const sender = 'Club Executive';
                    const timestamp = new Date();
                    await storeNotification(subject, messageBody, recipientPositions);
                    alert("Notification added successfully!");
                }

                // Clear form inputs
                document.getElementById("subject").value = "";
                document.getElementById("messageBody").value = "";
                document.getElementById("recipientPositions").selectedIndex = 0;
                document.getElementById("send-email-from-exec").checked = false;
            } catch (error) {
                console.error('Error:', error);
                alert("An error occurred. Please try again later.");
            }
        });
    }
}

// Call the function to set up the notification form
setupNotificationForm();

async function sendNotificationsToExecutives(subject, messageBody) {
    try {
        const clubDocRef = doc(database, "Clubs", clubName);
        // Get email addresses of club executives
        for (const position of positions) {
            const positionDocRef = doc(clubDocRef, 'Executives', position);
            const positionDocSnapshot = await getDoc(positionDocRef);
            if (positionDocSnapshot.exists()) {
                const executiveData = positionDocSnapshot.data();
                const studentRef = executiveData.student;
                const studentDocSnapshot = await getDoc(studentRef);
                if (studentDocSnapshot.exists()) {
                    const studentData = studentDocSnapshot.data();
                    if (studentData.email) {
                        // Send email notification to executive
                        await sendEmail(subject, messageBody, studentData.email);
                        // Store notification in 'ExecutiveNotifications' subcollection
                        await storeNotification(subject, messageBody, recipientPositions);
                        // Update reminders section of executive's forum page
                        // await updateRemindersSection(studentData.userId, messageBody);
                        // await updateRemindersSection(memberInfoData.userId, messageBody);
                    } else {
                        console.error('No email found for student:', studentData);
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error sending notifications to executives:', error);
    }
}

async function sendNotificationsToMembers(subject, messageBody) {
    try {
        const clubDocRef = doc(database, "Clubs", clubName);
        // Get email addresses of club members
        const membersCollectionRef = collection(clubDocRef, 'Members');
        const membersQuerySnapshot = await getDocs(membersCollectionRef);

        await Promise.all(membersQuerySnapshot.docs.map(async memberDoc => {
            const memberId = memberDoc.id.split('@')[0];
            const memberInfoDocRef = doc(database, 'Students', memberId);
            const memberInfoDocSnapshot = await getDoc(memberInfoDocRef);
            if (memberInfoDocSnapshot.exists()) {
                const memberInfoData = memberInfoDocSnapshot.data();
                if (memberInfoData.email) {
                    // Send email notification to member
                    await sendEmail(subject, messageBody, memberInfoData.email);
                    // Store notification in 'GeneralNotifications' subcollection
                    await storeNotification(subject, messageBody, recipientPositions);
                    // Update reminders section of member's forum page
                    // await updateRemindersSection(memberInfoData.userId, messageBody);
                } else {
                    console.error('No email found for member:', memberInfoData);
                }
            } else {
                console.error('User document not found for member ID:', memberId);
            }
        }));
    } catch (error) {
        console.error('Error sending notifications to members:', error);
    }
    renderNotifications(notifications);
}

async function renderNotifications(notifications) {
    try {
        console.log("Rendering notifications...");
        const remindersSection = document.querySelector('.reminders-container');

        // Check if the remindersSection exists
        if (!remindersSection) {
            console.error('Reminders section not found.');
            return;
        }

        remindersSection.innerHTML = '';

        notifications.forEach(notification => {
            const notificationElement = document.createElement('div');

            // Format the timestamp to include date and time
            const formattedTimestamp = new Date(notification.timestamp).toLocaleString();

            notificationElement.innerHTML = `
                <p>${notification.sender}:</p>
                <p>${notification.message}</p>
                <p>${formattedTimestamp}</p>
            `;
            remindersSection.appendChild(notificationElement);
        });
    } catch (error) {
        console.error('Error rendering notifications:', error);
    }
}

// Define the sendEmail function
async function sendEmail(subject, messageBody, recipientEmail) {
    const emailData = {
        subject: subject, // Pass the subject entered by the user
        html: messageBody, // Message body is HTML content
        recipient: recipientEmail // Pass the recipient email directly
    };

    if (emailData) {
        try {
            const response = await fetch('http://localhost:4000/send-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(emailData)
            });

            if (response.ok) {
                console.log('Email sent successfully');
            } else {
                console.error('Failed to send email:', response.statusText);
            }
        } catch (error) {
            console.error('Error sending email:', error);
        }
    } else {
        console.error('Email data is invalid.');
    }
}

// Modify the storeNotification function to handle storing notifications based on recipient positions
async function storeNotification(subject, messageBody, recipientPositions) {
    const clubDocRef = doc(database, "Clubs", clubName);
    try {
        if (!subject) {
            console.error('Subject cannot be empty.');
            return;
        }

        let notificationsRef;
        if (recipientPositions === 'send-to-exec') {
            notificationsRef = doc(clubDocRef, 'SentNotifications', 'ExecutiveNotifications');
        } else if (recipientPositions === 'send-club-chat') {
            notificationsRef = doc(clubDocRef, 'SentNotifications', 'GeneralNotifications');
        } else {
            console.error('Invalid recipientPositions:', recipientPositions);
            return;
        }

        // Update the document directly with the notification data
        await setDoc(notificationsRef, {
            [subject]: { // Use subject as the document ID
                message: messageBody,
                sender: 'Club Executive',
                timestamp: new Date()
            }
        }, { merge: true }); //update existing fields

        console.log('Notification stored successfully.');
    } catch (error) {
        console.error('Error storing notification:', error);
    }
}

// Function to send notifications based on recipient positions
async function sendNotifications(subject, messageBody, recipientPositions) {
    console.log("Inside sendNotifications, recipientPositions:", recipientPositions);
    try {
        if (recipientPositions === 'send-to-exec') {
            // Send notifications to club executives
            await sendNotificationsToExecutives(subject, messageBody);
        } else if (recipientPositions === 'send-club-chat') {
            // Send notifications to club members
            await sendNotificationsToMembers(subject, messageBody);
        } else {
            console.error('Invalid recipient positions:', recipientPositions);
        }
    } catch (error) {
        console.error('Error sending notifications:', error);
    }
}

async function listenForApplications(clubName) {
    return new Promise((resolve, reject) => {
        try {
            const applicationsRef = collection(database, "Clubs", clubName, "Applications");
            const q = query(applicationsRef);

            // Subscribe to changes in the applications collection
            const unsubscribe = onSnapshot(q, (snapshot) => {
                const applicationDataArray = []; // Array to store application data
                snapshot.docChanges().forEach((change) => {
                    if (change.type === "added") {
                        // Push new application data into the array
                        const applicationData = change.doc.data();
                        applicationDataArray.push(applicationData);
                    }
                });
                // Resolve the Promise with the array of application data
                resolve(applicationDataArray);
            });
        } catch (error) {
            console.error("Error listening for applications:", error);
            reject(error); // Reject the Promise if an error occurs
        }
    });
}

async function acceptApplication(email, clubName) {
    console.log("email as parameter: ", email);
    try {

        const emailArray = email.split("@");
        const username = emailArray[0];
        console.log("checking username in accept application:", username);
        await addClub(username, clubName);
        await addToClub(clubName, username);



        const userDocRef = doc(database, "Students", username);
        const userDocSnapshot = await getDoc(userDocRef);

        // Check if the user document exists and if the 'clubs' field is defined
        if (userDocSnapshot.exists()) {
            const userData = userDocSnapshot.data();
            if (userData.hasOwnProperty('clubs')) {
                const clubs = userData.clubs;
                let clubName = getStoredClubName();

                await updateDoc(userDocRef, {
                    clubs: clubs
                });


                const today = new Date();
                const formattedDate = today.toISOString().split('T')[0];


                const userRef = doc(database, "Students", username);

                // Check if clubName is defined and is a non-empty string
                if (clubName && typeof clubName === 'string' && clubName.trim() !== '') {

                    const memberDocRef = doc(database, "Clubs", clubName, "Members", username);
                    await setDoc(memberDocRef, {
                        user: userRef,
                        joinedDate: formattedDate,
                        status: "member",
                        hasVoted: false
                    });


                    const applicationRef = doc(database, "Clubs", clubName, "Applications", username);
                    await deleteDoc(applicationRef);

                    console.log("Accepted application for email:", email);
                    const clubSnapshot = await getDoc(clubRef);
                    if (clubSnapshot.exists()) {
                        const clubData = clubSnapshot.data();
                        const clubName = clubData.name;



                        const subject = "Application Accepted";
                        const messageBody = `Your application for ${clubName} has been accepted!Visit your ClubHub dashboard to access club.
             
              `;
                        await sendNewEmail(subject, messageBody, email);
                    } else {
                        console.error("Club document does not exist");
                    }

                } else {
                    console.error("Error accepting application: Invalid clubName.");
                }
            } else {
                console.error("Error accepting application: 'clubs' field is not defined in the user document.");
            }
        } else {
            console.error("Error accepting application: User document does not exist.");
        } const applicationDiv = document.querySelector(`.application[data-email="${email}"]`);
        if (applicationDiv) {
            applicationDiv.remove();
            console.log("Removed application from DOM after acceptance:", email);
        } else {
            console.error("Application div not found in DOM after acceptance:", email);
        }

    } catch (error) {
        console.error("Error accepting application:", error);
    }
}

async function declineApplication(email) {
    try {
        let clubName = getStoredClubName();
        const username = email.split('@')[0];

        const applicationRef = doc(database, "Clubs", clubName, "Applications", username);
        const clubRef = doc(database, "Clubs", clubName);


        await deleteDoc(applicationRef);
        console.log('Declined application for username:', username);


        const clubSnapshot = await getDoc(clubRef);
        if (clubSnapshot.exists()) {
            const clubData = clubSnapshot.data();
            const clubName = clubData.name;


            const subject = "Application Declined";
            const messageBody = `Your application for ${clubName} has been declined. Try again next time.
        
        `;
            await sendNewEmail(subject, messageBody, email);
        } else {
            console.error("Club document does not exist");
        }
    } catch (error) {
        console.error("Error declining application:", error);
    }
}

// Function to get user application status (pending or accepted)
async function getApplicationStatus(username, clubName) {
    return new Promise((resolve, reject) => {
        const pendingDocRef = doc(database, "Clubs", clubName, "Applications", username);
        const unsubscribe = onSnapshot(pendingDocRef, async (docSnapshot) => {
            if (docSnapshot.exists()) {
                // User is in applications, status is pending
                console.log("user is pending");
                resolve("pending");
            } else {
                const acceptedDocRef = doc(database, "Clubs", clubName, "Members", username);
                const docSnap = await getDoc(acceptedDocRef);
                if (docSnap.exists()) {
                    console.log("User is accepted");
                    resolve("accepted");
                } else {
                    console.log("User is not pending, checking for accepted");
                    // User is not in applications or members, status is undefined
                    resolve(undefined);
                }
            }
        });
    });
}

// Function to get the application data for current user
async function getApplicationData(username, clubName) {
    const docRef = doc(database, "Clubs", clubName, "Applications", username);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        const data = docSnap.data();
        const motivation = data.motivation || '';
        const skills = data.skills || '';
        const expectations = data.expectations || '';
        const leadershipRoles = data.leadershipRoles || '';
        const availability = data.availability || '';
        // Create an array containing the values
        const applicationArr = [motivation, skills, expectations, leadershipRoles, availability];
        return applicationArr;
    } else {
        console.log("This user's document does not exist");
        // Return an empty array if the document doesn't exist
        return [];
    }
}



// M O R E     V O T I N G      S T U F F     H E R E 