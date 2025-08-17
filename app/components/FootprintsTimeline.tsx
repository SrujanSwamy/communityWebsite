"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Flag, History } from "lucide-react";
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
      icon: <Flag className="w-8 h-8 text-[#B22222]" />,
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
        <h2 className="text-2xl font-bold mb-8 text-[#B22222] relative z-10">Our Footprints</h2>
        
        <div className="max-w-4xl mx-auto relative">
          <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-[#B22222] transform -translate-x-1/2"></div>
          {events.map((event, index) => (
            <div key={event.id} className="mb-16 flex justify-between items-center">
              {index % 2 === 0 ? (
                <>
                  <TimelineContent event={event} index={index} side="left" />
                  <TimelineIcon
                    event={event}
                    index={index}
                    setSelectedEventIndex={setSelectedEventIndex}
                  />
                  <div className="w-5/12"></div>
                </>
              ) : (
                <>
                  <div className="w-5/12"></div>
                  <TimelineIcon
                    event={event}
                    index={index}
                    setSelectedEventIndex={setSelectedEventIndex}
                  />
                  <TimelineContent event={event} index={index} side="right" />
                </>
              )}
            </div>
          ))}
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
              className="bg-white border-2 border-[#B22222] max-w-lg w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <CardHeader>
                <CardTitle className="text-2xl text-[#B22222] flex items-center">
                  {events[selectedEventIndex].icon}
                  <span className="ml-2">
                    {events[selectedEventIndex].year}: {events[selectedEventIndex].title}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-800">{events[selectedEventIndex].description}</p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function TimelineContent({
  event,
  index,
  side,
}: {
  event: TimelineEvent;
  index: number;
  side: "left" | "right";
}) {
  return (
    <motion.div
      className={`w-5/12 ${side === "left" ? "text-right pr-8" : "pl-8"}`}
      initial={{ opacity: 0, x: side === "left" ? -50 : 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <h3 className="text-xl font-bold text-[#B22222] mb-2">{event.year}</h3>
      <h4 className="text-lg font-semibold text-gray-800 mb-2">{event.title}</h4>
      <p className="text-gray-800 text-sm">{event.description}</p>
    </motion.div>
  );
}

function TimelineIcon({
  event,
  index,
  setSelectedEventIndex,
}: {
  event: TimelineEvent;
  index: number;
  setSelectedEventIndex: (index: number) => void;
}) {
  return (
    <div className="w-8 h-8 absolute left-1/2 transform -translate-x-1/2 flex items-center justify-center">
      <motion.div
        className="w-12 h-12 bg-white rounded-full border-4 border-[#B22222] flex items-center justify-center cursor-pointer"
        whileHover={{ scale: 1.1 }}
        onClick={() => setSelectedEventIndex(index)}
      >
        {event.icon}
      </motion.div>
    </div>
  );
}