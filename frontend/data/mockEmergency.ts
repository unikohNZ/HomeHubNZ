export interface EmergencyGuide {
  id: string;
  title: string;
  icon: string;
  summary: string;
  tips: string[];
}

export interface EmergencyContact {
  id: string;
  name: string;
  role: string;
  phone: string;
  priority: number;
}

export const EMERGENCY_KIT_ITEMS = [
  { id: "k1", label: "Water (3L per person/day)", checked: true },
  { id: "k2", label: "Non-perishable food (3 days)", checked: true },
  { id: "k3", label: "Torch + spare batteries", checked: true },
  { id: "k4", label: "First aid kit", checked: false },
  { id: "k5", label: "Radio (battery powered)", checked: false },
  { id: "k6", label: "Important documents (copies)", checked: true },
  { id: "k7", label: "Phone charger / power bank", checked: true },
  { id: "k8", label: "Warm blankets", checked: false },
];

export const SAFE_MEETING_POINT = {
  label: "Mount Drury Reserve Car Park",
  address: "Memorial Park Drive, Mount Maunganui",
  notes: "Agreed flat meeting point if evacuated from apartment.",
};

export const CIVIL_DEFENCE_INFO = {
  title: "NZ Civil Defence",
  summary: "In an emergency, listen to local radio, check getready.govt.nz, and follow official alerts.",
  website: "getready.govt.nz",
  emergency: "111",
};

export const EMERGENCY_GUIDES: EmergencyGuide[] = [
  {
    id: "earthquake",
    title: "Earthquake Guide",
    icon: "🌍",
    summary: "Drop, Cover, Hold. Check flatmates and utilities after shaking stops.",
    tips: [
      "Drop to hands and knees, cover head, hold on to something sturdy",
      "Stay indoors until shaking stops — do not run outside",
      "Check gas, water, and power after a significant quake",
      "Use Get Ready NZ app for aftershock updates",
    ],
  },
  {
    id: "flood",
    title: "Flood Guide",
    icon: "🌊",
    summary: "Move valuables upstairs. Avoid driving through floodwater.",
    tips: [
      "Monitor MetService and regional council flood alerts",
      "Move vehicles to higher ground if warning issued",
      "Unplug electronics in low areas",
      "Never walk or drive through floodwater",
    ],
  },
  {
    id: "tsunami",
    title: "Tsunami Guide",
    icon: "🌊",
    summary: "If you feel a long earthquake near the coast, evacuate immediately to high ground.",
    tips: [
      "Long OR strong earthquake near coast = tsunami threat",
      "Go inland or to high ground — do not wait for official warning",
      "Stay away until all-clear given by Civil Defence",
      "Know your local evacuation zone in Tauranga",
    ],
  },
  {
    id: "storm",
    title: "Storm Guide",
    icon: "⛈️",
    summary: "Secure outdoor furniture and charge devices before severe weather.",
    tips: [
      "Bring in washing, bins, and loose outdoor items",
      "Charge phones and power banks",
      "Stay indoors during peak wind periods",
      "Report property damage to landlord promptly",
    ],
  },
];

export const EMERGENCY_HUB_CONTACTS: EmergencyContact[] = [
  { id: "ec1", name: "Emergency Services", role: "Police / Fire / Ambulance", phone: "111", priority: 1 },
  { id: "ec2", name: "Aroha Williams", role: "Landlord", phone: "021 555 0101", priority: 2 },
  { id: "ec3", name: "Sarah Lee", role: "Flatmate", phone: "021 555 0202", priority: 3 },
  { id: "ec4", name: "Civil Defence", role: "Bay of Plenty Emergency", phone: "0800 884 881", priority: 4 },
  { id: "ec5", name: "Power Fault", role: "Vector Emergency", phone: "0800 832 867", priority: 5 },
];
