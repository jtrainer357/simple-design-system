/**
 * 60 Synthetic Patients for Demo
 * Diverse demographics, realistic mental health profiles
 * Avatars are matched by gender, age, and ethnicity
 */

export interface SyntheticPatient {
  id: string;
  client_id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string; // YYYY-MM-DD
  gender: "M" | "F" | "Non-binary";
  email: string;
  phone_mobile: string;
  phone_home?: string;
  address_street: string;
  address_city: string;
  address_state: string;
  address_zip: string;
  insurance_provider: string;
  insurance_member_id: string;
  primary_diagnosis_code: string;
  primary_diagnosis_name: string;
  secondary_diagnosis_code?: string;
  date_created: string;
  last_appointment: string;
  status: "Active" | "Inactive";
  provider: string;
  avatar_url: string;
  // For substrate analysis
  risk_level: "low" | "medium" | "high";
  treatment_start_date: string;
  medications?: string[];
}

// ============================================================================
// DEMOGRAPHICALLY-APPROPRIATE AVATAR SYSTEM
// Avatars are curated to match gender, age range, and ethnicity
// ============================================================================

type Ethnicity =
  | "caucasian"
  | "asian"
  | "hispanic"
  | "african_american"
  | "south_asian"
  | "middle_eastern";
type AgeRange = "young" | "middle" | "senior"; // 18-35, 36-55, 56+
type Gender = "male" | "female";

