import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Header() {
  return (
    <header className="bg-gradient-to-r from-[#FE6B35] to-[#E75A4F] text-white py-6 px-4 border-b-4 border-black shadow-lg">
      <div className="container mx-auto">
        {/* Main Header Container - Custom Layout: 15% - 70% - 15% */}
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          
          {/* Left Side - Logo (15% width on desktop) */}
          <div className="hidden lg:flex justify-center" style={{width: '15%'}}>
            <div className="rounded-full overflow-hidden flex-shrink-0 bg-[#FFF8DC] border-3 border-white w-20 h-20 lg:w-24 lg:h-24 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <img 
                src="/logo.jpg" 
                alt="D.K. District Marathi Samaja Logo" 
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" 
              />
            </div>
          </div>

          {/* Center - Club Name (70% width on desktop) */}
          <div className="flex flex-col items-center text-center lg:w-[70%]">
            {/* Mobile Logo - Only visible on mobile */}
            <div className="lg:hidden mb-3">
              <div className="rounded-full overflow-hidden bg-[#FFF8DC] border-3 border-white shadow-lg w-16 h-16 xs:w-20 xs:h-20 sm:w-24 sm:h-24 md:w-28 md:h-28">
                <img 
                  src="/logo.jpg" 
                  alt="D.K. District Marathi Samaja Logo" 
                  className="w-full h-full object-cover" 
                />
              </div>
            </div>
            
            {/* Club Name */}
            <Link href="/" className="font-bold leading-tight hover:text-[#FFF8DC] transition-all duration-300 hover:drop-shadow-lg">
              <h2 style={{fontSize: 'clamp(1.125rem, 4vw, 1.565rem)'}} className="drop-shadow-md">
                D.K. DISTRICT MARATI SAMAJA SEVA SANGHA ® MANGALORE
              </h2>
              <p style={{fontSize: 'clamp(0.75rem, 2vw, 1rem)'}} className="font-medium mt-1 text-[#FFF8DC]">
                AND
              </p>
              <h2 style={{fontSize: 'clamp(1.125rem, 4vw, 1.565rem)'}} className="drop-shadow-md">
                MARATI MAHILA VEDIKE, MANGALORE
              </h2>
            </Link>
          </div>

          {/* Right Side - Additional Logo (15% width on desktop) */}
          <div className="hidden lg:flex justify-center items-center" style={{width: '15%'}}>
            {/* Additional logo or emblem */}
            <div className="rounded-full overflow-hidden bg-[#FFF8DC] border-3 border-white w-20 h-20 lg:w-24 lg:h-24 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <img 
                src="/mahammaaye.jpg" 
                alt="Marathi Cultural Emblem" 
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" 
              />
            </div>
          </div>
        </div>

        {/* Optional: Mobile Navigation - Only visible on small screens */}
        <div className="lg:hidden mt-4 flex justify-center space-x-4">
          {/* Reserved for future mobile navigation elements if needed */}
        </div>
      </div>
    </header>
  )
}