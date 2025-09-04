"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Menu, X, Sun, Moon } from "lucide-react"
import { useTheme } from "next-themes"
import RealCoreLogo from "@/components/realcore-logo"

export function StickyHeader() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()

  const isLandingPage = pathname === "/landing" || pathname === "/" || pathname.startsWith("/pathfinder/")
  const isHomePage = pathname === "/home"

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white text-black shadow-md py-1.5" : isLandingPage || isHomePage ? "text-white bg-transparent py-3" : "text-black bg-transparent py-3"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <Link href="/landing" className="flex items-center">
            <RealCoreLogo className="w-1/3" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link href="/home">
              <Button
                variant="ghost"
                className={`${isScrolled ? "text-gray-700 hover:text-gray-900" : isLandingPage || isHomePage ? "text-white" : "text-black"}`}
              >
                Lösungsbaukasten
              </Button>
            </Link>
            {/* <Link href="/btp-services">
              <Button
                variant="ghost"
                className={`${isScrolled ? "text-gray-700 hover:text-gray-900" : "text-white hover:text-gray-200"}`}
              >
                BTP Services
              </Button>
            </Link> */}
            {/* <Link href="/architecture-templates">
              <Button
                variant="ghost"
                className={`${isScrolled ? "text-gray-700 hover:text-gray-900" : "text-white hover:text-gray-200"}`}
              >
                Architektur
              </Button>
            </Link> */}
            {/* <Link href="/templates">
              <Button
                variant="ghost"
                className={`${isScrolled ? "text-gray-700 hover:text-gray-900" : "text-white hover:text-gray-200"}`}
              >
                Templates
              </Button>
            </Link> */}
            <Link href="/home?packageType=starter-package#services" passHref>
              <Button
                variant="ghost"
                className={`${isScrolled ? "text-gray-700 hover:text-gray-900" : isLandingPage || isHomePage ? "text-white" : "text-black"}`}
              >
                Starter Packages
              </Button>
            </Link>
            <Link href="/pathfinder">
              <Button
                variant="ghost"
                className={`${isScrolled ? "text-gray-700 hover:text-gray-900" : isLandingPage || isHomePage ? "text-white" : "text-black"}`}
              >
                Pathfinder
              </Button>
            </Link>
            <Link href="/home?tab=schulungen#templates">
              <Button
                variant="ghost"
                className={`${isScrolled ? "text-gray-700 hover:text-gray-900" : isLandingPage || isHomePage ? "text-white" : "text-black"}`}
              >
                Trainingskatalog
              </Button>
            </Link>
            {/*<Link href="/unsere-experten">
              <Button
                variant="ghost"
                className={`${isScrolled ? "text-gray-700 hover:text-gray-900" : isLandingPage || isHomePage ? "text-white" : "text-black"}`}
              >
                Unsere Experten
              </Button>
            </Link>*/}
            {/* <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className={`${isScrolled ? "text-gray-700 hover:text-gray-900" : "text-white hover:text-gray-200"}`}
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button> */}
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`${isScrolled ? "text-gray-700 hover:text-gray-900" : isLandingPage || isHomePage ? "text-white" : "text-black"}`}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="bg-white shadow-md py-2 md:hidden mt-3 pb-3 max-h-[80vh] overflow-y-auto">
            <nav className="flex flex-col space-y-2">
              <Link href="/home">
                <Button variant="ghost" className="w-full justify-start text-black" onClick={() => setMobileMenuOpen(false)}>
                  Home
                </Button>
              </Link>
              {/* <Link href="/btp-services">
                <Button variant="ghost" className="w-full justify-start" onClick={() => setMobileMenuOpen(false)}>
                  BTP Services
                </Button>
              </Link> */}
              {/* <Link href="/architecture-templates">
                <Button variant="ghost" className="w-full justify-start" onClick={() => setMobileMenuOpen(false)}>
                  Architektur
                </Button>
              </Link> */}
              {/* <Link href="/templates">
                <Button variant="ghost" className="w-full justify-start" onClick={() => setMobileMenuOpen(false)}>
                  Templates
                </Button>
              </Link> */}
              <Link href="/home?packageType=starter-package#packageType">
                <Button variant="ghost" className="w-full justify-start text-black" onClick={() => setMobileMenuOpen(false)}>
                  Starter Packages
                </Button>
              </Link>
              {/* <Link href="/pathfinder">
                <Button variant="ghost" className="w-full justify-start" onClick={() => setMobileMenuOpen(false)}>
                  Pathfinder
                </Button>
              </Link> */}
              <Link href="/unsere-experten">
                <Button variant="ghost" className="w-full justify-start text-black" onClick={() => setMobileMenuOpen(false)}>
                  Unsere Experten
                </Button>
              </Link>
              <Link href="/home?tab=schulungen#templates">
                <Button variant="ghost" className="w-full justify-start text-black" onClick={() => setMobileMenuOpen(false)}>
                  Trainingskatalog
                </Button>
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
