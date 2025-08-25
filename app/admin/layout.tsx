import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard | RealCore BTP Portal",
  description: "Administration des RealCore BTP Portals",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      {children}
    </div>
  );
}
