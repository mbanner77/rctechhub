// Workshop type definition
export interface Workshop {
  id: string;
  title: string;
  description: string;
  duration: string;
  price: number;
  icon: string;
  benefits?: string[];
  audience?: string;
  nextDate?: string;
  location?: string;
  isNew?: boolean;
  unitId?: string; // ID der zugehörigen Pathfinder-Unit
}
