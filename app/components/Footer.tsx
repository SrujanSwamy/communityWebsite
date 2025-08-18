"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Phone, Mail, MapPin } from "lucide-react";

interface ContactUs {
  id: number;
  phone: string;
  alternatePhone: string;
  emailAddress: string;
  location: string;
}

export default function Footer() {
  const supabase = createClient();
  const [contactUsData, setContactUs] = useState<ContactUs | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchContactUs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("ContactUs")
        .select("*")
        .single();

      if (error) {
        console.error("ContactUs fetch error:", error);
        toast({
          title: "Error",
          description: "Failed to fetch contact information",
          variant: "destructive",
        });
      } else {
        setContactUs(data);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      toast({
        title: "Error",
        description: "Failed to fetch contact information",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContactUs();
  }, []);

  if (loading) {
    return (
      <footer className="bg-black text-white p-4 mt-8 text-sm sm:text-base max-w-full overflow-hidden">
        <div className="container mx-auto text-center">
          <p>Loading contact information...</p>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-black text-white p-6 mt-8 text-sm sm:text-base max-w-full overflow-hidden">
      <div className="container mx-auto">
        {contactUsData ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center md:text-left">
            {/* Email Section */}
            <div className="flex items-center justify-center md:justify-start space-x-2">
              <Mail className="w-4 h-4 text-[#B22222]" />
              <div>
                <p className="text-gray-300 text-xs">Email</p>
                <a 
                  href={`mailto:${contactUsData.emailAddress}`}
                  className="hover:text-[#B22222] transition-colors"
                >
                  {contactUsData.emailAddress}
                </a>
              </div>
            </div>

            {/* Phone Section */}
            <div className="flex items-center justify-center md:justify-start space-x-2">
              <Phone className="w-4 h-4 text-[#B22222]" />
              <div>
                <p className="text-gray-300 text-xs">Phone</p>
                <div className="space-y-1">
                  <a 
                    href={`tel:${contactUsData.phone}`}
                    className="block hover:text-[#B22222] transition-colors"
                  >
                    {contactUsData.phone}
                  </a>
                  {contactUsData.alternatePhone && (
                    <a 
                      href={`tel:${contactUsData.alternatePhone}`}
                      className="block text-gray-400 hover:text-[#B22222] transition-colors text-xs"
                    >
                      Alt: {contactUsData.alternatePhone}
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Location Section */}
            <div className="flex items-center justify-center md:justify-start space-x-2">
              <MapPin className="w-4 h-4 text-[#B22222]" />
              <div>
                <p className="text-gray-300 text-xs">Location</p>
                <p className="hover:text-[#B22222] transition-colors">
                  {contactUsData.location}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-400">
            <p>Contact information unavailable</p>
          </div>
        )}
        
        {/* Copyright Section */}
        <div className="border-t border-gray-800 mt-6 pt-4 text-center">
          <p className="text-gray-400 text-xs">
           D.K. DISTRICT MARATI SAMAJA SEVA SANGHA ® MANGALORE
          </p>
        </div>
      </div>
    </footer>
  );
}