import { collection, doc, setDoc, getDoc, onSnapshot, updateDoc, deleteDoc, getDocs, Timestamp } from 'firebase/firestore'
import { database, firebaseApp } from './firebaseConfig';
import { auth } from './login';

// Reference to the "Clubs" collection
const clubsCollectionRef = collection(database, 'Clubs');

const clubDocRef = doc(clubsCollectionRef, 'AnimalWelfare');

const positions = ['President', 'Vice President', 'Treasurer', 'Secretary', 'Public Relations Officer'];


console.log("Random point testing now hello hello");

// document.addEventListener("DOMContentLoaded", async function () {
    
        console.log("testing again hello hello hello");
    try {
        // Listen for changes in the authentication state
        // onAuthStateChanged(auth, async (user) => {
            const user = auth.currentUser;
            if (user) {
                const userEmail = user.email;
                const userId = userEmail.split("@")[0]; // Extract ID from email

                const userDocRef = doc(database, "Students", userId);
                const userDocSnap = await getDoc(userDocRef);

                if (!userDocSnap.exists()) {
                    // User document does not exist, create it
                    await setDoc(userDocRef, {
                        email: userEmail,
                        clubs: []
                    });
                }

                // Retrieve clubs associated with the current user's email
                const userClubs = userDocSnap.data().clubs;

                // Display the user's clubs in the inbox
                userClubs.forEach(async (clubRef) => {
                    try {
                        const clubDocSnap = await getDoc(clubRef);
                        if (clubDocSnap.exists()) {
                            const clubData = clubDocSnap.data();
                            const clubName = clubData.name;
                            console.log("Club name for inbox display:", clubName);
                            displayClubInInbox(clubName);
                        } else {
                            console.log("Club document does not exist.");
                        }
                    } catch (error) {
                        console.error("Error getting club data:", error);
                    }
                });

                // Get user status and listen for notifications
                const userStatus = await getUserStatus(userId);
                getNotifications(clubDocRef, userStatus);
            }
        // });

        // Event listener for club items in the inbox section
        const inboxSection = document.querySelector(".inbox-main");
        if (inboxSection) {
            inboxSection.addEventListener("click", function (event) {
                const clubItem = event.target;
                if (clubItem.classList.contains("club-item")) {
                    const clubName = clubItem.textContent.trim();
                    console.log("Clicked club name:", clubName);
                    displayClubInChat(clubName);
                }
            });
        }


        //Listen for message form submission
        document.addEventListener("submit", async function (event) {
            event.preventDefault();
            const messageForm = document.getElementById("message-form");
            if (event.target === messageForm) {
                const clubName = document.querySelector(".chat-header h1").textContent.trim();
                const messageInput = document.getElementById("chat-input").value.trim();
                if (messageInput !== "") {
                    const user = auth.currentUser;
                    if (user) {
                        const userId = user.uid;
                        const timestamp = new Date();
                        const message = {
                            userId: userId,
                            userName: user.displayName,
                            content: messageInput,
                            timestamp: timestamp
                        };
                        try {
                            // Add message to the subcollection 
                            const clubMessagesRef = collection(database, "ClubForum", clubName, "ClubMessages");

                            await addDoc(clubMessagesRef, message);
                            // Clear input field after sending message
                            document.getElementById("chat-input").value = "";
                        } catch (error) {
                            console.error("Error adding message:", error);
                        }
                    } else {
                        console.error("User not logged in.");
                    }
                }
            }
        });

    } catch (error) {
        console.error("Error initializing:", error);
    }
    
// });





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

// Function to alert message
function showAlert(message) {
    alert(message);
}

//queues for each chat room
const chatQueues = {};

// Function to display club in the inbox section
function displayClubInInbox(clubName) {
    // Display club in the inbox section
    const inboxSection = document.querySelector(".inbox-main");
    const clubItem = document.createElement("div");
    clubItem.setAttribute('class', 'club-item p-3 bg-[#fff] rounded-md text-black cursor-pointer transition-colors duration-300 ease-in-out list-none w-full leading-3 h-12 border-solid border-[rgb(231, 227, 227)] top-1/4 border-1 aspect-auto mb-1 hover:bg-[#aabeda]');
    clubItem.textContent = clubName; // Set text content to clubName
    clubItem.id = clubName; // Set the id to clubName
    if (inboxSection) {
        inboxSection.appendChild(clubItem);
    }
}

let originalChatHTML = null;

