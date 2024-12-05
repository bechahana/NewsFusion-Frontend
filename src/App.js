import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, useParams } from "react-router-dom";
import { auth } from "./firebase/firebase"; // Ensure this path is correct

// Authentication
import Login from "./features/Authentication/Login";
import Register from "./features/Authentication/Register";

// Admin Components
import AdminDashboard from "./features/Admin/AdminDashboard";
import AdminUserManagement from "./features/Admin/AdminUserManagement";
import AdminContentManagement from "./features/Admin/AdminContentManagement";
import AdminProfile from "./features/Admin/AdminProfile";
import AdminActivity from "./features/Admin/AdminActivity";
import Security from "./features/Admin/Security";
import Analytics from "./features/Admin/Analytics";

// Editor Components
import EditorDashboard from "./features/Editor/EditorDashboard";
import EditorPublishedArticles from "./features/Editor/EditorPublishedArticles";
import EditorProfile from "./features/Editor/EditorProfile";
import EditorActivity from "./features/Editor/EditorActivity";
import AddArticle from "./features/Editor/AddArticle";
import AddLiveUpdate from "./features/Editor/AddLiveUpdate";

// User Components
import UserDashboard from "./features/User/UserDashboard";
import UserPersonalized from "./features/User/UserPersonalized";
import UserSuggestedFeed from "./features/User/UserSuggestedFeed";
import UserProfile from "./features/User/UserProfile";
import UserActivity from "./features/User/UserActivity";

// General Components
import CategoryPage from "./features/General/CategoryPage";
import ArticleDetail from "./features/General/ArticleDetail";
import DeleteAccount from "./features/General/DeleteAccount";
import ResetPassword from "./features/General/ResetPassword";
import SearchResults from "./features/General/SearchResults";
import GuestLayout from "./features/General/GuestLayout";
import Layout from "./components/Layout/Layout";

// Utilities
import PrivateRoute from "./components/PrivateRoute";

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(
            (currentUser) => {
                console.log("Auth state changed: ", currentUser);
                setUser(currentUser);
                setLoading(false);
            },
            (error) => {
                console.error("Error during auth state change:", error.message);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, []);

    if (loading) {
        console.log("Loading...");
        return <p>Loading...</p>;
    }

    return (
        <Router>
            <Routes>
                {/* Guest Routes */}
                <Route path="/" element={<GuestLayout><CategoryPage /></GuestLayout>} />
                <Route path="/category/:categoryTitle" element={<GuestLayout><CategoryPage /></GuestLayout>} />
                <Route path="/article/:articleId" element={<GuestLayout><ArticleDetail /></GuestLayout>} />
                <Route path="/search-results" element={<GuestLayout><SearchResults /></GuestLayout>} />

                {/* Public Routes */}
                <Route path="/login" element={<Login setUser={setUser} />} />
                <Route path="/register" element={<Register setUser={setUser} />} />

                {/* Authenticated Routes */}
                <Route
                    path="/:userType/:userId/dashboard"
                    element={
                        <PrivateRoute>
                            <Layout setUser={setUser}>
                                <Dashboard />
                            </Layout>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/:userType/:userId/category/:categoryTitle"
                    element={
                        <PrivateRoute>
                            <Layout setUser={setUser}>
                                <CategoryPage />
                            </Layout>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/:userType/:userId/articles/:articleId"
                    element={
                        <PrivateRoute>
                            <Layout setUser={setUser}>
                                <ArticleDetail />
                            </Layout>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/:userType/:userId/reset-password"
                    element={
                        <PrivateRoute>
                            <Layout setUser={setUser}>
                                <ResetPassword />
                            </Layout>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/:userType/:userId/delete-account"
                    element={
                        <PrivateRoute>
                            <Layout setUser={setUser}>
                                <DeleteAccount />
                            </Layout>
                        </PrivateRoute>
                    }
                />
                {/* Admin-Specific Routes */}
                <Route
                    path="/:userType/:userId/users"
                    element={
                        <PrivateRoute role="Admin">
                            <Layout setUser={setUser}>
                                <AdminUserManagement />
                            </Layout>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/:userType/:userId/content"
                    element={
                        <PrivateRoute role="Admin">
                            <Layout setUser={setUser}>
                                <AdminContentManagement />
                            </Layout>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/:userType/:userId/analytics"
                    element={
                        <PrivateRoute role="Admin">
                            <Layout setUser={setUser}>
                                <Analytics />
                            </Layout>
                        </PrivateRoute>
                    }
                />
                {/* Editor-Specific Routes */}
                <Route
                    path="/:userType/:userId/published"
                    element={
                        <PrivateRoute role="Editor">
                            <Layout setUser={setUser}>
                                <EditorPublishedArticles />
                            </Layout>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/:userType/:userId/add-article"
                    element={
                        <PrivateRoute role="Editor">
                            <Layout setUser={setUser}>
                                <AddArticle />
                            </Layout>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/:userType/:userId/add-live"
                    element={
                        <PrivateRoute role="Editor">
                            <Layout setUser={setUser}>
                                <AddLiveUpdate />
                            </Layout>
                        </PrivateRoute>
                    }
                />
                {/* User-Specific Routes */}
                <Route
                    path="/:userType/:userId/personalized"
                    element={
                        <PrivateRoute role="User">
                            <Layout setUser={setUser}>
                                <UserPersonalized />
                            </Layout>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/:userType/:userId/suggested-feed"
                    element={
                        <PrivateRoute role="User">
                            <Layout setUser={setUser}>
                                <UserSuggestedFeed />
                            </Layout>
                        </PrivateRoute>
                    }
                />
                {/* Dynamic Profile and Activity */}
                <Route
                    path="/:userType/:userId/profile"
                    element={
                        <PrivateRoute>
                            <Layout setUser={setUser}>
                                <DynamicProfile />
                            </Layout>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/:userType/:userId/activity"
                    element={
                        <PrivateRoute>
                            <Layout setUser={setUser}>
                                <DynamicActivity />
                            </Layout>
                        </PrivateRoute>
                    }
                />
            </Routes>
        </Router>
    );
}

function Dashboard() {
    const { userType } = useParams();

    if (userType === "admin") return <AdminDashboard />;
    if (userType === "editor") return <EditorDashboard />;
    if (userType === "user") return <UserDashboard />;
    return <div>Error: Invalid user type</div>;
}

function DynamicProfile() {
    const { userType } = useParams();

    switch (userType) {
        case "admin":
            return <AdminProfile />;
        case "user":
            return <UserProfile />;
        case "editor":
            return <EditorProfile />;
        default:
            return <div>Error: Invalid user type</div>;
    }
}

function DynamicActivity() {
    const { userType } = useParams();

    switch (userType) {
        case "admin":
            return <AdminActivity />;
        case "user":
            return <UserActivity />;
        case "editor":
            return <EditorActivity />;
        default:
            return <div>Error: Invalid user type</div>;
    }
}

export default App;
