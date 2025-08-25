import type React from "react"

interface BTPService {
  id: string
  name: string
  description: string
  pricing: string
  freeTier: boolean
  regions: string[]
  // Add more properties as needed
}

interface BTPServiceComparisonProps {
  services: BTPService[]
  selectedServices: string[]
}

const BTPServiceComparison: React.FC<BTPServiceComparisonProps> = ({ services, selectedServices }) => {
  const renderComparisonRow = (label: string, accessor: (service: BTPService) => any) => {
    return (
      <tr className="border-b">
        <td className="py-3 px-4 font-medium">{label}</td>
        {selectedServices.map((serviceId) => {
          const service = services.find((s) => s.id === serviceId)
          if (!service)
            return (
              <td key={`empty-${serviceId}`} className="py-3 px-4">
                -
              </td>
            )

          const value = accessor(service)
          return (
            <td key={serviceId} className="py-3 px-4">
              {value !== undefined && value !== null ? (typeof value === "boolean" ? (value ? "✓" : "✗") : value) : "-"}
            </td>
          )
        })}
      </tr>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full table-auto">
        <thead>
          <tr>
            <th className="py-3 px-4 font-bold text-left">Feature</th>
            {selectedServices.map((serviceId) => {
              const service = services.find((s) => s.id === serviceId)
              return service ? (
                <th key={serviceId} className="py-3 px-4 font-bold text-left">
                  {service.name}
                </th>
              ) : (
                <th key={`header-empty-${serviceId}`} className="py-3 px-4 font-bold text-left">
                  Service Not Found
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {renderComparisonRow("Description", (service) => service.description)}
          {renderComparisonRow("Pricing", (service) => service.pricing)}
          {renderComparisonRow("Free Tier", (service) => service.freeTier)}
          {renderComparisonRow("Regions", (service) => service.regions?.join(", ") || "-")}
          {/* Add more comparison rows here */}
        </tbody>
      </table>
    </div>
  )
}

export default BTPServiceComparison
