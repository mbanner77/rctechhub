"use client";

import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  Mail,
  Settings,
  FileText,
  Package,
  MessageSquare,
  UserCog,
  BookOpen,
  Library,
  Briefcase,
  LayoutDashboard,
  Database,
} from "lucide-react";

// Metadata is moved to layout.tsx since this is a client component

export default function AdminPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <Image src="https://realcore.info/bilder/rc-logo.png" alt="Realcore Logo" width={180} height={36} priority />
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        </div>
        <Button 
          variant="outline" 
          onClick={() => {
            fetch('/api/auth/logout', { method: 'POST' })
              .then(() => window.location.href = '/admin/login')
              .catch(err => console.error('Logout error:', err))
          }}
        >
          <Users className="mr-2 h-4 w-4" />
          Abmelden
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Inhalte verwalten */}
        <Card>
          <CardHeader>
            <CardTitle>Inhalte verwalten</CardTitle>
            <CardDescription>Verwalte die Inhalte des Portals</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Link href="/admin/services">
                <Button className="w-full" variant="outline">
                  <Package className="mr-2 h-4 w-4" />
                  Dienste verwalten
                </Button>
              </Link>
            </div>
            <div>
              <Link href="/admin/consulting-phases">
                <Button className="w-full" variant="outline">
                  <FileText className="mr-2 h-4 w-4" />
                  Beratungspakete pflegen
                </Button>
              </Link>
            </div>
            <div>
              <Link href="/admin/experts/view">
                <Button className="w-full" variant="outline">
                  <Users className="mr-2 h-4 w-4" />
                  Experten anzeigen
                </Button>
              </Link>
            </div>
            <div>
              <Link href="/admin/experts/manage">
                <Button className="w-full" variant="outline">
                  <UserCog className="mr-2 h-4 w-4" />
                  Experten verwalten
                </Button>
              </Link>
            </div>
            <div>
              <Link href="/admin/unit-cards">
                <Button className="w-full" variant="outline">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Unit Cards verwalten
                </Button>
              </Link>
            </div>
            <div>
              <Link href="/admin/landing-page">
                <Button className="w-full" variant="outline">
                  <Settings className="mr-2 h-4 w-4" />
                  Landing Page
                </Button>
              </Link>
            </div>
            <div>
              <Link href="/admin/knowledge-hub">
                <Button className="w-full" variant="outline">
                  <Library className="mr-2 h-4 w-4" />
                  Knowledge Hub
                </Button>
              </Link>
            </div>
            <div>
              <Link href="/admin/case-studies">
                <Button className="w-full" variant="outline">
                  <Briefcase className="mr-2 h-4 w-4" />
                  Fallstudien
                </Button>
              </Link>
            </div>
            <div>
              <Link href="/admin/tags">
                <Button className="w-full" variant="outline">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Technologie-Tags
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
        
        {/* Daten & Einstellungen */}
        <Card>
          <CardHeader>
            <CardTitle>Daten & Einstellungen</CardTitle>
            <CardDescription>
              Verwalte Dienste und Einstellungen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Link href="/admin/mail-config">
                <Button className="w-full" variant="outline">
                  <Mail className="mr-2 h-4 w-4" />
                  E-Mail-Einstellungen
                </Button>
              </Link>
            </div>
            <div>
              <Link href="/admin/analytics">
                <Button className="w-full" variant="outline">
                  <Settings className="mr-2 h-4 w-4" />
                  Besucheranalysen
                </Button>
              </Link>
            </div>
            <div>
              <Link href="/admin/postgres">
                <Button className="w-full" variant="outline">
                  <Database className="mr-2 h-4 w-4" />
                  PostgreSQL Verwaltung
                </Button>
              </Link>
            </div>
            <div>
              <Link href="/admin/flexlicense">
                <Button className="w-full" variant="outline">
                  <Settings className="mr-2 h-4 w-4" />
                  FlexLicence pflegen
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
