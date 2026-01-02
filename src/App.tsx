import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider } from "@/contexts/SidebarContext";
import Login from "./pages/Login";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Chatbot from "./pages/Chatbot";
import Services from "./pages/Services";
import HotelMap from "./pages/HotelMap";
import Menu from "./pages/Menu";
import LocalGuide from "./pages/LocalGuide";
import Requests from "./pages/Requests";
import MainLayout from "./components/layout/MainLayout";
import NotFound from "./pages/NotFound";
import GuestAccess from "./pages/GuestAccess";

// Staff imports
import StaffLogin from "./pages/staff/StaffLogin";
import StaffLayout from "./components/staff/StaffLayout";
import StaffProtectedRoute from "./components/staff/StaffProtectedRoute";
import StaffDashboard from "./pages/staff/StaffDashboard";
import GuestManagement from "./pages/staff/GuestManagement";
import RoomManagement from "./pages/staff/RoomManagement";
import OrdersManagement from "./pages/staff/OrdersManagement";
import ServiceRequestsManagement from "./pages/staff/ServiceRequestsManagement";
import ReclamationsManagement from "./pages/staff/ReclamationsManagement";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <SidebarProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/guest-access" element={<GuestAccess />} />
            <Route element={<MainLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/chatbot" element={<Chatbot />} />
              <Route path="/services" element={<Services />} />
              <Route path="/map" element={<HotelMap />} />
              <Route path="/menu" element={<Menu />} />
              <Route path="/guide" element={<LocalGuide />} />
              <Route path="/requests" element={<Requests />} />
            </Route>
            
            {/* Staff Routes */}
            <Route path="/staff/login" element={<StaffLogin />} />
            <Route
              element={
                <StaffProtectedRoute>
                  <StaffLayout />
                </StaffProtectedRoute>
              }
            >
              <Route path="/staff" element={<StaffDashboard />} />
              <Route path="/staff/guests" element={<GuestManagement />} />
              <Route path="/staff/rooms" element={<RoomManagement />} />
              <Route path="/staff/orders" element={<OrdersManagement />} />
              <Route path="/staff/requests" element={<ServiceRequestsManagement />} />
              <Route path="/staff/reclamations" element={<ReclamationsManagement />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </SidebarProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
