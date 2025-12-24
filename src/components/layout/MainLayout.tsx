import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar - Fixed */}
      <div className="hidden lg:block fixed left-0 top-0 h-screen z-40">
        <Sidebar />
      </div>

      {/* Mobile Navigation */}
      <MobileNav />

      {/* Main Content - With left margin for fixed sidebar */}
      <main className="flex-1 pt-16 pb-20 lg:pt-0 lg:pb-0 lg:ml-64 overflow-auto min-h-screen">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
