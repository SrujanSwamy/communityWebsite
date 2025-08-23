"use client"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";

import { createClient } from "@/utils/supabase/client"

// Supabase client simulation for demo
const supabase = createClient()

interface AboutUs {
  id: number;
  heading: string;
  description: string;
  created_at?: string;
}

export default function AboutCommunityPage() {
  const [aboutUs, setAboutUs] = useState<AboutUs | null>(null);
  const [loading, setLoading] = useState(true);
  
  const supabase = createClient();

  const fetchAboutUs = async () => {
    try {
      setLoading(true);
      const { data: aboutUsData, error: aboutUsError } = await supabase
        .from("AboutUs")
        .select("*")
        .single();

      if (aboutUsError) {
        toast({
          title: "Error",
          description: "Failed to fetch about us information",
          variant: "destructive",
        });
        return;
      }
      
      setAboutUs(aboutUsData as AboutUs);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAboutUs();
  }, []);

  const formatHeading = (heading: string) => {
    if (heading.includes(" and ")) {
      const parts = heading.split(" and ");
      return (
        <div className="text-center">
          <div>{parts[0].trim()}</div>
          <div className="text-lg font-medium my-2">and</div>
          <div>{parts[1].trim()}</div>
        </div>
      );
    }
    return <div className="text-center">{heading}</div>;
  };

  const formatDescription = (description: string) => {
    return description.split('\n\n').map((paragraph, index) => (
      <p key={index} className="mb-4 text-justify text-[#4A2C2A] leading-relaxed">
        {paragraph.trim()}
      </p>
    ));
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 bg-gradient-to-br from-[#FAF3E0] to-[#F5E6D3] min-h-screen">
        <div className="flex justify-center items-center h-64">
          <div className="animate-pulse text-[#B22222] text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4 bg-gradient-to-br from-[#FAF3E0] to-[#F5E6D3] min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-12 text-center text-[#B22222] tracking-wide">
          About Our Community
        </h1>
        
        <Card className="bg-white/80 backdrop-blur-sm border-[#B22222]/30 border-2 shadow-xl rounded-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-[#B22222]/5 to-[#B22222]/10 text-center py-8">
            <CardTitle className="text-2xl font-semibold text-[#B22222] mb-2">
              {aboutUs?.heading ? formatHeading(aboutUs.heading) : "Loading..."}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-8">
            <div className="prose prose-lg max-w-none text-center">
              {aboutUs?.description ? (
                <div className="space-y-4">
                  {formatDescription(aboutUs.description)}
                </div>
              ) : (
                <p className="text-[#4A2C2A]">No description available.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <div className="inline-block w-16 h-1 bg-gradient-to-r from-[#B22222] to-[#B22222]/50 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}