// Curated avatar URLs organized by demographics
// Using xsgames.co/randomusers for diverse, high-quality portraits
const AVATAR_DATABASE: Record<Gender, Record<Ethnicity, Record<AgeRange, string[]>>> = {
  male: {
    caucasian: {
      young: [
        "https://xsgames.co/randomusers/assets/avatars/male/1.jpg",
        "https://xsgames.co/randomusers/assets/avatars/male/8.jpg",
        "https://xsgames.co/randomusers/assets/avatars/male/15.jpg",
        "https://xsgames.co/randomusers/assets/avatars/male/22.jpg",
      ],
      middle: [
        "https://xsgames.co/randomusers/assets/avatars/male/3.jpg",
        "https://xsgames.co/randomusers/assets/avatars/male/10.jpg",
        "https://xsgames.co/randomusers/assets/avatars/male/17.jpg",
        "https://xsgames.co/randomusers/assets/avatars/male/24.jpg",
      ],
      senior: [
        "https://xsgames.co/randomusers/assets/avatars/male/5.jpg",
        "https://xsgames.co/randomusers/assets/avatars/male/12.jpg",
        "https://xsgames.co/randomusers/assets/avatars/male/19.jpg",
        "https://xsgames.co/randomusers/assets/avatars/male/26.jpg",
      ],
    },
    asian: {
      young: [
        "https://xsgames.co/randomusers/assets/avatars/male/30.jpg",
        "https://xsgames.co/randomusers/assets/avatars/male/37.jpg",
        "https://xsgames.co/randomusers/assets/avatars/male/44.jpg",
        "https://xsgames.co/randomusers/assets/avatars/male/51.jpg",
      ],
      middle: [
        "https://xsgames.co/randomusers/assets/avatars/male/32.jpg",
        "https://xsgames.co/randomusers/assets/avatars/male/39.jpg",
        "https://xsgames.co/randomusers/assets/avatars/male/46.jpg",
        "https://xsgames.co/randomusers/assets/avatars/male/53.jpg",
      ],
      senior: [
        "https://xsgames.co/randomusers/assets/avatars/male/34.jpg",
        "https://xsgames.co/randomusers/assets/avatars/male/41.jpg",
        "https://xsgames.co/randomusers/assets/avatars/male/48.jpg",
        "https://xsgames.co/randomusers/assets/avatars/male/55.jpg",
      ],
    },
    hispanic: {
      young: [
        "https://xsgames.co/randomusers/assets/avatars/male/60.jpg",
        "https://xsgames.co/randomusers/assets/avatars/male/67.jpg",
        "https://xsgames.co/randomusers/assets/avatars/male/74.jpg",
        "https://xsgames.co/randomusers/assets/avatars/male/2.jpg",
      ],
      middle: [
        "https://xsgames.co/randomusers/assets/avatars/male/62.jpg",
        "https://xsgames.co/randomusers/assets/avatars/male/69.jpg",
        "https://xsgames.co/randomusers/assets/avatars/male/4.jpg",
        "https://xsgames.co/randomusers/assets/avatars/male/11.jpg",
      ],
      senior: [
        "https://xsgames.co/randomusers/assets/avatars/male/64.jpg",
        "https://xsgames.co/randomusers/assets/avatars/male/71.jpg",
        "https://xsgames.co/randomusers/assets/avatars/male/6.jpg",
        "https://xsgames.co/randomusers/assets/avatars/male/13.jpg",
      ],
    },
    african_american: {
      young: [
        "https://xsgames.co/randomusers/assets/avatars/male/7.jpg",
        "https://xsgames.co/randomusers/assets/avatars/male/14.jpg",
        "https://xsgames.co/randomusers/assets/avatars/male/21.jpg",
        "https://xsgames.co/randomusers/assets/avatars/male/28.jpg",
      ],
      middle: [
        "https://xsgames.co/randomusers/assets/avatars/male/9.jpg",
        "https://xsgames.co/randomusers/assets/avatars/male/16.jpg",
        "https://xsgames.co/randomusers/assets/avatars/male/23.jpg",
        "https://xsgames.co/randomusers/assets/avatars/male/31.jpg",
      ],
      senior: [
        "https://xsgames.co/randomusers/assets/avatars/male/11.jpg",
        "https://xsgames.co/randomusers/assets/avatars/male/18.jpg",
        "https://xsgames.co/randomusers/assets/avatars/male/25.jpg",
        "https://xsgames.co/randomusers/assets/avatars/male/33.jpg",
      ],
    },
    south_asian: {
      young: [
        "https://xsgames.co/randomusers/assets/avatars/male/35.jpg",
        "https://xsgames.co/randomusers/assets/avatars/male/42.jpg",
        "https://xsgames.co/randomusers/assets/avatars/male/49.jpg",
        "https://xsgames.co/randomusers/assets/avatars/male/56.jpg",
      ],
      middle: [
        "https://xsgames.co/randomusers/assets/avatars/male/36.jpg",
        "https://xsgames.co/randomusers/assets/avatars/male/43.jpg",
        "https://xsgames.co/randomusers/assets/avatars/male/50.jpg",
        "https://xsgames.co/randomusers/assets/avatars/male/57.jpg",
      ],
      senior: [
        "https://xsgames.co/randomusers/assets/avatars/male/38.jpg",
        "https://xsgames.co/randomusers/assets/avatars/male/45.jpg",
        "https://xsgames.co/randomusers/assets/avatars/male/52.jpg",
        "https://xsgames.co/randomusers/assets/avatars/male/59.jpg",
      ],
    },
    middle_eastern: {
      young: [
        "https://xsgames.co/randomusers/assets/avatars/male/40.jpg",
        "https://xsgames.co/randomusers/assets/avatars/male/47.jpg",
        "https://xsgames.co/randomusers/assets/avatars/male/54.jpg",
        "https://xsgames.co/randomusers/assets/avatars/male/61.jpg",
      ],
      middle: [
        "https://xsgames.co/randomusers/assets/avatars/male/63.jpg",
        "https://xsgames.co/randomusers/assets/avatars/male/65.jpg",
        "https://xsgames.co/randomusers/assets/avatars/male/68.jpg",
        "https://xsgames.co/randomusers/assets/avatars/male/70.jpg",
      ],
      senior: [
        "https://xsgames.co/randomusers/assets/avatars/male/66.jpg",
        "https://xsgames.co/randomusers/assets/avatars/male/72.jpg",
        "https://xsgames.co/randomusers/assets/avatars/male/73.jpg",
        "https://xsgames.co/randomusers/assets/avatars/male/75.jpg",
      ],
    },
  },
  female: {
    caucasian: {
      young: [
        "https://xsgames.co/randomusers/assets/avatars/female/1.jpg",
        "https://xsgames.co/randomusers/assets/avatars/female/8.jpg",
        "https://xsgames.co/randomusers/assets/avatars/female/15.jpg",
        "https://xsgames.co/randomusers/assets/avatars/female/22.jpg",
      ],
      middle: [
        "https://xsgames.co/randomusers/assets/avatars/female/3.jpg",
        "https://xsgames.co/randomusers/assets/avatars/female/10.jpg",
        "https://xsgames.co/randomusers/assets/avatars/female/17.jpg",
        "https://xsgames.co/randomusers/assets/avatars/female/24.jpg",
      ],
      senior: [
        "https://xsgames.co/randomusers/assets/avatars/female/5.jpg",
        "https://xsgames.co/randomusers/assets/avatars/female/12.jpg",
        "https://xsgames.co/randomusers/assets/avatars/female/19.jpg",
        "https://xsgames.co/randomusers/assets/avatars/female/26.jpg",
      ],
    },
    asian: {
      young: [
        "https://xsgames.co/randomusers/assets/avatars/female/30.jpg",
        "https://xsgames.co/randomusers/assets/avatars/female/37.jpg",
        "https://xsgames.co/randomusers/assets/avatars/female/44.jpg",
        "https://xsgames.co/randomusers/assets/avatars/female/51.jpg",
      ],
      middle: [
        "https://xsgames.co/randomusers/assets/avatars/female/32.jpg",
        "https://xsgames.co/randomusers/assets/avatars/female/39.jpg",
        "https://xsgames.co/randomusers/assets/avatars/female/46.jpg",
        "https://xsgames.co/randomusers/assets/avatars/female/53.jpg",
      ],
      senior: [
        "https://xsgames.co/randomusers/assets/avatars/female/34.jpg",
        "https://xsgames.co/randomusers/assets/avatars/female/41.jpg",
        "https://xsgames.co/randomusers/assets/avatars/female/48.jpg",
        "https://xsgames.co/randomusers/assets/avatars/female/55.jpg",
      ],
    },
    hispanic: {
      young: [
        "https://xsgames.co/randomusers/assets/avatars/female/60.jpg",
        "https://xsgames.co/randomusers/assets/avatars/female/67.jpg",
        "https://xsgames.co/randomusers/assets/avatars/female/74.jpg",
        "https://xsgames.co/randomusers/assets/avatars/female/2.jpg",
      ],
      middle: [
        "https://xsgames.co/randomusers/assets/avatars/female/62.jpg",
        "https://xsgames.co/randomusers/assets/avatars/female/69.jpg",
        "https://xsgames.co/randomusers/assets/avatars/female/4.jpg",
        "https://xsgames.co/randomusers/assets/avatars/female/11.jpg",
      ],
      senior: [
        "https://xsgames.co/randomusers/assets/avatars/female/64.jpg",
        "https://xsgames.co/randomusers/assets/avatars/female/71.jpg",
        "https://xsgames.co/randomusers/assets/avatars/female/6.jpg",
        "https://xsgames.co/randomusers/assets/avatars/female/13.jpg",
      ],
    },
    african_american: {
      young: [
        "https://xsgames.co/randomusers/assets/avatars/female/7.jpg",
        "https://xsgames.co/randomusers/assets/avatars/female/14.jpg",
        "https://xsgames.co/randomusers/assets/avatars/female/21.jpg",
        "https://xsgames.co/randomusers/assets/avatars/female/28.jpg",
      ],
      middle: [
        "https://xsgames.co/randomusers/assets/avatars/female/9.jpg",
        "https://xsgames.co/randomusers/assets/avatars/female/16.jpg",
        "https://xsgames.co/randomusers/assets/avatars/female/23.jpg",
        "https://xsgames.co/randomusers/assets/avatars/female/31.jpg",
      ],
      senior: [
        "https://xsgames.co/randomusers/assets/avatars/female/11.jpg",
        "https://xsgames.co/randomusers/assets/avatars/female/18.jpg",
        "https://xsgames.co/randomusers/assets/avatars/female/25.jpg",
        "https://xsgames.co/randomusers/assets/avatars/female/33.jpg",
      ],
    },
    south_asian: {
      young: [
        "https://xsgames.co/randomusers/assets/avatars/female/35.jpg",
        "https://xsgames.co/randomusers/assets/avatars/female/42.jpg",
        "https://xsgames.co/randomusers/assets/avatars/female/49.jpg",
        "https://xsgames.co/randomusers/assets/avatars/female/56.jpg",
      ],
      middle: [
        "https://xsgames.co/randomusers/assets/avatars/female/36.jpg",
        "https://xsgames.co/randomusers/assets/avatars/female/43.jpg",
        "https://xsgames.co/randomusers/assets/avatars/female/50.jpg",
        "https://xsgames.co/randomusers/assets/avatars/female/57.jpg",
      ],
      senior: [
        "https://xsgames.co/randomusers/assets/avatars/female/38.jpg",
        "https://xsgames.co/randomusers/assets/avatars/female/45.jpg",
        "https://xsgames.co/randomusers/assets/avatars/female/52.jpg",
        "https://xsgames.co/randomusers/assets/avatars/female/59.jpg",
      ],
    },
    middle_eastern: {
      young: [
        "https://xsgames.co/randomusers/assets/avatars/female/40.jpg",
        "https://xsgames.co/randomusers/assets/avatars/female/47.jpg",
        "https://xsgames.co/randomusers/assets/avatars/female/54.jpg",
        "https://xsgames.co/randomusers/assets/avatars/female/61.jpg",
      ],
      middle: [
        "https://xsgames.co/randomusers/assets/avatars/female/63.jpg",
        "https://xsgames.co/randomusers/assets/avatars/female/65.jpg",
        "https://xsgames.co/randomusers/assets/avatars/female/68.jpg",
        "https://xsgames.co/randomusers/assets/avatars/female/70.jpg",
      ],
      senior: [
        "https://xsgames.co/randomusers/assets/avatars/female/66.jpg",
        "https://xsgames.co/randomusers/assets/avatars/female/72.jpg",
        "https://xsgames.co/randomusers/assets/avatars/female/73.jpg",
        "https://xsgames.co/randomusers/assets/avatars/female/75.jpg",
      ],
    },
  },
};

