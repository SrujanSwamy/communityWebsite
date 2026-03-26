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
  2: "MARATI MAHILA VEDIKE, MANGALORE",
};

const optimizeCloudinaryUrl = (url: string, width: number, height: number, quality: string = "auto") => {
  if (!url || !url.includes('cloudinary.com')) {
    return url
  }
  
  // Add transformation parameters to Cloudinary URL with better cropping for faces
  const parts = url.split('/upload/')
  if (parts.length === 2) {
    return `${parts[0]}/upload/w_${width},h_${height},c_fill,g_face,q_${quality},f_auto/${parts[1]}`
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



      if (leadershipError) {
        console.error("Leadership data error:", leadershipError);
        toast({
          title: "Error",
          description: `Failed to fetch leadership data: ${leadershipError.message}`,
          variant: "destructive",

      } else if (leadershipData) {

        setLeadershipData(leadershipData);
      }

      if (buildingCommitteeError) {

        toast({
          title: "Error",
          description: `Failed to fetch building committee data: ${buildingCommitteeError.message}`,
          variant: "destructive",
        });
      } else if (buildingCommitteeData) {

        setBuildingCommitteeData(buildingCommitteeData);
      }

    } catch (error) {

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
        className="bg-[#FFF3E0] rounded-lg p-4 sm:p-6 lg:p-8 border-4 border-[#B22222] relative overflow-hidden max-w-6xl mx-auto"
      >
        <ShivajiArtisticBg />
        <Crown className="absolute top-4 right-4 text-[#B22222] opacity-20 w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20" />
        <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-4 sm:mb-6 text-[#B22222] relative z-10 text-center px-2">
          {clubNames[clubType]}
        </h3>

        <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
          {sortedMembers.map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: delay + index * 0.1 }}
              className="w-full sm:w-80 md:w-72 lg:w-80"
            >
              <Card className="bg-white border-2 border-[#B22222] overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg relative group">
                {/* Photo Container with better aspect ratio */}
                <div className="relative w-full h-80 sm:h-96">
                  {member.photo_url ? (
                    <div className="relative w-full h-full">
                      <Image
                        src={optimizeCloudinaryUrl(member.photo_url, 420, 510)}
                        alt={member.name || "Leadership Member"}
                        fill
                        className="object-contain bg-gray-50"
                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        priority={index < 3}
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

                {/* Name and Position - Only visible on hover */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <h2 className="text-xl font-bold mb-1 text-white drop-shadow-lg">{member.name || "Name not available"}</h2>
                  <h3 className="text-base font-medium text-white/90 drop-shadow">{member.position}</h3>
                </div>

                {/* Hover effect border */}
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-[#B22222]/50 transition-all duration-300 pointer-events-none"></div>
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
        className="bg-[#FFF3E0] rounded-lg p-4 sm:p-6 lg:p-8 border-4 border-[#B22222] relative overflow-hidden max-w-6xl mx-auto"
      >
        <ShivajiArtisticBg />
        <Building2 className="absolute top-4 right-4 text-[#B22222] opacity-20 w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20" />
        <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-4 sm:mb-6 text-[#B22222] relative z-10 text-center">
          BUILDING COMMITTEE
        </h3>

        <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
          {buildingCommitteeData.map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: delay + index * 0.1 }}
              className="w-full sm:w-80 md:w-72 lg:w-80"
            >
              <Card className="bg-white border-2 border-[#B22222] overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg relative group">
                {/* Photo Container with better aspect ratio */}
                <div className="relative w-full h-80 sm:h-96">
                  {member.photo ? (
                    <div className="relative w-full h-full">
                      <Image
                        src={optimizeCloudinaryUrl(member.photo, 400, 500)}
                        alt={member.name || "Building Committee Member"}
                        fill
                        className="object-contain bg-gray-50"
                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        priority={index < 3}
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

                {/* Name and Position - Only visible on hover */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <h2 className="text-xl font-bold mb-1 text-white drop-shadow-lg">{member.name || "Name not available"}</h2>
                  <h3 className="text-base font-medium text-white/90 drop-shadow">President</h3>
                </div>

                {/* Hover effect border */}
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-[#B22222]/50 transition-all duration-300 pointer-events-none"></div>
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
        <div className="bg-[#FFF3E0] rounded-lg p-8 border-4 border-[#B22222] text-center max-w-4xl mx-auto">
          <p className="text-[#B22222] text-lg">Loading leadership team...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="container mx-auto my-8 px-4">
      <div className="space-y-8 lg:space-y-12">
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

      </div>
    </section>
  );
}