"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star, ThumbsUp, ThumbsDown, MessageSquare } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import type { BTPService } from "@/types/btp-service"

interface BTPServiceRatingProps {
  service: BTPService
}

export default function BTPServiceRating({ service }: BTPServiceRatingProps) {
  // Ensure service is defined before accessing its properties
  if (!service) {
    return null
  }

  const [userRating, setUserRating] = useState<number | null>(null)
  const [feedback, setFeedback] = useState<"positive" | "negative" | null>(null)

  // Mock-Daten für Bewertungen
  const ratings = {
    average: 4.2,
    total: 128,
    distribution: [
      { stars: 5, count: 76, percentage: 59 },
      { stars: 4, count: 32, percentage: 25 },
      { stars: 3, count: 12, percentage: 9 },
      { stars: 2, count: 5, percentage: 4 },
      { stars: 1, count: 3, percentage: 3 },
    ],
  }

  const handleRating = (stars: number) => {
    setUserRating(stars)
  }

  const handleFeedback = (type: "positive" | "negative") => {
    setFeedback(type)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Star className="mr-2 h-5 w-5 text-yellow-500" />
          Bewertungen & Feedback
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <div className="text-center mb-4">
              <div className="text-4xl font-bold">{ratings.average}</div>
              <div className="flex justify-center mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${
                      star <= Math.round(ratings.average) ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <div className="text-sm text-gray-500 mt-1">{ratings.total} Bewertungen</div>
            </div>

            <div className="space-y-2">
              {ratings.distribution.map((item) => (
                <div key={item.stars} className="flex items-center gap-2">
                  <div className="w-12 text-sm">{item.stars} Sterne</div>
                  <Progress value={item.percentage} className="h-2 flex-1" />
                  <div className="w-12 text-sm text-right">{item.percentage}%</div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 border-t md:border-t-0 md:border-l border-gray-200 pt-4 md:pt-0 md:pl-6">
            <h4 className="font-medium mb-3">Ihre Bewertung</h4>
            {userRating === null ? (
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Button
                    key={star}
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleRating(star)}
                  >
                    <Star className="h-4 w-4" />
                  </Button>
                ))}
              </div>
            ) : (
              <div className="mb-4">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-5 w-5 ${star <= userRating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-1">Vielen Dank für Ihre Bewertung!</p>
              </div>
            )}

            <h4 className="font-medium mb-3">War dieser Service hilfreich?</h4>
            <div className="flex gap-2 mb-4">
              <Button
                variant={feedback === "positive" ? "default" : "outline"}
                size="sm"
                onClick={() => handleFeedback("positive")}
                className="flex items-center"
              >
                <ThumbsUp className="mr-1 h-4 w-4" />
                Ja
              </Button>
              <Button
                variant={feedback === "negative" ? "default" : "outline"}
                size="sm"
                onClick={() => handleFeedback("negative")}
                className="flex items-center"
              >
                <ThumbsDown className="mr-1 h-4 w-4" />
                Nein
              </Button>
            </div>

            <Button variant="outline" size="sm" className="w-full">
              <MessageSquare className="mr-2 h-4 w-4" />
              Feedback senden
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