// Name-based ethnicity inference
const ETHNICITY_BY_LAST_NAME: Record<string, Ethnicity> = {
  // Asian (East Asian)
  Chen: "asian",
  Kim: "asian",
  Lee: "asian",
  Wong: "asian",
  Nguyen: "asian",
  Tanaka: "asian",
  Yamamoto: "asian",
  Suzuki: "asian",
  Park: "asian",
  Choi: "asian",
  Wang: "asian",
  Zhang: "asian",
  Liu: "asian",
  Huang: "asian",
  Lin: "asian",
  Yang: "asian",
  Wu: "asian",
  Zhou: "asian",
  Xu: "asian",
  Sun: "asian",

  // Hispanic/Latino
  Rodriguez: "hispanic",
  Martinez: "hispanic",
  Garcia: "hispanic",
  Lopez: "hispanic",
  Hernandez: "hispanic",
  Gonzalez: "hispanic",
  Flores: "hispanic",
  Perez: "hispanic",
  Sanchez: "hispanic",
  Ramirez: "hispanic",
  Torres: "hispanic",
  Rivera: "hispanic",
  Gomez: "hispanic",
  Diaz: "hispanic",
  Reyes: "hispanic",
  Morales: "hispanic",
  Cruz: "hispanic",
  Ortiz: "hispanic",
  Gutierrez: "hispanic",
  Chavez: "hispanic",

  // South Asian
  Patel: "south_asian",
  Shah: "south_asian",
  Kumar: "south_asian",
  Singh: "south_asian",
  Sharma: "south_asian",
  Gupta: "south_asian",
  Reddy: "south_asian",
  Rao: "south_asian",
  Nair: "south_asian",
  Iyer: "south_asian",
  Khan: "south_asian",
  Das: "south_asian",
  Joshi: "south_asian",
  Kapoor: "south_asian",
  Mehta: "south_asian",
  Verma: "south_asian",

  // Middle Eastern
  Ahmed: "middle_eastern",
  Hassan: "middle_eastern",
  Ali: "middle_eastern",
  Mohammed: "middle_eastern",
  Ibrahim: "middle_eastern",
  Khalil: "middle_eastern",
  Mahmoud: "middle_eastern",
  Abbas: "middle_eastern",
  Youssef: "middle_eastern",
  Nasser: "middle_eastern",
  Said: "middle_eastern",
  Omar: "middle_eastern",

  // African American (common surnames - defaulting to african_american for diversity)
  Washington: "african_american",
  Jefferson: "african_american",
  Jackson: "african_american",
  Freeman: "african_american",
  Banks: "african_american",
  Brooks: "african_american",

  // Default Caucasian surnames
  Johnson: "caucasian",
  Smith: "caucasian",
  Williams: "caucasian",
  Brown: "caucasian",
  Jones: "caucasian",
  Davis: "caucasian",
  Miller: "caucasian",
  Wilson: "caucasian",
  Moore: "caucasian",
  Taylor: "caucasian",
  Anderson: "caucasian",
  Thomas: "caucasian",
  White: "caucasian",
  Harris: "caucasian",
  Martin: "caucasian",
  Thompson: "caucasian",
  Robinson: "caucasian",
  Clark: "caucasian",
  Lewis: "caucasian",
  Walker: "caucasian",
  Hall: "caucasian",
  Allen: "caucasian",
  Young: "caucasian",
  King: "caucasian",
  Wright: "caucasian",
  Scott: "caucasian",
  Green: "caucasian",
  Baker: "caucasian",
  Adams: "caucasian",
  Nelson: "caucasian",
  Hill: "caucasian",
  Campbell: "caucasian",
  Mitchell: "caucasian",
  Roberts: "caucasian",
  Carter: "caucasian",
  Phillips: "caucasian",
  Evans: "caucasian",
  Turner: "caucasian",
  Collins: "caucasian",
  Edwards: "caucasian",
  Parker: "caucasian",
  Foster: "caucasian",
  Gray: "caucasian",
  Hughes: "caucasian",
  James: "caucasian",
  Jenkins: "caucasian",
  Kelly: "caucasian",
  Long: "caucasian",
  Morris: "caucasian",
  Murphy: "caucasian",
};

