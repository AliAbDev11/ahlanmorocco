import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";
import { useSidebarContext } from "@/contexts/SidebarContext";
import { cn } from "@/lib/utils";
import { FullscreenButton } from "@/components/ui/fullscreen-button";

const MainLayout = () => {
  const { isCollapsed } = useSidebarContext();

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar - Fixed */}
      <div className="hidden lg:block fixed left-0 top-0 h-screen z-40">
        <Sidebar />
      </div>

      {/* Mobile Navigation */}
      <MobileNav />

      {/* Fullscreen Button - Fixed top right */}
      <div className="fixed top-4 right-4 z-50 hidden lg:block">
        <FullscreenButton variant="outline" showLabel={true} className="bg-card shadow-md" />
      </div>

      {/* Main Content - With left margin for fixed sidebar */}
      <main 
        className={cn(
          "flex-1 pt-16 pb-20 lg:pt-0 lg:pb-0 overflow-auto min-h-screen transition-[margin-left] duration-300 ease-in-out",
          isCollapsed ? "lg:ml-20" : "lg:ml-64"
        )}
      >
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
