"use client"

import Link from "next/link"
import { ImageWithFallback } from "@/components/ui/image-with-fallback"
import { usePathname } from "next/navigation"
import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from "lucide-react"

export function EnhancedFooter() {
  const currentYear = new Date().getFullYear()
  const pathname = usePathname()
  
  // Create contact link that preserves the current path
  const contactLink = pathname === "/landing" ? "/landing#contact" : "/home#contact"

  return (
    <footer className="bg-gray-100 text-gray-700 pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Unternehmen */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Über RealCore</h3>
            <div className="mb-4">
              <ImageWithFallback
                src="/images/rc-logo.png"
                fallbackSrc="/images/rc-logo.png"
                alt="RealCore Logo"
                width={120}
                height={30}
                className="h-8 w-auto bg-white p-1 rounded"
              />
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Ihr SAP Full-Stack Technologiepartner mit Expertise in SAP, Open Source und Microsoft-Technologien.
            </p>
            <div className="flex space-x-3">
              <a href="https://linkedin.com/company/realcore-group-gmbh" className="text-gray-400 hover:text-gray-600 transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="https://www.facebook.com/RealCoreGroup" className="text-gray-400 hover:text-gray-600 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="https://instagram.com/realcoregroupgmbh/" className="text-gray-400 hover:text-gray-600 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Schnelllinks */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Schnelllinks</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/home" className="text-gray-400 hover:text-gray-600 transition-colors">
                  Lösungsbaukasten
                </Link>
              </li>
              <li>
                <Link href="/home?packageType=starter-package#services" className="text-gray-400 hover:text-gray-600 transition-colors">
                  Starter Packages
                </Link>
              </li>
              <li>
                <Link href="/unsere-experten" className="text-gray-400 hover:text-gray-600 transition-colors">
                  Unsere Experten
                </Link>
              </li>
              {/* <li>
                <Link href="/home#assessment" className="text-gray-400 hover:text-gray-600 transition-colors">
                  Standortbestimmung
                </Link>
              </li> */}
              {/* <li>
                <Link href="/home#workshops" className="text-gray-400 hover:text-gray-600 transition-colors">
                  Workshops
                </Link>
              </li> */}
              {/* <li>
                <Link href="/btp-services" className="text-gray-400 hover:text-gray-600 transition-colors">
                  BTP Services
                </Link>
              </li> */}
              {/* <li>
                <Link href="/templates" className="text-gray-400 hover:text-gray-600 transition-colors">
                  Templates
                </Link>
              </li> */}
              <li>
                <Link href={contactLink} className="text-gray-400 hover:text-gray-600 transition-colors">
                  Kontakt
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          {/* <div>
            <h3 className="text-lg font-semibold mb-4">Unsere Services</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/btp-services" className="text-gray-400 hover:text-gray-600 transition-colors">
                  SAP BTP Services
                </Link>
              </li>
              <li>
                <Link href="/home?service=SAP S/4HANA#services" className="text-gray-400 hover:text-gray-600 transition-colors">
                  SAP S/4HANA
                </Link>
              </li>
              <li>
                <Link href="/home?service=Cloud Integration#services" className="text-gray-400 hover:text-gray-600 transition-colors">
                  Cloud Integration
                </Link>
              </li>
              <li>
                <Link href="/home?service=Fiori Development#services" className="text-gray-400 hover:text-gray-600 transition-colors">
                  Fiori Development
                </Link>
              </li>
              <li>
                <Link href="/home?service=CAP Development#services" className="text-gray-400 hover:text-gray-600 transition-colors">
                  CAP Development
                </Link>
              </li>
              <li>
                <Link href="/home?service=DevOps & CI/CD#services" className="text-gray-400 hover:text-gray-600 transition-colors">
                  DevOps & CI/CD
                </Link>
              </li>
            </ul>
          </div> */}

          {/* Kontakt */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Kontakt</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-400">Im Welterbe 2, 45141 Essen</span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" />
                <a href="tel:+49 201 48639980" className="text-gray-400 hover:text-gray-600 transition-colors">
                  +49 201 48639980
                </a>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" />
                <a href="mailto:techhub@realcore.de" className="text-gray-400 hover:text-gray-600 transition-colors">
                  techhub@realcore.de
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-200 text-center md:flex md:justify-between md:items-center">
          <div className="text-xs sm:text-sm text-gray-400 mb-4 md:mb-0">
            © {currentYear} RealCore. Alle Rechte vorbehalten.
          </div>
          <div className="flex justify-center space-x-4 text-xs sm:text-sm text-gray-400">
            <Link href="https://www.realcore.de/de/datenschutzerklaerung" target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors">
              Datenschutz
            </Link>
            <Link href="https://www.realcore.de/de/impressum" target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors">
              Impressum
            </Link>
            <Link href="https://a.storyblok.com/f/320610/x/01d5285c1f/2025_07-agb-s-realcore.pdf" target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors">
              AGB
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