// Calculate age from date of birth
function calculateAge(dateOfBirth: string): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

// Determine age range category
function getAgeRange(age: number): AgeRange {
  if (age < 36) return "young";
  if (age < 56) return "middle";
  return "senior";
}

// Infer ethnicity from last name (defaults to caucasian if unknown)
function inferEthnicity(lastName: string): Ethnicity {
  return ETHNICITY_BY_LAST_NAME[lastName] || "caucasian";
}

// Track used avatars to avoid duplicates
const usedAvatars = new Set<string>();

// Get demographically-appropriate avatar
function getDemographicAvatar(
  gender: "M" | "F" | "Non-binary",
  dateOfBirth: string,
  lastName: string,
  patientId: string
): string {
  const genderKey: Gender = gender === "M" ? "male" : "female";
  const age = calculateAge(dateOfBirth);
  const ageRange = getAgeRange(age);
  const ethnicity = inferEthnicity(lastName);

  const avatarOptions = AVATAR_DATABASE[genderKey][ethnicity][ageRange];

  // Find an unused avatar, or use hash-based selection if all used
  let selectedAvatar: string | undefined;
  for (const avatar of avatarOptions) {
    if (!usedAvatars.has(avatar)) {
      selectedAvatar = avatar;
      usedAvatars.add(avatar);
      break;
    }
  }

  // If all avatars in category are used, use deterministic selection based on patient ID
  if (!selectedAvatar) {
    const hash = patientId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    selectedAvatar = avatarOptions[hash % avatarOptions.length]!;
  }

  return selectedAvatar;
}

