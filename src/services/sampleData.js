// Realistic sample civic issues for CommunityPulse AI prototype demonstration
export const INITIAL_SAMPLE_REPORTS = [
  {
    id: "CP-801",
    title: "Burst Water Main Flooding Commercial Corridor",
    description: "A major underground water pipe has ruptured near the junction. Water is gushing onto the roadway creating 6-inch deep pooling across both traffic lanes and eroding the sidewalk sub-base. Storefront entrances are at risk of water intrusion.",
    locality: "Market Square & 4th Avenue",
    category: "Water Leakage",
    priority: "Critical",
    priorityScore: 92,
    status: "In Progress",
    reportedBy: "Civic Watch - Alex Rivera",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    isSample: true,
    affectedEstimate: "500+ commuters & 12 local businesses",
    imageUrl: "",
    aiAnalysis: {
      source: "Local Heuristics Engine (Verified Baseline)",
      predictedCategory: "Water Leakage",
      priority: "Critical",
      priorityScore: 92,
      department: "Municipal Water & Sewer Authority",
      recommendedAction: "Dispatch emergency isolation crew to close branch valve B-14 immediately; deploy vacuum trucks and traffic diversion barriers.",
      explanation: "Active subterranean pipe rupture with high-volume flow poses imminent risk of roadway collapse (sinkhole formation) and structural basement flooding.",
      safetyConcerns: "Hydroplaning hazard for vehicles; potential electrical conduit submersion; pavement collapse risk.",
      environmentalConcerns: "Loss of hundreds of gallons of treated potable water per minute; sediment runoff into municipal storm drains.",
      urgencyFactors: ["Active rapid flooding", "Main traffic artery blocked", "Property damage in progress"],
      confidence: 0.96
    },
    resolutionNotes: [
      {
        id: "rn-1",
        author: "Chief Dispatcher Miller",
        text: "Emergency valve crew on-site at 09:40. Section valve B-14 isolated. Water flow arrested. Heavy excavator en route for repair trenching.",
        timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString()
      }
    ]
  },
  {
    id: "CP-802",
    title: "Deep Pothole & Road Base Subside Near School Crosswalk",
    description: "Large 10-inch deep pothole with sharp asphalt edges directly in the pedestrian crossing zone used by Lincoln Elementary students. Two vehicles suffered rim damage this morning, and children on bicycles are swerving into oncoming traffic to avoid it.",
    locality: "Maple Street & 8th Lane (School Zone)",
    category: "Road Damage",
    priority: "High",
    priorityScore: 78,
    status: "Under Review",
    reportedBy: "Parent Association - Sarah Jenkins",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(), // 14 hours ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    isSample: true,
    affectedEstimate: "300+ students & daily school bus route",
    imageUrl: "",
    aiAnalysis: {
      source: "Local Heuristics Engine (Verified Baseline)",
      predictedCategory: "Road Damage",
      priority: "High",
      priorityScore: 78,
      department: "Department of Transportation & Public Works",
      recommendedAction: "Place reflective safety drums immediately; schedule same-day cold-mix asphalt patch followed by permanent resurfacing.",
      explanation: "Located within an active school pedestrian crossing zone with documented vehicle damage and child pedestrian diversion hazards.",
      safetyConcerns: "Severe trip hazard for young children; risk of bicycle crashes and vehicular tire blowouts.",
      environmentalConcerns: "Loose asphalt debris washing into curbside bioswales.",
      urgencyFactors: ["Directly in designated school crosswalk", "Documented near-miss incidents", "Subsurface crumbling"],
      confidence: 0.93
    },
    resolutionNotes: [
      {
        id: "rn-2",
        author: "PW Inspector Gomez",
        text: "Site inspected at 07:15. Temporary high-visibility cones deployed. Work order #WO-4482 generated for asphalt hot-patching crew.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString()
      }
    ]
  },
  {
    id: "CP-803",
    title: "Continuous Blackout of 6 Consecutive Streetlights",
    description: "Entire pedestrian pathway connecting North Hill Residential Quad to the Metro Transit Hub has been in pitch darkness for 3 nights. Several evening transit riders have reported feeling unsafe, and uneven roots on the unlit sidewalk cause frequent trips.",
    locality: "North Hill Greenway / Transit Walkway",
    category: "Streetlight",
    priority: "High",
    priorityScore: 74,
    status: "Reported",
    reportedBy: "Resident - Marcus Vance",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(),
    isSample: true,
    affectedEstimate: "850+ evening transit commuters",
    imageUrl: "",
    aiAnalysis: {
      source: "Local Heuristics Engine (Verified Baseline)",
      predictedCategory: "Streetlight",
      priority: "High",
      priorityScore: 74,
      department: "Bureau of Street Lighting & Electrical Utilities",
      recommendedAction: "Test central luminaire breaker panel LP-04; inspect circuit wiring for subterranean short circuit or photo-controller failure.",
      explanation: "Cluster failure of 6 consecutive fixtures on a primary transit pedestrian connector increases public safety vulnerability and fall risks.",
      safetyConcerns: "Severe night-time visibility deficit, crime deterrence reduction, trip/fall hazard on unlit concrete.",
      environmentalConcerns: "Potential faulty ground fault loop or exposed wiring near tree root zone.",
      urgencyFactors: ["Multiple contiguous fixtures out", "Primary transit access corridor", "Duration: 3+ nights"],
      confidence: 0.91
    },
    resolutionNotes: []
  },
  {
    id: "CP-804",
    title: "Illegal Toxic Debris & Chemical Cans Dumped in Storm Basin",
    description: "Approximately two pickup truck loads of construction demolition debris, sheetrock, and multiple rusty unlabeled paint and solvent containers have been illegally dumped into the open creek drainage basin.",
    locality: "Creekside Park / West Storm Basin",
    category: "Pollution",
    priority: "Critical",
    priorityScore: 88,
    status: "Under Review",
    reportedBy: "Parks Volunteer - Dr. Elena Rostova",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    isSample: true,
    affectedEstimate: "Local wildlife habitat & downstream watershed",
    imageUrl: "",
    aiAnalysis: {
      source: "Local Heuristics Engine (Verified Baseline)",
      predictedCategory: "Pollution",
      priority: "Critical",
      priorityScore: 88,
      department: "Environmental Protection & Hazardous Waste Division",
      recommendedAction: "Deploy HAZMAT certified cleanup contractor with containment booms before rain event; notify Environmental Code Enforcement.",
      explanation: "Unlabeled chemical containers adjacent to an active natural drainage channel present imminent danger of downstream soil and aquifer contamination.",
      safetyConcerns: "Chemical vapor inhalation risk; skin contact hazard; fire hazard if volatile solvents are unsealed.",
      environmentalConcerns: "Direct toxic runoff into urban tributary; threat to aquatic organisms and urban wetlands.",
      urgencyFactors: ["Imminent rain forecast could flush chemicals", "Unlabeled solvent containers", "Protected ecological zone"],
      confidence: 0.95
    },
    resolutionNotes: [
      {
        id: "rn-3",
        author: "Officer Chen - Env Compliance",
        text: "Sample taken for lab screening. Warning tape cordoned off perimeter. HAZMAT recovery truck requested for tomorrow morning.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString()
      }
    ]
  },
  {
    id: "CP-805",
    title: "Cracked Concrete Ramp Blocking Wheelchair Access",
    description: "The concrete wheelchair access ramp leading to the Community Health Clinic has fractured and settled unevenly, creating a 3-inch vertical lip that prevents wheelchair and stroller passage. Patients with mobility aids cannot access the front clinic doors.",
    locality: "Eastside Health Clinic Entrance, 12th St",
    category: "Accessibility",
    priority: "Medium",
    priorityScore: 58,
    status: "In Progress",
    reportedBy: "Clinic Administrator - Maya Patel",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    isSample: true,
    affectedEstimate: "80+ daily mobility-assisted visitors",
    imageUrl: "",
    aiAnalysis: {
      source: "Local Heuristics Engine (Verified Baseline)",
      predictedCategory: "Accessibility",
      priority: "Medium",
      priorityScore: 58,
      department: "Facilities & ADA Compliance Services",
      recommendedAction: "Install temporary ADA-compliant modular aluminum threshold ramp; pour polymer-modified concrete leveling mortar.",
      explanation: "Blocks essential ADA-compliant barrier-free entry to a public medical healthcare facility.",
      safetyConcerns: "Wheelchair tip hazard; tripping risk for seniors and visually impaired visitors.",
      environmentalConcerns: "None identified.",
      urgencyFactors: ["Essential healthcare facility entrance", "ADA non-compliance liability"],
      confidence: 0.89
    },
    resolutionNotes: [
      {
        id: "rn-4",
        author: "Facilities Lead Johnson",
        text: "Temporary metal transition plate installed at 11:00. Contractor contracted for weekend masonry repour.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString()
      }
    ]
  },
  {
    id: "CP-806",
    title: "Overflowing Park Bins & Windblown Plastic Litter",
    description: "Three solar compaction trash cans at the central picnic area are completely filled and jammed. Bags of food waste, plastic beverage bottles, and cardboard boxes are spilling across the lawn and attracting urban pests.",
    locality: "Pinegrove Community Park (Picnic Pavilion)",
    category: "Waste Management",
    priority: "Low",
    priorityScore: 32,
    status: "Resolved",
    reportedBy: "Neighborhood Resident - David Kim",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
    isSample: true,
    affectedEstimate: "Park weekend visitors",
    imageUrl: "",
    aiAnalysis: {
      source: "Local Heuristics Engine (Verified Baseline)",
      predictedCategory: "Waste Management",
      priority: "Low",
      priorityScore: 32,
      department: "Department of Sanitation & Urban Beautification",
      recommendedAction: "Dispatch weekend overflow collection route; clear compactors and replace heavy-duty bin liners.",
      explanation: "Routine waste management overflow following weekend community event. Nuisance issue with low physical safety risk.",
      safetyConcerns: "Broken glass risk if bottles shatter; pest attraction.",
      environmentalConcerns: "Wind-dispersed microplastics and paper debris.",
      urgencyFactors: ["Aesthetic nuisance", "Sanitation spill"],
      confidence: 0.94
    },
    resolutionNotes: [
      {
        id: "rn-5",
        author: "Sanitation Route 4 Crew",
        text: "Bins completely emptied, compactor rams cleared, and lawn area raked and cleaned. Marked completed.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString()
      }
    ]
  },
  {
    id: "CP-807",
    title: "Flickering Malfunctioning Traffic Signal at Cross-Boulevard",
    description: "The 3-way traffic light at the intersection of Washington Blvd and 2nd St is intermittently cycling straight from green to red without yellow transition, causing sudden screeching brakes and near rear-end collisions.",
    locality: "Washington Blvd & 2nd Street Intersection",
    category: "Public Safety",
    priority: "Critical",
    priorityScore: 95,
    status: "Resolved",
    reportedBy: "Traffic Patrol - Officer T. Davies",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 80).toISOString(),
    isSample: true,
    affectedEstimate: "15,000+ daily motorists and transit buses",
    imageUrl: "",
    aiAnalysis: {
      source: "Local Heuristics Engine (Verified Baseline)",
      predictedCategory: "Public Safety",
      priority: "Critical",
      priorityScore: 95,
      department: "Traffic Operations Center & Signal Engineering",
      recommendedAction: "Put signal immediately in all-way flashing red beacon mode; deploy traffic controller technician to replace malfunctioning conflict monitor card.",
      explanation: "Direct failure of vehicular sequencing on high-speed multi-lane arterial causes immediate catastrophic collision risk.",
      safetyConcerns: "Imminent danger of high-velocity vehicular T-bone or rear-end collisions.",
      environmentalConcerns: "Gridlock emissions; emergency vehicle transit delays.",
      urgencyFactors: ["Active intersection safety failure", "Severe injury risk", "High traffic volume"],
      confidence: 0.98
    },
    resolutionNotes: [
      {
        id: "rn-6",
        author: "Senior Signal Tech Harris",
        text: "Conflict monitor unit card replaced. Signal tested through 12 complete phase cycles. Intersection fully restored.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 80).toISOString()
      }
    ]
  }
];
