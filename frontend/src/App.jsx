import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { DesignProvider } from "./context/DesignContext";
import GardenDesigner from "./components/GardenDesigner";
import Login from "./components/Login";
import Register from "./components/Register";
import RoleProtectedRoute from "./components/RoleProtectedRoute";
import AdminDashboard from "./components/AdminDashboard";
import InventoryDashboard from "./components/InventoryDashboard";
import StaffDashboard from "./components/StaffDashboard";
import DashboardLayout from "./components/DashboardLayout";
import ManageAvailability from "./components/ManageAvailability";
import BookService from "./components/BookService";
import MyBookings from "./components/MyBookings";
import UserOrders from "./components/UserOrders";
import OrderSuccess from "./components/OrderSuccess";
import LandingPage from "./components/LandingPage";
import ForgotPassword from "./components/ForgotPassword";
import "./App.css";

function App() {
  return (
    <Router>
      <AuthProvider>
        <DesignProvider>
          <div className="app-root">
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/order-success" element={<OrderSuccess />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              {/* User Dashboard / Studio */}
              <Route
                path="/user-dashboard"
                element={
                  <RoleProtectedRoute allowedRoles={['user']}>
                    <DashboardLayout>
                      <div style={{ padding: '30px' }}>
                        <h2>Welcome to your Dashboard!</h2>
                        <p>Use the sidebar to navigate to the 3D Studio or book a service.</p>
                      </div>
                    </DashboardLayout>
                  </RoleProtectedRoute>
                }
              />

              {/* My 3D Studio */}
              <Route
                path="/studio"
                element={
                  <RoleProtectedRoute allowedRoles={['user', 'admin', 'staff']}>
                    <DashboardLayout>
                      <GardenDesigner />
                    </DashboardLayout>
                  </RoleProtectedRoute>
                }
              />

              {/* Book Service (User) */}
              <Route
                path="/book-service"
                element={
                  <RoleProtectedRoute allowedRoles={['user']}>
                    <DashboardLayout>
                      <BookService />
                    </DashboardLayout>
                  </RoleProtectedRoute>
                }
              />

              {/* My Bookings (User) */}
              <Route
                path="/my-bookings"
                element={
                  <RoleProtectedRoute allowedRoles={['user']}>
                    <DashboardLayout>
                      <MyBookings />
                    </DashboardLayout>
                  </RoleProtectedRoute>
                }
              />

              {/* My Orders (User) */}
              <Route
                path="/my-orders"
                element={
                  <RoleProtectedRoute allowedRoles={['user']}>
                    <DashboardLayout>
                      <UserOrders />
                    </DashboardLayout>
                  </RoleProtectedRoute>
                }
              />

              {/* Staff Dashboard */}
              <Route
                path="/staff-dashboard"
                element={
                  <RoleProtectedRoute allowedRoles={['staff']}>
                    <DashboardLayout>
                      <StaffDashboard />
                    </DashboardLayout>
                  </RoleProtectedRoute>
                }
              />

              {/* Manage Availability (Admin/Staff) */}
              <Route
                path="/manage-availability"
                element={
                  <RoleProtectedRoute allowedRoles={['admin', 'staff']}>
                    <DashboardLayout>
                      <ManageAvailability />
                    </DashboardLayout>
                  </RoleProtectedRoute>
                }
              />

              {/* Admin Dashboard */}
              <Route
                path="/admin-dashboard"
                element={
                  <RoleProtectedRoute allowedRoles={['admin']}>
                    <DashboardLayout>
                      <AdminDashboard />
                    </DashboardLayout>
                  </RoleProtectedRoute>
                }
              />

              {/* View Bookings (Admin/Staff) */}
              <Route
                path="/view-bookings"
                element={
                  <RoleProtectedRoute allowedRoles={['admin', 'staff']}>
                    <DashboardLayout>
                      <StaffDashboard /> {/* Using StaffDashboard to display the bookings table */}
                    </DashboardLayout>
                  </RoleProtectedRoute>
                }
              />

              {/* Inventory Management (Admin/Staff) */}
              <Route
                path="/inventory"
                element={
                  <RoleProtectedRoute allowedRoles={['admin', 'staff']}>
                    <DashboardLayout>
                      <InventoryDashboard />
                    </DashboardLayout>
                  </RoleProtectedRoute>
                }
              />

              {/* Landing Page */}
              <Route path="/" element={<LandingPage />} />
            </Routes>
          </div>
        </DesignProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;