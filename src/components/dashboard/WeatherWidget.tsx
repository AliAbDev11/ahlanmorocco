import { motion } from "framer-motion";
import { Sun, Cloud, Droplets, Wind } from "lucide-react";

const WeatherWidget = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-card rounded-xl p-6 border border-border"
    >
      <h3 className="font-serif text-lg text-foreground mb-4">Today's Weather</h3>
      
      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
          <Sun className="w-8 h-8 text-accent" />
        </div>
        <div>
          <p className="text-3xl font-semibold text-foreground">24°C</p>
          <p className="text-muted-foreground">Sunny</p>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
        <div className="text-center">
          <Droplets className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
          <p className="text-xs text-muted-foreground">Humidity</p>
          <p className="text-sm font-medium text-foreground">45%</p>
        </div>
        <div className="text-center">
          <Wind className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
          <p className="text-xs text-muted-foreground">Wind</p>
          <p className="text-sm font-medium text-foreground">12 km/h</p>
        </div>
        <div className="text-center">
          <Cloud className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
          <p className="text-xs text-muted-foreground">UV Index</p>
          <p className="text-sm font-medium text-foreground">High</p>
        </div>
      </div>
    </motion.div>
  );
};

export default WeatherWidget;
