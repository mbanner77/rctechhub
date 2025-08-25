"use client"

import { useEffect, useRef, useState, memo, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Check, ChevronRight, Download, Mail, Share2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import ActionDialog from "./action-dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Radar } from "react-chartjs-2"
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip as ChartTooltip,
  Legend,
} from "chart.js"
import { analytics } from "@/lib/analytics"

// Register the required chart.js components
ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, ChartTooltip, Legend)

interface AssessmentDialogProps {
  isOpen: boolean
  onClose: () => void
}

const questions = [
  {
    id: "process",
    question: "Wie hoch ist der Automatisierungsgrad Ihrer Geschäftsprozesse?",
    options: [
      { value: 1, label: "Hauptsächlich manuelle Prozesse" },
      { value: 2, label: "Teilweise automatisierte Prozesse" },
      { value: 3, label: "Mehrheitlich automatisierte Prozesse" },
      { value: 4, label: "Hochgradig automatisierte Prozesse" },
      { value: 5, label: "Vollständig automatisierte und selbstoptimierende Prozesse" },
    ],
  },
  {
    id: "integration",
    question: "Wie gut sind Ihre SAP- und Nicht-SAP-Systeme integriert?",
    options: [
      { value: 1, label: "Isolierte Systeme ohne Integration" },
      { value: 2, label: "Punktuelle Integration einzelner Systeme" },
      { value: 3, label: "Teilweise integrierte Systemlandschaft" },
      { value: 4, label: "Weitgehend integrierte Systemlandschaft" },
      { value: 5, label: "Vollständig integrierte Systemlandschaft" },
    ],
  },
  {
    id: "data",
    question: "Wie bewerten Sie Ihr Datenmanagement?",
    options: [
      { value: 1, label: "Daten in Silos, keine zentrale Datenhaltung" },
      { value: 2, label: "Teilweise zentralisierte Datenhaltung" },
      { value: 3, label: "Zentrale Datenhaltung, aber begrenzte Datenqualität" },
      { value: 4, label: "Hohe Datenqualität und -verfügbarkeit" },
      { value: 5, label: "Vollständig datengetriebene Organisation" },
    ],
  },
  {
    id: "innovation",
    question: "Wie schnell können Sie neue Technologien adaptieren?",
    options: [
      { value: 1, label: "Sehr langsam, hoher Widerstand gegen Veränderungen" },
      { value: 2, label: "Langsam, mit erheblichem Aufwand" },
      { value: 3, label: "Moderat, bei klarem Nutzen" },
      { value: 4, label: "Schnell, mit etablierten Prozessen" },
      { value: 5, label: "Sehr schnell, kontinuierliche Innovation" },
    ],
  },
  {
    id: "user",
    question: "Wie bewerten Sie die Benutzerfreundlichkeit Ihrer SAP-Systeme?",
    options: [
      { value: 1, label: "Veraltete Benutzeroberflächen, geringe Akzeptanz" },
      { value: 2, label: "Teilweise modernisierte Oberflächen" },
      { value: 3, label: "Moderne Oberflächen für Hauptprozesse" },
      { value: 4, label: "Durchgängig moderne, benutzerfreundliche Oberflächen" },
      { value: 5, label: "Exzellente User Experience mit hoher Personalisierung" },
    ],
  },
  {
    id: "cloud",
    question: "Wie weit ist Ihre Cloud-Strategie für SAP-Systeme fortgeschritten?",
    options: [
      { value: 1, label: "Keine Cloud-Nutzung" },
      { value: 2, label: "Erste Cloud-Pilotprojekte" },
      { value: 3, label: "Hybride Cloud-Strategie in Umsetzung" },
      { value: 4, label: "Cloud-First-Strategie" },
      { value: 5, label: "Vollständige Cloud-native Architektur" },
    ],
  },
];

