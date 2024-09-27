import { initializeApp } from 'firebase/app'
import { getFirestore, doc, getDoc, getAggregateFromServer } from 'firebase/firestore';

const firebaseConfig = ({ 
    apiKey: "AIzaSyBaDzmjsCa4XfuCV8xYLAAnFfvvf1ToCfY",
    authDomain: "club-hub-bffba.firebaseapp.com",
    projectId: "club-hub-bffba",
    storageBucket: "club-hub-bffba.appspot.com",
    messagingSenderId: "630620934364",
    appId: "1:630620934364:web:787780d3d64827a3bde419"
 });

export const firebaseApp = initializeApp(firebaseConfig);
const database = getFirestore(firebaseApp);



// Test function

async function hello() {
        //variables
        let emailInfo;
        //get document
        const docRef = doc(database, "Clubs", "AnimalWelfare");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists) {
            // store info
            const data = docSnap.data();
            const name = data.name;
            
            console.log("Hello", name);
    
            
    
        } else {
            console.log("This category does not exist");
        }
        return;
    }
    hello();




    