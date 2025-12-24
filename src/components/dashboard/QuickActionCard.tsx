import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface QuickActionCardProps {
  icon: LucideIcon;
  label: string;
  description: string;
  onClick: () => void;
  delay?: number;
}

const QuickActionCard = ({ icon: Icon, label, description, onClick, delay = 0 }: QuickActionCardProps) => {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      onClick={onClick}
      className="bg-card rounded-xl p-5 border border-border hover:border-accent/30 transition-all duration-300 text-left group hover:shadow-card-hover"
    >
      <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
        <Icon className="w-6 h-6 text-accent" />
      </div>
      <h3 className="font-medium text-foreground mb-1">{label}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </motion.button>
  );
};

export default QuickActionCard;
