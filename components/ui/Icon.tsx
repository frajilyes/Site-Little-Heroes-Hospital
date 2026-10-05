import {
  Baby, Brain, HeartPulse, Ribbon, Scissors, Siren, Smile, Wind, Stethoscope, type LucideProps,
} from "lucide-react";

const ICONS = {
  siren: Siren,
  baby: Baby,
  "heart-pulse": HeartPulse,
  scissors: Scissors,
  ribbon: Ribbon,
  brain: Brain,
  wind: Wind,
  smile: Smile,
} as const;

export function ServiceIcon({ name, ...props }: { name: string } & LucideProps) {
  const Cmp = ICONS[name as keyof typeof ICONS] ?? Stethoscope;
  return <Cmp {...props} />;
}
