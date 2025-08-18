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

interface ContactUs {
  id: number;
  phone: string;
  alternatePhone: string;
  emailAddress: string;
  location: string;
}

function UpdateContactPage() {
  const [phone, setPhone] = useState("")
  const [alternatePhone, setAlternatePhone] = useState("")
  const [email, setEmail] = useState("")
  const [location, setLocation] = useState("")
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUpdating(true)

    try {
      const updateData = {
        phone: phone.trim(),
        alternatePhone: alternatePhone.trim() || null,
        emailAddress: email.trim(),
        location: location.trim(),
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
      <div className="min-h-screen bg-[#FFF9E6] py-8 px-4">
        <div className="container mx-auto">
          <Card className="max-w-2xl mx-auto bg-white border-2 border-[#B22222]">
            <CardContent className="pt-6">
              <div className="text-center text-[#B22222]">
                Loading contact information...
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FFF9E6] py-8 px-4">
      <div className="container mx-auto">
        <Card className="max-w-2xl mx-auto bg-white border-2 border-[#B22222]">
          <CardHeader>
            <CardTitle className="text-[#B22222]">Update Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-[#4A2C2A]">
                    Phone Number *
                  </Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="border-[#B22222]"
                    placeholder="Enter primary phone number"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="alternatePhone" className="text-[#4A2C2A]">
                    Alternate Phone Number
                  </Label>
                  <Input
                    id="alternatePhone"
                    value={alternatePhone}
                    onChange={(e) => setAlternatePhone(e.target.value)}
                    className="border-[#B22222]"
                    placeholder="Enter alternate phone number (optional)"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[#4A2C2A]">
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border-[#B22222]"
                    placeholder="Enter email address"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location" className="text-[#4A2C2A]">
                    Location/Address *
                  </Label>
                  <Textarea
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="border-[#B22222]"
                    placeholder="Enter complete address/location"
                    rows={3}
                    required
                  />
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Link href="/admin/dashboard">
              <Button variant="outline" className="border-[#B22222] text-[#B22222] hover:bg-[#FFF3E0]">
                Cancel
              </Button>
            </Link>
            <Button 
              type="submit" 
              className="bg-[#B22222] text-white hover:bg-[#8B0000]" 
              onClick={handleSubmit}
              disabled={updating || !phone.trim() || !email.trim() || !location.trim()}
            >
              {updating ? "Updating..." : "Update Contact Information"}
            </Button>
          </CardFooter>
        </Card>
        <div className="mt-8">
                  <Link href="/admin/dashboard">
                    <Button
                      variant="outline"
                      className="border-[#B22222] text-[#B22222] hover:bg-[#FFF3E0]"
                    >
                      Back to Dashboard
                    </Button>
                  </Link>
                </div>
      </div>
    </div>
  )
}

export default UpdateContactPage