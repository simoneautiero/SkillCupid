import React, { useContext, useState, useEffect } from "react";
import { auth } from "../firebase";
import "firebase/firestore";
import firebase from "firebase/app";

const AuthContext = React.createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState();
  const [loading, setLoading] = useState(true);

  function signup(
    email,
    password,
    role,
    currentjob,
    location,
    phonenum,
    dateofbirth,
    fullname
  ) {
    const db = firebase.firestore();
    auth
      .createUserWithEmailAndPassword(email, password)
      .then((data) => {
        db.collection("users").add({
          uid: data.user.uid,
          role: role,
          currentjob: currentjob,
          location: location,
          phonenum: phonenum,
          dateofbirth: dateofbirth,
          fullname: fullname,
        });
      })
      .catch((error) => {
        switch (error.code) {
          case "auth/email-already-in-use":
            alert(`Email address ${email} already in use.`);
            break;
          case "auth/invalid-email":
            alert(`Email address ${email} is invalid.`);
            break;
          case "auth/operation-not-allowed":
            alert(`Error during sign up.`);
            break;
          case "auth/weak-password":
            alert(
              "Password is not strong enough. Add additional characters including special characters and numbers."
            );
            break;
          default:
            console.log(error.message);
            break;
        }
      });
  }

  function login(email, password) {
    return auth.signInWithEmailAndPassword(email, password);
  }

  function logout() {
    return auth.signOut();
  }

  function resetPassword(email) {
    return auth.sendPasswordResetEmail(email);
  }

  function updateEmail(email) {
    return currentUser.updateEmail(email);
  }

  function updatePassword(password) {
    return currentUser.updatePassword(password);
  }

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    login,
    signup,
    logout,
    resetPassword,
    updateEmail,
    updatePassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
