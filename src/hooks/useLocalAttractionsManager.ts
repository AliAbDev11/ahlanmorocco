import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";

type LocalAttraction = Tables<"local_attractions">;

interface CreateAttractionParams {
  name: string;
  description?: string;
  category: string;
  distance_km?: number;
  address?: string;
  rating?: number;
  operating_hours?: string;
  image_url?: string;
  google_maps_url?: string;
  is_active?: boolean;
}

export const useLocalAttractionsManager = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const createAttraction = async (params: CreateAttractionParams) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("local_attractions")
        .insert({
          name: params.name,
          description: params.description || null,
          category: params.category,
          distance_km: params.distance_km || null,
          address: params.address || null,
          rating: params.rating || null,
          operating_hours: params.operating_hours || null,
          image_url: params.image_url || null,
          google_maps_url: params.google_maps_url || null,
          is_active: params.is_active ?? true,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Attraction created successfully",
      });
      return true;
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to create attraction",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateAttraction = async (id: string, params: Partial<CreateAttractionParams>) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("local_attractions")
        .update(params)
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Attraction updated successfully",
      });
      return true;
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to update attraction",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteAttraction = async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("local_attractions")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Attraction deleted successfully",
      });
      return true;
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to delete attraction",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const toggleAttractionStatus = async (id: string, isActive: boolean) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("local_attractions")
        .update({ is_active: isActive })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Attraction ${isActive ? "activated" : "deactivated"} successfully`,
      });
      return true;
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to update attraction status",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    createAttraction,
    updateAttraction,
    deleteAttraction,
    toggleAttractionStatus,
  };
};
