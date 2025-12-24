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
  },
  {
    icon: MessageSquare,
    title: "24/7 AI Concierge",
    description: "Our intelligent chatbot is always ready to help. Ask questions, make requests, or get recommendations any time.",
  },
  {
    icon: Utensils,
    title: "In-Room Dining",
    description: "Browse our exquisite menu and order directly to your room. From gourmet cuisine to refreshing beverages.",
  },
  {
    icon: Map,
    title: "Interactive Hotel Map",
    description: "Navigate our property with ease. Find restaurants, spa, pool, gym, and all amenities at a glance.",
  },
  {
    icon: Compass,
    title: "Local Discoveries",
    description: "Explore the best of the city. Curated recommendations for attractions, restaurants, and hidden gems.",
  },
  {
    icon: Sparkles,
    title: "You're All Set!",
    description: "Enjoy your stay at Grand Azure Hotel. We're here to make every moment exceptional.",
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
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-20 p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        {/* Dark blue header section */}
        <div className="bg-[hsl(var(--navy))] px-8 pt-12 pb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
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
                className="w-16 h-16 rounded-xl bg-[hsl(var(--gold))] flex items-center justify-center mb-5 shadow-lg"
              >
                <Icon className="w-8 h-8 text-[hsl(var(--navy))]" />
              </motion.div>

              {/* Title */}
              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 }}
                className="text-2xl font-serif text-white"
              >
                {step.title}
              </motion.h1>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* White bottom section */}
        <div className="bg-white px-8 py-6">
          <AnimatePresence mode="wait">
            <motion.p
              key={currentStep}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="text-muted-foreground text-center leading-relaxed mb-6"
            >
              {step.description}
            </motion.p>
          </AnimatePresence>

          {/* Progress indicators */}
          <div className="flex justify-center gap-1.5 mb-6">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === currentStep
                    ? "w-6 bg-[hsl(var(--gold))]"
                    : index < currentStep
                    ? "w-1.5 bg-[hsl(var(--gold))]/50"
                    : "w-1.5 bg-border"
                }`}
              />
            ))}
          </div>

          {/* Navigation buttons */}
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

            <Button 
              variant="gold" 
              onClick={handleNext}
              className="px-6"
            >
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
