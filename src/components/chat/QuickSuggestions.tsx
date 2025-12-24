import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface QuickSuggestionsProps {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
}

const QuickSuggestions = ({ suggestions, onSelect }: QuickSuggestionsProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-6 pb-4"
    >
      <p className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
        <Sparkles className="w-4 h-4" />
        Quick suggestions
      </p>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => onSelect(suggestion)}
            className="px-3 py-2 bg-secondary rounded-lg text-sm text-foreground hover:bg-secondary/80 transition-colors"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </motion.div>
  );
};

export default QuickSuggestions;
