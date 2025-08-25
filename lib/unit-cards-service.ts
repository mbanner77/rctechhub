import { UnitCard, Advantage, Challenge } from "@/types/unit-cards";

export async function getUnitCards(): Promise<UnitCard[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || ''}/api/data/unit-cards`, { 
      cache: 'no-store',
      next: { revalidate: 60 } // Revalidate every 60 seconds
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch unit cards');
    }
    
    return res.json();
  } catch (error) {
    console.error('Error loading unit cards:', error);
    return [];
  }
}

export function mapUnitCardToPathfinderUnit(unitCard: UnitCard) {
  // Map the category to a color scheme
  const colorSchemes = {
    'core-systems': {
      color: "#3b82f6", // blue-500
      gradient: "from-blue-500 to-blue-700",
      iconImage: "/images/icon-database.png",
      icon: "Database",
      iconClass: "bg-blue-100",
    },
    'integration': {
      color: "#10b981", // emerald-500
      gradient: "from-emerald-500 to-emerald-700",
      iconImage: "/images/icon-refresh.png",
      icon: "RefreshCw",
      iconClass: "bg-emerald-100",
    },
    'data-analytics': {
      color: "#8b5cf6", // violet-500
      gradient: "from-violet-500 to-violet-700",
      iconImage: "/images/icon-chart.png",
      icon: "BarChart2",
      iconClass: "bg-violet-100",
    },
    'cloud-platform': {
      color: "#3b82f6", // blue-500
      gradient: "from-blue-400 to-cyan-500",
      iconImage: "/images/icon-cloud.png",
      icon: "Cloud",
      iconClass: "bg-blue-100",
    },
    'transformation': {
      color: "#ec4899", // pink-500
      gradient: "from-pink-500 to-rose-500",
      iconImage: "/images/icon-transform.png",
      icon: "Layers",
      iconClass: "bg-pink-100",
    }
  };

  // Get color scheme based on category, default to blue if not found
  const scheme = colorSchemes[unitCard.category as keyof typeof colorSchemes] || 
    colorSchemes['core-systems'];

  // Store the original numeric ID
  const originalId = unitCard.id;
  
  // Generate a URL-friendly ID
  let id;
  if (originalId) {
    // For real unit cards with numeric IDs, convert to string
    id = originalId.toString();
  } else {
    // For mock data without IDs, generate from title
    id = unitCard.title
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');
  }

  // Map benefits/advantages into the format expected by the UI
  const benefits = (unitCard.advantages || []).map((advantage, index) => {
    const colorClasses = ['bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-cyan-500', 'bg-rose-500'];
    return {
      title: typeof advantage === 'string' ? advantage : (advantage as Advantage).title,
      description: typeof advantage === 'string' ? 'Ihr Vorteil mit dieser Unit' : (advantage as Advantage).description,
      outcome: typeof advantage === 'string' ? null : (advantage as Advantage).outcome || null,
      colorClass: colorClasses[index % colorClasses.length],
    };
  });

  // Map challenges into the format expected by the UI
  const challenges = (unitCard.challenges || []).map((challenge) => {
    return {
      title: typeof challenge === 'string' ? challenge : (challenge as Challenge).title,
      description: typeof challenge === 'string' ? 'Wir unterstützen Sie bei dieser Herausforderung' : (challenge as Challenge).description,
    };
  });

  // Keep the full approach data structure
  // Note: approachSteps is kept for backward compatibility
  const approachSteps = unitCard.approach && unitCard.approach.length > 0 
    ? unitCard.approach.flatMap(a => a.steps || [])
    : [];

  // Build expertise areas based on tags
  const expertiseAreas = (unitCard.tags || []).slice(0, 3).map((tag, index) => {
    const colorClasses = ['bg-blue-500', 'bg-emerald-500', 'bg-violet-500'];
    return {
      name: tag,
      description: `Expertise in ${tag}`,
      colorClass: colorClasses[index % colorClasses.length],
    };
  });

  // Map key technologies
  const keyTechnologies = (unitCard.tags || []).slice(0, 4).map((tag, index) => {
    return {
      name: tag,
      category: unitCard.category || 'Technology',
      icon: scheme.iconImage,
      bgClass: scheme.iconClass,
    };
  });

  // Create workshops from resources if available
  const workshops = unitCard.resources ? unitCard.resources.map((resource, index) => {
    const icons = ["Calendar", "Lightbulb", "BookOpen", "Briefcase", "Code", "Settings"];
    return {
      id: `workshop-${index}`,
      title: resource.title,
      description: resource.description,
      duration: "1-2 Tage",
      format: "Online oder Vor-Ort",
      price: "Auf Anfrage",
      icon: icons[index % icons.length],
    };
  }) : [];

  return {
    id,
    originalId, // Keep the original ID for reference
    title: unitCard.title,
    shortDescription: unitCard.subtitle || '',
    description: unitCard.description,
    slogan: unitCard.slogan || '',
    quote: unitCard.slogan || '',
    color: scheme.color,
    image: unitCard.image || `/images/pathfinder-${unitCard.category || 'core-systems'}.png`,
    heroImage: unitCard.image || `/images/pathfinder-${unitCard.category || 'core-systems'}.png`,
    backgroundPattern: "/tech-pattern-blue.png",
    gradient: scheme.gradient,
    buttonClass: "bg-gray-100 hover:bg-gray-200 text-black",
    technologies: unitCard.tags || [],
    icon: scheme.icon,
    iconImage: scheme.iconImage,
    benefits: benefits,
    challenges: challenges,
    workshops: workshops,
    steps: approachSteps,
    approach: unitCard.approach || [],
    expertiseAreas: expertiseAreas,
    keyTechnologies: keyTechnologies,
    category: unitCard.category,
    // Map expert and contact person settings
    expertIds: unitCard.expertIds || [],
    contactPersonIds: (unitCard as any).contactPersonIds || [],
    showContactPersons: (unitCard as any).showContactPersons || false,
    // Map case studies if available
    caseStudies: unitCard.caseStudies || [],
  };
}
