"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { User, Phone, Search, ChevronLeft, ChevronRight, CreditCard, Hash, Award, Calendar, Heart } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { toast } from "@/components/ui/use-toast"
import Image from "next/image"

interface Donor {
  id: number
  name: string
  phone_no: string
  member_status: string
  Amount: number
  payment_type: string
  transaction_no: string | null
  photo: string | null
  designation: string | null
  created_at: string
}

const DONORS_PER_PAGE = 12

export default function DonorsPage() {
  const [donors, setDonors] = useState<Donor[]>([])
  const [selectedDonor, setSelectedDonor] = useState<Donor | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalDonors, setTotalDonors] = useState(0)
  const [filteredDonors, setFilteredDonors] = useState<Donor[]>([])

  const supabase = createClient()

  useEffect(() => {
    fetchDonors()
  }, [currentPage])

  useEffect(() => {
    // Filter donors based on search term
    if (searchTerm.trim() === "") {
      setFilteredDonors(donors)
    } else {
      const filtered = donors.filter(donor =>
        donor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (donor.designation && donor.designation.toLowerCase().includes(searchTerm.toLowerCase())) ||
        donor.member_status.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredDonors(filtered)
    }
  }, [donors, searchTerm])

  const fetchDonors = async () => {
    try {
      setLoading(true)
      
      // Get total count for pagination
      const { count, error: countError } = await supabase
        .from("Donors")
        .select("*", { count: "exact", head: true })

      if (countError) {
        console.error("Error getting donor count:", countError)
      } else {
        setTotalDonors(count || 0)
      }

      // Get donors for current page
      const from = (currentPage - 1) * DONORS_PER_PAGE
      const to = from + DONORS_PER_PAGE - 1

      const { data, error } = await supabase
        .from("Donors")
        .select(`
          id,
          name,
          phone_no,
          member_status,
          Amount,
          payment_type,
          transaction_no,
          photo,
          designation,
          created_at
        `)
        .order("created_at", { ascending: false }) // Order by donation date (newest first)
        .range(from, to)

      if (error) {
        console.error("Error fetching donors:", error)
        toast({
          title: "Error",
          description: `Failed to fetch donors: ${error.message}`,
          variant: "destructive",
        })
        return
      }

      if (data) {
        setDonors(data)
      }
    } catch (error) {
      console.error("Fetch error:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred while fetching donors",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const totalPages = Math.ceil(totalDonors / DONORS_PER_PAGE)

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const getMemberStatusColor = (status: string) => {
    const colors = {
      'Life Member': 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-yellow-900',
      'Annual Member': 'bg-gradient-to-r from-blue-400 to-blue-600 text-blue-900',
      'Honorary Member': 'bg-gradient-to-r from-purple-400 to-purple-600 text-purple-900',
      'Patron': 'bg-gradient-to-r from-emerald-400 to-emerald-600 text-emerald-900',
      'Supporter': 'bg-gradient-to-r from-orange-400 to-orange-600 text-orange-900',
      'General': 'bg-gradient-to-r from-gray-400 to-gray-600 text-gray-900'
    }
    return colors[status as keyof typeof colors] || 'bg-gradient-to-r from-gray-400 to-gray-600 text-gray-900'
  }

  if (loading && donors.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#B22222] to-[#8B0000] rounded-2xl shadow-2xl mb-12 py-12">
            <div className="text-center">
              <Heart className="w-16 h-16 text-white mx-auto mb-4" />
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">Our Generous Donors</h1>
              <p className="text-red-100 text-lg">Honoring those who support our community</p>
            </div>
          </div>
          
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#B22222] mx-auto mb-4"></div>
              <div className="text-[#B22222] text-xl font-medium">Loading our valued donors...</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50">
      <div className="container mx-auto px-4 py-8">
        {/* Enhanced Header */}
        <div className="bg-gradient-to-r from-[#B22222] to-[#8B0000] rounded-2xl shadow-2xl mb-12 py-12">
          <div className="text-center">
            
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">Our Generous Donors</h1>
           
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="mb-8 max-w-lg mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              type="text"
              placeholder="Search donors by name, designation, or status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-4 py-3 text-lg border-2 border-[#B22222] focus:border-[#8B0000] rounded-full shadow-lg bg-white/80 backdrop-blur"
            />
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-8 text-center">
          <p className="text-[#4A2C2A] text-lg font-medium bg-white/60 inline-block px-6 py-2 rounded-full shadow-md">
            {searchTerm ? `${filteredDonors.length} donors found` : `Showing ${filteredDonors.length} of ${totalDonors} donors`}
          </p>
        </div>

        {/* Enhanced Donors Grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredDonors.map((donor, index) => (
            <motion.div
              key={donor.id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ 
                duration: 0.5, 
                delay: index * 0.1,
                type: "spring",
                stiffness: 100 
              }}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Card
                className="bg-white/90 backdrop-blur border-0 shadow-xl hover:shadow-2xl cursor-pointer transition-all duration-300 rounded-2xl overflow-hidden group"
                onClick={() => setSelectedDonor(donor)}
              >
                {/* Card Header with Photo */}
                <CardHeader className="text-center pb-4 pt-8 bg-gradient-to-b from-gray-50 to-white">
                  <div className="relative mx-auto mb-4">
                    {donor.photo ? (
                      <div className="relative">
                        <Image
                          src={donor.photo}
                          alt={donor.name}
                          width={120}
                          height={120}
                          className="rounded-full object-cover shadow-lg ring-4 ring-white group-hover:ring-[#B22222] transition-all duration-300"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.parentElement?.querySelector('.fallback-avatar')?.classList.remove('hidden');
                          }}
                        />
                        <div className="absolute -bottom-2 -right-2 bg-[#B22222] rounded-full p-2 shadow-lg">
                          <Heart className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    ) : null}
                    <div className={`relative w-32 h-32 bg-gradient-to-br from-[#B22222] to-[#8B0000] rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 ${donor.photo ? 'hidden fallback-avatar' : ''}`}>
                      <User className="w-12 h-12 text-white" />
                      <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-lg">
                        <Heart className="w-4 h-4 text-[#B22222]" />
                      </div>
                    </div>
                  </div>
                </CardHeader>

                {/* Card Content */}
                <CardContent className="text-center pt-0 pb-8">
                  <CardTitle className="text-xl font-bold text-[#4A2C2A] mb-3 group-hover:text-[#B22222] transition-colors">
                    {donor.name}
                  </CardTitle>
                  
                  {donor.designation && (
                    <p className="text-[#B22222] text-sm font-medium mb-4 bg-red-50 px-3 py-1 rounded-full inline-block">
                      {donor.designation}
                    </p>
                  )}

                  {/* Member Status Badge */}
                  <div className="mb-4">
                    <span className={`${getMemberStatusColor(donor.member_status)} px-4 py-2 rounded-full text-sm font-bold shadow-md inline-flex items-center space-x-2`}>
                      <Award className="w-4 h-4" />
                      <span>{donor.member_status}</span>
                    </span>
                  </div>

                  {/* Donation Date */}
                  <div className="text-gray-600 text-sm flex items-center justify-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {new Date(donor.created_at).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short'
                      })}
                    </span>
                  </div>

                  {/* Hover Effect Indicator */}
                  <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="text-[#B22222] text-sm font-medium">Click for details →</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* No Results */}
        {filteredDonors.length === 0 && !loading && (
          <div className="text-center py-16">
            <div className="bg-white/60 backdrop-blur rounded-2xl shadow-lg p-8 max-w-md mx-auto">
              <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-[#4A2C2A] text-xl font-medium mb-2">
                {searchTerm ? "No donors found matching your search." : "No donors available."}
              </p>
              {searchTerm && (
                <p className="text-gray-600">Try searching with different keywords.</p>
              )}
            </div>
          </div>
        )}

        {/* Enhanced Pagination */}
        {!searchTerm && totalPages > 1 && (
          <div className="mt-16 flex justify-center items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || loading}
              className="border-2 border-[#B22222] text-[#B22222] hover:bg-[#B22222] hover:text-white rounded-full px-6 py-3 font-medium shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <ChevronLeft className="w-5 h-5 mr-2" />
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
                        ? "bg-[#B22222] text-white hover:bg-[#8B0000] rounded-full w-12 h-12 shadow-lg"
                        : "border-2 border-[#B22222] text-[#B22222] hover:bg-[#B22222] hover:text-white rounded-full w-12 h-12 shadow-md hover:shadow-lg transition-all duration-300"
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
              className="border-2 border-[#B22222] text-[#B22222] hover:bg-[#B22222] hover:text-white rounded-full px-6 py-3 font-medium shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Next
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        )}

        {/* Page Info */}
        {!searchTerm && totalPages > 1 && (
          <div className="mt-6 text-center">
            <p className="text-[#4A2C2A] bg-white/60 inline-block px-4 py-2 rounded-full text-sm font-medium shadow-md">
              Page {currentPage} of {totalPages}
            </p>
          </div>
        )}
      </div>

      {/* Enhanced Donor Detail Modal */}
      <AnimatePresence>
        {selectedDonor && (
          <Dialog open={!!selectedDonor} onOpenChange={() => setSelectedDonor(null)}>
            <DialogContent className="bg-white border-0 shadow-2xl max-w-3xl rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-3xl text-[#B22222] flex items-center mb-6">
                  <div className="mr-6">
                    {selectedDonor.photo ? (
                      <div className="relative">
                        <Image
                          src={selectedDonor.photo}
                          alt={selectedDonor.name}
                          width={80}
                          height={80}
                          className="rounded-full object-cover shadow-lg ring-4 ring-[#B22222]"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.parentElement?.querySelector('.fallback-avatar')?.classList.remove('hidden');
                          }}
                        />
                        <div className="absolute -bottom-1 -right-1 bg-[#B22222] rounded-full p-1.5">
                          <Heart className="w-3 h-3 text-white" />
                        </div>
                      </div>
                    ) : null}
                    <div className={`relative w-20 h-20 bg-gradient-to-br from-[#B22222] to-[#8B0000] rounded-full flex items-center justify-center shadow-lg ${selectedDonor.photo ? 'hidden fallback-avatar' : ''}`}>
                      <User className="w-10 h-10 text-white" />
                      <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1.5">
                        <Heart className="w-3 h-3 text-[#B22222]" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{selectedDonor.name}</h2>
                    {selectedDonor.designation && (
                      <h3 className="text-lg text-[#4A2C2A] font-normal mt-1 bg-red-50 px-3 py-1 rounded-full inline-block">
                        {selectedDonor.designation}
                      </h3>
                    )}
                  </div>
                </DialogTitle>
                
                <DialogDescription className="text-[#4A2C2A] space-y-6">
                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Contact Information */}
                    <div className="bg-blue-50 p-6 rounded-xl">
                      <h4 className="text-xl font-bold text-[#B22222] mb-4 flex items-center">
                        <Phone className="w-5 h-5 mr-2" />
                        Contact Information
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <Phone className="w-4 h-4 text-[#B22222]" />
                          <span className="text-lg">{selectedDonor.phone_no}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Award className="w-4 h-4 text-[#B22222]" />
                          <span className={`${getMemberStatusColor(selectedDonor.member_status)} px-3 py-1 rounded-full text-sm font-medium`}>
                            {selectedDonor.member_status}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Contribution Information */}
                    <div className="bg-green-50 p-6 rounded-xl">
                      <h4 className="text-xl font-bold text-[#B22222] mb-4 flex items-center">
                        <Heart className="w-5 h-5 mr-2" />
                        Contribution Details
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <CreditCard className="w-4 h-4 text-[#B22222]" />
                          <span className="text-lg capitalize">{selectedDonor.payment_type}</span>
                        </div>
                        {selectedDonor.transaction_no && (
                          <div className="flex items-center space-x-3">
                            <Hash className="w-4 h-4 text-[#B22222]" />
                            <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                              {selectedDonor.transaction_no}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center space-x-3">
                          <Calendar className="w-4 h-4 text-[#B22222]" />
                          <span>{new Date(selectedDonor.created_at).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Thank You Message */}
                  <div className="bg-gradient-to-r from-[#B22222] to-[#8B0000] p-6 rounded-xl text-white text-center">
                    <Heart className="w-8 h-8 mx-auto mb-3 animate-pulse" />
                    <h4 className="text-lg font-bold mb-2">Thank You for Your Generous Support!</h4>
                    <p className="text-red-100">
                      Your contribution helps us preserve our cultural heritage and serve our community better.
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