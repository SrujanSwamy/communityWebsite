"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Images, X, ZoomIn, Download, Heart } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { toast } from "@/components/ui/use-toast"
import Image from "next/image"

interface GalleryPhoto {
  id: number
  photo_url: string
}

const PHOTOS_PER_PAGE = 20

const optimizeCloudinaryUrl = (url: string, width: number, height: number, quality: string = "auto") => {
  if (!url || !url.includes('cloudinary.com')) {
    return url
  }
  
  const parts = url.split('/upload/')
  if (parts.length === 2) {
    return `${parts[0]}/upload/w_${width},h_${height},c_fill,q_${quality},f_auto/${parts[1]}`
  }
  
  return url
}

const getFullSizeUrl = (url: string) => {
  if (!url || !url.includes('cloudinary.com')) {
    return url
  }
  
  const parts = url.split('/upload/')
  if (parts.length === 2) {
    return `${parts[0]}/upload/q_auto,f_auto/${parts[1]}`
  }
  
  return url
}

export default function PhotoGalleryPage() {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([])
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPhotos, setTotalPhotos] = useState(0)
  const [imageLoading, setImageLoading] = useState<{ [key: string]: boolean }>({})

  const supabase = createClient()

  useEffect(() => {
    fetchPhotos()
  }, [currentPage])

  const fetchPhotos = async () => {
    try {
      setLoading(true)
      
      const { count, error: countError } = await supabase
        .from("Gallery")
        .select("*", { count: "exact", head: true })
        .not("photo_url", "is", null)

      if (countError) {
        console.error("Error getting photo count:", countError)
      } else {
        setTotalPhotos(count || 0)
      }

      const from = (currentPage - 1) * PHOTOS_PER_PAGE
      const to = from + PHOTOS_PER_PAGE - 1

      const { data, error } = await supabase
        .from("Gallery")
        .select("id, photo_url")
        .not("photo_url", "is", null)
        .order("id", { ascending: false })
        .range(from, to)

      if (error) {
        console.error("Error fetching photos:", error)
        toast({
          title: "Error",
          description: `Failed to fetch photos: ${error.message}`,
          variant: "destructive",
        })
        return
      }

      if (data) {
        setPhotos(data)
      }
    } catch (error) {
      console.error("Fetch error:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred while fetching photos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const totalPages = Math.ceil(totalPhotos / PHOTOS_PER_PAGE)

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
      setSelectedPhotoIndex(null)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handlePhotoClick = (index: number) => {
    setSelectedPhotoIndex(index)
  }

  const handleNextPhoto = () => {
    if (selectedPhotoIndex !== null && selectedPhotoIndex < photos.length - 1) {
      setSelectedPhotoIndex(selectedPhotoIndex + 1)
    }
  }

  const handlePrevPhoto = () => {
    if (selectedPhotoIndex !== null && selectedPhotoIndex > 0) {
      setSelectedPhotoIndex(selectedPhotoIndex - 1)
    }
  }

  const handleDownload = async (url: string, photoId: number) => {
    try {
      const fullSizeUrl = getFullSizeUrl(url)
      const response = await fetch(fullSizeUrl)
      if (!response.ok) throw new Error('Network response was not ok')
      
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `gallery-photo-${photoId}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
      
      toast({
        title: "Success",
        description: "Photo downloaded successfully!",
      })
    } catch (error) {
      console.error("Download error:", error)
      toast({
        title: "Error",
        description: "Failed to download photo. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleImageLoad = (photoId: number) => {
    setImageLoading(prev => ({ ...prev, [photoId]: false }))
  }

  const handleImageLoadStart = (photoId: number) => {
    setImageLoading(prev => ({ ...prev, [photoId]: true }))
  }

  const selectedPhoto = selectedPhotoIndex !== null ? photos[selectedPhotoIndex] : null

  if (loading && photos.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FFF9E6] via-[#FFF3E0] to-[#FFEDE0] py-8 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-[#B22222] to-[#8B0000] rounded-full mb-6 shadow-2xl">
              <Images className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-[#B22222] to-[#8B0000] bg-clip-text text-transparent mb-4">
              Photo Gallery
            </h1>
            <p className="text-[#4A2C2A] text-xl opacity-75">Capturing Beautiful Moments</p>
          </div>
          <div className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B22222]"></div>
              <div className="text-[#B22222] text-lg">Loading beautiful memories...</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF9E6] via-[#FFF3E0] to-[#FFEDE0] py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-[#B22222] to-[#8B0000] rounded-full mb-6 shadow-2xl">
            <Images className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-[#B22222] to-[#8B0000] bg-clip-text text-transparent mb-4">
            Photo Gallery
          </h1>
          <p className="text-[#4A2C2A] text-xl opacity-75 mb-6">Capturing Beautiful Moments</p>
          
          {/* Stats */}
          <div className="inline-flex items-center bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg border border-[#B22222]/20">
            <Heart className="w-5 h-5 text-[#B22222] mr-2" />
            <span className="text-[#4A2C2A] font-semibold">{totalPhotos} memories captured</span>
          </div>
        </div>

        {/* Modern Grid Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-12">
          {photos.map((photo, index) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                duration: 0.5, 
                delay: index * 0.05,
                type: "spring",
                stiffness: 100
              }}
              className="group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:scale-[1.02]"
              onClick={() => handlePhotoClick(index)}
              style={{
                aspectRatio: index % 7 === 0 ? '1/1.4' : 
                           index % 5 === 0 ? '1/0.8' : 
                           index % 3 === 0 ? '1/1.2' : '1/1'
              }}
            >
              {/* Loading Skeleton */}
              {imageLoading[photo.id] && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse" />
              )}
              
              {/* Image */}
              <Image
                src={optimizeCloudinaryUrl(photo.photo_url, 600, 800)}
                alt={`Gallery photo ${photo.id}`}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                priority={index < 8}
                onLoadingComplete={() => handleImageLoad(photo.id)}
                onLoadStart={() => handleImageLoadStart(photo.id)}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
              
              
              {/* Hover Content */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                <div className="bg-white/90 backdrop-blur-sm rounded-full p-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  <ZoomIn className="w-6 h-6 text-[#B22222]" />
                </div>
              </div>

            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {photos.length === 0 && !loading && (
          <div className="text-center py-20">
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 bg-gradient-to-r from-[#B22222]/10 to-[#8B0000]/10 rounded-full flex items-center justify-center mb-8">
                <Images className="w-16 h-16 text-[#B22222]/30" />
              </div>
              <h3 className="text-2xl font-semibold text-[#4A2C2A] mb-4">No Photos Yet</h3>
              <p className="text-[#4A2C2A]/60 text-lg max-w-md mx-auto">
                The gallery is waiting to be filled with beautiful memories. Check back soon!
              </p>
            </div>
          </div>
        )}

        {/* Enhanced Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col items-center space-y-6">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || loading}
                className="bg-white/80 backdrop-blur-sm border-[#B22222]/30 text-[#B22222] hover:bg-[#B22222] hover:text-white transition-all duration-300 shadow-md"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                  let pageNum
                  if (totalPages <= 7) {
                    pageNum = i + 1
                  } else if (currentPage <= 4) {
                    pageNum = i + 1
                  } else if (currentPage >= totalPages - 3) {
                    pageNum = totalPages - 6 + i
                  } else {
                    pageNum = currentPage - 3 + i
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      onClick={() => handlePageChange(pageNum)}
                      disabled={loading}
                      className={
                        currentPage === pageNum
                          ? "bg-gradient-to-r from-[#B22222] to-[#8B0000] text-white hover:from-[#8B0000] hover:to-[#B22222] shadow-lg"
                          : "bg-white/80 backdrop-blur-sm border-[#B22222]/30 text-[#B22222] hover:bg-[#B22222] hover:text-white transition-all duration-300"
                      }
                      size="sm"
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
                className="bg-white/80 backdrop-blur-sm border-[#B22222]/30 text-[#B22222] hover:bg-[#B22222] hover:text-white transition-all duration-300 shadow-md"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
            
            <div className="text-[#4A2C2A]/60 text-sm bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full">
              Page {currentPage} of {totalPages} • Showing {photos.length} photos
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Photo Viewer Modal */}
      <AnimatePresence>
        {selectedPhoto && selectedPhotoIndex !== null && (
          <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhotoIndex(null)}>
            <DialogContent className="max-w-[98vw] max-h-[98vh] p-0 bg-black/95 backdrop-blur-sm border-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
                className="relative w-full h-full flex flex-col"
              >
                {/* Enhanced Header */}
                <div className="absolute top-0 left-0 right-0 z-30 bg-gradient-to-b from-black/80 to-transparent p-6">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                      <div className="bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full border border-white/20">
                        <span className="text-sm font-medium">
                          Photo #{selectedPhoto.id}
                        </span>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full border border-white/20">
                        <span className="text-sm">
                          {selectedPhotoIndex + 1} of {photos.length}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(selectedPhoto.photo_url, selectedPhoto.id)}
                        className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 transition-all duration-300"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedPhotoIndex(null)}
                        className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-red-500/30 transition-all duration-300"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Enhanced Navigation */}
                {selectedPhotoIndex > 0 && (
                  <Button
                    variant="outline"
                    onClick={handlePrevPhoto}
                    className="absolute left-6 top-1/2 transform -translate-y-1/2 z-30 bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 w-14 h-14 p-0 rounded-full transition-all duration-300"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </Button>
                )}
                
                {selectedPhotoIndex < photos.length - 1 && (
                  <Button
                    variant="outline"
                    onClick={handleNextPhoto}
                    className="absolute right-6 top-1/2 transform -translate-y-1/2 z-30 bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 w-14 h-14 p-0 rounded-full transition-all duration-300"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </Button>
                )}

                {/* Enhanced Image Container */}
                <div className="flex-1 flex items-center justify-center p-8 pt-24 pb-16">
                  <div className="relative max-w-full max-h-full">
                    <Image
                      src={getFullSizeUrl(selectedPhoto.photo_url)}
                      alt={`Gallery photo ${selectedPhoto.id}`}
                      width={1200}
                      height={800}
                      className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
                      sizes="90vw"
                      priority
                      quality={95}
                    />
                  </div>
                </div>

                {/* Bottom Gradient */}
                <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
              </motion.div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  )
}