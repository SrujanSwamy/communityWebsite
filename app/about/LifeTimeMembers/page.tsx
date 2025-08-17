"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { User, Phone, MapPin, Briefcase, Search, ChevronLeft, ChevronRight } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { toast } from "@/components/ui/use-toast"

interface Member {
  id: number
  name: string
  email_id: string
  phone_no: string
  profession: string
  street: string | null
  city: string
  state: string
  country: string
  pincode: number
  documents: string | null
  created_at: string
}

const MEMBERS_PER_PAGE = 12

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalMembers, setTotalMembers] = useState(0)
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([])

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
        member.profession.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.state.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredMembers(filtered)
    }
  }, [members, searchTerm])

  const fetchMembers = async () => {
    try {
      setLoading(true)
      
      // Get total count for pagination
      const { count, error: countError } = await supabase
        .from("Members")
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
        .from("Members")
        .select(`
          id,
          name,
          email_id,
          phone_no,
          profession,
          street,
          city,
          state,
          country,
          pincode,
          documents,
          created_at
        `)
        .order("name", { ascending: true })
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

  const getFullAddress = (member: Member) => {
    const parts = [member.street, member.city, member.state, member.country].filter(Boolean)
    return parts.join(", ")
  }

  if (loading && members.length === 0) {
    return (
      <div className="min-h-screen bg-[#FFF9E6] py-8 px-4">
        <div className="container mx-auto">
          <div className="bg-black py-6 mb-12">
            <h1 className="text-3xl font-bold text-center text-white">Our Members</h1>
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
          <h1 className="text-3xl font-bold text-center text-white">Our Members</h1>
        </div>
        
        {/* Search Bar */}
        <div className="mb-8 max-w-md mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              type="text"
              placeholder="Search members by name, profession, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-2 border-[#B22222] focus:border-[#8B0000]"
            />
          </div>
        </div>

        {/* Members Count */}
        <div className="mb-6 text-center">
          <p className="text-[#4A2C2A] text-lg">
            {searchTerm ? `${filteredMembers.length} members found` : `Total: ${totalMembers} members`}
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
                className="bg-white border-2 border-[#B22222] overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg"
                onClick={() => setSelectedMember(member)}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center space-y-3">
                    {/* Avatar */}
                    <div className="w-16 h-16 bg-[#B22222] rounded-full flex items-center justify-center">
                      <User className="w-8 h-8 text-white" />
                    </div>
                    
                    {/* Name */}
                    <h2 className="text-lg font-bold text-[#B22222] line-clamp-2">{member.name}</h2>
                    
                    {/* Profession */}
                    <div className="flex items-center text-[#4A2C2A] text-sm">
                      <Briefcase className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="line-clamp-1">{member.profession}</span>
                    </div>
                    
                    {/* Location */}
                    <div className="flex items-center text-[#4A2C2A] text-sm">
                      <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="line-clamp-1">{member.city}, {member.state}</span>
                    </div>
                    
                    {/* Phone */}
                    <div className="flex items-center text-[#4A2C2A] text-sm">
                      <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="line-clamp-1">{member.phone_no}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* No Results */}
        {filteredMembers.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-[#4A2C2A] text-lg">
              {searchTerm ? "No members found matching your search." : "No members available."}
            </p>
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
            <DialogContent className="bg-white border-2 border-[#B22222] max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl text-[#B22222] flex items-center mb-4">
                  <div className="w-16 h-16 bg-[#B22222] rounded-full flex items-center justify-center mr-4">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2>{selectedMember.name}</h2>
                    <h3 className="text-lg text-[#4A2C2A] font-normal">{selectedMember.profession}</h3>
                  </div>
                </DialogTitle>
                <DialogDescription className="text-[#4A2C2A] space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Contact Information */}
                    <div>
                      <h4 className="text-lg font-semibold text-[#B22222] mb-3">Contact Information</h4>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 mr-3 text-[#B22222]" />
                          <span>{selectedMember.phone_no}</span>
                        </div>
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-3 text-[#B22222]" />
                          <span>{selectedMember.email_id}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Location */}
                    <div>
                      <h4 className="text-lg font-semibold text-[#B22222] mb-3">Location</h4>
                      <div className="flex items-start">
                        <MapPin className="w-4 h-4 mr-3 text-[#B22222] mt-0.5 flex-shrink-0" />
                        <div>
                          <p>{getFullAddress(selectedMember)}</p>
                          <p className="text-sm text-gray-600">PIN: {selectedMember.pincode}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Professional Information */}
                  <div>
                    <h4 className="text-lg font-semibold text-[#B22222] mb-2">Professional Information</h4>
                    <div className="flex items-center">
                      <Briefcase className="w-4 h-4 mr-3 text-[#B22222]" />
                      <span>{selectedMember.profession}</span>
                    </div>
                  </div>
                  
                  {/* Documents Link */}
                  {selectedMember.documents && (
                    <div>
                      <h4 className="text-lg font-semibold text-[#B22222] mb-2">Documents</h4>
                      <a
                        href={selectedMember.documents}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#B22222] hover:underline inline-flex items-center"
                      >
                        View Documents
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </a>
                    </div>
                  )}
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  )
}