// Function to display club chat
function displayClubInChat(clubName) {
    const chatSection = document.querySelector(".chat");
    originalChatHTML = originalChatHTML || chatSection.innerHTML;
    chatSection.innerHTML = `
    <div style="float: right; margin-left: 50%;">
    <div class="close-chat-btn text-white float-right mt-5" style="align-content: flex-end;">✕</div>
</div>
<div style="display: flex;">
    <div class="chat-header flex rounded-bl-3xl rounded-br-3xl mx-auto my-auto text-center justify-center items-center">
        <h1 class="p-1 mb-5">${clubName}</h1>
    </div> 
</div>
<div class="club-messages-main bg-[#ffffff] w-full opacity-85 p-2 overflow-y-auto" style="max-height: 700px; z-index: 5;">
    <div class="chat-logs p-4 h-96 overflow-y-scroll" id="chat-logs"></div>
</div>
<div>
    <div class="chat-input">      
        <form id="message-form" style="display: flex;">
            <input type="text" id="chat-input" placeholder="Send a message..." required class="mt-2 bg-[#dde1e3] w-full relative h-12 py-2 pr-12 pl-4 resize-none border-solid border-[#ccc] text-[#5d5c5c] border-t-0 rounded-br-md rounded-bl-md overflow-hidden"/>
            <button type="submit" id="send-message-btn" style="height: fit-content; margin-top: 10px; border-radius: 8px;"><i class="fas fa-paper-plane"></i></button>
        </form>  
    </div>
</div>       
    `;
    
    
    chatQueues[clubName] = []; // Initialize queue for the chat room
    listenForMessages(clubName); // Listen for incoming messages

    const closeBtn = document.querySelector(".close-chat-btn");
    closeBtn.addEventListener("click", function () {
        // Restore the original state of the chat section
        chatSection.innerHTML = originalChatHTML;
    });
}

// Function to listen for message updates
function listenForMessages(clubName) {
    const clubMessagesRef = collection(database, "ClubForum", clubName, "ClubMessages");

    // Listen for changes to the club messages collection
    onSnapshot(clubMessagesRef, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
            if (change.type === "added") {
                const messageData = change.doc.data();
                // Assign a unique ID to the message
                messageData.id = change.doc.id;
                // Push the message to the queue
                chatQueues[clubName].push(messageData);
                // Display messages from the queue
                displayMessagesFromQueue(clubName);
                // Scroll to the bottom if the user has viewed all previous messages
                if (allMessagesViewed(clubName)) {
                    scrollChatToBottom(clubName);
                }
            }
        });
    });
}

// Function to check if all messages have been viewed
function allMessagesViewed(clubName) {
    const chatLogs = document.getElementById("chat-logs");
    const lastMessage = chatQueues[clubName][chatQueues[clubName].length - 1];
    // Check if the last message is in view
    return lastMessage && chatLogs.scrollHeight - chatLogs.scrollTop === chatLogs.clientHeight;
}

// Function to scroll chat logs to the bottom
function scrollChatToBottom() {
    const chatLogs = document.getElementById("chat-logs");
    chatLogs.scrollTo({
        top: chatLogs.scrollHeight,
        behavior: 'smooth'
    });
}

// Function to extract the date part from a timestamp
function getMessageDate(timestamp) {
    const messageDate = new Date(timestamp.toDate());
    messageDate.setHours(0, 0, 0, 0); // Set time to midnight to ignore time component
    return messageDate;
}

// Determine the text to display based on the date
function createSectionHeader(date) {
    let headerText = "";
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
        headerText = "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
        headerText = "Yesterday";
    } else {
        const daysAgo = Math.floor((today - date) / (1000 * 60 * 60 * 24));
        headerText = `${daysAgo} days ago`;
    }

    // Add a unique class based on the date
    const dateString = date.toISOString().split("T")[0]; // Get YYYY-MM-DD format
    const uniqueClass = `section-header-${dateString}`;

    // Construct the HTML for the section header with dynamic styling
    const sectionHeaderHTML = `
        <div class="section-header ${uniqueClass}" style="margin-bottom: 5px; margin-top: 10px;">${headerText}</div>
    `;

    // Convert the HTML string to a DOM element
    const sectionHeader = document.createElement('div');
    sectionHeader.innerHTML = sectionHeaderHTML;

    return sectionHeader.firstChild; // Return the first child node (the div.section-header)
}

// Function to display messages from queue
function displayMessagesFromQueue(clubName) {
    const chatLogs = document.getElementById("chat-logs");

    // Clear previous messages
    chatLogs.innerHTML = "";

    // Sort messages by timestamp
    chatQueues[clubName].sort((a, b) => a.timestamp - b.timestamp);

    let currentDate = null; // Track the current date to determine section headers

    // Loop through each message in the queue
    chatQueues[clubName].forEach((messageData) => {
        // Check if the message is not marked as deleted
        if (!messageData.deleted) {
            // Extract message date
            const messageDate = getMessageDate(messageData.timestamp);

            // Check if the message date is different from the current date
            if (!currentDate || messageDate.getTime() !== currentDate.getTime()) {
                // Add section header for the new date
                const sectionHeader = createSectionHeader(messageDate);
                chatLogs.appendChild(sectionHeader);

                currentDate = messageDate; // Update current date
            }

            // Append the message element to the chat logs
            const messageElement = createMessageElement(messageData);
            chatLogs.appendChild(messageElement);
        }
    });

    // Scroll to the bottom of the chat logs
    scrollChatToBottom(clubName);
}

