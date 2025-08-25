import { FeatureCard } from "@/components/example/feature-card"

export default async function ExampleSSRPage() {
  // Diese Daten würden in einer echten Implementierung aus der Datenbank geladen
  const feature1 = {
    title: "Feature 1",
    description: "Beschreibung des ersten Features",
  }

  const feature2 = {
    title: "Feature 2",
    description: "Beschreibung des zweiten Features",
  }

  const feature3 = {
    title: "Feature 3",
    description: "Beschreibung des dritten Features",
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Beispielseite (SSR)</h1>

      <div className="mb-8">
        <p className="text-lg">Dies ist eine Beispielseite mit serverseitigem Rendering.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <FeatureCard title={feature1.title} description={feature1.description} />
        <FeatureCard title={feature2.title} description={feature2.description} />
        <FeatureCard title={feature3.title} description={feature3.description} />
      </div>

      <div className="bg-gray-50 p-8 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Bereit für den nächsten Schritt?</h2>
        <p className="text-lg mb-6">Kontaktieren Sie uns noch heute, um mehr zu erfahren.</p>
        <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors">
          Kontakt aufnehmen
        </button>
      </div>
    </div>
  )
}
