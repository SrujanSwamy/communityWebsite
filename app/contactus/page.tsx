"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/utils/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { useState, useEffect } from "react";
import { Phone, Mail, MapPin, Instagram, Facebook, Youtube, Calendar, ExternalLink, Clock } from "lucide-react";

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

export default function ContactUsPage() {
  const [contactUsData, setContactUs] = useState<ContactUs | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchContactUs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("ContactUs").select("*").single();

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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded-lg w-64 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-48 mx-auto"></div>
            </div>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse bg-white rounded-xl shadow-lg p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!contactUsData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4 text-[#B22222]">Contact Us</h1>
            <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8">
              <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Contact information unavailable</p>
              <p className="text-gray-400 text-sm mt-2">Please try refreshing the page</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-12">
      <div className="container mx-auto px-4">
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-[#B22222] to-[#8B0000] bg-clip-text text-transparent">
            Contact Us
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Get in touch with D.K. District Marati Samaja Seva Sangha. We're here to serve our community and preserve our cultural heritage.
          </p>
          {contactUsData.establishedYear && (
            <div className="flex items-center justify-center space-x-2 mt-4 text-gray-500">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">Serving since {contactUsData.establishedYear}</span>
            </div>
          )}
        </div>

        {/* Main Contact Card */}
        <div className="max-w-6xl mx-auto">
          <Card className="bg-white shadow-2xl border-0 rounded-2xl overflow-hidden">
            
            {/* Organization Header */}
            <CardHeader className="bg-gradient-to-r from-[#B22222] to-[#8B0000] text-white p-8">
              <CardTitle className="text-2xl md:text-3xl font-bold text-center">
                D.K. DISTRICT MARATI SAMAJA SEVA SANGHA
              </CardTitle>
              <p className="text-center text-red-100 text-lg mt-2">Mangalore</p>
            </CardHeader>

            <CardContent className="p-0">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                
                {/* Contact Information */}
                <div className="p-8 space-y-8">
                  <h3 className="text-2xl font-semibold text-[#4A2C2A] mb-6 border-b-2 border-[#B22222] pb-2">
                    Contact Information
                  </h3>

                  {/* Phone Numbers */}
                  <div className="space-y-4">
                    <div className="flex items-start space-x-4 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                      <div className="bg-[#B22222] p-3 rounded-full">
                        <Phone className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm font-medium uppercase tracking-wide">Primary Phone</p>
                        <a 
                          href={`tel:${contactUsData.phone}`}
                          className="text-lg font-semibold text-[#4A2C2A] hover:text-[#B22222] transition-colors"
                        >
                          {contactUsData.phone}
                        </a>
                        {contactUsData.alternatePhone && (
                          <a 
                            href={`tel:${contactUsData.alternatePhone}`}
                            className="block text-gray-600 hover:text-[#B22222] transition-colors mt-1"
                          >
                            Alt: {contactUsData.alternatePhone}
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Email */}
                    <div className="flex items-start space-x-4 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                      <div className="bg-[#B22222] p-3 rounded-full">
                        <Mail className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm font-medium uppercase tracking-wide">Email Address</p>
                        <a 
                          href={`mailto:${contactUsData.emailAddress}`}
                          className="text-lg font-semibold text-[#4A2C2A] hover:text-[#B22222] transition-colors break-all"
                        >
                          {contactUsData.emailAddress}
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Social Media */}
                  {(contactUsData.instagramHandle || contactUsData.facebookHandle || contactUsData.youtubeHandle) && (
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-[#4A2C2A]">Follow Us</h4>
                      <div className="flex flex-wrap gap-4">
                        {contactUsData.instagramHandle && (
                          <a
                            href={`https://instagram.com/${contactUsData.instagramHandle.replace('@', '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                          >
                            <Instagram className="w-4 h-4" />
                            <span>Instagram</span>
                          </a>
                        )}
                        
                        {contactUsData.facebookHandle && (
                          <a
                            href={`https://facebook.com/${contactUsData.facebookHandle}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                          >
                            <Facebook className="w-4 h-4" />
                            <span>Facebook</span>
                          </a>
                        )}
                        
                        {contactUsData.youtubeHandle && (
                          <a
                            href={`https://youtube.com/@${contactUsData.youtubeHandle.replace('@', '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                          >
                            <Youtube className="w-4 h-4" />
                            <span>YouTube</span>
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Location & Address */}
                <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 space-y-6">
                  <h3 className="text-2xl font-semibold text-[#4A2C2A] mb-6 border-b-2 border-[#B22222] pb-2">
                    Visit Us
                  </h3>

                  {/* Location */}
                  <div className="flex items-start space-x-4 p-4 bg-white rounded-lg shadow-sm">
                    <div className="bg-[#B22222] p-3 rounded-full">
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-600 text-sm font-medium uppercase tracking-wide">Location</p>
                      <p className="text-lg font-semibold text-[#4A2C2A] mb-2">
                        {contactUsData.location}
                      </p>
                      
                      {contactUsData.address && (
                        <div className="mt-3">
                          <p className="text-gray-600 text-sm font-medium uppercase tracking-wide">Full Address</p>
                          <p className="text-gray-700 leading-relaxed">
                            {contactUsData.address}
                          </p>
                        </div>
                      )}

                      {contactUsData.googleMapsUrl && (
                        <div className="mt-4">
                          <a
                            href={contactUsData.googleMapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-2 bg-[#B22222] hover:bg-[#8B0000] text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                          >
                            <MapPin className="w-4 h-4" />
                            <span>View on Google Maps</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Office Hours (placeholder - you can add this to database later) */}
                 
                </div>
              </div>

              {/* Map Section (if Google Maps URL is available) */}
              {contactUsData.googleMapsUrl && (
                <div className="bg-gray-100 p-8 border-t">
                  <h3 className="text-xl font-semibold text-[#4A2C2A] mb-4 text-center">Find Us Here</h3>
                  <div className="max-w-4xl mx-auto">
                    <div className="aspect-video rounded-lg overflow-hidden shadow-lg">
                      <iframe
                        src={contactUsData.googleMapsUrl.replace('/maps/', '/maps/embed?')}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        className="w-full h-full"
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Additional Information */}
        <div className="max-w-4xl mx-auto mt-8 text-center">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-[#4A2C2A] mb-3">
              Questions or Need Assistance?
            </h3>
            <p className="text-gray-600 mb-4">
              Feel free to reach out to us through any of the contact methods above. 
              We're committed to serving our community and preserving our cultural heritage.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={`tel:${contactUsData.phone}`}
                className="bg-[#B22222] hover:bg-[#8B0000] text-white px-6 py-3 rounded-lg transition-colors duration-200 font-medium"
              >
                Call Us Now
              </a>
              <a
                href={`mailto:${contactUsData.emailAddress}`}
                className="border-2 border-[#B22222] text-[#B22222] hover:bg-[#B22222] hover:text-white px-6 py-3 rounded-lg transition-colors duration-200 font-medium"
              >
                Send Email
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}