// Function to create message element
function createMessageElement(messageData) {
    const messageElement = document.createElement("div");
    messageElement.setAttribute('class', 'message mb-5 p-2 w-auto rounded-lg');

    const user = auth.currentUser;
    const isCurrentUser = user && messageData.userId === user.uid;

    if (isCurrentUser) {
        // Set style for sender's message (aligned to the right)
        messageElement.setAttribute('class', 'message sender-message w-auto bg-[#6036e0] text-black float-right clear-both mt-1 mr-5 mb-1 ml-1 p-4 rounded-2xl');

        // Display sender's message without the user's name
        messageElement.innerHTML = `
            <span class="message">${messageData.content}</span>
            <span class="message-timestamp text-sm text-right text-white font-medium ml-1">${formatTimestamp(messageData.timestamp)}</span>
            <button class="delete-btn p-0 text-right bg-gray-100 text-xs p-1 rounded-sm text-black" style="display: none;">Delete</button>
        `;

        // Function to create and show a toast message
        function showToast(message) {
            const toastElement = document.getElementById("toast");
            toastElement.textContent = message;
            toastElement.style.display = "block";
            setTimeout(() => {
                toastElement.style.display = "none";
            }, 3000); // Hide the toast message after 3 seconds
        }

        // Event listener to show delete button on hover
        messageElement.addEventListener("mouseenter", function () {
            const deleteBtn = messageElement.querySelector(".delete-btn");
            deleteBtn.style.display = "block";
        });

        // Event listener to hide delete button when not hovering
        messageElement.addEventListener("mouseleave", function () {
            const deleteBtn = messageElement.querySelector(".delete-btn");
            deleteBtn.style.display = "none";
        });

        // Event listener for delete button
        const deleteBtn = messageElement.querySelector(".delete-btn");
        deleteBtn.addEventListener("click", async () => {
            if (confirm("Are you sure you want to delete this message?")) {
                try {
                    // Get the club name from the chat header
                    const clubName = document.querySelector(".chat-header h1").textContent.trim();
                    // Get the message ID
                    const messageId = messageData.id;
                    if (messageId) { // Check if the message ID is valid
                        // Construct the reference to the message document
                        const clubMessagesRef = collection(database, "ClubForum", clubName, "ClubMessages");

                        const messageDocRef = doc(clubMessagesRef, messageId);
                        // Delete the message document from the database
                        await deleteDoc(messageDocRef);
                        // Remove the message from the UI
                        messageElement.remove();
                        // Show toast message for successful deletion
                        showToast("Message deleted successfully");

                        // Remove the deleted message from the queue
                        chatQueues[clubName] = chatQueues[clubName].filter(message => message.id !== messageId);
                    } else {
                        console.error("Invalid message ID");
                        showToast("Error deleting message");
                    }
                } catch (error) {
                    console.error("Error deleting message:", error);
                    showToast("Error deleting message");
                }
            }
        });
    } else {
        // Set style for receiver's message (aligned to the left)
        messageElement.setAttribute('class', 'receiver-message message text-black mb-5 p-2 w-auto rounded-lg bg-gray-500 float-left clear-both my-1 mr-1 ml-5');
        // Display sender's name for receiver's message
        const userNameSpan = document.createElement("span");
        userNameSpan.classList.add("message-user");
        userNameSpan.textContent = `${messageData.userName}: `;
        messageElement.appendChild(userNameSpan);
        // Display receiver's message content
        const messageContentSpan = document.createElement("span");
        messageContentSpan.classList.add("message-content");
        messageContentSpan.textContent = messageData.content;
        messageElement.appendChild(messageContentSpan);
        // Display message timestamp
        const timestampSpan = document.createElement("span");
        timestampSpan.setAttribute('class', 'message-timestamp text-sm text-white font-medium ml-1');
        timestampSpan.textContent = formatTimestamp(messageData.timestamp);
        messageElement.appendChild(timestampSpan);
    }

    return messageElement;
}

// Function to format timestamp
function formatTimestamp(timestamp) {
    const currentDate = new Date();
    const messageDate = timestamp.toDate();

    // Check if the message was sent today
    if (isSameDate(messageDate, currentDate)) {
        // Message was sent today, include time component
        const options = { hour: 'numeric', minute: 'numeric' };
        return `Today at ${messageDate.toLocaleTimeString(undefined, options)}`;
    } else {
        // Message was sent on a different day
        const diffInDays = Math.floor((currentDate - messageDate) / (1000 * 60 * 60 * 24));
        if (diffInDays === 1) {
            const options = { hour: 'numeric', minute: 'numeric' };
            return `Yesterday at ${messageDate.toLocaleTimeString(undefined, options)}`;
        } else {
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' };
            return messageDate.toLocaleDateString(undefined, options);
        }
    }
}