const getMaturityLevel = (score: number) => {
  if (score < 1.5)
    return {
      level: 1,
      name: "Initial",
      description: "Grundlegende SAP-Systeme ohne Integration, manuelle Prozesse dominieren",
    }
  if (score < 2.5)
    return {
      level: 2,
      name: "Managed",
      description: "Standardisierte Prozesse, beginnende Systemintegration, erste Cloud-Ansätze",
    }
  if (score < 3.5)
    return {
      level: 3,
      name: "Defined",
      description: "Integrierte Systeme, teilweise automatisierte Prozesse, hybride Cloud-Nutzung",
    }
  if (score < 4.5)
    return {
      level: 4,
      name: "Quantitatively Managed",
      description: "Datengetriebene Entscheidungen, weitgehend automatisierte Prozesse, Cloud-First-Strategie",
    }
  return {
    level: 5,
    name: "Optimizing",
    description: "KI-gestützte Prozesse, vollständige Integration, innovative Cloud-native Lösungen",
  }
}

const totalSteps = 6

const getDimensionName = (questionId: string): string => {
  const dimensionMap: Record<string, string> = {
    process: "Prozessautomatisierung",
    integration: "Systemintegration",
    data: "Datenmanagement",
    innovation: "Innovationsfähigkeit",
    user: "User Experience",
    cloud: "Cloud-Nutzung"
  };
  
  return dimensionMap[questionId] || questionId;
};

// Memoized RadarChart component to prevent unnecessary re-renders
const RadarChart = memo(({ answers, chartRef }: { answers: Record<string, number>, chartRef: React.RefObject<ChartJS<'radar'> | null> }) => {
  // White background plugin for email compatibility
  const whiteBackgroundPlugin = {
    id: 'whiteBackground',
    beforeDraw: (chart: any) => {
      const ctx = chart.canvas.getContext('2d');
      ctx.save();
      ctx.globalCompositeOperation = 'destination-over';
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, chart.canvas.width, chart.canvas.height);
      ctx.restore();
    }
  };

  const data = {
    labels: questions.map((q) => getDimensionName(q.id)),
    datasets: [
      {
        label: "Ihr Ergebnis",
        data: questions.map((q) => answers[q.id] || 0),
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgb(75, 192, 192)",
        borderWidth: 2,
        pointBackgroundColor: "rgb(75, 192, 192)",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "rgb(75, 192, 192)",
      },
      {
        label: "Branchendurchschnitt",
        data: [3, 3.5, 3, 2.5, 3, 3.5],
        backgroundColor: "rgba(255, 159, 64, 0.2)",
        borderColor: "rgb(255, 159, 64)",
        borderWidth: 2,
        pointBackgroundColor: "rgb(255, 159, 64)",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "rgb(255, 159, 64)",
      },
    ],
  }

  const options = {
    scales: {
      r: {
        min: 0,
        max: 5,
        ticks: {
          stepSize: 1,
        },
      },
    },
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
      },
    },
  }

  return (
    <div className="h-[300px]">
      <Radar ref={chartRef} data={data} options={options} plugins={[whiteBackgroundPlugin]} />
    </div>
  )
}, (prevProps, nextProps) => {
  // Custom comparison function to check if answers have actually changed
  const prevAnswerKeys = Object.keys(prevProps.answers);
  const nextAnswerKeys = Object.keys(nextProps.answers);
  
  if (prevAnswerKeys.length !== nextAnswerKeys.length) {
    return false; // Re-render if different number of answers
  }
  
  // Check if any answer values have changed
  for (const key of prevAnswerKeys) {
    if (prevProps.answers[key] !== nextProps.answers[key]) {
      return false; // Re-render if any answer changed
    }
  }
  
  // Don't re-render if answers are the same
  return true;
})

// Separate memoized chart container to isolate it from email changes
const ChartContainer = memo(({ answers, chartRef }: { answers: Record<string, number>, chartRef: React.RefObject<ChartJS<'radar'> | null> }) => {
  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <RadarChart answers={answers} chartRef={chartRef} />
    </div>
  )
}, (prevProps, nextProps) => {
  // Only re-render if answers change
  const prevAnswerKeys = Object.keys(prevProps.answers);
  const nextAnswerKeys = Object.keys(nextProps.answers);
  
  if (prevAnswerKeys.length !== nextAnswerKeys.length) {
    return false;
  }
  
  for (const key of prevAnswerKeys) {
    if (prevProps.answers[key] !== nextProps.answers[key]) {
      return false;
    }
  }
  
  return true;
})

