"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, Target, Star, Heart, Globe, Award } from "lucide-react"
import { ShivajiArtisticBg } from "./ShivajiArtisticBg"

export default function VisionMission() {
  const [activeTab, setActiveTab] = useState("vision")

  return (
    <section className="container mx-auto my-16">
      <div className="bg-[#FFF3E0] rounded-lg p-8 border-4 border-[#B22222] relative overflow-hidden">
        <ShivajiArtisticBg />
        <Tabs defaultValue="vision" className="relative z-10" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="vision" className="text-[#B22222]">
             <h4>Vision</h4> 
            </TabsTrigger>
            <TabsTrigger value="mission" className="text-[#B22222]">
              <h4>Mission</h4> 
            </TabsTrigger>
          </TabsList>
          <TabsContent value="vision">
            <Card className="bg-white border-2 border-[#B22222]">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-[#B22222] flex items-center">
                  <Eye className="mr-2" />
                  Our Vision
                </CardTitle>
              </CardHeader>
              <CardContent>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <p className="text-gray-800 mb-4">
                    To be a thriving global community that preserves, promotes, and celebrates Marathi culture while 
                    fostering unity, progress, and excellence in all our endeavors. We envision a future where our 
                    rich heritage continues to inspire generations.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <Globe className="mr-2 text-[#B22222]" />
                      <span>Global network of connected Marathi communities</span>
                    </li>
                    <li className="flex items-center">
                      <Star className="mr-2 text-[#B22222]" />
                      <span>Cultural excellence and innovation</span>
                    </li>
                    <li className="flex items-center">
                      <Award className="mr-2 text-[#B22222]" />
                      <span>Recognition and respect for our heritage</span>
                    </li>
                    <li className="flex items-center">
                      <Heart className="mr-2 text-[#B22222]" />
                      <span>Inclusive community embracing all backgrounds</span>
                    </li>
                  </ul>
                </motion.div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="mission">
            <Card className="bg-white border-2 border-[#B22222]">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-[#B22222] flex items-center">
                  <Target className="mr-2" />
                  Our Mission
                </CardTitle>
              </CardHeader>
              <CardContent>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <p className="text-gray-800 mb-4">
                    We are dedicated to preserving and promoting Marathi culture, language, and traditions through 
                    community engagement, educational initiatives, and cultural programs. Our mission is to create 
                    meaningful connections and opportunities for growth.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <Target className="mr-2 text-[#B22222]" />
                      <span>Preserve and promote Marathi language and literature</span>
                    </li>
                    <li className="flex items-center">
                      <Star className="mr-2 text-[#B22222]" />
                      <span>Organize cultural events and festivals</span>
                    </li>
                    <li className="flex items-center">
                      <Heart className="mr-2 text-[#B22222]" />
                      <span>Support community members in need</span>
                    </li>
                    <li className="flex items-center">
                      <Globe className="mr-2 text-[#B22222]" />
                      <span>Build bridges between different cultures</span>
                    </li>
                    <li className="flex items-center">
                      <Award className="mr-2 text-[#B22222]" />
                      <span>Mentor youth and foster leadership</span>
                    </li>
                  </ul>
                </motion.div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  )
}