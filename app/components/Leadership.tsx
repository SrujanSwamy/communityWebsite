"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Users, Crown } from "lucide-react";
import { ShivajiArtisticBg } from "./ShivajiArtisticBg";
import { createClient } from "@/utils/supabase/client";
import { toast } from "@/components/ui/use-toast";

interface LeadershipMember {
  id: number;
  name: string;
  position: string;
  photo_url: string | null;
  club_type: number;
  created_at: string;
}

const clubNames: { [key: number]: string } = {
  1: "D.K. DISTRICT MARATI SAMAJA SEVA SANGHA ® MANGALORE",
  2: "MARATI WOMEN'S CLUB, MANGALORE",
};

export default function Leadership() {
  const [leadershipData, setLeadershipData] = useState<LeadershipMember[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    fetchLeadershipData();
  }, []);

  const fetchLeadershipData = async () => {
    try {
      setLoading(true);
      console.log("Fetching leadership data...");
      
      const { data, error } = await supabase
        .from("Leadership")
        .select("*")
        .order("club_type", { ascending: true });

      console.log("Supabase response:", { data, error });

      if (error) {
        console.error("Supabase error:", error);
        toast({
          title: "Error",
          description: `Failed to fetch leadership data: ${error.message}`,
          variant: "destructive",
        });
        return;
      }

      if (data) {
        console.log("Leadership data received:", data);
        setLeadershipData(data);
      } else {
        console.log("No data received");
        setLeadershipData([]);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while fetching leadership data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to sort members by position order
  const sortByPosition = (members: LeadershipMember[]) => {
    const positionOrder: { [key: string]: number } = { 
      "President": 1, 
      "Vice President": 2, 
      "Secretary": 3 
    };
    
    return [...members].sort((a, b) => {
      const aOrder = positionOrder[a.position] || 999;
      const bOrder = positionOrder[b.position] || 999;
      return aOrder - bOrder;
    });
  };

  const firstClubMembers = leadershipData.filter((member) => member.club_type === 1);
  const womensClubMembers = leadershipData.filter((member) => member.club_type === 2);

  const LeadershipCard = ({ 
    members, 
    clubType, 
    delay 
  }: { 
    members: LeadershipMember[]; 
    clubType: number; 
    delay: number; 
  }) => {
    const sortedMembers = sortByPosition(members);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
        className="bg-[#FFF3E0] rounded-lg p-8 border-4 border-[#B22222] relative overflow-hidden"
      >
        <ShivajiArtisticBg />
        <Crown className="absolute top-4 right-4 text-[#B22222] opacity-20" size={80} />
        <h3 className="text-xl font-bold mb-6 text-[#B22222] relative z-10 text-center">
          {clubNames[clubType]}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sortedMembers.map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: delay + index * 0.1 }}
            >
              <Card className="h-full flex flex-col bg-white border-2 border-[#B22222] text-center">
                <CardHeader className="pb-4">
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-4 border-[#B22222]">
                    <img
                      src={member.photo_url || "/placeholder-avatar.jpg"}
                      alt={`${member.name} - ${member.position}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        if (target.src !== "/placeholder-avatar.jpg") {
                          target.src = "/placeholder-avatar.jpg";
                        }
                      }}
                    />
                  </div>
                  <CardTitle className="text-[#B22222] text-lg">{member.position}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow pt-0">
                  <p className="font-semibold text-gray-800 text-lg">{member.name || "Name not available"}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <section className="container mx-auto my-8 px-4">
        <div className="bg-[#FFF3E0] rounded-lg p-8 border-4 border-[#B22222] text-center">
          <p className="text-[#B22222] text-lg">Loading leadership team...</p>
        </div>
      </section>
    );
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
          <Users className="absolute top-4 right-4 text-[#B22222] opacity-20" size={80} />
          <h2 className="text-2xl font-bold mb-8 text-[#B22222] relative z-10 text-center">
            Our Leadership Team
          </h2>
        

        {firstClubMembers.length > 0 && (
          <LeadershipCard 
            members={firstClubMembers} 
            clubType={1} 
            delay={0.2} 
          />
        )}
        <br></br>
        {womensClubMembers.length > 0 && (
          <LeadershipCard 
            members={womensClubMembers} 
            clubType={2} 
            delay={0.4} 
          />
        )}

        {leadershipData.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-[#FFF3E0] rounded-lg p-8 border-4 border-[#B22222] text-center"
          >
            <p className="text-gray-800 text-lg">No leadership data available at this time.</p>
          </motion.div>

        
        )}
        </motion.div>
      </div>
    </section>
  );
}