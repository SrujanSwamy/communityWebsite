"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown, User, Globe, Heart, Menu, X } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { LanguageSwitcher } from "./LanguageSwitcher"

export default function Navigation() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showMainMenu, setShowMainMenu] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error || !user) {
          setUser(null)
          setIsAdmin(false)
          setLoading(false)
          return
        }

        setUser(user)

        // Check if user is admin
        const { data: adminData } = await supabase
          .from('admins')
          .select('*')
          .eq('email', user.email)
          .single()

        setIsAdmin(!!adminData)
      } catch (error) {
        console.error('Error checking user:', error)
        setUser(null)
        setIsAdmin(false)
      } finally {
        setLoading(false)
      }
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        getUser()
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setIsAdmin(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const handleDashboardClick = () => {
    setIsMobileMenuOpen(false) // Close mobile menu when navigating
    setShowMainMenu(false)
    setOpenDropdown(null)
    if (isAdmin) {
      router.push('/admin/dashboard')
    } else {
      router.push('/community/dashboard')
    }
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
    if (!isMobileMenuOpen) {
      setShowMainMenu(false)
      setOpenDropdown(null)
    }
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
    setShowMainMenu(false)
    setOpenDropdown(null)
  }

  const toggleMainMenu = () => {
    setShowMainMenu(!showMainMenu)
    setOpenDropdown(null)
  }

  const toggleDropdown = (dropdown: string) => {
    setOpenDropdown(openDropdown === dropdown ? null : dropdown)
  }

  return (
    <nav className="bg-gradient-to-r from-[#ECCEA9] to-[#ECCEA9] text-white py-3 shadow-lg border-t-2 border-[#8B4513]">
      <div className="container mx-auto px-4">
        {/* Desktop Navigation */}
        <div className="hidden lg:flex justify-between items-center">
          {/* Main Navigation */}
          <div className="flex gap-2 items-center">
            <Link href="/" passHref>
              <Button variant="outline" className="bg-[#FFF8DC] text-[#8B4513] border-2 border-[#CD853F] hover:bg-[#FFE4B5] hover:text-[#D2691E] hover:border-[#D2691E] shadow-md transition-all duration-200 hover:shadow-lg">
                Home
              </Button>
            </Link>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="bg-[#FFF8DC] text-[#8B4513] border-2 border-[#CD853F] hover:bg-[#FFE4B5] hover:text-[#D2691E] hover:border-[#D2691E] shadow-md transition-all duration-200 hover:shadow-lg">
                  About <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="bg-[#FFF8DC] text-[#8B4513] border-2 border-[#ECCEA9] shadow-xl">
                <DropdownMenuItem className="hover:bg-[#FFE4B5] hover:text-[#ECCEA9] transition-colors">
                  <Link href="/about/community" className="w-full">
                    About Community
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-[#FFE4B5] hover:text-[#ECCEA9] transition-colors">
                  <Link href="/about/management-committee" className="w-full">
                    Executive Committee
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="bg-[#FFF8DC] text-[#8B4513] border-2 border-[#CD853F] hover:bg-[#FFE4B5] hover:text-[#D2691E] hover:border-[#D2691E] shadow-md transition-all duration-200 hover:shadow-lg">
                  Members <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="bg-[#FFF8DC] text-[#8B4513] border-2 border-[#ECCEA9] shadow-xl">
                <DropdownMenuItem className="hover:bg-[#FFE4B5] hover:text-[#ECCEA9] transition-colors">
                  <Link href="/about/PoshakaSadasyaru" className="w-full">
                    Poshaka Sadasyaru
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-[#FFE4B5] hover:text-[#ECCEA9] transition-colors">
                  <Link href="/about/MahaPoshakaru" className="w-full">
                    Mahaposhakaru
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-[#FFE4B5] hover:text-[#ECCEA9] transition-colors">
                  <Link href="/about/LifeTimeMembers" className="w-full">
                    Life-time Members
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-[#FFE4B5] hover:text-[#ECCEA9] transition-colors">
                  <Link href="/about/DeceasedMembers" className="w-full">
                    Deceased Members
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-[#FFE4B5] hover:text-[#ECCEA9] transition-colors">
                  <Link href="/about/BuildingCommittee" className="w-full">
                    Building Committee
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="border-t border-[#ECCEA9] mt-2 pt-2 hover:bg-[#FFE4B5] hover:text-[#ECCEA9] transition-colors">
                  <Link href="/membership" className="w-full font-semibold  hover:text-[#8B4513] transition-colors">
                    ✨ Become a Member
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="bg-[#FFF8DC] text-[#8B4513] border-2 border-[#CD853F] hover:bg-[#FFE4B5] hover:text-[#D2691E] hover:border-[#D2691E] shadow-md transition-all duration-200 hover:shadow-lg">
                  Announcements <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="bg-[#FFF8DC] text-[#8B4513] border-2 border-[#ECCEA9] shadow-xl">
                <DropdownMenuItem className="hover:bg-[#FFE4B5] hover:text-[#ECCEA9] transition-colors">
                  <Link href="/announcements" className="w-full">
                    Announcements
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-[#FFE4B5] hover:text-[#ECCEA9] transition-colors">
                  <Link href="/events" className="w-full">
                    Events
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Link href="/donors" passHref>
              <Button variant="outline" className="bg-[#FFF8DC] text-[#8B4513] border-2 border-[#CD853F] hover:bg-[#FFE4B5] hover:text-[#D2691E] hover:border-[#D2691E] shadow-md transition-all duration-200 hover:shadow-lg">
                Donors
              </Button>
            </Link>
            
            <Link href="/contactus" passHref>
              <Button variant="outline" className="bg-[#FFF8DC] text-[#8B4513] border-2 border-[#CD853F] hover:bg-[#FFE4B5] hover:text-[#D2691E] hover:border-[#D2691E] shadow-md transition-all duration-200 hover:shadow-lg">
                Contact Us
              </Button>
            </Link>
          </div>

          {/* Right Side - Language, Donate, Login/Dashboard */}
          <div className="flex gap-2 items-center">
            {/* Language Switcher with Globe Icon */}
             <LanguageSwitcher />

            {/* Donate Button */}
            <Link href="/donate">
              <Button variant="outline" className="bg-[#FFF8DC] text-[#8B4513] border-2 border-[#CD853F] hover:bg-[#FFE4B5] hover:text-[#ECCEA9] hover:border-[#ECCEA9] shadow-md transition-all duration-200 hover:shadow-lg">
                <Heart className="h-4 w-4 mr-1" />
                Donate
              </Button>
            </Link>

            {/* Login/Dashboard */}
            {!loading && (
              <>
                {user ? (
                  <Button 
                    onClick={handleDashboardClick}
                    variant="default" 
                    className="bg-[#8B4513] hover:bg-[#5D2F09] text-white shadow-md transition-all duration-200 hover:shadow-lg hover:scale-105"
                  >
                    <User className="mr-1 h-4 w-4" />
                    Dashboard
                  </Button>
                ) : (
                  <Link href="/login/user">
                    <Button variant="outline" className="bg-[#FFF8DC] text-[#8B4513] border-2 border-[#CD853F] hover:bg-[#FFE4B5] hover:text-[#ECCEA9] hover:border-[#ECCEA9] shadow-md transition-all duration-200 hover:shadow-lg">
                      <User className="mr-1 h-4 w-4" />
                      Login
                    </Button>
                  </Link>
                )}
              </>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden">
          {/* Mobile Header */}
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-[#8B4513]">Menu</span>
            <Button
              variant="ghost"
              onClick={toggleMobileMenu}
              className="text-[#8B4513] border-2 border-[#8B4513] hover:bg-[#CD853F] p-2 transition-all duration-200"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>

          {/* Mobile Menu Items */}
          {isMobileMenuOpen && (
            <div className="mt-4 space-y-2 border-t-2 border-[#CD853F] pt-4">
              <Link href="/" className="block" onClick={closeMobileMenu}>
                <Button variant="ghost" className="w-full justify-start text-[#8B4513] hover:bg-[#CD853F] transition-all duration-200">
                  Home
                </Button>
              </Link>
              
              {/* Mobile About Section */}
              <div className="space-y-1">
                <div className="text-[#8B4513] font-semibold px-3 py-2 text-sm">About</div>
                <div className="pl-4 space-y-1">
                  <Link href="/about/community" className="block" onClick={closeMobileMenu}>
                    <Button variant="ghost" className="w-full justify-start text-[#8B4513] hover:bg-[#CD853F] transition-all duration-200 text-sm">
                      About Community
                    </Button>
                  </Link>
                  <Link href="/about/management-committee" className="block" onClick={closeMobileMenu}>
                    <Button variant="ghost" className="w-full justify-start text-[#8B4513] hover:bg-[#CD853F] transition-all duration-200 text-sm">
                      Executive Committee
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Mobile Members Section */}
              <div className="space-y-1">
                <div className="text-[#8B4513] font-semibold px-3 py-2 text-sm">Members</div>
                <div className="pl-4 space-y-1">
                  <Link href="/about/PoshakaSadasyaru" className="block" onClick={closeMobileMenu}>
                    <Button variant="ghost" className="w-full justify-start text-[#8B4513] hover:bg-[#CD853F] transition-all duration-200 text-sm">
                      Poshaka Sadasyaru
                    </Button>
                  </Link>
                  <Link href="/about/MahaPoshakaru" className="block" onClick={closeMobileMenu}>
                    <Button variant="ghost" className="w-full justify-start text-[#8B4513] hover:bg-[#CD853F] transition-all duration-200 text-sm">
                      Mahaposhakaru
                    </Button>
                  </Link>
                  <Link href="/about/LifeTimeMembers" className="block" onClick={closeMobileMenu}>
                    <Button variant="ghost" className="w-full justify-start text-[#8B4513] hover:bg-[#CD853F] transition-all duration-200 text-sm">
                      Life-time Members
                    </Button>
                  </Link>
                  <Link href="/about/DeceasedMembers" className="block" onClick={closeMobileMenu}>
                    <Button variant="ghost" className="w-full justify-start text-[#8B4513] hover:bg-[#CD853F] transition-all duration-200 text-sm">
                      Deceased Members
                    </Button>
                  </Link>
                  <Link href="/about/BuildingCommittee" className="block" onClick={closeMobileMenu}>
                    <Button variant="ghost" className="w-full justify-start text-[#8B4513] hover:bg-[#CD853F] transition-all duration-200 text-sm">
                      Building Committee
                    </Button>
                  </Link>
                  <Link href="/membership" className="block" onClick={closeMobileMenu}>
                    <Button variant="ghost" className="w-full justify-start text-[#8B4513] hover:bg-[#CD853F] transition-all duration-200 text-sm font-semibold">
                       Become a Member
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Mobile Announcements Section */}
              <div className="space-y-1">
                <div className="text-[#8B4513] font-semibold px-3 py-2 text-sm">Announcements</div>
                <div className="pl-4 space-y-1">
                  <Link href="/announcements" className="block" onClick={closeMobileMenu}>
                    <Button variant="ghost" className="w-full justify-start text-[#8B4513] hover:bg-[#CD853F] transition-all duration-200 text-sm">
                      Announcements
                    </Button>
                  </Link>
                  <Link href="/events" className="block" onClick={closeMobileMenu}>
                    <Button variant="ghost" className="w-full justify-start text-[#8B4513] hover:bg-[#CD853F] transition-all duration-200 text-sm">
                      Events
                    </Button>
                  </Link>
                </div>
              </div>

              <Link href="/donors" className="block" onClick={closeMobileMenu}>
                <Button variant="ghost" className="w-full justify-start text-[#8B4513] hover:bg-[#CD853F] transition-all duration-200">
                  Donors
                </Button>
              </Link>
              
              <Link href="/contactus" className="block" onClick={closeMobileMenu}>
                <Button variant="ghost" className="w-full justify-start text-[#8B4513] hover:bg-[#CD853F] transition-all duration-200">
                  Contact Us
                </Button>
              </Link>

              {/* Mobile Right Side Items */}
              <div className="border-t-2 border-[#CD853F] pt-2 space-y-2">
                <div className="space-y-1">
                  <div className="text-[#8B4513] font-semibold px-3 py-2 text-sm">Language</div>
                  <div className="pl-4">
                    <Button variant="outline" className="w-full bg-[#FFF8DC] text-[#8B4513] border-2 border-[#CD853F] hover:bg-[#FFE4B5] hover:text-[#ECCEA9] transition-all duration-200">
                      <Globe className="h-4 w-4 mr-2" />Select Language
                    </Button>
                  </div>
                </div>

                <Link href="/donate" className="block" onClick={closeMobileMenu}>
                  <Button variant="outline" className="w-full bg-[#FFF8DC] text-[#8B4513] border-2 border-[#CD853F] hover:bg-[#FFE4B5] hover:text-[#ECCEA9] transition-all duration-200">
                    <Heart className="h-4 w-4 mr-2" />Donate
                  </Button>
                </Link>

                {!loading && (
                  <>
                    {user ? (
                      <Button 
                        onClick={handleDashboardClick}
                        className="w-full bg-[#8B4513] hover:bg-[#5D2F09] text-white transition-all duration-200 hover:shadow-lg"
                      >
                        <User className="mr-2 h-4 w-4" />Dashboard
                      </Button>
                    ) : (
                      <Link href="/login/user" className="block" onClick={closeMobileMenu}>
                        <Button variant="outline" className="w-full bg-[#FFF8DC] text-[#8B4513] border-2 border-[#CD853F] hover:bg-[#FFE4B5] hover:text-[#ECCEA9] transition-all duration-200">
                          <User className="mr-2 h-4 w-4" />Login
                        </Button>
                      </Link>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}