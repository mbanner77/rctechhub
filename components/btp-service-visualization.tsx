"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { btpServices } from "@/data/btp-services"
import type { BTPService, BTPServiceCategory } from "@/types/btp-service"
import { PieChart, BarChart2, Network } from "lucide-react"
import * as d3 from "d3"

interface BTPServiceVisualizationProps {
  onSelectService: (service: BTPService) => void
}

export default function BTPServiceVisualization({ onSelectService }: BTPServiceVisualizationProps) {
  const [visualizationType, setVisualizationType] = useState<"category" | "network" | "bubble">("category")
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Zähle Services pro Kategorie
  const categoryCount = btpServices.reduce(
    (acc, service) => {
      acc[service.category] = (acc[service.category] || 0) + 1
      return acc
    },
    {} as Record<BTPServiceCategory, number>,
  )

  // Erstelle Daten für die Visualisierung
  const categoryData = Object.entries(categoryCount).map(([category, count]) => ({
    category,
    count,
    color: getCategoryColor(category as BTPServiceCategory),
  }))

  // Funktion zum Generieren von Farben basierend auf der Kategorie
  function getCategoryColor(category: BTPServiceCategory): string {
    const colorMap: Record<BTPServiceCategory, string> = {
      Integration: "#3182CE", // Blau
      Extension: "#38A169", // Grün
      "Data & Analytics": "#805AD5", // Lila
      Database: "#DD6B20", // Orange
      "Application Development": "#D53F8C", // Pink
      "Intelligent Technologies": "#2B6CB0", // Dunkelblau
      Mobile: "#ED8936", // Hellorange
      Security: "#E53E3E", // Rot
      DevOps: "#4299E1", // Hellblau
      Governance: "#718096", // Grau
      "Industry Cloud": "#6B46C1", // Dunkellila
    }

    return colorMap[category] || "#718096" // Grau als Fallback
  }

  // Erstelle die Visualisierung
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return

    // Lösche vorherige Visualisierung
    d3.select(svgRef.current).selectAll("*").remove()

    const containerWidth = containerRef.current.clientWidth
    const containerHeight = 400

    const svg = d3
      .select(svgRef.current)
      .attr("width", containerWidth)
      .attr("height", containerHeight)
      .attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`)

    if (visualizationType === "category") {
      // Erstelle ein Balkendiagramm
      const margin = { top: 20, right: 20, bottom: 60, left: 60 }
      const width = containerWidth - margin.left - margin.right
      const height = containerHeight - margin.top - margin.bottom

      const x = d3
        .scaleBand()
        .domain(categoryData.map((d) => d.category))
        .range([0, width])
        .padding(0.2)

      const y = d3
        .scaleLinear()
        .domain([0, d3.max(categoryData, (d) => d.count) || 0])
        .nice()
        .range([height, 0])

      const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`)

      // X-Achse
      g.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")

      // Y-Achse
      g.append("g").call(d3.axisLeft(y).ticks(5))

      // Balken
      g.selectAll(".bar")
        .data(categoryData)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", (d) => x(d.category) || 0)
        .attr("y", (d) => y(d.count))
        .attr("width", x.bandwidth())
        .attr("height", (d) => height - y(d.count))
        .attr("fill", (d) => d.color)
        .attr("rx", 4)
        .attr("ry", 4)
        .style("cursor", "pointer")
        .on("click", (event, d) => {
          const servicesInCategory = btpServices.filter((service) => service.category === d.category)
          if (servicesInCategory.length > 0) {
            onSelectService(servicesInCategory[0])
          }
        })
        .append("title")
        .text((d) => `${d.category}: ${d.count} Services`)

      // Beschriftungen
      g.selectAll(".label")
        .data(categoryData)
        .enter()
        .append("text")
        .attr("class", "label")
        .attr("x", (d) => (x(d.category) || 0) + x.bandwidth() / 2)
        .attr("y", (d) => y(d.count) - 5)
        .attr("text-anchor", "middle")
        .text((d) => d.count)
        .style("fill", "#333")
        .style("font-size", "12px")
        .style("font-weight", "bold")
    } else if (visualizationType === "network") {
      // Erstelle ein Netzwerkdiagramm
      const nodes = btpServices.map((service) => ({
        id: service.id,
        name: service.name,
        category: service.category,
        radius: 10,
        color: getCategoryColor(service.category),
        service,
      }))

      // Erstelle Links basierend auf verwandten Services
      const links: { source: string; target: string }[] = []
      btpServices.forEach((service) => {
        if (service.relatedServices) {
          service.relatedServices.forEach((relatedId) => {
            if (btpServices.some((s) => s.id === relatedId)) {
              links.push({
                source: service.id,
                target: relatedId,
              })
            }
          })
        }
      })

      const simulation = d3
        .forceSimulation(nodes as any)
        .force(
          "link",
          d3
            .forceLink(links)
            .id((d: any) => d.id)
            .distance(100),
        )
        .force("charge", d3.forceManyBody().strength(-200))
        .force("center", d3.forceCenter(containerWidth / 2, containerHeight / 2))
        .force(
          "collision",
          d3.forceCollide().radius((d: any) => d.radius + 10),
        )

      const link = svg
        .append("g")
        .selectAll("line")
        .data(links)
        .enter()
        .append("line")
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.6)
        .attr("stroke-width", 1)

      const node = svg
        .append("g")
        .selectAll("circle")
        .data(nodes)
        .enter()
        .append("circle")
        .attr("r", (d: any) => d.radius)
        .attr("fill", (d: any) => d.color)
        .style("cursor", "pointer")
        .on("click", (event, d: any) => {
          onSelectService(d.service)
        })
        .call(
          d3
            .drag()
            .on("start", (event, d: any) => {
              if (!event.active) simulation.alphaTarget(0.3).restart()
              d.fx = d.x
              d.fy = d.y
            })
            .on("drag", (event, d: any) => {
              d.fx = event.x
              d.fy = event.y
            })
            .on("end", (event, d: any) => {
              if (!event.active) simulation.alphaTarget(0)
              d.fx = null
              d.fy = null
            }) as any,
        )

      node.append("title").text((d: any) => d.name)

      simulation.on("tick", () => {
        link
          .attr("x1", (d: any) => d.source.x)
          .attr("y1", (d: any) => d.source.y)
          .attr("x2", (d: any) => d.target.x)
          .attr("y2", (d: any) => d.target.y)

        node.attr("cx", (d: any) => d.x).attr("cy", (d: any) => d.y)
      })
    } else if (visualizationType === "bubble") {
      // Erstelle ein Bubble Chart
      const data = btpServices.map((service) => ({
        name: service.name,
        value: service.features.length + (service.useCases?.length || 0),
        category: service.category,
        color: getCategoryColor(service.category),
        service,
      }))

      const pack = d3
        .pack()
        .size([containerWidth - 20, containerHeight - 20])
        .padding(3)

      const root = d3.hierarchy({ children: data }).sum((d) => (d as any).value)

      const nodes = pack(root).leaves()

      const bubbles = svg
        .selectAll(".bubble")
        .data(nodes)
        .enter()
        .append("circle")
        .attr("class", "bubble")
        .attr("cx", (d) => d.x + 10)
        .attr("cy", (d) => d.y + 10)
        .attr("r", (d) => d.r)
        .attr("fill", (d) => (d.data as any).color)
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5)
        .style("cursor", "pointer")
        .on("click", (event, d) => {
          onSelectService((d.data as any).service)
        })

      bubbles.append("title").text((d) => (d.data as any).name)

      // Füge Text für größere Bubbles hinzu
      svg
        .selectAll(".label")
        .data(nodes.filter((d) => d.r > 25))
        .enter()
        .append("text")
        .attr("class", "label")
        .attr("x", (d) => d.x + 10)
        .attr("y", (d) => d.y + 10)
        .attr("text-anchor", "middle")
        .attr("dy", ".3em")
        .text((d) => {
          const name = (d.data as any).name
          return name.length > 10 ? name.substring(0, 10) + "..." : name
        })
        .style("font-size", "10px")
        .style("fill", "#fff")
        .style("pointer-events", "none")
    }
  }, [visualizationType, containerRef.current?.clientWidth])

  // Aktualisiere die Visualisierung bei Größenänderungen
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth
        if (svgRef.current) {
          svgRef.current.setAttribute("width", containerWidth.toString())
          svgRef.current.setAttribute("viewBox", `0 0 ${containerWidth} 400`)
        }
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">BTP Services Übersicht</h3>
            <div className="flex space-x-2">
              <Button
                variant={visualizationType === "category" ? "default" : "outline"}
                size="sm"
                onClick={() => setVisualizationType("category")}
                className="flex items-center gap-1"
              >
                <BarChart2 className="h-4 w-4" />
                <span className="hidden sm:inline">Kategorien</span>
              </Button>
              <Button
                variant={visualizationType === "network" ? "default" : "outline"}
                size="sm"
                onClick={() => setVisualizationType("network")}
                className="flex items-center gap-1"
              >
                <Network className="h-4 w-4" />
                <span className="hidden sm:inline">Netzwerk</span>
              </Button>
              <Button
                variant={visualizationType === "bubble" ? "default" : "outline"}
                size="sm"
                onClick={() => setVisualizationType("bubble")}
                className="flex items-center gap-1"
              >
                <PieChart className="h-4 w-4" />
                <span className="hidden sm:inline">Bubble</span>
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {Array.from(new Set(btpServices.map((service) => service.category))).map((category) => (
              <Badge
                key={category}
                style={{ backgroundColor: getCategoryColor(category), color: "white" }}
                className="cursor-pointer"
                onClick={() => {
                  const servicesInCategory = btpServices.filter((service) => service.category === category)
                  if (servicesInCategory.length > 0) {
                    onSelectService(servicesInCategory[0])
                  }
                }}
              >
                {category}
              </Badge>
            ))}
          </div>

          <div ref={containerRef} className="w-full h-[400px] overflow-hidden">
            <svg ref={svgRef} className="w-full h-full"></svg>
          </div>

          <div className="text-sm text-gray-500 text-center">
            Klicken Sie auf einen Bereich, um Services in dieser Kategorie anzuzeigen
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