// Generate diverse, realistic patient data
export const SYNTHETIC_PATIENTS: SyntheticPatient[] = [
  // HIGH PRIORITY PATIENTS (will surface as urgent actions)
  {
    // Sarah Johnson: Female, 40yo (middle-aged), Caucasian
    id: "p001",
    client_id: "10001",
    first_name: "Sarah",
    last_name: "Johnson",
    date_of_birth: "1985-03-15",
    gender: "F",
    email: "sarah.johnson@email.com",
    phone_mobile: "(412) 555-0101",
    address_street: "245 Cedar Lane",
    address_city: "Pittsburgh",
    address_state: "PA",
    address_zip: "15228",
    insurance_provider: "Blue Cross Blue Shield",
    insurance_member_id: "BCB789456123",
    primary_diagnosis_code: "F41.1",
    primary_diagnosis_name: "Generalized Anxiety Disorder",
    secondary_diagnosis_code: "F32.1",
    date_created: "2024-06-15",
    last_appointment: "2026-01-28",
    status: "Active",
    provider: "Dr. Demo",
    avatar_url: "https://xsgames.co/randomusers/assets/avatars/female/3.jpg", // Caucasian middle-aged female
    risk_level: "medium",
    treatment_start_date: "2024-06-15",
    medications: ["Sertraline 50mg"],
  },
  {
    // Michael Chen: Male, 33yo (young), Asian
    id: "p002",
    client_id: "10002",
    first_name: "Michael",
    last_name: "Chen",
    date_of_birth: "1992-07-22",
    gender: "M",
    email: "michael.chen@email.com",
    phone_mobile: "(412) 555-0102",
    address_street: "892 Maple Drive",
    address_city: "Pittsburgh",
    address_state: "PA",
    address_zip: "15243",
    insurance_provider: "Aetna",
    insurance_member_id: "AET456789012",
    primary_diagnosis_code: "F33.1",
    primary_diagnosis_name: "Major Depressive Disorder, Recurrent, Moderate",
    date_created: "2024-03-01",
    last_appointment: "2026-01-21",
    status: "Active",
    provider: "Dr. Demo",
    avatar_url: "https://xsgames.co/randomusers/assets/avatars/male/30.jpg", // Asian young male
    risk_level: "high",
    treatment_start_date: "2024-03-01",
    medications: ["Bupropion 150mg", "Trazodone 50mg PRN"],
  },
  {
    // Maria Rodriguez: Female, 47yo (middle-aged), Hispanic
    id: "p003",
    client_id: "10003",
    first_name: "Maria",
    last_name: "Rodriguez",
    date_of_birth: "1978-11-08",
    gender: "F",
    email: "maria.rodriguez@email.com",
    phone_mobile: "(412) 555-0103",
    address_street: "1456 Oak Street",
    address_city: "Mt. Lebanon",
    address_state: "PA",
    address_zip: "15228",
    insurance_provider: "UnitedHealthcare",
    insurance_member_id: "UHC321654987",
    primary_diagnosis_code: "F43.10",
    primary_diagnosis_name: "Post-Traumatic Stress Disorder",
    date_created: "2023-09-10",
    last_appointment: "2026-01-30",
    status: "Active",
    provider: "Dr. Demo",
    avatar_url: "https://xsgames.co/randomusers/assets/avatars/female/62.jpg", // Hispanic middle-aged female
    risk_level: "high",
    treatment_start_date: "2023-09-10",
    medications: ["Prazosin 2mg", "Sertraline 100mg"],
  },
  {
    // James Williams: Male, 35yo (young), Caucasian
    id: "p004",
    client_id: "10004",
    first_name: "James",
    last_name: "Williams",
    date_of_birth: "1990-04-25",
    gender: "M",
    email: "james.williams@email.com",
    phone_mobile: "(412) 555-0104",
    address_street: "3021 Pine Avenue",
    address_city: "Pittsburgh",
    address_state: "PA",
    address_zip: "15216",
    insurance_provider: "Cigna",
    insurance_member_id: "CIG852963741",
    primary_diagnosis_code: "F40.10",
    primary_diagnosis_name: "Social Anxiety Disorder",
    date_created: "2025-01-05",
    last_appointment: "2026-01-27",
    status: "Active",
    provider: "Dr. Demo",
    avatar_url: "https://xsgames.co/randomusers/assets/avatars/male/1.jpg", // Caucasian young male
    risk_level: "low",
    treatment_start_date: "2025-01-05",
    medications: [],
  },
  {
    // Emily Davis: Female, 37yo (middle-aged), Caucasian
    id: "p005",
    client_id: "10005",
    first_name: "Emily",
    last_name: "Davis",
    date_of_birth: "1988-09-12",
    gender: "F",
    email: "emily.davis@email.com",
    phone_mobile: "(412) 555-0105",
    address_street: "567 Birch Road",
    address_city: "Bethel Park",
    address_state: "PA",
    address_zip: "15102",
    insurance_provider: "Blue Cross Blue Shield",
    insurance_member_id: "BCB159753468",
    primary_diagnosis_code: "F32.0",
    primary_diagnosis_name: "Major Depressive Disorder, Single Episode, Mild",
    date_created: "2025-06-20",
    last_appointment: "2026-01-29",
    status: "Active",
    provider: "Dr. Demo",
    avatar_url: "https://xsgames.co/randomusers/assets/avatars/female/10.jpg", // Caucasian middle-aged female
    risk_level: "low",
    treatment_start_date: "2025-06-20",
    medications: [],
  },
  {
    // David Kim: Male, 30yo (young), Asian
    id: "p006",
    client_id: "10006",
    first_name: "David",
    last_name: "Kim",
    date_of_birth: "1995-02-18",
    gender: "M",
    email: "david.kim@email.com",
    phone_mobile: "(412) 555-0106",
    address_street: "789 Elm Court",
    address_city: "Pittsburgh",
    address_state: "PA",
    address_zip: "15232",
    insurance_provider: "Aetna",
    insurance_member_id: "AET753951852",
    primary_diagnosis_code: "F41.0",
    primary_diagnosis_name: "Panic Disorder",
    date_created: "2024-11-15",
    last_appointment: "2026-01-25",
    status: "Active",
    provider: "Dr. Demo",
    avatar_url: "https://xsgames.co/randomusers/assets/avatars/male/37.jpg", // Asian young male
    risk_level: "medium",
    treatment_start_date: "2024-11-15",
    medications: ["Alprazolam 0.5mg PRN"],
  },
  {
    // Jennifer Martinez: Female, 43yo (middle-aged), Hispanic
    id: "p007",
    client_id: "10007",
    first_name: "Jennifer",
    last_name: "Martinez",
    date_of_birth: "1982-06-30",
    gender: "F",
    email: "jennifer.martinez@email.com",
    phone_mobile: "(412) 555-0107",
    address_street: "234 Walnut Street",
    address_city: "Mt. Lebanon",
    address_state: "PA",
    address_zip: "15228",
    insurance_provider: "Medicare",
    insurance_member_id: "MED147258369",
    primary_diagnosis_code: "F33.0",
    primary_diagnosis_name: "Major Depressive Disorder, Recurrent, Mild",
    date_created: "2023-04-01",
    last_appointment: "2026-01-30",
    status: "Active",
    provider: "Dr. Demo",
    avatar_url: "https://xsgames.co/randomusers/assets/avatars/female/69.jpg", // Hispanic middle-aged female
    risk_level: "low",
    treatment_start_date: "2023-04-01",
    medications: ["Escitalopram 10mg"],
  },
  {
    // Robert Taylor: Male, 50yo (middle-aged), Caucasian
    id: "p008",
    client_id: "10008",
    first_name: "Robert",
    last_name: "Taylor",
    date_of_birth: "1975-12-05",
    gender: "M",
    email: "robert.taylor@email.com",
    phone_mobile: "(412) 555-0108",
    address_street: "456 Spruce Lane",
    address_city: "Pittsburgh",
    address_state: "PA",
    address_zip: "15217",
    insurance_provider: "Self-Pay",
    insurance_member_id: "",
    primary_diagnosis_code: "F10.20",
    primary_diagnosis_name: "Alcohol Use Disorder, Moderate",
    secondary_diagnosis_code: "F32.1",
    date_created: "2024-08-10",
    last_appointment: "2026-01-24",
    status: "Active",
    provider: "Dr. Demo",
    avatar_url: "https://xsgames.co/randomusers/assets/avatars/male/10.jpg", // Caucasian middle-aged male
    risk_level: "high",
    treatment_start_date: "2024-08-10",
    medications: ["Naltrexone 50mg"],
  },
];

