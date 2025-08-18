"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Megaphone, Calendar } from "lucide-react"
import { ShivajiArtisticBg } from "./ShivajiArtisticBg"
import { createClient } from "@/utils/supabase/client"
import { toast } from "@/components/ui/use-toast"

interface AnnouncementItem {
  id: number
  name: string
  date: string
  category: string
  description: string
}

interface EventItem {
  id: number
  name: string
  from_date: string
  to_date: string | null
  from_time: string | null
  to_time: string | null
  venue: string | null
  description: string
}

export default function NewsEvents() {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([])
  const [events, setEvents] = useState<EventItem[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    
    try {
      // Fetch announcements
      const { data: announcementData, error: announcementError } = await supabase
        .from("Announcements")
        .select("*")
        .order("date", { ascending: false })
        .limit(4)

      if (announcementError) {
        toast({
          title: "Error",
          description: "Failed to fetch announcements",
          variant: "destructive",
        })
      } else {
        setAnnouncements(announcementData || [])
      }

      // Fetch events
      const { data: eventData, error: eventError } = await supabase
        .from("Events")
        .select("*")
        .gte("from_date", new Date().toISOString().split('T')[0]) // Only future events
        .order("from_date", { ascending: true })
        .limit(4)

      if (eventError) {
        toast({
          title: "Error",
          description: "Failed to fetch events",
          variant: "destructive",
        })
      } else {
        setEvents(eventData || [])
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const formatEventDate = (event: EventItem) => {
    const fromDate = new Date(event.from_date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
    
    if (event.to_date && event.to_date !== event.from_date) {
      const toDate = new Date(event.to_date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
      return `${fromDate} - ${toDate}`
    }
    
    return fromDate
  }

  const formatEventTime = (event: EventItem) => {
    if (event.from_time) {
      if (event.to_time) {
        return `${event.from_time} - ${event.to_time}`
      }
      return `${event.from_time}`
    }
    return null
  }

  if (loading) {
    return (
      <section className="container mx-auto my-8 px-4">
        <div className="space-y-12">
          <div className="bg-[#FFF3E0] rounded-lg p-8 border-4 border-[#B22222] relative overflow-hidden">
            <div className="text-center text-[#B22222]">Loading...</div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="container mx-auto my-8 px-4">
      <div className="space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-[#FFF3E0] rounded-lg p-8 border-4 border-[#B22222] relative overflow-hidden"
        >
          <ShivajiArtisticBg />
          <Megaphone className="absolute top-4 right-4 text-[#B22222] opacity-20" size={80} />
          <h2 className="text-2xl font-bold mb-4 text-[#B22222] relative z-10">Latest Announcements</h2>
          {announcements.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No announcements available.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {announcements.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="h-full flex flex-col bg-white border-2 border-[#B22222]">
                    <CardHeader>
                      <CardTitle className="text-[#B22222]">{item.name}</CardTitle>
                      <div className="flex justify-between items-center text-sm text-gray-600">
                        <span className="bg-[#B22222] text-white px-2 py-1 rounded text-xs">
                          {item.category}
                        </span>
                        <span>
                          {new Date(item.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <p className="text-gray-800">{item.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
          <div className="mt-4 text-right">
            <Link
              href="/announcements"
              className="inline-block bg-[#B22222] text-white px-4 py-2 rounded hover:bg-[#8B0000] transition-colors"
            >
              View all announcements
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-[#FFF3E0] rounded-lg p-8 border-4 border-[#B22222] relative overflow-hidden"
        >
          <ShivajiArtisticBg />
          <Calendar className="absolute top-4 right-4 text-[#B22222] opacity-20" size={80} />
          <h2 className="text-2xl font-bold mb-4 text-[#B22222] relative z-10">Upcoming Events</h2>
          {events.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No upcoming events available.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {events.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="h-full flex flex-col bg-white border-2 border-[#B22222]">
                    <CardHeader>
                      <CardTitle className="text-[#B22222]">{item.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <div className="space-y-2">
                        <p className="font-semibold text-gray-800">{formatEventDate(item)}</p>
                        {formatEventTime(item) && (
                          <p className="text-sm text-gray-600">Time: {formatEventTime(item)}</p>
                        )}
                        {item.venue && (
                          <p className="text-sm text-gray-600">Venue: {item.venue}</p>
                        )}
                        <p className="text-gray-800">{item.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
          <div className="mt-4 text-right">
            <Link
              href="/events"
              className="inline-block bg-[#B22222] text-white px-4 py-2 rounded hover:bg-[#8B0000] transition-colors"
            >
              View all events
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}