// Function to check if two dates are the same day
function isSameDate(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate();
}



// Function to get user status
async function getUserStatus(userId) {
    try {
        const docRef = doc(clubDocRef, "Members", userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists) {
            //store status
            const userStatus = docSnap.data().status;
            console.log("User status: ", userStatus);
            return userStatus;
        } else {
            console.log("Document does not exist");
            return null;
        }
    } catch (error) {
        console.error('Error retrieving user status:', error);
        return null;
    }
}

// Function to get Notifications
async function getNotifications(clubDocRef, userStatus) {
    try {
        let generalNotificationsRef, executiveNotificationsRef;

        // Reference to the SentNotifications collection
        const sentNotificationsRef = collection(clubDocRef, 'SentNotifications');

        if (userStatus === 'executive') {
            // Reference to the ExecutiveNotifications document within the SentNotifications subcollection
            executiveNotificationsRef = doc(sentNotificationsRef, 'ExecutiveNotifications');
        } else if (userStatus === 'member') {
            // Reference to the GeneralNotifications document within the SentNotifications subcollection
            generalNotificationsRef = doc(sentNotificationsRef, 'GeneralNotifications');
        } else {
            console.error('Invalid user status:', userStatus);
            return;
        }

        // Listen for changes to the GeneralNotifications document
        if (generalNotificationsRef) {
            onSnapshot(generalNotificationsRef, (docSnapshot) => {
                if (docSnapshot.exists()) {
                    const notifications = docSnapshot.data();
                    renderNotifications(notifications);
                } else {
                    console.log('GeneralNotifications document does not exist.');
                }
            });
        }

        // Listen for changes to the ExecutiveNotifications document
        if (executiveNotificationsRef) {
            onSnapshot(executiveNotificationsRef, (docSnapshot) => {
                if (docSnapshot.exists()) {
                    const notifications = docSnapshot.data();
                    renderNotifications(notifications);
                } else {
                    console.log('ExecutiveNotifications document does not exist.');
                }
            });
        }
    } catch (error) {
        console.error('Error fetching notifications:', error);
    }
}


async function renderNotifications(notifications) {
    try {
        console.log("Rendering notifications...");
        const remindersSection = document.getElementsByClassName('reminders');

        // Check if the remindersSection exists
        
        // if (!remindersSection || remindersSection.length === 0) {
        //     console.error('Reminders section not found or is empty.');
        //     return;
        // }

        // Get the first element in the remindersSection NodeList
        if (remindersSection){
            console.log("Reminders section:", remindersSection);
            const remindersElement = remindersSection[0];

            if (remindersElement){
                remindersElement.innerHTML = '';
            }            

            // Iterate through notifications and render each one
            Object.entries(notifications).forEach(([clubName, notification]) => {
                const notificationDiv = document.createElement('div');
                notificationDiv.setAttribute('class', 'notification border-solid border-[#ccc] p-2 rounded-s bg-[#aabeda] hover:bg-[#f0f0f0] cursor-pointer');


                // Parse the timestamp and format it
                let timestamp;
                if (notification.timestamp instanceof Timestamp) {
                    timestamp = notification.timestamp.toDate();
                } else if (typeof notification.timestamp === 'string') {
                    timestamp = new Date(notification.timestamp);
                } else if (notification.timestamp instanceof Date) {
                    timestamp = notification.timestamp;
                } else {
                    console.error('Invalid timestamp format:', notification.timestamp);
                    return;
                }

                // Format timestamp to display hours and minutes
                const formattedTimestamp = `${timestamp.getHours()}:${('0' + timestamp.getMinutes()).slice(-2)}`;

                // Create HTML content for notification
                notificationDiv.innerHTML = `
                    <div class="notification-header">
                        <small>${formattedTimestamp}</small>
                    </div>
                    <div class="notification-content">
                        <p class="mx-5 my-0"><strong>${clubName}:</strong></p>
                        <p class="mx-5 my-0">${notification.message}</p>
                    </div>
                `;

                // Append notification div to reminders section
                if (remindersElement){
                    remindersElement.appendChild(notificationDiv);
                }
            });
        }
    } catch (error) {
        console.error('Error rendering notifications:', error);
    }
}



// //representation of a queue
// class Queue {
//     constructor() {
//         this.items = [];
//     }

//     enqueue(item) {
//         this.items.push(item);
//     }

//     dequeue() {
//         if (this.isEmpty()) {
//             return null;
//         }
//         return this.items.shift();
//     }

//     isEmpty() {
//         return this.items.length === 0;
//     }
// }

