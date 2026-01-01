import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  Building,
  Shield,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useStaffAuth } from "@/hooks/useStaffAuth";
import { format } from "date-fns";

const StaffProfile = () => {
  const { staff } = useStaffAuth();

  if (!staff) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const profileFields = [
    { icon: Mail, label: "Email", value: staff.email },
    { icon: Phone, label: "Phone", value: staff.phone_number || "Not provided" },
    { icon: Building, label: "Department", value: staff.department || "Not assigned" },
    { icon: Shield, label: "Role", value: staff.role },
    { icon: Calendar, label: "Member Since", value: staff.created_at ? format(new Date(staff.created_at), "MMMM yyyy") : "Unknown" },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-semibold">My Profile</h1>
        <p className="text-muted-foreground">View your staff information</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <CardHeader className="text-center pb-2">
            <Avatar className="w-24 h-24 mx-auto mb-4">
              <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                {getInitials(staff.full_name)}
              </AvatarFallback>
            </Avatar>
            <CardTitle className="text-2xl">{staff.full_name}</CardTitle>
            <CardDescription className="flex items-center justify-center gap-2">
              <Badge variant="secondary" className="capitalize">
                {staff.role}
              </Badge>
              <Badge variant={staff.is_active ? "default" : "destructive"}>
                {staff.is_active ? "Active" : "Inactive"}
              </Badge>
            </CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="pt-6">
            <div className="space-y-4">
              {profileFields.map((field) => (
                <div key={field.label} className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-secondary">
                    <field.icon className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">{field.label}</p>
                    <p className="font-medium capitalize">{field.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default StaffProfile;
