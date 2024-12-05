import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "./firebase/firebase";
import { doc, getDoc } from "firebase/firestore";

const PrivateRoute = ({ children, requiredRole }) => {
  const [user, loadingAuth] = useAuthState(auth);
  const [userRole, setUserRole] = useState(localStorage.getItem("userRole") || null);
  const [loadingRole, setLoadingRole] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const fetchedRole = userDoc.data().role;
            setUserRole(fetchedRole);
            localStorage.setItem("userRole", fetchedRole); // Cache role in localStorage
          } else {
            console.error("User document does not exist");
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
        }
      } else {
        localStorage.removeItem("userRole");
      }
      setLoadingRole(false);
    };

    if (!loadingAuth) {
      fetchUserRole();
    }
  }, [user, loadingAuth]);

  if (loadingAuth || loadingRole) return <div>Loading...</div>;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/login" replace />;
  }

  // Map userRole to userType
  const userType = userRole ? userRole.toLowerCase() : "user";

  return React.cloneElement(children, { userType, userRole });
};

export default PrivateRoute;