// Generate remaining 52 patients programmatically
// Separate male and female names for proper avatar assignment
const maleFirstNames = [
  "Alex",
  "Andrew",
  "Anthony",
  "Benjamin",
  "Brandon",
  "Charles",
  "Christopher",
  "Daniel",
  "Edward",
  "Eric",
  "Frank",
  "Gregory",
  "Henry",
  "Jack",
  "John",
  "Justin",
  "Keith",
  "Kevin",
  "Lawrence",
  "Mark",
  "Matthew",
  "Nathan",
  "Oliver",
  "Paul",
  "Ryan",
  "Steven",
];
const femaleFirstNames = [
  "Amanda",
  "Angela",
  "Ashley",
  "Brittany",
  "Catherine",
  "Christina",
  "Danielle",
  "Diana",
  "Elizabeth",
  "Erica",
  "Grace",
  "Hannah",
  "Isabella",
  "Jessica",
  "Julia",
  "Karen",
  "Kelly",
  "Kimberly",
  "Laura",
  "Linda",
  "Lisa",
  "Margaret",
  "Megan",
  "Michelle",
  "Nancy",
  "Nicole",
  "Patricia",
  "Rachel",
];
// Diverse last names to ensure proper demographic coverage
const lastNames = [
  // Caucasian
  "Anderson",
  "Brown",
  "Clark",
  "Davis",
  "Evans",
  "Hall",
  "Harris",
  "Hill",
  "Johnson",
  "Jones",
  "King",
  "Lewis",
  "Martin",
  "Miller",
  "Mitchell",
  "Moore",
  "Nelson",
  "Parker",
  "Phillips",
  "Roberts",
  "Robinson",
  "Scott",
  "Smith",
  "Thomas",
  "Thompson",
  "Turner",
  "Walker",
  "White",
  "Wilson",
  "Wright",
  "Young",
  // Hispanic
  "Garcia",
  "Lopez",
  "Perez",
  "Flores",
  "Gonzalez",
  "Hernandez",
  "Martinez",
  "Rodriguez",
  "Sanchez",
  "Torres",
  "Rivera",
  "Ramirez",
  // Asian
  "Chen",
  "Kim",
  "Lee",
  "Nguyen",
  "Park",
  "Wong",
  "Wang",
  "Tanaka",
  "Liu",
  "Yang",
  // South Asian
  "Patel",
  "Shah",
  "Kumar",
  "Singh",
  "Sharma",
  "Gupta",
  // African American
  "Washington",
  "Jackson",
  "Freeman",
  "Banks",
  "Brooks",
  // Middle Eastern
  "Ahmed",
  "Hassan",
  "Ali",
  "Khan",
];
const diagnoses = [
  { code: "F41.1", name: "Generalized Anxiety Disorder" },
  { code: "F32.1", name: "Major Depressive Disorder, Single Episode, Moderate" },
  { code: "F33.1", name: "Major Depressive Disorder, Recurrent, Moderate" },
  { code: "F43.10", name: "Post-Traumatic Stress Disorder" },
  { code: "F40.10", name: "Social Anxiety Disorder" },
  { code: "F41.0", name: "Panic Disorder" },
  { code: "F34.1", name: "Dysthymic Disorder" },
  { code: "F42.2", name: "Obsessive-Compulsive Disorder" },
  { code: "F50.00", name: "Anorexia Nervosa" },
  { code: "F31.81", name: "Bipolar II Disorder" },
];
const insurers = [
  "Blue Cross Blue Shield",
  "Aetna",
  "UnitedHealthcare",
  "Cigna",
  "Medicare",
  "Medicaid",
  "Self-Pay",
  "Highmark",
  "UPMC Health Plan",
];

