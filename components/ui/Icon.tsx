import {
  Activity, Baby, BookOpen, Brain, CalendarCheck, Dices, Dog, FlaskConical, HeartHandshake,
  HeartPulse, Home, Mail, MapPin, Microscope, Music, Newspaper, Palette, Ribbon, Scissors,
  Search, Siren, Smile, Sparkles, Stethoscope, Theater, Users, Wind,
  type LucideProps,
} from "lucide-react";

/** Icons named from the database or configuration (departments, categories, projects). */
const ICONS = {
  // Departments
  siren: Siren,
  baby: Baby,
  "heart-pulse": HeartPulse,
  scissors: Scissors,
  ribbon: Ribbon,
  brain: Brain,
  wind: Wind,
  smile: Smile,
  // Activity categories and donation projects
  palette: Palette,
  music: Music,
  dices: Dices,
  activity: Activity,
  "book-open": BookOpen,
  dog: Dog,
  theater: Theater,
  flask: FlaskConical,
  sparkle: Sparkles,
  microscope: Microscope,
  home: Home,
  // Page headers
  stethoscope: Stethoscope,
  users: Users,
  newspaper: Newspaper,
  mail: Mail,
  "map-pin": MapPin,
  calendar: CalendarCheck,
  search: Search,
  "heart-hands": HeartHandshake,
} as const;

export function ServiceIcon({ name, ...props }: { name: string } & LucideProps) {
  const Cmp = ICONS[name as keyof typeof ICONS] ?? Stethoscope;
  return <Cmp {...props} />;
}

export { ServiceIcon as Icon };
