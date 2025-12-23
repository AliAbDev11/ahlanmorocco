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
  Compass
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
    description: "Enjoy your stay at Grand Azure Hotel. We're here to make every moment exceptional.",
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

  const handleSkip = () => {
    navigate("/dashboard");
  };

  const step = steps[currentStep];
  const Icon = step.icon;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Skip button */}
      <div className="absolute top-6 right-6 z-10">
        <Button variant="ghost" onClick={handleSkip} className="text-muted-foreground">
          Skip Tour
        </Button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center text-center max-w-lg"
          >
            {/* Icon */}
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className={`w-24 h-24 rounded-2xl ${step.color} flex items-center justify-center mb-8 shadow-lg`}
            >
              <Icon className="w-12 h-12 text-primary-foreground" />
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-3xl md:text-4xl font-serif text-foreground mb-4"
            >
              {step.title}
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-lg text-muted-foreground leading-relaxed"
            >
              {step.description}
            </motion.p>
          </motion.div>
        </AnimatePresence>

        {/* Progress indicators */}
        <div className="flex gap-2 mt-12">
          {steps.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentStep(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentStep
                  ? "w-8 bg-accent"
                  : index < currentStep
                  ? "bg-accent/50"
                  : "bg-border"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="p-8 flex justify-between items-center max-w-lg mx-auto w-full">
        <Button
          variant="ghost"
          onClick={handlePrev}
          disabled={currentStep === 0}
          className={currentStep === 0 ? "invisible" : ""}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Button variant="gold" size="lg" onClick={handleNext}>
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
  );
};

export default Onboarding;
