import React from 'react';
import { useState, useEffect } from 'react';
import { messaging, getToken, onMessage } from "../firebase"; // adjust path
import { createContext } from 'react';

export const notifContext = createContext();


function NotificationsProvider({children}) {
  const [messagesValue, setMessagesValue] = useState(0);
  const [messagesUpdated, setMessagesUpdated] = useState(false);
  //const [loading, setLoading] = useState(true); Dumi: this was for the loading indicator to make users aware while the token is being fetched

  // Get FCM Token once
  useEffect(() => {
    async function fetchToken() {
      try {
        const currentToken = await getToken(messaging, {
          vapidKey: "your_web_push_cert_key_from_firebase_console",
        });

        if (currentToken) {
          console.log(" FCM Token:", currentToken);
          localStorage.setItem("user_fcm_token", currentToken);

          // OPTIONAL: send this token to your backend if you want to store it
          await fetch("https://your-backend-url.com/store-token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: currentToken }),
          });

        } else {
          console.warn(" No registration token available. Request permission to generate one.");
        }
      } catch (err) {
        console.error(" An error occurred while retrieving token.", err);
      }
    }

    fetchToken();
  }, []);

  // Listen for foreground messages
  useEffect(() => {
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log(" Foreground message received: ", payload);
      const tip = payload?.notification?.body || "New tip!";
      setMessagesValue(prev => prev + 1); // goood state closure to avoid the stale
      setMessagesUpdated(true);
      console.log(`${tip}`);
    //  alert(🌟 Recommendation: ${tip});
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => { // when thenn component mounts
    localStorage.setItem("isMessagesUpdated", messagesUpdated.toString());
    const timerDelay = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timerDelay);
  }, [messagesUpdated]);


  //loading saved notifications count into the local storage:
  useEffect(()=>{
    const savedValue = localStorage.getItem("messagesValue");
    if(savedValue){
         try {
        const parsed = JSON.parse(savedValue);
        setMessagesValue(parsed.messagesValue || 0);
      } catch (error) {
        console.error("Error parsing saved messagesValue:", error);
      }
    }
  });


  // then you save the value on local storage each time the value changes :

  useEffect(()=>{
    localStorage.setItem("messagesValue", JSON.stringify({messagesValue}));
  }, [messagesValue]);

 // return <>{children}</>;

 
    function notifsNumber (){
      const randomValue = Math.floor(Math.random() * 1);
      const newValue = messagesValue + randomValue;
      setMessagesValue(newValue);
      localStorage.setItem("messagesValue", JSON.stringify({ messagesValue : newValue})); 
      setMessagesUpdated(true);
      return;
    }
//D: resetting the notifications when the user actyally views:
function resetNotifications(){
    setMessagesValue(0);
    setMessagesUpdated(false);
}


 return (
    <notifContext.Provider value={{messagesUpdated, messagesValue, notifsNumber, resetNotifications}}>
        {children}
    </notifContext.Provider>
 )
}

export default NotificationsProvider;
