import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  MessageSquare, 
  Utensils, 
  Map, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft,
  Home,
  Compass,
  X
} from "lucide-react";

const steps = [
  {
    icon: Home,
    title: "Your Personal Dashboard",
    description: "Access all hotel services from one place. Quick actions, notifications, and personalized recommendations await you.",
    color: "bg-primary",
  },
  {
    icon: MessageSquare,
    title: "24/7 AI Concierge",
    description: "Our intelligent chatbot is always ready to help. Ask questions, make requests, or get recommendations any time.",
    color: "bg-accent",
  },
  {
    icon: Utensils,
    title: "In-Room Dining",
    description: "Browse our exquisite menu and order directly to your room. From gourmet cuisine to refreshing beverages.",
    color: "bg-primary",
  },
  {
    icon: Map,
    title: "Interactive Hotel Map",
    description: "Navigate our property with ease. Find restaurants, spa, pool, gym, and all amenities at a glance.",
    color: "bg-accent",
  },
  {
    icon: Compass,
    title: "Local Discoveries",
    description: "Explore the best of the city. Curated recommendations for attractions, restaurants, and hidden gems.",
    color: "bg-primary",
  },
  {
    icon: Sparkles,
    title: "You're All Set!",
    description: "Enjoy your stay at hyatt regency Hotel. We're here to make every moment exceptional.",
    color: "bg-accent",
  },
];

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      navigate("/dashboard");
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    navigate("/dashboard");
  };

  const step = steps[currentStep];
  const Icon = step.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Dimmed backdrop with blur */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        className="relative z-10 w-full max-w-md mx-4 rounded-2xl overflow-hidden shadow-2xl"
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Dark Blue Header Section */}
        <div className="bg-[hsl(220,60%,20%)] px-8 pt-12 pb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={`header-${currentStep}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center text-center"
            >
              {/* Icon */}
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                className="w-20 h-20 rounded-2xl bg-accent flex items-center justify-center mb-6 shadow-lg"
              >
                <Icon className="w-10 h-10 text-accent-foreground" />
              </motion.div>

              {/* Title */}
              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-2xl font-serif text-white"
              >
                {step.title}
              </motion.h1>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* White Body Section */}
        <div className="bg-white px-8 py-6">
          <AnimatePresence mode="wait">
            <motion.p
              key={`desc-${currentStep}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="text-muted-foreground text-center leading-relaxed mb-6"
            >
              {step.description}
            </motion.p>
          </AnimatePresence>

          {/* Progress Dots */}
          <div className="flex justify-center gap-2 mb-6">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentStep
                    ? "w-6 bg-accent"
                    : index < currentStep
                    ? "w-2 bg-accent/50"
                    : "w-2 bg-border"
                }`}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrev}
              disabled={currentStep === 0}
              className={`text-muted-foreground ${currentStep === 0 ? "invisible" : ""}`}
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>

            <Button variant="gold" onClick={handleNext}>
              {currentStep === steps.length - 1 ? (
                <>
                  Get Started
                  <Sparkles className="w-4 h-4 ml-2" />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Onboarding;
