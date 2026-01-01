import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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

// Staff imports
import StaffLogin from "./pages/staff/StaffLogin";
import StaffLayout from "./components/staff/StaffLayout";
import StaffProtectedRoute from "./components/staff/StaffProtectedRoute";
import StaffDashboard from "./pages/staff/StaffDashboard";
import StaffTasks from "./pages/staff/StaffTasks";
import StaffOrders from "./pages/staff/StaffOrders";
import StaffServices from "./pages/staff/StaffServices";
import StaffReclamations from "./pages/staff/StaffReclamations";
import StaffProfile from "./pages/staff/StaffProfile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <SidebarProvider>
        <BrowserRouter>
          <Routes>
            {/* Guest Routes */}
            <Route path="/" element={<Login />} />
            <Route path="/onboarding" element={<Onboarding />} />
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
              <Route path="/staff/dashboard" element={<StaffDashboard />} />
              <Route path="/staff/tasks" element={<StaffTasks />} />
              <Route path="/staff/orders" element={<StaffOrders />} />
              <Route path="/staff/services" element={<StaffServices />} />
              <Route path="/staff/reclamations" element={<StaffReclamations />} />
              <Route path="/staff/profile" element={<StaffProfile />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </SidebarProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
