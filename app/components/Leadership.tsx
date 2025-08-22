"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Users, Crown, Building2, User } from "lucide-react";
import { ShivajiArtisticBg } from "./ShivajiArtisticBg";
import { createClient } from "@/utils/supabase/client";
import { toast } from "@/components/ui/use-toast";
import Image from "next/image";

interface LeadershipMember {
  id: number;
  name: string;
  position: string;
  photo_url: string | null;
  club_type: number;
  created_at: string;
}

interface BuildingCommitteeMember {
  id: number;
  name: string;
  designation: string;
  photo: string | null;
}

const clubNames: { [key: number]: string } = {
  1: "D.K. DISTRICT MARATI SAMAJA SEVA SANGHA ® MANGALORE",
  2: "MARATI WOMEN'S CLUB, MANGALORE",
};

const optimizeCloudinaryUrl = (url: string, width: number, height: number, quality: string = "auto") => {
  if (!url || !url.includes('cloudinary.com')) {
    return url
  }
  
  // Add transformation parameters to Cloudinary URL
  const parts = url.split('/upload/')
  if (parts.length === 2) {
    return `${parts[0]}/upload/w_${width},h_${height},c_fill,q_${quality},f_auto/${parts[1]}`
  }
  
  return url
}

export default function Leadership() {
  const [leadershipData, setLeadershipData] = useState<LeadershipMember[]>([]);
  const [buildingCommitteeData, setBuildingCommitteeData] = useState<BuildingCommitteeMember[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      console.log("Fetching all data...");
      
      // Fetch leadership data
      const { data: leadershipData, error: leadershipError } = await supabase
        .from("Leadership")
        .select("*")
        .order("club_type", { ascending: true });

      // Fetch building committee data
      const { data: buildingCommitteeData, error: buildingCommitteeError } = await supabase
        .from("BuidingCommitee")
        .select("*")
        .order("id", { ascending: true });

      console.log("Supabase response:", { 
        leadershipData, 
        leadershipError, 
        buildingCommitteeData, 
        buildingCommitteeError 
      });

      if (leadershipError) {
        console.error("Leadership data error:", leadershipError);
        toast({
          title: "Error",
          description: `Failed to fetch leadership data: ${leadershipError.message}`,
          variant: "destructive",
        });
      } else if (leadershipData) {
        console.log("Leadership data received:", leadershipData);
        setLeadershipData(leadershipData);
      }

      if (buildingCommitteeError) {
        console.error("Building committee data error:", buildingCommitteeError);
        toast({
          title: "Error",
          description: `Failed to fetch building committee data: ${buildingCommitteeError.message}`,
          variant: "destructive",
        });
      } else if (buildingCommitteeData) {
        console.log("Building committee data received:", buildingCommitteeData);
        setBuildingCommitteeData(buildingCommitteeData);
      }

    } catch (error) {
      console.error("Fetch error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while fetching data",
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
              <Card className="bg-white border-2 border-[#B22222] overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg h-80 relative group">
                {/* Photo Background - Always Visible */}
                <div className="absolute inset-0 h-full w-full">
                  {member.photo_url ? (
                    <div className="relative w-full h-full">
                      <Image
                        src={optimizeCloudinaryUrl(member.photo_url, 400, 320)}
                        alt={member.name || "Leadership Member"}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const fallback = target.parentElement?.parentElement?.querySelector('.fallback-avatar');
                          if (fallback) {
                            fallback.classList.remove('hidden');
                          }
                        }}
                      />
                    </div>
                  ) : null}
                  <div className={`fallback-avatar absolute inset-0 bg-[#B22222] flex items-center justify-center ${member.photo_url ? 'hidden' : ''}`}>
                    <User className="w-16 h-16 text-white" />
                  </div>
                </div>

                {/* Position Badge - Always Visible */}
                <div className="absolute top-3 right-3 z-10">
                  <div className="bg-black/80 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs flex items-center shadow-lg">
                    <Crown className="w-3 h-3 mr-1" />
                    Leadership
                  </div>
                </div>

                {/* Hover Overlay with Name and Position */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                  <div className="p-4 text-white w-full">
                    <h2 className="text-xl font-bold mb-1 drop-shadow-lg">{member.name || "Name not available"}</h2>
                    <h3 className="text-base font-medium opacity-90 drop-shadow">{member.position}</h3>
                  </div>
                </div>

                {/* Subtle hover indicator */}
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-white/30 transition-all duration-300 pointer-events-none"></div>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    );
  };

  const BuildingCommitteeCard = ({ delay }: { delay: number }) => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
        className="bg-[#FFF3E0] rounded-lg p-8 border-4 border-[#B22222] relative overflow-hidden"
      >
        <ShivajiArtisticBg />
        <Building2 className="absolute top-4 right-4 text-[#B22222] opacity-20" size={80} />
        <h3 className="text-xl font-bold mb-6 text-[#B22222] relative z-10 text-center">
          BUILDING COMMITTEE
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {buildingCommitteeData.map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: delay + index * 0.1 }}
            >
              <Card className="bg-white border-2 border-[#B22222] overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg h-80 relative group">
                {/* Photo Background - Always Visible */}
                <div className="absolute inset-0 h-full w-full">
                  {member.photo ? (
                    <div className="relative w-full h-full">
                      <Image
                        src={optimizeCloudinaryUrl(member.photo, 400, 320)}
                        alt={member.name || "Building Committee Member"}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const fallback = target.parentElement?.parentElement?.querySelector('.fallback-avatar');
                          if (fallback) {
                            fallback.classList.remove('hidden');
                          }
                        }}
                      />
                    </div>
                  ) : null}
                  <div className={`fallback-avatar absolute inset-0 bg-[#B22222] flex items-center justify-center ${member.photo ? 'hidden' : ''}`}>
                    <User className="w-16 h-16 text-white" />
                  </div>
                </div>

                {/* Committee Badge - Always Visible */}
                <div className="absolute top-3 right-3 z-10">
                  <div className="bg-black/80 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs flex items-center shadow-lg">
                    <Building2 className="w-3 h-3 mr-1" />
                    Committee
                  </div>
                </div>

                {/* Hover Overlay with Name and Designation */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                  <div className="p-4 text-white w-full">
                    <h2 className="text-xl font-bold mb-1 drop-shadow-lg">{member.name || "Name not available"}</h2>
                    <h3 className="text-base font-medium opacity-90 drop-shadow">{member.designation}</h3>
                  </div>
                </div>

                {/* Subtle hover indicator */}
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-white/30 transition-all duration-300 pointer-events-none"></div>
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
        {firstClubMembers.length > 0 && (
          <LeadershipCard 
            members={firstClubMembers} 
            clubType={1} 
            delay={0.2} 
          />
        )}

        {womensClubMembers.length > 0 && (
          <LeadershipCard 
            members={womensClubMembers} 
            clubType={2} 
            delay={0.4} 
          />
        )}

        {buildingCommitteeData.length > 0 && (
          <BuildingCommitteeCard delay={0.6} />
        )}

        {leadershipData.length === 0 && buildingCommitteeData.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-[#FFF3E0] rounded-lg p-8 border-4 border-[#B22222] text-center"
          >
            <p className="text-gray-800 text-lg">No leadership data available at this time.</p>
          </motion.div>
        )}
      </div>
    </section>
  );
}