"use client"

import { DynamicContent } from "@/components/dynamic-content"
import { StructuredContent } from "@/components/structured-content"

export default function ExamplePage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">
        <DynamicContent contentKey="example-page-title" defaultValue="Beispielseite" as="span" />
      </h1>

      <div className="mb-8">
        <DynamicContent
          contentKey="example-page-intro"
          defaultValue="Dies ist eine Beispielseite, die dynamische Inhalte verwendet."
          as="p"
          className="text-lg"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <StructuredContent
          contentKey="example-feature-1"
          defaultValue={{
            title: "Feature 1",
            description: "Beschreibung des ersten Features",
            icon: "Zap",
          }}
          render={(data) => (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-2">{data.title}</h2>
              <p className="text-gray-600">{data.description}</p>
            </div>
          )}
        />

        <StructuredContent
          contentKey="example-feature-2"
          defaultValue={{
            title: "Feature 2",
            description: "Beschreibung des zweiten Features",
            icon: "Shield",
          }}
          render={(data) => (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-2">{data.title}</h2>
              <p className="text-gray-600">{data.description}</p>
            </div>
          )}
        />

        <StructuredContent
          contentKey="example-feature-3"
          defaultValue={{
            title: "Feature 3",
            description: "Beschreibung des dritten Features",
            icon: "Star",
          }}
          render={(data) => (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-2">{data.title}</h2>
              <p className="text-gray-600">{data.description}</p>
            </div>
          )}
        />
      </div>

      <div className="bg-gray-50 p-8 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">
          <DynamicContent contentKey="example-cta-title" defaultValue="Bereit für den nächsten Schritt?" as="span" />
        </h2>

        <DynamicContent
          contentKey="example-cta-description"
          defaultValue="Kontaktieren Sie uns noch heute, um mehr zu erfahren."
          as="p"
          className="text-lg mb-6"
        />

        <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors">
          <DynamicContent contentKey="example-cta-button" defaultValue="Kontakt aufnehmen" as="span" />
        </button>
      </div>
    </div>
  )
}
