"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { User, Search, ChevronLeft, ChevronRight, Award, Building } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { toast } from "@/components/ui/use-toast"
import Image from "next/image"

interface BuildingCommitteeMember {
  id: number
  name: string | null
  photo: string | null
  designation: string | null
}

const MEMBERS_PER_PAGE = 12

// Helper function to optimize Cloudinary URLs
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

export default function BuildingCommittee() {
  const [members, setMembers] = useState<BuildingCommitteeMember[]>([])
  const [selectedMember, setSelectedMember] = useState<BuildingCommitteeMember | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalMembers, setTotalMembers] = useState(0)
  const [filteredMembers, setFilteredMembers] = useState<BuildingCommitteeMember[]>([])

  const supabase = createClient()

  useEffect(() => {
    fetchMembers()
  }, [currentPage])

  useEffect(() => {
    // Filter members based on search term
    if (searchTerm.trim() === "") {
      setFilteredMembers(members)
    } else {
      const filtered = members.filter(member =>
        (member.name && member.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (member.designation && member.designation.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      setFilteredMembers(filtered)
    }
  }, [members, searchTerm])

  const fetchMembers = async () => {
    try {
      setLoading(true)
      
      // Get total count for pagination
      const { count, error: countError } = await supabase
        .from("BuidingCommitee")
        .select("*", { count: "exact", head: true })

      if (countError) {
        console.error("Error getting member count:", countError)
      } else {
        setTotalMembers(count || 0)
      }

      // Get members for current page
      const from = (currentPage - 1) * MEMBERS_PER_PAGE
      const to = from + MEMBERS_PER_PAGE - 1

      const { data, error } = await supabase
        .from("BuidingCommitee")
        .select(`
          id,
          name,
          photo,
          designation
        `)
        .order("name", { ascending: true, nullsFirst: false })
        .range(from, to)

      if (error) {
        console.error("Error fetching members:", error)
        toast({
          title: "Error",
          description: `Failed to fetch members: ${error.message}`,
          variant: "destructive",
        })
        return
      }

      if (data) {
        setMembers(data)
      }
    } catch (error) {
      console.error("Fetch error:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred while fetching members",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const totalPages = Math.ceil(totalMembers / MEMBERS_PER_PAGE)

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  if (loading && members.length === 0) {
    return (
      <div className="min-h-screen bg-[#FFF9E6] py-8 px-4">
        <div className="container mx-auto">
          <div className="bg-black py-6 mb-12">
            <div className="flex items-center justify-center mb-2">
              <Building className="w-8 h-8 text-white mr-3" />
              <h1 className="text-3xl font-bold text-white">Building Committee</h1>
            </div>
            <p className="text-center text-white opacity-75">Infrastructure Development Team</p>
          </div>
          <div className="flex justify-center items-center h-64">
            <div className="text-[#B22222] text-lg">Loading members...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FFF9E6] py-8 px-4">
      <div className="container mx-auto">
        <div className="bg-black py-6 mb-12">
          <div className="flex items-center justify-center mb-2">
            <Building className="w-8 h-8 text-white mr-3" />
            <h1 className="text-3xl font-bold text-white">Building Committee</h1>
          </div>
          <p className="text-center text-white opacity-75">Infrastructure Development Team</p>
        </div>
        
        {/* Search Bar */}
        <div className="mb-8 max-w-md mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              type="text"
              placeholder="Search by name or designation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-2 border-[#B22222] focus:border-[#8B0000]"
            />
          </div>
        </div>

        {/* Members Count */}
        <div className="mb-6 text-center">
          <p className="text-[#4A2C2A] text-lg">
            {searchTerm ? `${filteredMembers.length} members found` : `Total: ${totalMembers} committee members`}
          </p>
        </div>

        {/* Members Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredMembers.map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card
                className="bg-white border-2 border-[#B22222] overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg relative"
                onClick={() => setSelectedMember(member)}
              >
                {/* Committee indicator */}
                <div className="absolute top-2 right-2 z-10">
                  <div className="bg-[#B22222] text-white px-2 py-1 rounded-full text-xs flex items-center">
                    <Building className="w-3 h-3 mr-1" />
                    Committee
                  </div>
                </div>
                
                <CardHeader className="flex items-center justify-center pb-4">
                  {member.photo ? (
                    <div className="relative w-24 h-24">
                      <Image
                        src={optimizeCloudinaryUrl(member.photo, 200, 200)}
                        alt={member.name || "Committee Member"}
                        fill
                        className="rounded-full object-cover"
                        sizes="96px"
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
                  <div className={`w-24 h-24 bg-[#B22222] rounded-full flex items-center justify-center ${member.photo ? 'hidden fallback-avatar' : ''}`}>
                    <User className="w-10 h-10 text-white" />
                  </div>
                </CardHeader>
                <CardContent className="text-center pt-0">
                  <CardTitle className="text-lg font-semibold text-[#4A2C2A] mb-2">
                    {member.name || "Committee Member"}
                  </CardTitle>
                  {member.designation ? (
                    <p className="text-[#B22222] text-sm font-medium">
                      {member.designation}
                    </p>
                  ) : (
                    <p className="text-[#B22222] text-sm italic">
                      Building Committee Member
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* No Results */}
        {filteredMembers.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="flex flex-col items-center">
              <Building className="w-16 h-16 text-[#B22222] mb-4 opacity-50" />
              <p className="text-[#4A2C2A] text-lg">
                {searchTerm ? "No committee members found matching your search." : "No committee members available."}
              </p>
            </div>
          </div>
        )}

        {/* Pagination */}
        {!searchTerm && totalPages > 1 && (
          <div className="mt-12 flex justify-center items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || loading}
              className="border-[#B22222] text-[#B22222] hover:bg-[#B22222] hover:text-white"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            
            <div className="flex items-center space-x-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }
                
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    onClick={() => handlePageChange(pageNum)}
                    disabled={loading}
                    className={
                      currentPage === pageNum
                        ? "bg-[#B22222] text-white hover:bg-[#8B0000]"
                        : "border-[#B22222] text-[#B22222] hover:bg-[#B22222] hover:text-white"
                    }
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>
            
            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || loading}
              className="border-[#B22222] text-[#B22222] hover:bg-[#B22222] hover:text-white"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}

        {/* Page Info */}
        {!searchTerm && totalPages > 1 && (
          <div className="mt-4 text-center text-[#4A2C2A] text-sm">
            Page {currentPage} of {totalPages}
          </div>
        )}
      </div>

      {/* Member Detail Modal */}
      <AnimatePresence>
        {selectedMember && (
          <Dialog open={!!selectedMember} onOpenChange={() => setSelectedMember(null)}>
            <DialogContent className="bg-white border-2 border-[#B22222] max-w-md">
              <DialogHeader>
                <DialogTitle className="text-2xl text-[#B22222] flex flex-col items-center mb-4">
                  <div className="mb-4 relative">
                    {selectedMember.photo ? (
                      <div className="relative w-30 h-30">
                        <Image
                          src={optimizeCloudinaryUrl(selectedMember.photo, 240, 240)}
                          alt={selectedMember.name || "Committee Member"}
                          width={120}
                          height={120}
                          className="rounded-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const fallback = target.parentElement?.parentElement?.querySelector('.fallback-avatar');
                            if (fallback) {
                              fallback.classList.remove('hidden');
                            }
                          }}
                        />
                        <div className="absolute -top-2 -right-2">
                          <div className="bg-[#B22222] text-white p-2 rounded-full">
                            <Building className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    ) : null}
                    <div className={`w-30 h-30 bg-[#B22222] rounded-full flex items-center justify-center relative ${selectedMember.photo ? 'hidden fallback-avatar' : ''}`}>
                      <User className="w-12 h-12 text-white" />
                      <div className="absolute -top-2 -right-2">
                        <div className="bg-[#B22222] text-white p-2 rounded-full">
                          <Building className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <h2 className="text-2xl">{selectedMember.name || "Committee Member"}</h2>
                    {selectedMember.designation ? (
                      <h3 className="text-lg text-[#4A2C2A] font-normal mt-2">
                        {selectedMember.designation}
                      </h3>
                    ) : (
                      <h3 className="text-lg text-[#4A2C2A] font-normal mt-2 italic">
                        Building Committee Member
                      </h3>
                    )}
                  </div>
                </DialogTitle>
                <DialogDescription className="text-center">
                  <div className="space-y-3">
                    <div className="flex items-center justify-center">
                      <Building className="w-5 h-5 mr-2 text-[#B22222]" />
                      <span className="text-[#4A2C2A] text-base font-medium">Building Committee</span>
                    </div>
                    {selectedMember.designation && (
                      <div className="flex items-center justify-center">
                        <Award className="w-4 h-4 mr-2 text-[#B22222]" />
                        <span className="text-[#4A2C2A] text-base">{selectedMember.designation}</span>
                      </div>
                    )}
                    <p className="text-sm text-[#4A2C2A] mt-4 italic">
                      "Dedicated to building our community's future"
                    </p>
                  </div>
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  )
}