"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/utils/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

interface AboutUs {
  id: number;
  heading: string;
  description: string;
  created_at: string;
}

export default function AboutUsPage() {
  const supabase = createClient();
  const [heading, setHeading] = useState("");
  const [aboutContent, setAboutContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [aboutData, setAboutData] = useState<AboutUs | null>(null);

  useEffect(() => {
    fetchAboutData();
  }, []);

  const fetchAboutData = async () => {
    setLoading(true);
    try {
      console.log("Fetching about data...");
      
      const { data, error } = await supabase
        .from("AboutUs")
        .select("*")
        .maybeSingle(); // Use maybeSingle() instead of single() to handle no rows gracefully

      console.log("Fetch result:", { data, error });

      if (error) {
        console.error("Error fetching about data:", error);
        toast({
          title: "Error",
          description: `Failed to fetch about information: ${error.message}`,
          variant: "destructive",
        });
      } else if (data) {
        console.log("Setting data:", data);
        setAboutData(data);
        setHeading(data.heading || "");
        setAboutContent(data.description || "");
      } else {
        console.log("No existing data found, starting fresh");
        // No existing data, start with empty form
        setAboutData(null);
        setHeading("");
        setAboutContent("");
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while fetching data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAboutContent = async () => {
    if (!heading.trim() || !aboutContent.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in both heading and description",
        variant: "destructive",
      });
      return;
    }

    setUpdating(true);

    try {
      const updateData = {
        heading: heading.trim(),
        description: aboutContent.trim(),
      };

      console.log("Updating with data:", updateData);

      let result;
      if (aboutData?.id) {
        // Update existing record
        console.log("Updating existing record with ID:", aboutData.id);
        result = await supabase
          .from("AboutUs")
          .update(updateData)
          .eq("id", aboutData.id)
          .select()
          .single();
      } else {
        // Insert new record
        console.log("Inserting new record");
        result = await supabase
          .from("AboutUs")
          .insert([updateData])
          .select()
          .single();
      }

      console.log("Operation result:", result);

      if (result.error) {
        console.error("Database operation error:", result.error);
        toast({
          title: "Error",
          description: `Failed to save: ${result.error.message}`,
          variant: "destructive",
        });
      } else if (result.data) {
        console.log("Successfully saved:", result.data);
        setAboutData(result.data);
        toast({
          title: "Success",
          description: aboutData?.id ? "About information updated successfully!" : "About information created successfully!",
        });
      }
    } catch (error) {
      console.error("Unexpected error during save:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while saving",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  // Test connection function
  const testConnection = async () => {
    try {
      console.log("Testing database connection...");
      const { data, error } = await supabase
        .from("AboutUs")
        .select("count", { count: "exact", head: true });
      
      console.log("Connection test result:", { data, error });
      
      if (error) {
        toast({
          title: "Connection Error",
          description: `Database connection failed: ${error.message}`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Connection Success",
          description: "Database connection is working!",
        });
      }
    } catch (error) {
      console.error("Connection test error:", error);
      toast({
        title: "Connection Error",
        description: "Failed to test database connection",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF9E6] py-8 px-4">
        <div className="container mx-auto">
          <Card className="max-w-4xl mx-auto bg-white border-2 border-[#B22222]">
            <CardContent className="pt-6">
              <div className="text-center text-[#B22222]">
                Loading about information...
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF9E6] py-8 px-4">
      <div className="container mx-auto">
        <div className="max-w-4xl mx-auto">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAboutContent();
            }}
          >
            <Card className="bg-white border-2 border-[#B22222]">
              <CardHeader>
                <CardTitle className="text-[#B22222]">
                  {aboutData?.id ? "Update About Us Content" : "Create About Us Content"}
                </CardTitle>
                {aboutData && (
                  <p className="text-sm text-gray-600">
                    Last updated: {new Date(aboutData.created_at).toLocaleDateString()} (ID: {aboutData.id})
                  </p>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="heading" className="text-[#4A2C2A]">
                      Heading *
                    </Label>
                    <Input
                      id="heading"
                      value={heading}
                      required
                      placeholder="Enter heading for about us section"
                      onChange={(e) => setHeading(e.target.value)}
                      className="border-[#B22222]"
                    />
                    <p className="text-xs text-gray-500">
                      Current value: "{heading}"
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-[#4A2C2A]">
                      Description *
                    </Label>
                    <Textarea
                      id="description"
                      value={aboutContent}
                      onChange={(e) => setAboutContent(e.target.value)}
                      required
                      placeholder="Enter the about us content and description"
                      className="border-[#B22222]"
                      rows={8}
                    />
                    <p className="text-xs text-gray-500">
                      Character count: {aboutContent.length}
                    </p>
                  </div>
                  
                  <div className="flex gap-4">
                    <Link href="/admin/dashboard" className="flex-1">
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="w-full border-[#B22222] text-[#B22222] hover:bg-[#FFF3E0]"
                      >
                        Cancel
                      </Button>
                    </Link>
                    <Button
                      type="submit"
                      className="flex-1 bg-[#B22222] text-white hover:bg-[#8B0000]"
                      disabled={updating || !heading.trim() || !aboutContent.trim()}
                    >
                      {updating 
                        ? "Saving..." 
                        : aboutData?.id 
                          ? "Update About Content" 
                          : "Create About Content"
                      }
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </form>

        </div>
      </div>
    </div>
  );
}