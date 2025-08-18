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

export default function CommunityPage() {
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
      const { data, error } = await supabase
        .from("AboutUs")
        .select("*")
        .single();

      if (error) {
        // If no data exists yet, that's okay - we'll create new data
        if (error.code !== 'PGRST116') {
          console.error("Error fetching about data:", error);
          toast({
            title: "Error",
            description: "Failed to fetch about information",
            variant: "destructive",
          });
        }
      } else if (data) {
        setAboutData(data);
        setHeading(data.heading || "");
        setAboutContent(data.description || "");
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      toast({
        title: "Error",
        description: "Failed to fetch about information",
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

      let result;
      if (aboutData) {
        // Update existing record
        result = await supabase
          .from("AboutUs")
          .update(updateData)
          .eq("id", aboutData.id)
          .select()
          .single();
      } else {
        // Insert new record
        result = await supabase
          .from("AboutUs")
          .insert([updateData])
          .select()
          .single();
      }

      if (result.error) {
        console.error("Error updating about data:", result.error);
        toast({
          title: "Error",
          description: "Failed to update about information",
          variant: "destructive",
        });
      } else {
        setAboutData(result.data);
        toast({
          title: "Success",
          description: "About information updated successfully.",
        });
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      toast({
        title: "Error",
        description: "Failed to update about information",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
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
                  {aboutData ? "Update About Us Content" : "Create About Us Content"}
                </CardTitle>
                {aboutData && (
                  <p className="text-sm text-gray-600">
                    Last updated: {new Date(aboutData.created_at).toLocaleDateString()}
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
                        ? "Updating..." 
                        : aboutData 
                          ? "Update About Content" 
                          : "Create About Content"
                      }
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </form>

         {/* 
          {(heading.trim() || aboutContent.trim()) && (
            <Card className="mt-6 bg-white border-2 border-[#B22222]">
              <CardHeader>
                <CardTitle className="text-[#B22222]">Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {heading.trim() && (
                    <h2 className="text-2xl font-bold text-[#B22222]">
                      {heading}
                    </h2>
                  )}
                  {aboutContent.trim() && (
                    <div className="prose prose-sm max-w-none">
                      <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                        {aboutContent}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )} */}
        </div>
      </div>
    </div>
  );
}