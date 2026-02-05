// Clinical Trial Data — Alzheimer's & Parkinson's Research
// Source: Integrated from Medical Progress Dashboard + ClinicalTrials.gov patterns

export const clinicalData = {
  alzheimers: {
    name: "Alzheimer's Disease",
    description: "Progressive neurodegenerative disease affecting memory and cognition",
    approved: [
      {
        id: "ad-approved-001",
        name: "Lecanemab",
        company: "Eisai / Biogen",
        phase: "Approved",
        phaseNum: 4,
        type: "biologic",
        purpose: "disease-modifying",
        status: "approved",
        enrollment: 1796,
        indication: "Early Alzheimer's Disease",
        mechanism: "Anti-amyloid monoclonal antibody",
        ukApproved: true,
        fdaApproved: true,
        launched: "2023-01"
      },
      {
        id: "ad-approved-002",
        name: "Donanemab",
        company: "Eli Lilly",
        phase: "Approved",
        phaseNum: 4,
        type: "biologic",
        purpose: "disease-modifying",
        status: "approved",
        enrollment: 1736,
        indication: "Early Symptomatic Alzheimer's",
        mechanism: "Anti-amyloid monoclonal antibody",
        ukApproved: false,
        ukExpected: "2025-Q2",
        fdaApproved: true,
        launched: "2024-07"
      }
    ],
    phase3: [
      {
        id: "ad-p3-001",
        name: "Remternetug",
        company: "Eli Lilly",
        phase: "Phase 3",
        phaseNum: 3,
        type: "biologic",
        purpose: "disease-modifying",
        status: "active",
        enrollment: 1200,
        enrollmentTarget: 1200,
        indication: "Early Alzheimer's Disease",
        mechanism: "Anti-amyloid monoclonal antibody (next-gen)",
        primaryEndpoint: "Amyloid clearance at 12 months",
        locations: 40,
        started: "2022-08",
        estimatedCompletion: "2028-06",
        description: "Next-generation anti-amyloid with enhanced brain penetration"
      },
      {
        id: "ad-p3-002",
        name: "Trontinemab",
        company: "Roche",
        phase: "Phase 3",
        phaseNum: 3,
        type: "biologic",
        purpose: "disease-modifying",
        status: "recruiting",
        enrollment: 2000,
        enrollmentTarget: 2400,
        indication: "Early Alzheimer's Disease",
        mechanism: "Anti-amyloid with brain shuttle technology",
        highlight: true
      },
      {
        id: "ad-p3-003",
        name: "Simufilam",
        company: "Cassava Sciences",
        phase: "Phase 3",
        phaseNum: 3,
        type: "small-molecule",
        purpose: "disease-modifying",
        status: "active",
        enrollment: 1900,
        enrollmentTarget: 1900,
        indication: "Alzheimer's Disease",
        mechanism: "Filamin A modulator"
      }
    ],
    phase2: [
      {
        id: "ad-p2-001",
        name: "AL002",
        company: "Alector",
        phase: "Phase 2",
        phaseNum: 2,
        type: "biologic",
        purpose: "disease-modifying",
        status: "active",
        enrollment: 325,
        indication: "Alzheimer's with TREM2 variant",
        mechanism: "TREM2 agonist monoclonal antibody",
        primaryEndpoint: "CSF biomarker changes at 48 weeks",
        description: "Targets microglial receptor for immune response modulation"
      },
      {
        id: "ad-p2-002",
        name: "SIM0408",
        company: "Simcere",
        phase: "Phase 2",
        phaseNum: 2,
        type: "small-molecule",
        purpose: "symptomatic",
        status: "active",
        enrollment: 240,
        indication: "Mild to Moderate Alzheimer's",
        mechanism: "QPCT inhibitor"
      },
      {
        id: "ad-p2-003",
        name: "BIIB080",
        company: "Biogen",
        phase: "Phase 2",
        phaseNum: 2,
        type: "biologic",
        purpose: "disease-modifying",
        status: "active",
        enrollment: 420,
        mechanism: "Tau ASO (antisense oligonucleotide)",
        highlight: true
      },
      {
        id: "ad-p2-004",
        name: "Cognigum",
        company: "Cognition Therapeutics",
        phase: "Phase 2",
        phaseNum: 2,
        type: "small-molecule",
        purpose: "disease-modifying",
        status: "active",
        enrollment: 150,
        mechanism: "Sigma-2 receptor antagonist"
      },
      {
        id: "ad-p2-005",
        name: "Neflamapimod",
        company: "EIP Pharma",
        phase: "Phase 2",
        phaseNum: 2,
        type: "small-molecule",
        purpose: "disease-modifying",
        status: "recruiting",
        enrollment: 280,
        mechanism: "p38 MAPK inhibitor"
      },
      {
        id: "ad-p2-006",
        name: "Anavex 2-73",
        company: "Anavex",
        phase: "Phase 2",
        phaseNum: 2,
        type: "small-molecule",
        purpose: "disease-modifying",
        status: "active",
        enrollment: 500,
        mechanism: "Sigma-1 receptor agonist"
      }
    ],
    phase1: [
      {
        id: "ad-p1-001",
        name: "AL101",
        company: "Alector",
        phase: "Phase 1",
        phaseNum: 1,
        type: "biologic",
        purpose: "disease-modifying",
        status: "active",
        enrollment: 72,
        indication: "Alzheimer's Disease",
        mechanism: "Anti-MS4A4A antibody"
      },
      {
        id: "ad-p1-002",
        name: "CT1812",
        company: "Cognition Therapeutics",
        phase: "Phase 1",
        phaseNum: 1,
        type: "small-molecule",
        purpose: "disease-modifying",
        status: "active",
        enrollment: 48,
        mechanism: "Sigma-2 receptor modulator"
      },
      {
        id: "ad-p1-003",
        name: "E2814",
        company: "Eisai",
        phase: "Phase 1",
        phaseNum: 1,
        type: "biologic",
        purpose: "disease-modifying",
        status: "recruiting",
        enrollment: 80,
        mechanism: "Anti-tau antibody"
      },
      {
        id: "ad-p1-004",
        name: "ARV-102",
        company: "Arvinas",
        phase: "Phase 1",
        phaseNum: 1,
        type: "small-molecule",
        purpose: "disease-modifying",
        status: "recruiting",
        enrollment: 24,
        mechanism: "Tau PROTAC (protein degrader)"
      }
    ],
    updates: [
      {
        id: "upd-ad-001",
        drugId: "ad-approved-001",
        drugName: "Lecanemab",
        type: "results",
        date: "2025-01-28",
        description: "Full 18-month Phase 3 results published in NEJM showing 27% slowing of cognitive decline"
      },
      {
        id: "upd-ad-002",
        drugId: "ad-approved-002",
        drugName: "Donanemab",
        type: "advance",
        date: "2025-01-15",
        description: "Approved in EU. UK MHRA decision expected Q2 2025"
      },
      {
        id: "upd-ad-003",
        drugId: "ad-p2-001",
        drugName: "AL002",
        type: "enrolled",
        date: "2024-12-15",
        description: "INVOKE-2 Phase 2 trial reaches 50% enrollment milestone"
      }
    ]
  },
  
  parkinsons: {
    name: "Parkinson's Disease",
    description: "Movement disorder affecting dopamine-producing neurons",
    approved: [],
    phase3: [
      {
        id: "pd-p3-001",
        name: "Praliciguat",
        company: "Cyclerion",
        phase: "Phase 3",
        phaseNum: 3,
        type: "small-molecule",
        purpose: "symptomatic",
        status: "active",
        enrollment: 450,
        indication: "Parkinson's Disease",
        mechanism: "sGC stimulator targeting mitochondrial function"
      },
      {
        id: "pd-p3-002",
        name: "Buntanetap",
        company: "Annovis Bio",
        phase: "Phase 3",
        phaseNum: 3,
        type: "small-molecule",
        purpose: "disease-modifying",
        status: "active",
        enrollment: 300,
        indication: "Early Parkinson's Disease",
        mechanism: "Translation inhibitor reducing neurotoxic proteins",
        highlight: true
      },
      {
        id: "pd-p3-003",
        name: "Prasinezumab",
        company: "Roche",
        phase: "Phase 3",
        phaseNum: 3,
        type: "biologic",
        purpose: "disease-modifying",
        status: "recruiting",
        enrollment: 586,
        enrollmentTarget: 800,
        mechanism: "Anti-alpha-synuclein antibody",
        highlight: true
      }
    ],
    phase2: [
      {
        id: "pd-p2-001",
        name: "NBIb-1817",
        company: "Neurocrine / Voyager",
        phase: "Phase 2",
        phaseNum: 2,
        type: "biologic",
        purpose: "disease-modifying",
        status: "active",
        enrollment: 85,
        mechanism: "AAV5-GAD gene therapy",
        description: "Gene therapy delivering GAD enzyme to subthalamic nucleus"
      },
      {
        id: "pd-p2-002",
        name: "AMB-101",
        company: "Ambral",
        phase: "Phase 2",
        phaseNum: 2,
        type: "small-molecule",
        purpose: "disease-modifying",
        status: "active",
        enrollment: 160,
        mechanism: "Abl kinase inhibitor targeting alpha-synuclein aggregation"
      },
      {
        id: "pd-p2-003",
        name: "Lixisenatide",
        company: "Sanofi",
        phase: "Phase 2",
        phaseNum: 2,
        type: "small-molecule",
        purpose: "disease-modifying",
        status: "completed",
        enrollment: 156,
        mechanism: "GLP-1 receptor agonist (repurposed diabetes drug)",
        highlight: true
      },
      {
        id: "pd-p2-004",
        name: "Tavapadon",
        company: "Cerevel / AbbVie",
        phase: "Phase 2",
        phaseNum: 2,
        type: "small-molecule",
        purpose: "symptomatic",
        status: "active",
        enrollment: 700,
        mechanism: "D1/D5 partial agonist for motor symptoms"
      },
      {
        id: "pd-p2-005",
        name: "Ambroxol",
        company: "Academic",
        phase: "Phase 2",
        phaseNum: 2,
        type: "small-molecule",
        purpose: "disease-modifying",
        status: "recruiting",
        enrollment: 120,
        mechanism: "GBA activator"
      }
    ],
    phase1: [
      {
        id: "pd-p1-001",
        name: "PD01A",
        company: "Affiris",
        phase: "Phase 1",
        phaseNum: 1,
        type: "biologic",
        purpose: "disease-modifying",
        status: "active",
        enrollment: 24,
        mechanism: "Alpha-synuclein vaccine (active immunotherapy)"
      },
      {
        id: "pd-p1-002",
        name: "BEY1107",
        company: "Beyontra",
        phase: "Phase 1",
        phaseNum: 1,
        type: "small-molecule",
        purpose: "disease-modifying",
        status: "active",
        enrollment: 56,
        mechanism: "LRRK2 inhibitor"
      },
      {
        id: "pd-p1-003",
        name: "AAV2-GDNF",
        company: "Askbio",
        phase: "Phase 1",
        phaseNum: 1,
        type: "biologic",
        purpose: "disease-modifying",
        status: "recruiting",
        enrollment: 25,
        mechanism: "Gene therapy delivering GDNF"
      },
      {
        id: "pd-p1-004",
        name: "iPSC-DA",
        company: "BlueRock / Kyoto",
        phase: "Phase 1",
        phaseNum: 1,
        type: "biologic",
        purpose: "disease-modifying",
        status: "recruiting",
        enrollment: 12,
        mechanism: "Cell replacement therapy (dopamine neurons)"
      }
    ],
    updates: [
      {
        id: "upd-pd-001",
        drugId: "pd-p3-002",
        drugName: "Buntanetap",
        type: "advance",
        date: "2024-12-28",
        description: "Phase 3 trial initiated with FDA Special Protocol Assessment agreement"
      },
      {
        id: "upd-pd-002",
        drugId: "pd-p2-003",
        drugName: "Lixisenatide",
        type: "results",
        date: "2024-11-15",
        description: "Phase 2 data shows motor benefit sustained 12 months after treatment cessation"
      },
      {
        id: "upd-pd-003",
        drugId: "pd-p1-001",
        drugName: "PD01A",
        type: "enrolled",
        date: "2024-12-10",
        description: "AFFiRiS alpha-synuclein vaccine completes Phase 1 enrollment"
      }
    ]
  }
};

// Helper functions
export function getEnrollmentSize(enrollment) {
  if (!enrollment) return 0.5;
  if (enrollment < 50) return 0.6;
  if (enrollment < 150) return 0.8;
  if (enrollment < 500) return 1.0;
  if (enrollment < 1000) return 1.3;
  return 1.6;
}

export function formatEnrollment(num) {
  if (!num) return "N/A";
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
  return num.toString();
}

export function getStatusColor(status) {
  const colors = {
    active: 0x22c55e,
    recruiting: 0x3b82f6,
    completed: 0x737373,
    terminated: 0xef4444,
    approved: 0xc9b896
  };
  return colors[status] || 0x737373;
}

export function getDiseaseColor(disease) {
  return disease === 'alzheimers' ? 0x60a5fa : 0xf472b6;
}

export function getPhaseLabel(phaseNum) {
  const labels = {
    1: "Phase 1",
    2: "Phase 2", 
    3: "Phase 3",
    4: "Approved"
  };
  return labels[phaseNum] || phaseNum;
}
