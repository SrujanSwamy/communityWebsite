"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Flag, History, X } from "lucide-react";
import type React from "react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { ShivajiArtisticBg } from "./ShivajiArtisticBg";

interface TimelineEvent {
  id: number;
  year: number;
  title: string;
  description: string;
  icon?: React.ReactNode;
}

export default function FootprintsTimeline() {
  const [selectedEventIndex, setSelectedEventIndex] = useState<number | null>(null);
  const [events, setEvents] = useState<TimelineEvent[]>([]);

  useEffect(() => {
    fetchFootprints();
  }, []);

  const supabase = createClient();

  const fetchFootprints = async () => {
    const { data: footprintData, error: footprintError } = await supabase
      .from("Footprints")
      .select("*")
      .order("event_year", { ascending: true });

    if (footprintError) {
      toast({
        title: "Error",
        description: "Failed to fetch footprints",
        variant: "destructive",
      });
      return;
    }

    const enrichedEvents: TimelineEvent[] = footprintData.map((item: any) => ({
      id: item.id,
      year: item.event_year,
      title: item.event_name,
      description: item.event_desc,
      icon: <Flag className="w-6 h-6 text-[#B22222]" />,
    }));

    setEvents(enrichedEvents);
  };

  return (
    <section className="container mx-auto my-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-[#FFF3E0] rounded-lg p-8 border-4 border-[#B22222] relative overflow-hidden"
      >
        <ShivajiArtisticBg />
        <History className="absolute top-4 right-4 text-[#B22222] opacity-20" size={80} />
        <h2 className="text-3xl font-bold mb-12 text-[#B22222] relative z-10 text-center">
          Our Footprints
        </h2>
        
        <div className="max-w-7xl mx-auto relative">
          {/* Central timeline line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-[#B22222] transform -translate-x-1/2 opacity-30 hidden md:block"></div>
          
          <div className="space-y-8 md:space-y-16">
            {events.map((event, index) => (
              <TimelineEventBox
                key={event.id}
                event={event}
                index={index}
                setSelectedEventIndex={setSelectedEventIndex}
              />
            ))}
          </div>
        </div>
      </motion.div>
      
      <AnimatePresence>
        {selectedEventIndex !== null && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedEventIndex(null)}
          >
            <Card
              className="bg-white border-2 border-[#B22222] max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <CardHeader className="relative">
                <button
                  onClick={() => setSelectedEventIndex(null)}
                  className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="Close"
                >
                  <X className="w-6 h-6 text-gray-500 hover:text-gray-700" />
                </button>
                <CardTitle className="text-2xl text-[#B22222] flex items-center pr-8">
                  {events[selectedEventIndex].icon}
                  <span className="ml-2">
                    {events[selectedEventIndex].year}: {events[selectedEventIndex].title}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-800 leading-relaxed">{events[selectedEventIndex].description}</p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function TimelineEventBox({
  event,
  index,
  setSelectedEventIndex,
}: {
  event: TimelineEvent;
  index: number;
  setSelectedEventIndex: (index: number) => void;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: "-50px" });
  const isEven = index % 2 === 0;

  return (
    <div ref={ref} className="relative">
      {/* Mobile Layout */}
      <div className="block md:hidden">
        <motion.div
          className="relative pl-8"
          initial={{ opacity: 0, x: -50, scale: 0.9 }}
          animate={isInView ? { opacity: 1, x: 0, scale: 1 } : { opacity: 0, x: -50, scale: 0.9 }}
          transition={{ duration: 0.6, delay: index * 0.1 }}
        >
          {/* Mobile connecting line */}
          <div className="absolute left-0 top-8 w-6 h-0.5 bg-[#B22222] opacity-50"></div>
          
          {/* Mobile timeline dot */}
          <motion.div
            className="absolute -left-2 top-6 w-4 h-4 bg-[#B22222] rounded-full border-2 border-white shadow-sm"
            initial={{ scale: 0 }}
            animate={isInView ? { scale: 1 } : { scale: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 + 0.2 }}
          />
          
          <Card className="bg-white border-2 border-[#B22222] shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105">
            <CardContent className="p-4">
              <div className="flex items-center mb-3">
                <div className="bg-[#B22222] text-white px-2 py-1 rounded-full text-xs font-bold mr-2">
                  {event.year}
                </div>
                {event.icon}
              </div>
              <h4 className="text-base font-bold text-[#B22222] mb-2">{event.title}</h4>
              <p className="text-gray-700 text-sm leading-relaxed">
                {event.description.length > 100 
                  ? `${event.description.substring(0, 100)}...` 
                  : event.description
                }
              </p>
              <button
                onClick={() => setSelectedEventIndex(index)}
                className="mt-3 text-[#B22222] text-sm font-semibold hover:underline"
              >
                Read More →
              </button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex justify-between items-center relative">
        {isEven ? (
          <>
            {/* Left side content */}
            <motion.div
              className="w-5/12 pr-8 relative"
              initial={{ opacity: 0, x: -100, scale: 0.8 }}
              animate={isInView ? { opacity: 1, x: 0, scale: 1 } : { opacity: 0, x: -100, scale: 0.8 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              {/* Connecting line to center */}
              <div className="absolute right-0 top-1/2 w-8 h-0.5 bg-[#B22222] opacity-40 transform -translate-y-1/2"></div>
              
              <Card className="bg-white border-2 border-[#B22222] shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105">
                <CardContent className="p-6">
                  <div className="flex items-center mb-3">
                    <div className="bg-[#B22222] text-white px-3 py-1 rounded-full text-sm font-bold mr-3">
                      {event.year}
                    </div>
                    {event.icon}
                  </div>
                  <h4 className="text-lg font-bold text-[#B22222] mb-2">{event.title}</h4>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {event.description.length > 120 
                      ? `${event.description.substring(0, 120)}...` 
                      : event.description
                    }
                  </p>
                  <button
                    onClick={() => setSelectedEventIndex(index)}
                    className="mt-3 text-[#B22222] text-sm font-semibold hover:underline"
                  >
                    Read More →
                  </button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Center icon */}
            <motion.div
              className="w-16 h-16 bg-[#B22222] rounded-full border-4 border-white shadow-lg flex items-center justify-center cursor-pointer z-10 relative"
              initial={{ opacity: 0, scale: 0 }}
              animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 + 0.2 }}
              whileHover={{ scale: 1.1 }}
              onClick={() => setSelectedEventIndex(index)}
            >
              <Flag className="w-8 h-8 text-white" />
            </motion.div>

            {/* Right side empty space */}
            <div className="w-5/12"></div>
          </>
        ) : (
          <>
            {/* Left side empty space */}
            <div className="w-5/12"></div>

            {/* Center icon */}
            <motion.div
              className="w-16 h-16 bg-[#B22222] rounded-full border-4 border-white shadow-lg flex items-center justify-center cursor-pointer z-10 relative"
              initial={{ opacity: 0, scale: 0 }}
              animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 + 0.2 }}
              whileHover={{ scale: 1.1 }}
              onClick={() => setSelectedEventIndex(index)}
            >
              <Flag className="w-8 h-8 text-white" />
            </motion.div>

            {/* Right side content */}
            <motion.div
              className="w-5/12 pl-8 relative"
              initial={{ opacity: 0, x: 100, scale: 0.8 }}
              animate={isInView ? { opacity: 1, x: 0, scale: 1 } : { opacity: 0, x: 100, scale: 0.8 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              {/* Connecting line to center */}
              <div className="absolute left-0 top-1/2 w-8 h-0.5 bg-[#B22222] opacity-40 transform -translate-y-1/2"></div>
              
              <Card className="bg-white border-2 border-[#B22222] shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105">
                <CardContent className="p-6">
                  <div className="flex items-center mb-3">
                    <div className="bg-[#B22222] text-white px-3 py-1 rounded-full text-sm font-bold mr-3">
                      {event.year}
                    </div>
                    {event.icon}
                  </div>
                  <h4 className="text-lg font-bold text-[#B22222] mb-2">{event.title}</h4>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {event.description.length > 120 
                      ? `${event.description.substring(0, 120)}...` 
                      : event.description
                    }
                  </p>
                  <button
                    onClick={() => setSelectedEventIndex(index)}
                    className="mt-3 text-[#B22222] text-sm font-semibold hover:underline"
                  >
                    Read More →
                  </button>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}