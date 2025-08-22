"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { createClient } from "@/utils/supabase/client"
import Link from "next/link"
import { Phone, Mail, MapPin, Instagram, Facebook, Youtube, Calendar, ExternalLink } from "lucide-react"

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

function UpdateContactPage() {
  const [phone, setPhone] = useState("")
  const [alternatePhone, setAlternatePhone] = useState("")
  const [email, setEmail] = useState("")
  const [location, setLocation] = useState("")
  const [address, setAddress] = useState("")
  const [googleMapsUrl, setGoogleMapsUrl] = useState("")
  const [instagramHandle, setInstagramHandle] = useState("")
  const [facebookHandle, setFacebookHandle] = useState("")
  const [youtubeHandle, setYoutubeHandle] = useState("")
  const [establishedYear, setEstablishedYear] = useState<number | "">(new Date().getFullYear())
  
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [contactData, setContactData] = useState<ContactUs | null>(null)

  const supabase = createClient()

  useEffect(() => {
    fetchContactData()
  }, [])

  const fetchContactData = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("ContactUs")
        .select("*")
        .single()

      if (error) {
        console.error("Error fetching contact data:", error)
        toast({
          title: "Error",
          description: "Failed to fetch contact information",
          variant: "destructive",
        })
      } else if (data) {
        setContactData(data)
        setPhone(data.phone || "")
        setAlternatePhone(data.alternatePhone || "")
        setEmail(data.emailAddress || "")
        setLocation(data.location || "")
        setAddress(data.address || "")
        setGoogleMapsUrl(data.googleMapsUrl || "")
        setInstagramHandle(data.instagramHandle || "")
        setFacebookHandle(data.facebookHandle || "")
        setYoutubeHandle(data.youtubeHandle || "")
        setEstablishedYear(data.establishedYear || "")
      }
    } catch (error) {
      console.error("Unexpected error:", error)
      toast({
        title: "Error",
        description: "Failed to fetch contact information",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const validateUrl = (url: string): boolean => {
    if (!url.trim()) return true; // Empty URL is allowed
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  const formatSocialHandle = (handle: string, platform: 'instagram' | 'facebook' | 'youtube'): string => {
    if (!handle.trim()) return "";
    
    let cleanHandle = handle.trim();
    
    // Remove full URLs and extract handle
    if (cleanHandle.includes(`${platform}.com/`)) {
      const parts = cleanHandle.split(`${platform}.com/`);
      if (parts.length > 1) {
        cleanHandle = parts[1].split('/')[0].split('?')[0];
      }
    }
    
    // Remove @ symbol if present
    cleanHandle = cleanHandle.replace(/^@/, '');
    
    return cleanHandle;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUpdating(true)

    // Validate required fields
    if (!phone.trim() || !email.trim() || !location.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (marked with *)",
        variant: "destructive",
      })
      setUpdating(false)
      return
    }

    // Validate Google Maps URL
    if (googleMapsUrl.trim() && !validateUrl(googleMapsUrl)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid Google Maps URL",
        variant: "destructive",
      })
      setUpdating(false)
      return
    }

    try {
      const updateData = {
        phone: phone.trim(),
        alternatePhone: alternatePhone.trim() || null,
        emailAddress: email.trim(),
        location: location.trim(),
        address: address.trim() || null,
        googleMapsUrl: googleMapsUrl.trim() || null,
        instagramHandle: formatSocialHandle(instagramHandle, 'instagram') || null,
        facebookHandle: formatSocialHandle(facebookHandle, 'facebook') || null,
        youtubeHandle: formatSocialHandle(youtubeHandle, 'youtube') || null,
        establishedYear: establishedYear ? Number(establishedYear) : null,
      }

      let result;
      if (contactData) {
        // Update existing record
        result = await supabase
          .from("ContactUs")
          .update(updateData)
          .eq("id", contactData.id)
          .select()
          .single()
      } else {
        // Insert new record
        result = await supabase
          .from("ContactUs")
          .insert([updateData])
          .select()
          .single()
      }

      if (result.error) {
        console.error("Error updating contact data:", result.error)
        toast({
          title: "Error",
          description: "Failed to update contact information",
          variant: "destructive",
        })
      } else {
        setContactData(result.data)
        toast({
          title: "Success",
          description: "Contact information updated successfully.",
        })
      }
    } catch (error) {
      console.error("Unexpected error:", error)
      toast({
        title: "Error",
        description: "Failed to update contact information",
        variant: "destructive",
      })
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
        <div className="container mx-auto">
          <Card className="max-w-4xl mx-auto bg-white shadow-lg">
            <CardContent className="pt-12">
              <div className="flex items-center justify-center space-x-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#B22222]"></div>
                <div className="text-[#B22222] text-lg">Loading contact information...</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="container mx-auto">
        <Card className="max-w-4xl mx-auto bg-white shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-[#B22222] to-[#8B0000] text-white rounded-t-lg">
            <CardTitle className="text-2xl font-bold flex items-center space-x-2">
              <Mail className="w-6 h-6" />
              <span>Update Contact Information</span>
            </CardTitle>
            <p className="text-red-100 mt-2">
              Manage all contact details and social media handles for your organization
            </p>
          </CardHeader>
          
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Basic Contact Information */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-[#4A2C2A] mb-4 flex items-center space-x-2">
                  <Phone className="w-5 h-5" />
                  <span>Basic Contact Information</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-[#4A2C2A] font-medium">
                      Primary Phone Number *
                    </Label>
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="border-gray-300 focus:border-[#B22222] focus:ring-[#B22222]"
                      placeholder="+91 12345 67890"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="alternatePhone" className="text-[#4A2C2A] font-medium">
                      Alternate Phone Number
                    </Label>
                    <Input
                      id="alternatePhone"
                      value={alternatePhone}
                      onChange={(e) => setAlternatePhone(e.target.value)}
                      className="border-gray-300 focus:border-[#B22222] focus:ring-[#B22222]"
                      placeholder="+91 98765 43210 (optional)"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="email" className="text-[#4A2C2A] font-medium">
                      Email Address *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="border-gray-300 focus:border-[#B22222] focus:ring-[#B22222]"
                      placeholder="contact@organization.com"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="establishedYear" className="text-[#4A2C2A] font-medium">
                      Established Year
                    </Label>
                    <Input
                      id="establishedYear"
                      type="number"
                      value={establishedYear}
                      onChange={(e) => setEstablishedYear(e.target.value ? Number(e.target.value) : "")}
                      className="border-gray-300 focus:border-[#B22222] focus:ring-[#B22222]"
                      placeholder="1990"
                      min="1800"
                      max={new Date().getFullYear()}
                    />
                  </div>
                </div>
              </div>

              {/* Address & Location */}
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-[#4A2C2A] mb-4 flex items-center space-x-2">
                  <MapPin className="w-5 h-5" />
                  <span>Address & Location</span>
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-[#4A2C2A] font-medium">
                      Location/City *
                    </Label>
                    <Input
                      id="location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="border-gray-300 focus:border-[#B22222] focus:ring-[#B22222]"
                      placeholder="Mangalore, Karnataka"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-[#4A2C2A] font-medium">
                      Full Address
                    </Label>
                    <Textarea
                      id="address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="border-gray-300 focus:border-[#B22222] focus:ring-[#B22222]"
                      placeholder="Complete address with street, area, city, pincode..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="googleMapsUrl" className="text-[#4A2C2A] font-medium">
                      Google Maps URL
                    </Label>
                    <div className="relative">
                      <Input
                        id="googleMapsUrl"
                        type="url"
                        value={googleMapsUrl}
                        onChange={(e) => setGoogleMapsUrl(e.target.value)}
                        className="border-gray-300 focus:border-[#B22222] focus:ring-[#B22222] pr-10"
                        placeholder="https://maps.google.com/..."
                      />
                      {googleMapsUrl && validateUrl(googleMapsUrl) && (
                        <a
                          href={googleMapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#B22222] hover:text-[#8B0000]"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                    <p className="text-xs text-gray-600">
                      Go to Google Maps, search your location, click Share, and paste the URL here
                    </p>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div className="bg-purple-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-[#4A2C2A] mb-4 flex items-center space-x-2">
                  <Instagram className="w-5 h-5" />
                  <span>Social Media Handles</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="instagramHandle" className="text-[#4A2C2A] font-medium flex items-center space-x-2">
                      <Instagram className="w-4 h-4 text-pink-600" />
                      <span>Instagram</span>
                    </Label>
                    <Input
                      id="instagramHandle"
                      value={instagramHandle}
                      onChange={(e) => setInstagramHandle(e.target.value)}
                      className="border-gray-300 focus:border-[#B22222] focus:ring-[#B22222]"
                      placeholder="@username or full URL"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="facebookHandle" className="text-[#4A2C2A] font-medium flex items-center space-x-2">
                      <Facebook className="w-4 h-4 text-blue-600" />
                      <span>Facebook</span>
                    </Label>
                    <Input
                      id="facebookHandle"
                      value={facebookHandle}
                      onChange={(e) => setFacebookHandle(e.target.value)}
                      className="border-gray-300 focus:border-[#B22222] focus:ring-[#B22222]"
                      placeholder="page-name or full URL"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="youtubeHandle" className="text-[#4A2C2A] font-medium flex items-center space-x-2">
                      <Youtube className="w-4 h-4 text-red-600" />
                      <span>YouTube</span>
                    </Label>
                    <Input
                      id="youtubeHandle"
                      value={youtubeHandle}
                      onChange={(e) => setYoutubeHandle(e.target.value)}
                      className="border-gray-300 focus:border-[#B22222] focus:ring-[#B22222]"
                      placeholder="@channel or full URL"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-600 mt-3">
                  You can enter just the username/handle or paste the complete URL - we'll format it automatically
                </p>
              </div>

              {/* Preview Section */}
              {(phone || email || location) && (
                <div className="bg-green-50 p-6 rounded-lg border-l-4 border-green-500">
                  <h3 className="text-lg font-semibold text-[#4A2C2A] mb-4">Preview</h3>
                  <div className="text-sm text-gray-700 space-y-2">
                    {phone && <p><strong>Phone:</strong> {phone}</p>}
                    {email && <p><strong>Email:</strong> {email}</p>}
                    {location && <p><strong>Location:</strong> {location}</p>}
                    {establishedYear && <p><strong>Established:</strong> {establishedYear}</p>}
                  </div>
                </div>
              )}
            </form>
          </CardContent>
          
          <CardFooter className="bg-gray-50 rounded-b-lg p-6 flex flex-col sm:flex-row justify-between space-y-4 sm:space-y-0">
            <Link href="/admin/dashboard">
              <Button variant="outline" className="border-[#B22222] text-[#B22222] hover:bg-[#FFF3E0]">
                Cancel
              </Button>
            </Link>
            <Button 
              type="submit" 
              className="bg-[#B22222] text-white hover:bg-[#8B0000] px-8" 
              onClick={handleSubmit}
              disabled={updating || !phone.trim() || !email.trim() || !location.trim()}
            >
              {updating ? (
                <span className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Updating...</span>
                </span>
              ) : (
                "Update Contact Information"
              )}
            </Button>
          </CardFooter>
        </Card>
        
        <div className="mt-8 text-center">
          <Link href="/admin/dashboard">
            <Button
              variant="outline"
              className="border-[#B22222] text-[#B22222] hover:bg-[#FFF3E0]"
            >
              ← Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default UpdateContactPage