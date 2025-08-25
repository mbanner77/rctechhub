import { Expert } from "../types/expert";

// Centralized expert data - single source of truth
export const defaultExperts: Expert[] = [
  {
    id: "1",
    name: "Müller",
    firstName: "Thomas",
    role: "SAP BTP Architekt",
    technologies: ["SAP BTP", "Cloud Architecture", "Integration"],
    email: "thomas.mueller@realcore.de",
    expertise: ["SAP BTP", "Cloud Architecture", "Integration"],
    experience: "15+ Jahre",
    certifications: "SAP Certified Development Associate - ABAP, SAP Certified Technology Associate - SAP HANA",
    image: "/images/expert-thomas-mueller.jpg",
    bio: "Thomas Müller ist ein erfahrener SAP BTP Architekt mit über 15 Jahren Erfahrung in der Beratung und Implementierung von Cloud-Lösungen.",
    phone: "+49 123 456789",
    location: "München, Deutschland",
    linkedin: "https://www.linkedin.com/in/thomas-mueller/",
    languages: ["Deutsch (Muttersprache)", "Englisch (Fließend)"],
    projects: ["Cloud-Transformation für Automotive GmbH", "Hybride Architektur für Maschinen AG"],
    publications: ["Die Zukunft der SAP-Landschaft: Clean Core und BTP"],
    showContactDialog: false
  },
  {
    id: "2",
    name: "Schmidt",
    firstName: "Sarah",
    role: "UX/UI Design Spezialistin",
    technologies: ["SAP Fiori", "UI5", "UX Design"],
    email: "sarah.schmidt@realcore.de",
    expertise: ["SAP Fiori", "UI5", "UX Design"],
    experience: "10+ Jahre",
    certifications: "SAP Certified Application Associate - SAP Fiori",
    image: "/images/expert-sarah-schmidt.jpg",
    bio: "Sarah Schmidt ist eine UX/UI Design Spezialistin mit Fokus auf benutzerfreundliche Fiori-Anwendungen.",
    phone: "+49 123 456790",
    location: "Berlin, Deutschland",
    linkedin: "https://www.linkedin.com/in/sarah-schmidt/",
    languages: ["Deutsch (Muttersprache)", "Englisch (Fließend)", "Französisch (Grundkenntnisse)"],
    projects: ["UI/UX Redesign für Finance AG", "Fiori Implementierung für Retail GmbH"],
    publications: ["Modern UI Design Principles"],
    showContactDialog: false
  },
  {
    id: "3",
    name: "Weber",
    firstName: "Michael",
    role: "SAP S/4HANA Berater",
    technologies: ["SAP S/4HANA", "Business Process", "Migration"],
    email: "michael.weber@realcore.de",
    expertise: ["SAP S/4HANA", "Business Process", "Migration"],
    experience: "12+ Jahre",
    certifications: "SAP Certified Application Associate - SAP S/4HANA",
    image: "/images/expert-michael-weber.jpg",
    bio: "Michael Weber ist ein SAP S/4HANA Berater mit umfassender Erfahrung in Geschäftsprozessen und Migrationen.",
    phone: "+49 123 456791",
    location: "Frankfurt, Deutschland",
    linkedin: "https://www.linkedin.com/in/michael-weber/",
    languages: ["Deutsch (Muttersprache)", "Englisch (Fließend)"],
    projects: ["S/4HANA Migration für Manufacturing AG", "Business Process Optimization für Retail GmbH"],
    publications: ["S/4HANA Best Practices"],
    showContactDialog: false
  },
  {
    id: "4",
    name: "Hoffmann",
    firstName: "Andreas",
    role: "Integration Spezialist",
    technologies: ["SAP Integration Suite", "API Management", "Event Mesh"],
    email: "andreas.hoffmann@realcore.de",
    expertise: ["SAP Integration Suite", "API Management", "Event Mesh"],
    experience: "8+ Jahre",
    certifications: "SAP Certified Development Specialist - SAP Integration Suite",
    image: "/images/expert-andreas-hoffmann.jpg",
    bio: "Andreas Hoffmann ist ein Integration Spezialist mit Fokus auf moderne Integrationsmuster und API-Management.",
    phone: "+49 123 456792",
    location: "Hamburg, Deutschland",
    linkedin: "https://www.linkedin.com/in/andreas-hoffmann/",
    languages: ["Deutsch (Muttersprache)", "Englisch (Fließend)"],
    projects: ["API Strategy für Logistics GmbH", "Event-driven Architecture für Finance AG"],
    publications: ["Modern Integration Patterns"],
    showContactDialog: false
  },
  {
    id: "5",
    name: "Becker",
    firstName: "Julia",
    role: "CAP Development Lead",
    technologies: ["CAP", "Node.js", "HANA"],
    email: "julia.becker@realcore.de",
    expertise: ["CAP", "Node.js", "HANA"],
    experience: "7+ Jahre",
    certifications: "SAP Certified Development Associate - SAP Cloud Application Programming Model",
    image: "/professional-female-headshot.png",
    bio: "Julia Becker ist eine CAP Development Lead mit Expertise in der Entwicklung moderner Cloud-Anwendungen.",
    phone: "+49 123 456793",
    location: "München, Deutschland",
    linkedin: "https://www.linkedin.com/in/julia-becker/",
    languages: ["Deutsch (Muttersprache)", "Englisch (Fließend)"],
    projects: ["CAP Application für Manufacturing AG", "Cloud Development für Retail GmbH"],
    publications: ["CAP Development Best Practices"],
    showContactDialog: false
  },
  {
    id: "6",
    name: "Schneider",
    firstName: "Markus",
    role: "DevOps Experte",
    technologies: ["CI/CD", "Kubernetes", "Cloud Foundry"],
    email: "markus.schneider@realcore.de",
    expertise: ["CI/CD", "Kubernetes", "Cloud Foundry"],
    experience: "9+ Jahre",
    certifications: "SAP Certified Development Associate - SAP Cloud Platform",
    image: "/professional-male-headshot.png",
    bio: "Markus Schneider ist ein DevOps Experte mit umfassender Erfahrung in CI/CD, Kubernetes und Cloud Foundry.",
    phone: "+49 123 456794",
    location: "Deutschland",
    linkedin: "https://www.linkedin.com/in/markus-schneider/",
    languages: ["Deutsch (Muttersprache)", "Englisch (Fließend)"],
    projects: ["DevOps Transformation für Tech AG", "Kubernetes Migration für Cloud GmbH"],
    publications: ["Modern DevOps Practices"],
    showContactDialog: false
  }
];

