import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, Mail, Lock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useStaffAuth } from "@/hooks/useStaffAuth";
import ahlanLogo from "@/assets/ahlan-logo.png";

const StaffLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading, isStaff, signIn } = useStaffAuth();

  useEffect(() => {
    if (!loading && user) {
      if (isStaff) {
        navigate("/staff/dashboard");
      } else {
        toast({
          title: "Access Denied",
          description: "You don't have staff access. Redirecting to guest portal.",
          variant: "destructive",
        });
        navigate("/dashboard");
      }
    }
  }, [user, loading, isStaff, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Missing fields",
        description: "Please enter both email and password",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const { error } = await signIn(email, password);

    if (error) {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Section - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary to-navy-dark flex-col justify-center items-center p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <img src={ahlanLogo} alt="AHLAN Hotel" className="h-24 mx-auto mb-8" />
          <h1 className="text-4xl font-serif text-primary-foreground mb-4">
            Staff Portal
          </h1>
          <p className="text-primary-foreground/80 text-lg max-w-md">
            Access your dashboard to manage guest requests, orders, and service tasks efficiently.
          </p>
          
          <div className="mt-12 grid grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-accent">24/7</div>
              <div className="text-primary-foreground/70 text-sm mt-1">Support</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent">500+</div>
              <div className="text-primary-foreground/70 text-sm mt-1">Rooms</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent">50+</div>
              <div className="text-primary-foreground/70 text-sm mt-1">Staff</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right Section - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden text-center mb-8">
            <img src={ahlanLogo} alt="AHLAN Hotel" className="h-16 mx-auto mb-4" />
          </div>

          <Card className="border-border/50 shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-2xl font-serif">Staff Login</CardTitle>
              <CardDescription>
                Enter your credentials to access the staff dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="staff@ahlanhotel.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      autoComplete="current-password"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  variant="gold"
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <a
                  href="/"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  ← Back to Guest Portal
                </a>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default StaffLogin;
