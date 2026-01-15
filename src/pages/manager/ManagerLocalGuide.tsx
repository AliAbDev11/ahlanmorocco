import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { MapPin, Clock, Star, ExternalLink, Loader2, Plus, Pencil, Trash2, Eye, EyeOff, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { useLocalAttractionsManager } from "@/hooks/useLocalAttractionsManager";

type LocalAttraction = Tables<"local_attractions"> & { is_active?: boolean };

const categories = [
  "Museum",
  "Nature",
  "Dining",
  "Sightseeing",
  "Entertainment",
  "Shopping",
  "Historical",
  "Beach",
  "Other",
];

const ManagerLocalGuide = () => {
  const [attractions, setAttractions] = useState<LocalAttraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedAttraction, setSelectedAttraction] = useState<LocalAttraction | null>(null);
  
  const { loading: actionLoading, createAttraction, updateAttraction, deleteAttraction, toggleAttractionStatus } = useLocalAttractionsManager();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    distance_km: "",
    address: "",
    rating: "",
    operating_hours: "",
    image_url: "",
    google_maps_url: "",
    is_active: true,
  });

  const fetchAttractions = async () => {
    try {
      const { data, error } = await supabase
        .from("local_attractions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAttractions(data || []);
    } catch (err) {
      console.error("Failed to fetch attractions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttractions();
  }, []);

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      category: "",
      distance_km: "",
      address: "",
      rating: "",
      operating_hours: "",
      image_url: "",
      google_maps_url: "",
      is_active: true,
    });
  };

  const handleAddAttraction = async () => {
    const success = await createAttraction({
      name: formData.name,
      description: formData.description || undefined,
      category: formData.category,
      distance_km: formData.distance_km ? parseFloat(formData.distance_km) : undefined,
      address: formData.address || undefined,
      rating: formData.rating ? parseFloat(formData.rating) : undefined,
      operating_hours: formData.operating_hours || undefined,
      image_url: formData.image_url || undefined,
      google_maps_url: formData.google_maps_url || undefined,
      is_active: formData.is_active,
    });

    if (success) {
      setIsAddDialogOpen(false);
      resetForm();
      fetchAttractions();
    }
  };

  const handleEditAttraction = async () => {
    if (!selectedAttraction) return;

    const success = await updateAttraction(selectedAttraction.id, {
      name: formData.name,
      description: formData.description || undefined,
      category: formData.category,
      distance_km: formData.distance_km ? parseFloat(formData.distance_km) : undefined,
      address: formData.address || undefined,
      rating: formData.rating ? parseFloat(formData.rating) : undefined,
      operating_hours: formData.operating_hours || undefined,
      image_url: formData.image_url || undefined,
      google_maps_url: formData.google_maps_url || undefined,
      is_active: formData.is_active,
    });

    if (success) {
      setIsEditDialogOpen(false);
      setSelectedAttraction(null);
      resetForm();
      fetchAttractions();
    }
  };

  const handleDeleteAttraction = async (id: string) => {
    const success = await deleteAttraction(id);
    if (success) {
      fetchAttractions();
    }
  };

  const handleToggleStatus = async (attraction: LocalAttraction) => {
    const newStatus = !(attraction.is_active ?? true);
    const success = await toggleAttractionStatus(attraction.id, newStatus);
    if (success) {
      fetchAttractions();
    }
  };

  const openEditDialog = (attraction: LocalAttraction) => {
    setSelectedAttraction(attraction);
    setFormData({
      name: attraction.name,
      description: attraction.description || "",
      category: attraction.category,
      distance_km: attraction.distance_km?.toString() || "",
      address: attraction.address || "",
      rating: attraction.rating?.toString() || "",
      operating_hours: attraction.operating_hours || "",
      image_url: attraction.image_url || "",
      google_maps_url: attraction.google_maps_url || "",
      is_active: attraction.is_active ?? true,
    });
    setIsEditDialogOpen(true);
  };

  const filteredAttractions = attractions.filter((attraction) => {
    const matchesSearch =
      attraction.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attraction.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || attraction.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && (attraction.is_active ?? true)) ||
      (statusFilter === "inactive" && !(attraction.is_active ?? true));
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const AttractionForm = ({ onSubmit, submitLabel }: { onSubmit: () => void; submitLabel: string }) => (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Attraction name"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe the attraction"
          rows={3}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="category">Category *</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => setFormData({ ...formData, category: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="distance">Distance (km)</Label>
          <Input
            id="distance"
            type="number"
            step="0.1"
            value={formData.distance_km}
            onChange={(e) => setFormData({ ...formData, distance_km: e.target.value })}
            placeholder="0.0"
          />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          placeholder="Full address"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="rating">Rating (0-5)</Label>
          <Input
            id="rating"
            type="number"
            min="0"
            max="5"
            step="0.1"
            value={formData.rating}
            onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
            placeholder="4.5"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="hours">Operating Hours</Label>
          <Input
            id="hours"
            value={formData.operating_hours}
            onChange={(e) => setFormData({ ...formData, operating_hours: e.target.value })}
            placeholder="9 AM - 5 PM"
          />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="image">Image URL</Label>
        <Input
          id="image"
          type="url"
          value={formData.image_url}
          onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
          placeholder="https://..."
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="maps">Google Maps URL</Label>
        <Input
          id="maps"
          type="url"
          value={formData.google_maps_url}
          onChange={(e) => setFormData({ ...formData, google_maps_url: e.target.value })}
          placeholder="https://maps.google.com/..."
        />
      </div>
      <div className="flex items-center gap-2">
        <Switch
          id="is_active"
          checked={formData.is_active}
          onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
        />
        <Label htmlFor="is_active">Active (visible to guests)</Label>
      </div>
      <DialogFooter>
        <Button
          onClick={onSubmit}
          disabled={actionLoading || !formData.name || !formData.category}
        >
          {actionLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {submitLabel}
        </Button>
      </DialogFooter>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Local Guide Management</h1>
          <p className="text-muted-foreground">Manage local attractions for guests</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={(open) => { setIsAddDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Attraction
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Attraction</DialogTitle>
              <DialogDescription>
                Create a new local attraction for guests to discover.
              </DialogDescription>
            </DialogHeader>
            <AttractionForm onSubmit={handleAddAttraction} submitLabel="Add Attraction" />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search attractions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-2xl font-bold">{attractions.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Active</p>
            <p className="text-2xl font-bold text-green-600">
              {attractions.filter((a) => a.is_active ?? true).length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Inactive</p>
            <p className="text-2xl font-bold text-gray-500">
              {attractions.filter((a) => !(a.is_active ?? true)).length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Categories</p>
            <p className="text-2xl font-bold">
              {new Set(attractions.map((a) => a.category)).size}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Attractions Grid */}
      {filteredAttractions.length === 0 ? (
        <div className="text-center py-12">
          <MapPin className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No attractions found</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAttractions.map((attraction, index) => (
            <motion.div
              key={attraction.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className={`overflow-hidden ${!(attraction.is_active ?? true) ? "opacity-60" : ""}`}>
                <div className="relative h-40 overflow-hidden">
                  {attraction.image_url ? (
                    <img
                      src={attraction.image_url}
                      alt={attraction.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <MapPin className="w-12 h-12 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute top-2 left-2 flex gap-2">
                    <Badge variant="secondary">{attraction.category}</Badge>
                    <Badge variant={attraction.is_active ?? true ? "default" : "outline"}>
                      {attraction.is_active ?? true ? (
                        <><Eye className="w-3 h-3 mr-1" /> Active</>
                      ) : (
                        <><EyeOff className="w-3 h-3 mr-1" /> Hidden</>
                      )}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-foreground truncate">{attraction.name}</h3>
                    {attraction.rating && (
                      <div className="flex items-center gap-1 text-amber-500">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-sm font-medium">{attraction.rating}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {attraction.description || "No description"}
                  </p>
                  {attraction.operating_hours && (
                    <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {attraction.operating_hours}
                    </p>
                  )}
                  <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t">
                    <div className="flex items-center gap-1">
                      <Switch
                        checked={attraction.is_active ?? true}
                        onCheckedChange={() => handleToggleStatus(attraction)}
                        disabled={actionLoading}
                      />
                      <span className="text-xs text-muted-foreground">
                        {attraction.is_active ?? true ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(attraction)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Attraction?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{attraction.name}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteAttraction(attraction.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => { setIsEditDialogOpen(open); if (!open) { setSelectedAttraction(null); resetForm(); } }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Attraction</DialogTitle>
            <DialogDescription>
              Update the attraction details.
            </DialogDescription>
          </DialogHeader>
          <AttractionForm onSubmit={handleEditAttraction} submitLabel="Update Attraction" />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManagerLocalGuide;
