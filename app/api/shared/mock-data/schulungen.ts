/**
 * Mock data for trainings to be used in development environment
 * This data will not be displayed in production
 */
import { Schulung } from "@/types/schulung";

export const mockSchulungen: Schulung[] = [
  {
    id: "schulung-1",
    title: "SAP BTP Basics",
    category: "Online-Kurs",
    duration: "4 hours",
    price: 299,
    hours: 4
  },
  {
    id: "schulung-2",
    title: "SAPUI5 Development",
    category: "Workshop",
    duration: "2 days",
    price: 1200,
    days: 2
  },
  {
    id: "schulung-3",
    title: "SAP Integration Suite",
    category: "Webinar",
    duration: "90 minutes",
    price: 0,
    hours: 1.5
  }
];