// Results component outside to prevent re-creation
const ResultsComponent = memo(({ 
  answers, 
  chartRef, 
  email, 
  onEmailChange, 
  onSendReport, 
  isLoading 
}: {
  answers: Record<string, number>
  chartRef: React.RefObject<ChartJS<'radar'> | null>
  email: string
  onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onSendReport: () => void
  isLoading: boolean
}) => {
  const calculateAverageScore = () => {
    const totalScore = Object.values(answers).reduce((sum, value) => sum + value, 0)
    return totalScore / Object.values(answers).length
  }

  const averageScore = calculateAverageScore()
  const maturityLevel = getMaturityLevel(averageScore)

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-bold mb-2">Ihr digitaler Reifegrad</h3>
        <div className="text-4xl font-bold text-green-600 mb-2">{averageScore.toFixed(1)} / 5.0</div>
        <div className="text-lg font-medium">
          Stufe {maturityLevel.level}: {maturityLevel.name}
        </div>
        <p className="text-gray-600 mt-2">{maturityLevel.description}</p>
      </div>

      <ChartContainer answers={answers} chartRef={chartRef} />

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <h4 className="font-medium mb-2">Stärken</h4>
            <ul className="space-y-1 text-sm">
              {Object.entries(answers)
                .filter(([_, value]) => value >= 4)
                .map(([key, _]) => {
                  const dimension = getDimensionName(key);
                  return (
                    <li key={key} className="flex items-start">
                      <Check className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
                      <span>{dimension}</span>
                    </li>
                  )
                })}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h4 className="font-medium mb-2">Handlungsfelder</h4>
            <ul className="space-y-1 text-sm">
              {Object.entries(answers)
                .filter(([_, value]) => value <= 2)
                .map(([key, _]) => {
                  const dimension = getDimensionName(key);
                  return (
                    <li key={key} className="flex items-start">
                      <div className="w-4 h-4 rounded-full bg-gray-200 mr-2 mt-0.5 flex items-center justify-center">
                        <span className="text-white text-xs">!</span>
                      </div>
                      <span>{dimension}</span>
                    </li>
                  )
                })}
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium">Erhalten Sie Ihren detaillierten Bericht</h4>
        <div className="flex items-center space-x-2">
          <input
            type="email"
            placeholder="Ihre E-Mail-Adresse"
            className="flex-1 p-2 border rounded-md"
            value={email}
            onChange={onEmailChange}
          />
          <Button onClick={onSendReport} disabled={isLoading} className="bg-green-600 hover:bg-green-700">
            <Mail className="mr-2 h-4 w-4" />
            {isLoading ? "Wird gesendet..." : "Bericht senden"}
          </Button>
        </div>
      </div>
    </div>
  )
})

