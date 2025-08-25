import EditableText from "@/components/cms/editable-text"
import TextDisplay from "@/components/cms/text-display"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ExampleCmsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">
        <EditableText
          textKey="example.title"
          defaultValue="CMS Beispielseite"
          category="example"
          description="Titel der Beispielseite"
          as="span"
        />
      </h1>

      <p className="text-gray-600 mb-8">
        <EditableText
          textKey="example.description"
          defaultValue="Diese Seite demonstriert die Verwendung des neuen CMS-Systems. Texte können direkt auf der Seite bearbeitet werden."
          category="example"
          description="Beschreibung der Beispielseite"
          as="span"
        />
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>
              <TextDisplay textKey="example.card1.title" defaultValue="Einfache Textanzeige" as="h3" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              <TextDisplay
                textKey="example.card1.content"
                defaultValue="Diese Komponente zeigt Texte aus dem CMS an, ohne die Möglichkeit zur Bearbeitung."
              />
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <EditableText
                textKey="example.card2.title"
                defaultValue="Bearbeitbare Texte"
                category="example"
                description="Titel der zweiten Karte"
                as="h3"
              />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              <EditableText
                textKey="example.card2.content"
                defaultValue="Diese Komponente ermöglicht die direkte Bearbeitung von Texten auf der Seite. Bewegen Sie den Mauszeiger über den Text, um den Bearbeiten-Button anzuzeigen."
                category="example"
                description="Inhalt der zweiten Karte"
              />
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">
          <EditableText
            textKey="example.section.title"
            defaultValue="Wie es funktioniert"
            category="example"
            description="Titel des Abschnitts"
            as="span"
          />
        </h2>

        <ol className="list-decimal list-inside space-y-2 ml-4">
          <li>
            <EditableText
              textKey="example.section.step1"
              defaultValue="Verwenden Sie die EditableText-Komponente, um bearbeitbare Texte auf Ihrer Seite anzuzeigen."
              category="example"
              description="Schritt 1"
            />
          </li>
          <li>
            <EditableText
              textKey="example.section.step2"
              defaultValue="Bewegen Sie den Mauszeiger über einen Text, um den Bearbeiten-Button anzuzeigen."
              category="example"
              description="Schritt 2"
            />
          </li>
          <li>
            <EditableText
              textKey="example.section.step3"
              defaultValue="Klicken Sie auf den Button, um den Text zu bearbeiten."
              category="example"
              description="Schritt 3"
            />
          </li>
          <li>
            <EditableText
              textKey="example.section.step4"
              defaultValue="Speichern Sie den Text, um die Änderungen zu übernehmen."
              category="example"
              description="Schritt 4"
            />
          </li>
        </ol>
      </div>
    </div>
  )
}