function generatePatient(index: number): SyntheticPatient {
  // Alternate between male and female patients
  const isMale = index % 2 === 0;
  const firstName = isMale
    ? maleFirstNames[Math.floor(index / 2) % maleFirstNames.length]!
    : femaleFirstNames[Math.floor(index / 2) % femaleFirstNames.length]!;
  const lastName = lastNames[index % lastNames.length]!;
  const diagnosis = diagnoses[index % diagnoses.length]!;
  const insurer = insurers[index % insurers.length]!;
  const birthYear = 1960 + (index % 40);
  const birthMonth = String((index % 12) + 1).padStart(2, "0");
  const birthDay = String((index % 28) + 1).padStart(2, "0");
  const dateOfBirth = `${birthYear}-${birthMonth}-${birthDay}`;
  const patientId = `p${String(index + 9).padStart(3, "0")}`;
  const gender: "M" | "F" = isMale ? "M" : "F";

  // Get demographically-appropriate avatar based on gender, age, and ethnicity
  const avatarUrl = getDemographicAvatar(gender, dateOfBirth, lastName, patientId);

  return {
    id: patientId,
    client_id: String(10000 + index + 8),
    first_name: firstName,
    last_name: lastName,
    date_of_birth: dateOfBirth,
    gender: gender,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`,
    phone_mobile: `(412) 555-${String(index + 109).padStart(4, "0")}`,
    address_street: `${100 + index * 7} ${["Oak", "Maple", "Cedar", "Pine", "Elm", "Birch"][index % 6]!} ${["St", "Ave", "Rd", "Ln", "Dr"][index % 5]!}`,
    address_city: ["Pittsburgh", "Mt. Lebanon", "Bethel Park", "Upper St. Clair", "South Hills"][
      index % 5
    ]!,
    address_state: "PA",
    address_zip: ["15228", "15216", "15232", "15243", "15102"][index % 5]!,
    insurance_provider: insurer,
    insurance_member_id:
      insurer === "Self-Pay"
        ? ""
        : `${insurer.substring(0, 3).toUpperCase()}${String(Math.floor(Math.random() * 999999999)).padStart(9, "0")}`,
    primary_diagnosis_code: diagnosis.code,
    primary_diagnosis_name: diagnosis.name,
    date_created: `202${3 + (index % 3)}-${String((index % 12) + 1).padStart(2, "0")}-${String((index % 28) + 1).padStart(2, "0")}`,
    last_appointment: "2026-01-" + String(20 + (index % 10)).padStart(2, "0"),
    status: index % 12 === 0 ? "Inactive" : "Active",
    provider: "Dr. Demo",
    avatar_url: avatarUrl,
    risk_level: index % 5 === 0 ? "high" : index % 3 === 0 ? "medium" : "low",
    treatment_start_date: `202${3 + (index % 3)}-${String((index % 12) + 1).padStart(2, "0")}-${String((index % 28) + 1).padStart(2, "0")}`,
    medications: index % 3 === 0 ? ["Sertraline 50mg"] : index % 4 === 0 ? ["Bupropion 150mg"] : [],
  };
}

// Add remaining patients
for (let i = 0; i < 52; i++) {
  SYNTHETIC_PATIENTS.push(generatePatient(i));
}

export default SYNTHETIC_PATIENTS;
