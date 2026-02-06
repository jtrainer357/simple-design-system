export interface AddOn {
  id: string;
  name: string;
  price: number;
  description: string;
  detailedFeatures: string[];
}

export const ADD_ONS: AddOn[] = [
  {
    id: "analytics",
    name: "Advanced Analytics Dashboard",
    price: 49,
    description: "In-depth practice analytics and comprehensive reporting tools",
    detailedFeatures: [
      "Real-time performance dashboards",
      "Custom report builder",
      "Revenue trend analysis",
      "Patient demographics insights",
      "Appointment utilization metrics",
    ],
  },
  {
    id: "priority-support",
    name: "Priority Support",
    price: 29,
    description: "24/7 priority phone and chat support with dedicated team",
    detailedFeatures: [
      "24/7 phone support access",
      "Priority chat queue",
      "Dedicated support specialist",
      "2-hour response SLA",
      "Proactive issue monitoring",
    ],
  },
  {
    id: "sms-reminders",
    name: "SMS Appointment Reminders",
    price: 39,
    description: "Automated text reminders to reduce no-shows",
    detailedFeatures: [
      "Customizable reminder timing",
      "Two-way text messaging",
      "Appointment confirmation replies",
      "Multilingual support",
      "No-show rate tracking",
    ],
  },
  {
    id: "reputation",
    name: "Online Reputation Management",
    price: 59,
    description: "Review monitoring, response tools, and reputation building",
    detailedFeatures: [
      "Multi-platform review monitoring",
      "Automated review requests",
      "Response templates",
      "Sentiment analysis",
      "Competitor benchmarking",
    ],
  },
];

export const BASE_PLAN = {
  name: "Professional",
  price: 349,
  billingPeriod: "per provider/month",
  trialDays: 14,
  features: [
    "Full practice management platform",
    "Priority phone + email support 24hr response",
    "Priority implementation - get live faster",
  ],
  pricingOptions: [
    { label: "5,000 messages / month", price: 349 },
    { label: "10,000 messages / month", price: 449 },
    { label: "15,000 messages / month", price: 549 },
  ],
};

export const SPECIALTIES = [
  "Family Medicine",
  "Internal Medicine",
  "Pediatrics",
  "Cardiology",
  "Dermatology",
  "Orthopedics",
  "OB/GYN",
  "Psychiatry",
  "Ophthalmology",
  "Gastroenterology",
  "Neurology",
  "Urology",
  "ENT (Otolaryngology)",
  "Pulmonology",
  "Endocrinology",
  "Rheumatology",
  "Oncology",
  "Nephrology",
  "Allergy & Immunology",
  "Physical Medicine & Rehabilitation",
  "Other",
];

export const PROVIDER_OPTIONS = [
  { value: "1", label: "1 provider" },
  { value: "2-5", label: "2-5 providers" },
  { value: "6-10", label: "6-10 providers" },
  { value: "10+", label: "10+ providers" },
];
