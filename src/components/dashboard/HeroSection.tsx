import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MessageSquare, Cloud, Sun } from "lucide-react";

interface HeroSectionProps {
  guestName: string;
  roomNumber: string;
}

const HeroSection = ({ guestName, roomNumber }: HeroSectionProps) => {
  const navigate = useNavigate();
  
  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-navy to-navy-dark p-8 mb-8"
    >
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gold-light/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
      
      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <p className="text-gold-light text-sm font-medium mb-1">
            {getGreeting()}
          </p>
          <h1 className="text-3xl md:text-4xl font-serif text-cream mb-2">
            {guestName}
          </h1>
          <div className="flex items-center gap-4 text-cream/80 text-sm">
            <span className="flex items-center gap-1">
              Room {roomNumber}
            </span>
            <span className="w-1 h-1 rounded-full bg-cream/40" />
            <span className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-accent" />
              24°C Sunny
            </span>
          </div>
        </div>
        
        <Button
          onClick={() => navigate("/chatbot")}
          className="btn-gold flex items-center gap-2 px-6 py-3 h-auto"
        >
          <MessageSquare className="w-5 h-5" />
          Chat with Concierge
        </Button>
      </div>
    </motion.div>
  );
};

export default HeroSection;
