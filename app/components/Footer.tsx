"use client";

import Link from "next/link"
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Phone, Mail, MapPin, Instagram, Facebook, Youtube, ExternalLink } from "lucide-react";

interface ContactUs {
  id: number;
  phone: string;
  alternatePhone: string;
  emailAddress: string;
  location: string;
  address: string;
  googleMapsUrl: string;
  instagramHandle: string;
  facebookHandle: string;
  youtubeHandle: string;
  establishedYear: number;
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
      <footer className="bg-gradient-to-br from-gray-900 to-black text-white">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center">
            <div className="animate-pulse flex space-x-4">
              <div className="rounded-full bg-gray-700 h-4 w-4"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-700 rounded w-32"></div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white">
      {/* Main Footer Content */}
      <div className="container mx-auto px-6 py-12">
        {contactUsData ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Organization Info */}
            <div className="lg:col-span-1">
              <h3 className="text-xl font-bold text-[#B22222] mb-4">
                D.K. District Marati Samaja
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                Seva Sangha dedicated to serving the community and preserving our cultural heritage since {contactUsData.establishedYear || 'inception'}.
              </p>
              
              {/* Social Media Links */}
              <div className="flex space-x-4">
                {contactUsData.instagramHandle && (
                  <a
                    href={`https://instagram.com/${contactUsData.instagramHandle.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gray-800 p-2 rounded-full hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 transition-all duration-300 transform hover:scale-110"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                )}
                
                {contactUsData.facebookHandle && (
                  <a
                    href={`https://facebook.com/${contactUsData.facebookHandle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gray-800 p-2 rounded-full hover:bg-blue-600 transition-all duration-300 transform hover:scale-110"
                  >
                    <Facebook className="w-5 h-5" />
                  </a>
                )}
                
                {contactUsData.youtubeHandle && (
                  <a
                    href={`https://youtube.com/@${contactUsData.youtubeHandle.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gray-800 p-2 rounded-full hover:bg-red-600 transition-all duration-300 transform hover:scale-110"
                  >
                    <Youtube className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h4 className="text-lg font-semibold text-[#B22222] mb-4 border-b border-gray-700 pb-2">
                Contact Us
              </h4>
              
              {/* Email */}
              <div className="flex items-start space-x-3 mb-4">
                <div className="bg-[#B22222] p-2 rounded-lg">
                  <Mail className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wide">Email</p>
                  <a 
                    href={`mailto:${contactUsData.emailAddress}`}
                    className="text-white hover:text-[#B22222] transition-colors duration-200 break-all"
                  >
                    {contactUsData.emailAddress}
                  </a>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start space-x-3">
                <div className="bg-[#B22222] p-2 rounded-lg">
                  <Phone className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wide">Phone</p>
                  <a 
                    href={`tel:${contactUsData.phone}`}
                    className="block text-white hover:text-[#B22222] transition-colors duration-200"
                  >
                    {contactUsData.phone}
                  </a>
                  {contactUsData.alternatePhone && (
                    <a 
                      href={`tel:${contactUsData.alternatePhone}`}
                      className="block text-gray-400 hover:text-[#B22222] transition-colors duration-200 text-sm"
                    >
                      {contactUsData.alternatePhone}
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Location & Address */}
            <div>
              <h4 className="text-lg font-semibold text-[#B22222] mb-4 border-b border-gray-700 pb-2">
                Location
              </h4>
              
              <div className="flex items-start space-x-3 mb-4">
                <div className="bg-[#B22222] p-2 rounded-lg">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Address</p>
                  <p className="text-white text-sm leading-relaxed mb-3">
                    {contactUsData.address || contactUsData.location}
                  </p>
                  
                  {contactUsData.googleMapsUrl && (
                    <a
                      href={contactUsData.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 bg-gray-800 hover:bg-[#B22222] text-white px-3 py-2 rounded-md transition-all duration-200 text-sm"
                    >
                      <MapPin className="w-4 h-4" />
                      <span>View on Maps</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Admin & Quick Links */}
            <div>
              <h4 className="text-lg font-semibold text-[#B22222] mb-4 border-b border-gray-700 pb-2">
                Quick Links
              </h4>
              
              <div className="space-y-3">
                <Link 
                  href="/about"
                  className="block text-gray-300 hover:text-[#B22222] transition-colors duration-200"
                >
                  About Us
                </Link>
                <Link 
                  href="/events"
                  className="block text-gray-300 hover:text-[#B22222] transition-colors duration-200"
                >
                  Events
                </Link>
                <Link 
                  href="/contact"
                  className="block text-gray-300 hover:text-[#B22222] transition-colors duration-200"
                >
                  Contact
                </Link>
                
                {/* Admin Login - Styled differently for security */}
                <div className="pt-4 border-t border-gray-700">
                  <Link 
                    href="/login/admin"
                    className="inline-flex items-center space-x-2 text-xs text-gray-500 hover:text-gray-300 transition-colors duration-200"
                  >
                    <span>Admin login</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-400 py-12">
            <div className="mb-4">
              <MapPin className="w-12 h-12 mx-auto text-gray-600" />
            </div>
            <p>Contact information unavailable</p>
          </div>
        )}
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-700">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-center md:text-left">
              <p className="text-gray-400 text-sm">
                © {new Date().getFullYear()} D.K. District Marati Samaja Seva Sangha, Mangalore
              </p>
              <p className="text-gray-500 text-xs mt-1">
                All rights reserved. Preserving culture, serving community.
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link 
                href="/privacy-policy" 
                className="text-gray-400 hover:text-[#B22222] text-xs transition-colors duration-200"
              >
                Privacy Policy
              </Link>
              <span className="text-gray-600">•</span>
              <Link 
                href="/terms" 
                className="text-gray-400 hover:text-[#B22222] text-xs transition-colors duration-200"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}