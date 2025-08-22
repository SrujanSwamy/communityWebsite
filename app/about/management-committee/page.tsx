"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { User, Search, ChevronLeft, ChevronRight, Users } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { toast } from "@/components/ui/use-toast"
import Image from "next/image"

interface ExecutiveMember {
  id: number
  name: string
  position: string
  description: string | null
  photo: string | null
  achivements: string | null
}

const MEMBERS_PER_PAGE = 8 // Fewer per page for executive members

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

export default function ExecutiveMembersPage() {
  const [members, setMembers] = useState<ExecutiveMember[]>([])
  const [selectedMember, setSelectedMember] = useState<ExecutiveMember | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalMembers, setTotalMembers] = useState(0)
  const [filteredMembers, setFilteredMembers] = useState<ExecutiveMember[]>([])

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
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (member.description && member.description.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      setFilteredMembers(filtered)
    }
  }, [members, searchTerm])

  const fetchMembers = async () => {
    try {
      setLoading(true)
      
      // Get total count for pagination
      const { count, error: countError } = await supabase
        .from("ExecutiveMembers")
        .select("*", { count: "exact", head: true })

      if (countError) {
        console.error("Error getting member count:", countError)
      } else {
        setTotalMembers(count || 0)
      }

      // Get members for current page - ORDER BY ID instead of position
      const from = (currentPage - 1) * MEMBERS_PER_PAGE
      const to = from + MEMBERS_PER_PAGE - 1

      const { data, error } = await supabase
        .from("ExecutiveMembers")
        .select(`
          id,
          name,
          position,
          description,
          photo,
          achivements
        `)
        .order("id", { ascending: true }) // Order by ID for database insertion order
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
          <div className="bg-black py-6 mb-12 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <Users className="w-8 h-8 text-white mr-3" />
              <h1 className="text-3xl font-bold text-white">Executive Committee</h1>
            </div>
            <p className="text-center text-white opacity-75">Leadership Team</p>
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
        <div className="bg-black py-6 mb-12 rounded-lg">
          <div className="flex items-center justify-center mb-2">
            <Users className="w-8 h-8 text-white mr-3" />
            <h1 className="text-3xl font-bold text-white">Executive Committee</h1>
          </div>
          <p className="text-center text-white opacity-75">Leadership Team</p>
        </div>
        
        {/* Search Bar */}
        <div className="mb-8 max-w-md mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              type="text"
              placeholder="Search by name, position, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-2 border-[#B22222] focus:border-[#8B0000]"
            />
          </div>
        </div>

        {/* Members Count */}
        <div className="mb-6 text-center">
          <p className="text-[#4A2C2A] text-lg">
            {searchTerm ? `${filteredMembers.length} members found` : `Total: ${totalMembers} executive members`}
          </p>
        </div>

        {/* Members Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredMembers.map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card
                className="bg-white border-2 border-[#B22222] overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg h-80 relative group"
                onClick={() => setSelectedMember(member)}
              >
                {/* Photo Background - Always Visible */}
                <div className="absolute inset-0 h-full w-full">
                  {member.photo ? (
                    <div className="relative w-full h-full">
                      <Image
                        src={optimizeCloudinaryUrl(member.photo, 400, 320)}
                        alt={member.name || "Executive Member"}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
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

                {/* Executive Badge - Always Visible */}
                <div className="absolute top-3 right-3 z-10">
                  <div className="bg-black/80 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs flex items-center shadow-lg">
                    <Users className="w-3 h-3 mr-1" />
                    Executive
                  </div>
                </div>

                {/* Hover Overlay with Name and Position */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                  <div className="p-4 text-white w-full">
                    <h2 className="text-xl font-bold mb-1 drop-shadow-lg">{member.name}</h2>
                    <h3 className="text-base font-medium opacity-90 drop-shadow">{member.position}</h3>
                  </div>
                </div>

                {/* Subtle hover indicator */}
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-white/30 transition-all duration-300 pointer-events-none"></div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* No Results */}
        {filteredMembers.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="flex flex-col items-center">
              <Users className="w-16 h-16 text-[#B22222] mb-4 opacity-50" />
              <p className="text-[#4A2C2A] text-lg">
                {searchTerm ? "No executive members found matching your search." : "No executive members available."}
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
            <DialogContent className="bg-white border-2 border-[#B22222] max-w-3xl">
              <DialogHeader>
                <DialogTitle className="text-2xl text-[#B22222] flex items-start mb-4">
                  <div className="mr-4 flex-shrink-0">
                    {selectedMember.photo ? (
                      <div className="relative w-24 h-24">
                        <Image
                          src={optimizeCloudinaryUrl(selectedMember.photo, 200, 200)}
                          alt={selectedMember.name}
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
                    <div className={`fallback-avatar w-24 h-24 bg-[#B22222] rounded-full flex items-center justify-center ${selectedMember.photo ? 'hidden' : ''}`}>
                      <User className="w-10 h-10 text-white" />
                    </div>
                  </div>
                  <div className="flex-grow">
                    <h2 className="mb-1">{selectedMember.name}</h2>
                    <h3 className="text-lg text-[#4A2C2A] font-normal">{selectedMember.position}</h3>
                  </div>
                </DialogTitle>
                <DialogDescription className="text-[#4A2C2A] space-y-4">
                  {selectedMember.description && (
                    <div>
                      <h4 className="font-semibold text-[#B22222] mb-2">About</h4>
                      <p className="text-base leading-relaxed">{selectedMember.description}</p>
                    </div>
                  )}
                  
                  {selectedMember.achivements && (
                    <div>
                      <h4 className="font-semibold text-[#B22222] mb-2">Achievements</h4>
                      <p className="text-base leading-relaxed">{selectedMember.achivements}</p>
                    </div>
                  )}
                  
                  {/* Executive Committee Badge */}
                  <div className="flex items-center justify-center pt-4">
                    <div className="bg-[#B22222] text-white px-4 py-2 rounded-full flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      <span>Executive Committee Member</span>
                    </div>
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