export default function AssessmentDialog({ isOpen, onClose }: AssessmentDialogProps) {
  const [step, setStep] = useState(1);
  const [currentQuestion, setCurrentQuestion] = useState(questions[step - 1]);
  const [progress, setProgress] = useState(0);
  const [radioGroupValue, setRadioGroupValue] = useState<string | undefined>(undefined);
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [showResults, setShowResults] = useState(false)
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const chartRef = useRef<ChartJS<'radar'>>(null)
  const { toast } = useToast()
  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setAnswers({});
      setShowResults(false);
      setRadioGroupValue(undefined);
      setProgress(0);
    }
  }, [isOpen])

  useEffect(() => {
    setCurrentQuestion(questions[step - 1]);
    setProgress(((step - 1) / totalSteps) * 100);
    
    // Reset radio group value when changing steps, then check for saved answers
    const currentQuestionId = questions[step - 1]?.id;
    const currentAnswer = answers[currentQuestionId];
    setRadioGroupValue(currentAnswer ? currentAnswer.toString() : undefined);
  }, [step, answers])

  const handleNext = () => {
    if (!answers[currentQuestion.id]) {
      toast({
        title: "Bitte wählen Sie eine Option",
        description: "Um fortzufahren, müssen Sie eine Antwort auswählen.",
        variant: "destructive",
      })
      return
    }

    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      setShowResults(true)
    }
  }

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleAnswerChange = (value: string) => {
    setAnswers({
      ...answers,
      [currentQuestion.id]: Number.parseInt(value),
    });
    setRadioGroupValue(value)
  }

  const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
  }, [])

  const generateEmailContent = (averageScore: number, maturityLevel: any, chartImageData: string) => {
    const dimensionScores = questions.map((q) => ({
      name: getDimensionName(q.id),
      score: answers[q.id] || 0
    }));

    const strengths = dimensionScores.filter(d => d.score >= 4);
    const improvements = dimensionScores.filter(d => d.score <= 2);

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Ihr digitaler Reifegrad - Ergebnisbericht</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .score { font-size: 48px; font-weight: bold; color: #16a34a; margin: 10px 0; }
          .level { font-size: 24px; font-weight: 600; margin: 10px 0; }
          .description { font-size: 16px; color: #666; margin: 10px 0; }
          .chart-section { text-align: center; margin: 30px 0; }
          .chart-image { max-width: 100%; height: auto; border: 1px solid #ddd; border-radius: 8px; }
          .section { margin: 30px 0; }
          .section h3 { color: #16a34a; border-bottom: 2px solid #16a34a; padding-bottom: 5px; }
          .dimension-list { list-style: none; padding: 0; }
          .dimension-list li { padding: 8px 0; border-bottom: 1px solid #eee; }
          .score-badge { display: inline-block; background: #f0f9ff; color: #0369a1; padding: 2px 8px; border-radius: 4px; font-weight: bold; margin-left: 10px; }
          .footer { margin-top: 40px; text-align: center; color: #666; font-size: 14px; }
          .branding { margin-top: 30px; text-align: center; }
          .realcore-logo { color: #16a34a; font-weight: bold; font-size: 18px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Ihr digitaler Reifegrad</h1>
          <div class="score">${averageScore.toFixed(1)} / 5.0</div>
          <div class="level">Stufe ${maturityLevel.level}: ${maturityLevel.name}</div>
          <div class="description">${maturityLevel.description}</div>
        </div>

        <div class="chart-section">
          <h3>Ihre Bewertung im Überblick</h3>
          <img src="data:image/png;base64,${chartImageData}" alt="Radar Chart" class="chart-image" />
        </div>

        <div class="section">
          <h3>Detaillierte Bewertung</h3>
          <ul class="dimension-list">
            ${dimensionScores.map(d => `
              <li>
                ${d.name}
                <span class="score-badge">${d.score}/5</span>
              </li>
            `).join('')}
          </ul>
        </div>

        ${strengths.length > 0 ? `
        <div class="section">
          <h3>Ihre Stärken</h3>
          <ul class="dimension-list">
            ${strengths.map(d => `
              <li>
                ✓ ${d.name}
                <span class="score-badge">${d.score}/5</span>
              </li>
            `).join('')}
          </ul>
        </div>
        ` : ''}

        ${improvements.length > 0 ? `
        <div class="section">
          <h3>Handlungsfelder</h3>
          <ul class="dimension-list">
            ${improvements.map(d => `
              <li>
                ⚠ ${d.name}
                <span class="score-badge">${d.score}/5</span>
              </li>
            `).join('')}
          </ul>
        </div>
        ` : ''}

        <div class="footer">
          <p>Dieser Bericht wurde automatisch generiert basierend auf Ihrer digitalen Standortbestimmung.</p>
          
          <h4 style="color: #16a34a; margin: 20px 0 10px 0;">Unsere Empfehlung:</h4>
          <p>Nutzen Sie das Ergebnis als Impuls für eine strategische Roadmap.</p>
          <p>Gerne laden wir Sie zu einem kostenlosen Tagesworkshop ein.</p>
          <p><strong>Ziel:</strong> eine fundierte Analyse Ihrer bestehenden Systemlandschaft und erste Handlungsempfehlungen, abgestimmt auf Ihre Geschäftsstrategie.</p>
          
          <h4 style="color: #16a34a; margin: 20px 0 10px 0;">Ihr persönlicher Ansprechpartner:</h4>
          <p><strong>Marcus Banner</strong><br>
          CEO, RealCore Group<br>
          <a href="mailto:m.banner@realcore.de" style="color: #16a34a;">m.banner@realcore.de</a></p>
          
          <p style="margin: 15px 0;"><em>Unser CEO freut sich persönlich auf den Austausch mit Ihnen!</em></p>
          
          <p>Schreiben Sie Ihn noch heute mit dem Betreff: „Standortanalyse - Workshop" per Mail an, er wird sich umgehend bei Ihnen mit Terminvorschlägen melden.</p>
          
          <p style="margin-top: 20px;"><strong>Viele Grüße</strong><br>
          Ihr RealCore Tech-Hub Team</p>
        </div>
      </body>
      </html>
    `;
  }

  const handleSendReport = async () => {
    if (!email) {
      toast({
        title: "Bitte geben Sie Ihre E-Mail-Adresse ein",
        description: "Um den Bericht zu erhalten, benötigen wir Ihre E-Mail-Adresse.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const averageScore = calculateAverageScore()
      const maturityLevel = getMaturityLevel(averageScore)

      // Generate chart image
      let chartImageData = ""
      if (chartRef.current) {
        try {
          const chartCanvas = chartRef.current.canvas
          if (chartCanvas) {
            chartImageData = chartCanvas.toDataURL('image/png').split(',')[1]
          }
        } catch (error) {
          console.warn('Failed to generate chart image:', error)
        }
      }

      // Generate email content
      const emailHtml = generateEmailContent(averageScore, maturityLevel, chartImageData)

      // Send email via API
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          testEmail: email,
          subject: `Ihr digitaler Reifegrad - Bewertung ${averageScore.toFixed(1)}/5.0`,
          html: emailHtml,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send email')
      }

      analytics.assessmentComplete('digital-maturity', averageScore)

      toast({
        title: "Bericht erfolgreich gesendet",
        description: `Ein detaillierter Bericht wurde an ${email} gesendet.`,
      })

      onClose()
    } catch (error) {
      console.error('Error sending report:', error)
      toast({
        title: "Fehler beim Senden",
        description: "Der Bericht konnte nicht gesendet werden. Bitte versuchen Sie es später erneut.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const calculateAverageScore = () => {
    const totalScore = Object.values(answers).reduce((sum, value) => sum + value, 0)
    return totalScore / Object.values(answers).length
  }

  return (
    <ActionDialog
      isOpen={isOpen}
      onClose={onClose}
      title={showResults ? "Ihr Ergebnis der digitalen Standortbestimmung" : "Digitale Standortbestimmung"}
      description={
        showResults ? "" : "Beantworten Sie die folgenden Fragen, um Ihren digitalen Reifegrad zu ermitteln."
      }
    >
      {!showResults ? (
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>
                Schritt {step} von {totalSteps}
              </span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="py-4">
            <h3 className="text-lg font-medium mb-4">{currentQuestion.question}</h3>
            <RadioGroup key={`question-${step}`} value={radioGroupValue} onValueChange={handleAnswerChange}>
              <div className="space-y-3">
                {currentQuestion.options.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value.toString()} id={`option-${option.value}`} />
                    <Label htmlFor={`option-${option.value}`} className="flex-grow cursor-pointer">
                      {option.label}
                    </Label>
                    {answers[currentQuestion.id] === option.value && <Check className="h-4 w-4 text-green-600" />}
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={handlePrevious} disabled={step === 1}>
              Zurück
            </Button>
            <Button onClick={handleNext} className="bg-green-600 hover:bg-green-700">
              {step === totalSteps ? "Auswertung anzeigen" : "Weiter"}
              {step !== totalSteps && <ChevronRight className="ml-1 h-4 w-4" />}
            </Button>
          </div>
        </div>
      ) : (
        <ResultsComponent 
          answers={answers}
          chartRef={chartRef}
          email={email}
          onEmailChange={handleEmailChange}
          onSendReport={handleSendReport}
          isLoading={isLoading}
        />
      )}
    </ActionDialog>
  )
}
