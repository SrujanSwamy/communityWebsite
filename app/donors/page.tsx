"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { User, Phone, Search, ChevronLeft, ChevronRight, DollarSign, CreditCard, Hash, Award } from "lucide-react"
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
        .order("Amount", { ascending: false }) // Order by donation amount (highest first)
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

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  if (loading && donors.length === 0) {
    return (
      <div className="min-h-screen bg-[#FFF9E6] py-8 px-4">
        <div className="container mx-auto">
          <div className="bg-black py-6 mb-12">
            <h1 className="text-3xl font-bold text-center text-white">Our Donors</h1>
          </div>
          <div className="flex justify-center items-center h-64">
            <div className="text-[#B22222] text-lg">Loading donors...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FFF9E6] py-8 px-4">
      <div className="container mx-auto">
        <div className="bg-black py-6 mb-12">
          <h1 className="text-3xl font-bold text-center text-white">Our Donors</h1>
        </div>
        
        {/* Search Bar */}
        <div className="mb-8 max-w-md mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              type="text"
              placeholder="Search donors by name, designation, or status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-2 border-[#B22222] focus:border-[#8B0000]"
            />
          </div>
        </div>

        {/* Donors Count */}
        <div className="mb-6 text-center">
          <p className="text-[#4A2C2A] text-lg">
            {searchTerm ? `${filteredDonors.length} donors found` : `Total: ${totalDonors} donors`}
          </p>
        </div>

        {/* Donors Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredDonors.map((donor, index) => (
            <motion.div
              key={donor.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card
                className="bg-white border-2 border-[#B22222] overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg"
                onClick={() => setSelectedDonor(donor)}
              >
                <CardHeader className="flex items-center justify-center pb-4">
                  {donor.photo ? (
                    <Image
                      src={donor.photo}
                      alt={donor.name}
                      width={100}
                      height={100}
                      className="rounded-full object-cover"
                      onError={(e) => {
                        // Fallback to default avatar if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.parentElement?.querySelector('.fallback-avatar')?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className={`w-16 h-16 bg-[#B22222] rounded-full flex items-center justify-center ${donor.photo ? 'hidden fallback-avatar' : ''}`}>
                    <User className="w-8 h-8 text-white" />
                  </div>
                </CardHeader>
                <CardContent className="text-center pt-0">
                  <CardTitle className="text-lg font-semibold text-[#4A2C2A] mb-2">{donor.name}</CardTitle>
                  {donor.designation && (
                    <p className="text-[#B22222] text-sm mb-2">{donor.designation}</p>
                  )}
                  <div className="flex items-center justify-center text-[#B22222] font-bold text-lg mb-2">
                    <DollarSign className="w-4 h-4 mr-1" />
                    <span>{formatAmount(donor.Amount)}</span>
                  </div>
                  <div className="text-[#4A2C2A] text-sm">
                    <span className="bg-[#FFF9E6] px-2 py-1 rounded-full border border-[#B22222]">
                      {donor.member_status}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* No Results */}
        {filteredDonors.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-[#4A2C2A] text-lg">
              {searchTerm ? "No donors found matching your search." : "No donors available."}
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

      {/* Donor Detail Modal */}
      <AnimatePresence>
        {selectedDonor && (
          <Dialog open={!!selectedDonor} onOpenChange={() => setSelectedDonor(null)}>
            <DialogContent className="bg-white border-2 border-[#B22222] max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl text-[#B22222] flex items-center mb-4">
                  <div className="mr-4">
                    {selectedDonor.photo ? (
                      <Image
                        src={selectedDonor.photo}
                        alt={selectedDonor.name}
                        width={64}
                        height={64}
                        className="rounded-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.parentElement?.querySelector('.fallback-avatar')?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`w-16 h-16 bg-[#B22222] rounded-full flex items-center justify-center ${selectedDonor.photo ? 'hidden fallback-avatar' : ''}`}>
                      <User className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <div>
                    <h2>{selectedDonor.name}</h2>
                    {selectedDonor.designation && (
                      <h3 className="text-lg text-[#4A2C2A] font-normal">{selectedDonor.designation}</h3>
                    )}
                  </div>
                </DialogTitle>
                <DialogDescription className="text-[#4A2C2A] space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Donation Information */}
                    <div>
                      <h4 className="text-lg font-semibold text-[#B22222] mb-3">Donation Details</h4>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <DollarSign className="w-4 h-4 mr-3 text-[#B22222]" />
                          <span className="font-bold text-lg">{formatAmount(selectedDonor.Amount)}</span>
                        </div>
                        <div className="flex items-center">
                          <CreditCard className="w-4 h-4 mr-3 text-[#B22222]" />
                          <span>{selectedDonor.payment_type}</span>
                        </div>
                        {selectedDonor.transaction_no && (
                          <div className="flex items-center">
                            <Hash className="w-4 h-4 mr-3 text-[#B22222]" />
                            <span className="text-sm font-mono">{selectedDonor.transaction_no}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Contact Information */}
                    <div>
                      <h4 className="text-lg font-semibold text-[#B22222] mb-3">Contact Information</h4>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 mr-3 text-[#B22222]" />
                          <span>{selectedDonor.phone_no}</span>
                        </div>
                        <div className="flex items-center">
                          <Award className="w-4 h-4 mr-3 text-[#B22222]" />
                          <span>{selectedDonor.member_status}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Additional Information */}
                  {selectedDonor.designation && (
                    <div>
                      <h4 className="text-lg font-semibold text-[#B22222] mb-2">Designation</h4>
                      <p>{selectedDonor.designation}</p>
                    </div>
                  )}
                  
                  {/* Donation Date */}
                  <div>
                    <h4 className="text-lg font-semibold text-[#B22222] mb-2">Donation Date</h4>
                    <p>{new Date(selectedDonor.created_at).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</p>
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