// Helper function to validate and clean expert data
export const validateAndCleanExpertData = (experts: Expert[]): Expert[] => {
  return experts.filter(expert => {
    // Check if required fields are present and not empty
    const hasValidName = expert.firstName &&
      expert.name &&
      expert.firstName.trim() !== '' &&
      expert.name.trim() !== '';

    if (!hasValidName) {
      console.warn(`Filtering out expert with invalid name data:`, expert);
      return false;
    }

    return true;
  });
};

// Helper function to fetch current experts from API (without cache)
export const fetchCurrentExperts = async (): Promise<Expert[]> => {
  try {
    const response = await fetch('/api/data/experts', {
      cache: 'no-store', // Always fetch fresh data
      headers: {
        'Cache-Control': 'no-cache',
      },
    });
    
    if (response.ok) {
      const experts = await response.json();
      return validateAndCleanExpertData(experts);
    } else {
      console.warn('Failed to fetch current experts, using defaults');
      return defaultExperts;
    }
  } catch (error) {
    console.error('Error fetching current experts:', error);
    return defaultExperts;
  }
};

// Helper function to get expert by ID
export const getExpertById = async (id: string): Promise<Expert | undefined> => {
  const experts = await fetchCurrentExperts();
  return experts.find(expert => expert.id === id);
};

// Helper function to get experts by technology
export const getExpertsByTechnology = async (technology: string): Promise<Expert[]> => {
  const experts = await fetchCurrentExperts();
  return experts.filter(expert =>
    expert.technologies.includes(technology) ||
    expert.expertise?.includes(technology)
  );
};

// Helper function to get experts by role
export const getExpertsByRole = async (role: string): Promise<Expert[]> => {
  const experts = await fetchCurrentExperts();
  return experts.filter(expert =>
    expert.role.toLowerCase().includes(role.toLowerCase())
  );
};

// Helper function to get multiple experts by ID
export const getExpertsByIds = async (expertIds: string[]): Promise<Expert[]> => {
  const experts = await fetchCurrentExperts();
  return expertIds
    .map(id => experts.find(expert => expert.id === id))
    .filter((expert): expert is Expert => expert !== undefined);
};
