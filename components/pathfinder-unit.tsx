"use client";

import { useState } from "react";
import Link from "next/link";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { ChevronRight } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { analytics } from "@/lib/analytics";

export const PathfinderUnit = ({ unit }: { unit: any }) => {
  const [hovered, setHovered] = useState(false);

  const handleClick = () => {
    analytics.serviceClick(unit.title, 'pathfinder-unit');
  };

  return (
    <Link
      href={`/pathfinder/${unit.id}`}
      key={unit.id}
      className="block h-full"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleClick}
    >
      <Card
        className={`overflow-hidden h-full min-h-[500px] transition-all duration-300 ${
          hovered ? "shadow-xl transform -translate-y-1" : "shadow-md"
        }`}
      >
        <div className={`h-2 bg-gradient-to-r ${unit.gradient}`}></div>
        <CardContent
          className="p-6 flex flex-col"
          style={{ height: "calc(100% - 0.5rem)" }}
        >
          <div className="flex items-center mb-4">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 bg-gradient-to-br ${unit.gradient}`}
            >
              <ImageWithFallback
                src={unit.iconImage}
                fallbackSrc={`/placeholder.svg?height=24&width=24&query=${unit.icon}`}
                alt={unit.title}
                width={24}
                height={24}
                className="text-white"
              />
            </div>
            <h3 className="text-xl font-bold">{unit.title}</h3>
          </div>
          <p className="text-gray-600 mb-4">{unit.subtitle}</p>
          <div className="relative h-48 mb-4 rounded-lg overflow-hidden">
            <ImageWithFallback
              src={unit.image}
              fallbackSrc={`/placeholder.svg?height=300&width=500&query=${unit.title}+digital+transformation`}
              alt={unit.title}
              fill
              className="object-cover transition-transform duration-500 ease-in-out hover:scale-105"
            />
          </div>
          <p className="text-gray-600 mb-4 flex-grow">{unit.description}</p>{" "}
          <Button
            variant="link"
            className={`p-0 h-auto transition-colors duration-300 mt-auto self-start ${
              hovered ? "text-green-600" : "text-gray-600"
            }`}
          >
            Mehr erfahren
            <ChevronRight
              className={`ml-1 h-4 w-4 transition-transform duration-300 ${
                hovered ? "transform translate-x-1" : ""
              }`}
            />
          </Button>
        </CardContent>
      </Card>
    </Link>
  );
};
