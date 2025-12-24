import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ShoppingCart,
  Plus,
  Minus,
  X,
  Clock,
  ChevronRight,
  Coffee,
  UtensilsCrossed,
  Wine,
  Cake,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
}

interface CartItem extends MenuItem {
  quantity: number;
}

const categories = [
  { id: "breakfast", label: "Breakfast", icon: Coffee },
  { id: "lunch", label: "Lunch", icon: UtensilsCrossed },
  { id: "dinner", label: "Dinner", icon: UtensilsCrossed },
  { id: "drinks", label: "Drinks", icon: Wine },
  { id: "desserts", label: "Desserts", icon: Cake },
];

const menuItems: MenuItem[] = [
  {
    id: 1,
    name: "Classic Continental Breakfast",
    description: "Croissants, fresh fruit, yogurt parfait, and artisanal coffee",
    price: 28,
    category: "breakfast",
    image: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=400&h=300&fit=crop",
  },
  {
    id: 2,
    name: "Eggs Benedict Royale",
    description: "Poached eggs, smoked salmon, hollandaise on brioche",
    price: 32,
    category: "breakfast",
    image: "https://images.unsplash.com/photo-1608039829572-ee5e15baa9ab?w=400&h=300&fit=crop",
  },
  {
    id: 3,
    name: "Mediterranean Salad",
    description: "Mixed greens, feta, olives, cherry tomatoes, lemon vinaigrette",
    price: 24,
    category: "lunch",
    image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=300&fit=crop",
  },
  {
    id: 4,
    name: "Wagyu Beef Burger",
    description: "Premium wagyu patty, aged cheddar, truffle aioli, brioche bun",
    price: 45,
    category: "lunch",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop",
  },
  {
    id: 5,
    name: "Pan-Seared Salmon",
    description: "Atlantic salmon, asparagus, lemon butter sauce, wild rice",
    price: 52,
    category: "dinner",
    image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop",
  },
  {
    id: 6,
    name: "Filet Mignon",
    description: "8oz prime beef tenderloin, truffle mash, seasonal vegetables",
    price: 68,
    category: "dinner",
    image: "https://images.unsplash.com/photo-1558030006-450675393462?w=400&h=300&fit=crop",
  },
  {
    id: 7,
    name: "Signature Cocktail",
    description: "Our bartender's special creation of the day",
    price: 18,
    category: "drinks",
    image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&h=300&fit=crop",
  },
  {
    id: 8,
    name: "Premium Wine Selection",
    description: "Glass of curated red, white, or rosé wine",
    price: 22,
    category: "drinks",
    image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&h=300&fit=crop",
  },
  {
    id: 9,
    name: "Chocolate Fondant",
    description: "Warm chocolate cake with molten center, vanilla ice cream",
    price: 16,
    category: "desserts",
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=300&fit=crop",
  },
  {
    id: 10,
    name: "Crème Brûlée",
    description: "Classic French vanilla custard with caramelized sugar",
    price: 14,
    category: "desserts",
    image: "https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?w=400&h=300&fit=crop",
  },
];

const Menu = () => {
  const [activeCategory, setActiveCategory] = useState("breakfast");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [specialRequests, setSpecialRequests] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");
  const { toast } = useToast();

  const filteredItems = menuItems.filter((item) => item.category === activeCategory);

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    toast({
      title: "Added to cart",
      description: `${item.name} has been added to your order.`,
    });
  };

  const updateQuantity = (id: number, change: number) => {
    setCart((prev) => {
      return prev
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity + change } : item
        )
        .filter((item) => item.quantity > 0);
    });
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleSubmitOrder = () => {
    toast({
      title: "Order Placed!",
      description: "Your order has been submitted. Estimated delivery: 30-45 minutes.",
    });
    setCart([]);
    setIsCartOpen(false);
    setShowOrderForm(false);
    setSpecialRequests("");
    setDeliveryTime("");
  };

  return (
    <div className="min-h-screen p-6 lg:p-8 pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl lg:text-4xl font-serif text-foreground mb-2">
              In-Room Dining
            </h1>
            <p className="text-muted-foreground flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Available 24/7 • Delivery in 30-45 minutes
            </p>
          </div>
          <Button
            variant="gold"
            className="relative"
            onClick={() => setIsCartOpen(true)}
          >
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-primary text-primary-foreground rounded-full text-xs flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Button>
        </div>
      </motion.div>

      {/* Categories */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8 overflow-x-auto"
      >
        <div className="flex gap-2 pb-2">
          {categories.map((category) => {
            const Icon = category.icon;
            const isActive = activeCategory === category.id;
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-4 h-4" />
                {category.label}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Menu Items */}
      <div className="grid md:grid-cols-2 gap-4">
        {filteredItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.05 }}
            className="menu-item-card flex overflow-hidden"
          >
            <img
              src={item.image}
              alt={item.name}
              className="w-32 h-32 object-cover flex-shrink-0"
            />
            <div className="flex-1 p-4 flex flex-col">
              <h3 className="font-medium text-foreground mb-1">{item.name}</h3>
              <p className="text-sm text-muted-foreground flex-1 line-clamp-2">
                {item.description}
              </p>
              <div className="flex items-center justify-between mt-3">
                <span className="text-lg font-serif text-accent">${item.price}</span>
                <Button
                  variant="gold-outline"
                  size="sm"
                  onClick={() => addToCart(item)}
                >
                  <Plus className="w-4 h-4" />
                  Add
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Cart Sidebar */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-foreground/50 z-40"
              onClick={() => setIsCartOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-card z-50 shadow-xl flex flex-col"
            >
              {/* Cart Header */}
              <div className="p-6 border-b border-border flex items-center justify-between">
                <h2 className="text-xl font-serif text-foreground">Your Order</h2>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 hover:bg-secondary rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-6">
                {cart.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Your cart is empty</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-4 bg-secondary/50 rounded-xl p-3"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-foreground text-sm truncate">
                            {item.name}
                          </h4>
                          <p className="text-accent font-medium">${item.price}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Order Form */}
                {showOrderForm && cart.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 space-y-4"
                  >
                    <div className="space-y-2">
                      <Label>Delivery Time</Label>
                      <Select value={deliveryTime} onValueChange={setDeliveryTime}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="asap">As soon as possible</SelectItem>
                          <SelectItem value="30">In 30 minutes</SelectItem>
                          <SelectItem value="60">In 1 hour</SelectItem>
                          <SelectItem value="90">In 1.5 hours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Special Requests</Label>
                      <Textarea
                        value={specialRequests}
                        onChange={(e) => setSpecialRequests(e.target.value)}
                        placeholder="Any allergies or special requests?"
                        className="bg-secondary/50"
                      />
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Cart Footer */}
              {cart.length > 0 && (
                <div className="p-6 border-t border-border space-y-4">
                  <div className="flex items-center justify-between text-lg">
                    <span className="text-muted-foreground">Total</span>
                    <span className="font-serif text-foreground">${cartTotal.toFixed(2)}</span>
                  </div>
                  {!showOrderForm ? (
                    <Button
                      variant="gold"
                      size="lg"
                      className="w-full"
                      onClick={() => setShowOrderForm(true)}
                    >
                      Proceed to Order
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      variant="gold"
                      size="lg"
                      className="w-full"
                      onClick={handleSubmitOrder}
                    >
                      Place Order
                    </Button>
                  )}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Menu;
