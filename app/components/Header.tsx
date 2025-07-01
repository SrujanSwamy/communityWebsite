import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LanguageSwitcher } from "./LanguageSwitcher"

export default function Header() {
  return (
    <header className="bg-home-secondary text-white py-6 px-4 border-b-4 border-black">
      <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-[#FFF3E0] rounded-full mr-3"></div>
          <Link href="/" className="text-3xl font-bold">
            Mangalore Hindu Community
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <LanguageSwitcher />
          <Link href="/login/user">
            <Button
              variant="outline"
              className="bg-[#FFF3E0] text-[#B22222] border-2 border-[#B22222] hover:bg-[#FFE0B2] hover:text-[#8B0000]"
            >
              Login
            </Button>
          </Link>
          <Link href="/login/admin">
            <Button
              variant="outline"
              className="bg-[#FFF3E0] text-[#B22222] border-2 border-[#B22222] hover:bg-[#FFE0B2] hover:text-[#8B0000]"
            >
              Admin Login
            </Button>
          </Link>
          <Link href="/donate">
            <Button
              variant="outline"
              className="bg-[#FFF3E0] text-[#B22222] border-2 border-[#B22222] hover:bg-[#FFE0B2] hover:text-[#8B0000]"
            >
              Donate
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}

