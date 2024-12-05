import { auth, db } from "./firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

// Register user and set role in Firestore
export const registerUserWithRole = async (email, password, role = "User") => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Store user info with the default or provided role
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: user.email,
      role: role, // Default role is "User"
      createdAt: new Date(),
    });

    return user;
  } catch (error) {
    console.error("Error registering user:", error);
    throw error;
  }
};

// Login user and retrieve role from Firestore
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Fetch user role
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (!userDoc.exists()) {
      throw new Error("User not found in database");
    }

    const userRole = userDoc.data().role;
    return { user, role: userRole };
  } catch (error) {
    console.error("Error logging in:", error);
    throw error;
  }
};

// Logout user
export const logoutUser = async () => {
  try {
    await signOut(auth); 
    alert("User signed out successfully."); // Alert on successful sign-out
    console.log("User signed out successfully."); 
  } catch (error) {
    alert("Error signing out: " + error.message); // Alert on error
    console.error("Error signing out:", error.message); 
    throw error; 
  }
};

// Get current user's ID token
export const getCurrentUserToken = async () => {
  const currentUser = auth.currentUser;
  if (currentUser) {
    return await currentUser.getIdToken();
  }
  throw new Error("User not authenticated");
};
