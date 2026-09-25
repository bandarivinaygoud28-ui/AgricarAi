import { GovernmentScheme, SchemesResponse } from '../types';

export const OFFICIAL_GOVERNMENT_SCHEMES: GovernmentScheme[] = [
  // -------------------------------------------------------------
  // CENTRAL GOVERNMENT SCHEMES (All-India)
  // -------------------------------------------------------------
  {
    id: 'pm-kisan',
    title: 'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)',
    short_name: 'PM-KISAN',
    category: 'Income Support',
    scope: 'Central',
    state: 'All',
    target_crops: ['All', 'Paddy', 'Wheat', 'Tomato', 'Cotton', 'Chilli', 'Maize', 'Potato'],
    max_land_limit: null,
    description: 'Direct financial benefit transfer scheme providing guaranteed income support to landholding farmer families across India for purchasing agricultural inputs and meeting domestic farm needs.',
    benefits: '₹6,000 per year transferred directly into the farmer\'s Aadhaar-linked bank account in three equal installments of ₹2,000 every 4 months.',
    eligibility_summary: 'All landholding farmer families having cultivable land registered in their name (subject to exclusion criteria like institutional landholders, government employees, and income tax payees).',
    required_documents: [
      'Aadhaar Card',
      'Land Ownership Record (Pattadar Passbook / RoR 1B / Khasra / 7/12 Extract)',
      'Active Aadhaar-NPCI linked Bank Account Passbook',
      'Active Mobile Number for e-KYC Verification'
    ],
    department: 'Ministry of Agriculture & Farmers Welfare, Government of India',
    application_process: 'Apply online at the official PM-KISAN portal (pmkisan.gov.in) under "New Farmer Registration" or visit your local Common Service Center (CSC) / Village Agriculture Officer (VAO).',
    official_url: 'https://pmkisan.gov.in/',
    official_source: 'Ministry of Agriculture & Farmers Welfare (pmkisan.gov.in)',
    last_verified: 'August 2026',
    is_verified: true,
    tags: ['income support', 'pm kisan', 'direct benefit', 'financial aid', 'cash transfer', 'central']
  },
  {
    id: 'kisan-credit-card',
    title: 'Kisan Credit Card (KCC) Crop Loan Scheme',
    short_name: 'Kisan Credit Card (KCC)',
    category: 'Loans',
    scope: 'Central',
    state: 'All',
    target_crops: ['All', 'Paddy', 'Cotton', 'Tomato', 'Chilli', 'Maize', 'Potato', 'Sugarcane'],
    max_land_limit: null,
    description: 'Comprehensive credit delivery mechanism providing timely and hassle-free short-term agricultural loans to farmers for cultivation expenses, post-harvest costs, farm maintenance, and allied activities.',
    benefits: 'Concessional institutional credit up to ₹3,00,000 at a low effective interest rate of 4% per annum (7% base interest with 3% prompt repayment subvention). Collateral-free loan limit up to ₹1,60,000.',
    eligibility_summary: 'All individual farmers, joint borrowers, tenant farmers, oral lessees, and sharecroppers engaged in crop production, horticulture, dairy, poultry, or fisheries.',
    required_documents: [
      'Duly completed KCC Application Form',
      'Identity Proof (Aadhaar Card / Voter ID / PAN)',
      'Address Proof (Aadhaar / Ration Card)',
      'Land Records (Pattadar Passbook / Title Deed / Revenue Records)',
      'Crop Sowing / Cropping Pattern Certificate'
    ],
    department: 'Department of Agriculture & Cooperation / NABARD / Reserve Bank of India',
    application_process: 'Submit the standard one-page KCC form to your nearest Commercial Bank branch, Regional Rural Bank (RRB), or Primary Agricultural Cooperative Society (PACS).',
    official_url: 'https://www.myscheme.gov.in/schemes/kcc',
    official_source: 'NABARD & Ministry of Finance (nabard.org)',
    last_verified: 'August 2026',
    is_verified: true,
    tags: ['loan', 'kcc', 'credit', 'crop loan', 'interest subvention', 'nabard', 'bank']
  },
  {
    id: 'pm-fasal-bima-yojana',
    title: 'PMFBY (Pradhan Mantri Fasal Bima Yojana)',
    short_name: 'PM Fasal Bima Yojana',
    category: 'Insurance',
    scope: 'Central',
    state: 'All',
    target_crops: ['Paddy', 'Cotton', 'Tomato', 'Chilli', 'Maize', 'Potato', 'Wheat', 'Soybean', 'Groundnut', 'All'],
    max_land_limit: null,
    description: 'National yield-based and weather-based crop insurance coverage safeguarding farmers against unavoidable natural calamities, unseasonal rainfall, pest attacks, localized storms, drought, and post-harvest losses.',
    benefits: 'Comprehensive insurance cover with very low farmer premium rates: only 2.0% for Kharif food and oilseed crops, 1.5% for Rabi crops, and 5.0% for annual commercial/horticultural crops. Balance premium is subsidized by Central and State Governments.',
    eligibility_summary: 'All farmers including sharecroppers and tenant farmers growing notified crops in notified areas across participating states.',
    required_documents: [
      'Aadhaar Card',
      'Land Title / Revenue Document (Pattadar Passbook / RoR 1B / Sowing Certificate)',
      'Bank Account Passbook with IFSC',
      'Crop Sowing Declaration / Certificate'
    ],
    department: 'Ministry of Agriculture & Farmers Welfare, Government of India',
    application_process: 'Enroll online on the National Crop Insurance Portal (pmfby.gov.in), through your bank while taking crop loan, or via nearest CSC / Village Level Worker before the seasonal cut-off date.',
    official_url: 'https://pmfby.gov.in/',
    official_source: 'Ministry of Agriculture & Farmers Welfare (pmfby.gov.in)',
    last_verified: 'August 2026',
    is_verified: true,
    tags: ['insurance', 'pmfby', 'crop insurance', 'drought', 'flood', 'natural disaster', 'bima']
  },
  {
    id: 'smam-agri-mechanization',
    title: 'SMAM (Sub-Mission on Agricultural Mechanization) Machinery & Drone Subsidy',
    short_name: 'Farm Machinery & Drone Subsidy',
    category: 'Equipment',
    scope: 'Central',
    state: 'All',
    target_crops: ['All', 'Paddy', 'Cotton', 'Maize', 'Chilli', 'Tomato', 'Potato'],
    max_land_limit: null,
    description: 'Financial assistance program promoting modern farm mechanization, tractor implements, power tillers, combine harvesters, laser levelers, and agricultural Kisan drones among small and marginal farmers.',
    benefits: '40% to 50% subsidy on purchase of agricultural machinery and equipment (up to 50% for SC/ST, women, and small/marginal farmers; up to ₹5 Lakhs for Kisan Drones for Farmer Producer Organizations / Custom Hiring Centers).',
    eligibility_summary: 'Individual farmers, Farmer Producer Organizations (FPOs), Panchayats, and rural youth setting up Custom Hiring Centers (CHCs).',
    required_documents: [
      'Aadhaar Card',
      'Pattadar Passbook / Land Record Proof',
      'Bank Passbook Copy',
      'Category / Caste Certificate (for higher SC/ST subsidy benefits)',
      'Quotation / Proforma Invoice from authorized farm equipment dealer'
    ],
    department: 'Department of Agriculture & Farmers Welfare, Mechanization & Technology Division',
    application_process: 'Register on the Direct Benefit Transfer (DBT) in Agriculture Mechanization portal (agrimachinery.nic.in) and submit application with selected equipment quotation.',
    official_url: 'https://agrimachinery.nic.in/',
    official_source: 'Government of India Agri-Machinery Portal (agrimachinery.nic.in)',
    last_verified: 'August 2026',
    is_verified: true,
    tags: ['equipment', 'tractor', 'drone', 'subsidy', 'machinery', 'harvester', 'smam', 'mechanization']
  },
  {
    id: 'pm-kusum-solar-pump',
    title: 'PM-KUSUM (Solar Agricultural Pump Subsidy Scheme)',
    short_name: 'PM-KUSUM Solar Pumps',
    category: 'Irrigation',
    scope: 'Central',
    state: 'All',
    target_crops: ['All', 'Paddy', 'Cotton', 'Tomato', 'Chilli', 'Maize', 'Horticulture'],
    max_land_limit: null,
    description: 'Major green energy initiative enabling farmers to install standalone off-grid solar agricultural irrigation pumps and solarize existing grid-connected diesel/electric pumps with substantial government subsidies.',
    benefits: 'Up to 60% total financial subsidy (30% Central Government + 30% State Government subsidy). The farmer contributes only 10% upfront cost, with remaining 30% available via bank loan.',
    eligibility_summary: 'Individual farmers, groups of farmers, Water User Associations (WUAs), and cooperatives possessing agricultural land requiring irrigation power.',
    required_documents: [
      'Aadhaar Card & Identity Proof',
      'Land Ownership Document & Revenue Map',
      'Electricity Connection Details (for grid-solarization component)',
      'Bank Account Details',
      'Passport Size Photograph'
    ],
    department: 'Ministry of New and Renewable Energy (MNRE), Government of India',
    application_process: 'Apply through the official state renewable energy development agency or PM-KUSUM official national portal (pmkusum.mnre.gov.in).',
    official_url: 'https://pmkusum.mnre.gov.in/',
    official_source: 'Ministry of New & Renewable Energy (pmkusum.mnre.gov.in)',
    last_verified: 'August 2026',
    is_verified: true,
    tags: ['irrigation', 'solar pump', 'kusum', 'solar', 'electricity', 'subsidy', 'water']
  },
  {
    id: 'pmksy-micro-irrigation',
    title: 'PMKSY (Per Drop More Crop - Drip & Sprinkler Irrigation Subsidy)',
    short_name: 'PMKSY Micro Irrigation',
    category: 'Irrigation',
    scope: 'Central',
    state: 'All',
    target_crops: ['Tomato', 'Chilli', 'Cotton', 'Maize', 'Potato', 'Sugarcane', 'Horticulture', 'All'],
    max_land_limit: null,
    description: 'Centrally sponsored micro-irrigation program promoting water-saving drip and sprinkler irrigation technologies to enhance crop productivity, conserve groundwater, and optimize fertilizer use.',
    benefits: 'Up to 55% financial subsidy for Small & Marginal farmers and up to 45% for other category farmers on the benchmark cost of drip and sprinkler irrigation systems.',
    eligibility_summary: 'All farmers having cultivable land with an assured water source (borewell, open well, or farm pond).',
    required_documents: [
      'Aadhaar Card',
      'Land Title / Pattadar Passbook / 7/12 Extract',
      'Water Source Certificate / Electricity Bill',
      'Bank Account Passbook',
      'Soil & Water Testing Report'
    ],
    department: 'Department of Agriculture & Cooperation, Ministry of Agriculture & Farmers Welfare',
    application_process: 'Apply via State Horticulture / Agriculture Department portal (or respective State Micro Irrigation Project portal like T-MIP/MIP).',
    official_url: 'https://pmksy.gov.in/',
    official_source: 'Ministry of Agriculture & Farmers Welfare (pmksy.gov.in)',
    last_verified: 'August 2026',
    is_verified: true,
    tags: ['irrigation', 'drip irrigation', 'sprinkler', 'pmksy', 'water saving', 'micro irrigation']
  },
  {
    id: 'paramparagat-krishi-vikas',
    title: 'PKVY (Paramparagat Krishi Vikas Yojana) Organic Farming Support',
    short_name: 'PKVY Organic Farming',
    category: 'Seeds & Fertilizers',
    scope: 'Central',
    state: 'All',
    target_crops: ['Paddy', 'Cotton', 'Tomato', 'Chilli', 'Maize', 'Pulses', 'All'],
    max_land_limit: null,
    description: 'Comprehensive sub-component of National Mission on Sustainable Agriculture (NMSA) promoting eco-friendly, chemical-free organic farming through cluster approach and Participatory Guarantee System (PGS) certification.',
    benefits: 'Financial assistance of ₹50,000 per hectare for 3 years (₹31,000/ha for organic inputs like bio-fertilizers, vermicompost, botanical extracts, and ₹8,800/ha for value addition, packaging, and marketing).',
    eligibility_summary: 'Farmers forming clusters of 20 or more farmers covering a minimum area of 20 hectares (50 acres) committing to chemical-free organic cultivation.',
    required_documents: [
      'Aadhaar Card of participating farmers',
      'Land Ownership Certificates',
      'Cluster Formation Resolution & Member List',
      'Bank Account Details of the Farmer Group / Self Help Group'
    ],
    department: 'Integrated Nutrient Management Division, Ministry of Agriculture & Farmers Welfare',
    application_process: 'Contact your District Agriculture Officer (DAO) or Krishi Vigyan Kendra (KVK) to enroll your village farmer cluster under Jaivik Kheti portal.',
    official_url: 'https://www.myscheme.gov.in/schemes/pkvy',
    official_source: 'Ministry of Agriculture & Farmers Welfare (myscheme.gov.in)',
    last_verified: 'August 2026',
    is_verified: true,
    tags: ['organic', 'bio fertilizer', 'pkvy', 'seeds', 'fertilizer', 'natural farming', 'compost']
  },
  {
    id: 'soil-health-card-scheme',
    title: 'National Soil Health Card Scheme',
    short_name: 'Soil Health Card',
    category: 'Seeds & Fertilizers',
    scope: 'Central',
    state: 'All',
    target_crops: ['All', 'Paddy', 'Cotton', 'Tomato', 'Chilli', 'Maize', 'Potato'],
    max_land_limit: null,
    description: 'Nationwide soil testing program issuing customized crop-wise fertilizer dosage recommendations to improve soil fertility, prevent over-use of chemical fertilizers, and boost farm yield.',
    benefits: 'Free comprehensive soil laboratory testing covering 12 vital chemical parameters (N, P, K, S, Zn, Fe, Cu, Mn, Bo, pH, EC, OC) with printed report detailing exact fertilizer dosage for selected crops.',
    eligibility_summary: 'All farmers across all states and union territories in India.',
    required_documents: [
      'Farmer Name & Mobile Number',
      'Aadhaar Number',
      'Survey Number / Field Location Details for Geo-referenced Soil Sample Collection'
    ],
    department: 'Department of Agriculture & Cooperation, Ministry of Agriculture & Farmers Welfare',
    application_process: 'Collect and submit soil sample via your local Village Agriculture Extension Officer (AEO) or locate nearest testing lab on soilhealth.dac.gov.in.',
    official_url: 'https://soilhealth.dac.gov.in/',
    official_source: 'Department of Agriculture & Cooperation (soilhealth.dac.gov.in)',
    last_verified: 'August 2026',
    is_verified: true,
    tags: ['soil health', 'fertilizer', 'npk', 'soil testing', 'nutrients', 'card']
  },
  {
    id: 'certified-seed-subsidy',
    title: 'National Seed Subsidy & Distribution Scheme (NFSM / BGREI)',
    short_name: 'Certified Seed Subsidy',
    category: 'Seeds & Fertilizers',
    scope: 'Central',
    state: 'All',
    target_crops: ['Paddy', 'Maize', 'Cotton', 'Pulses', 'Oilseeds', 'Wheat'],
    max_land_limit: null,
    description: 'Direct distribution and subsidy on certified high-yielding variety (HYV) and hybrid seeds to ensure optimal seed replacement rate and disease-resistant crop establishment.',
    benefits: 'Up to 50% subsidy on notified certified seed varieties (e.g. ₹20 - ₹40 per kg subsidy on certified paddy and pulse seed bags) distributed via Primary Agricultural Cooperatives and Rythu Seva Kendras.',
    eligibility_summary: 'All landholding and tenant farmers registered with state Agriculture Department / Rythu Seva Kendram.',
    required_documents: [
      'Aadhaar Card',
      'Pattadar Passbook or Crop Sowing Registration Record',
      'Active Mobile Number'
    ],
    department: 'National Food Security Mission (NFSM) / National Seeds Corporation (NSC)',
    application_process: 'Book and collect subsidized seed bags from your nearest Primary Agricultural Credit Society (PACS), Agriculture Extension Center, or State Seed Corporation depot.',
    official_url: 'https://www.myscheme.gov.in/schemes/nfsm-cd',
    official_source: 'National Food Security Mission & Ministry of Agriculture (myscheme.gov.in)',
    last_verified: 'August 2026',
    is_verified: true,
    tags: ['seed subsidy', 'certified seed', 'paddy seed', 'hyv', 'seeds', 'nfsm']
  },
  {
    id: 'agri-infra-fund',
    title: 'Agriculture Infrastructure Fund (AIF) - Post Harvest & Storage',
    short_name: 'Agri Infrastructure Fund',
    category: 'Loans',
    scope: 'Central',
    state: 'All',
    target_crops: ['All', 'Paddy', 'Tomato', 'Cotton', 'Chilli', 'Potato', 'Horticulture'],
    max_land_limit: null,
    description: 'Medium-long term debt financing facility for investment in viable projects for post-harvest management infrastructure, primary processing units, cold chains, silos, and pack houses.',
    benefits: '3% per annum interest subvention on loans up to ₹2 Crores for a maximum period of 7 years, along with credit guarantee coverage under CGTMSE.',
    eligibility_summary: 'Farmers, Agri-entrepreneurs, Start-ups, Farmer Producer Organizations (FPOs), and Primary Agricultural Credit Societies (PACS).',
    required_documents: [
      'Aadhaar & PAN Card',
      'Detailed Project Report (DPR) for warehouse / cold storage / packhouse',
      'Land documents / Lease agreement for project site',
      'Bank Account Statements'
    ],
    department: 'Ministry of Agriculture & Farmers Welfare, Government of India',
    application_process: 'Apply directly on the National Agriculture Infrastructure Fund portal (agriinfra.dac.gov.in) and select preferred lending bank.',
    official_url: 'https://agriinfra.dac.gov.in/',
    official_source: 'Department of Agriculture & Farmers Welfare (agriinfra.dac.gov.in)',
    last_verified: 'August 2026',
    is_verified: true,
    tags: ['warehouse', 'cold storage', 'infra', 'processing', 'interest subvention', 'loan']
  },

  // -------------------------------------------------------------
  // STATE GOVERNMENT SCHEMES: TELANGANA
  // -------------------------------------------------------------
  {
    id: 'rythu-bandhu-telangana',
    title: 'Rythu Bandhu / Rythu Bharosa (Telangana Farmer Investment Support Scheme)',
    short_name: 'Rythu Bandhu / Rythu Bharosa',
    category: 'Income Support',
    scope: 'State',
    state: 'Telangana',
    target_crops: ['All', 'Paddy', 'Cotton', 'Chilli', 'Tomato', 'Maize'],
    max_land_limit: null,
    description: 'Flagship agricultural investment support initiative of the Government of Telangana granting direct seasonal assistance per acre to all eligible agricultural landholders for seed, fertilizer, and farm inputs.',
    benefits: '₹10,000 to ₹15,000 per acre per agricultural year (credited directly in two crop seasons: Kharif/Vanakkalam & Rabi/Yasangi) directly to the farmer\'s bank account via e-Kuber portal.',
    eligibility_summary: 'All farmers holding valid Pattadar Passbooks and registered in the Dharani land revenue portal of Telangana.',
    required_documents: [
      'Pattadar Passbook (e-Pattadar Passbook / Dharani Title Record)',
      'Aadhaar Card',
      'Aadhaar-linked Bank Account Details'
    ],
    department: 'Department of Agriculture, Government of Telangana',
    application_process: 'Registered automatically based on Dharani land records. New land purchasers can update details with local Agriculture Extension Officer (AEO) or Tahsildar office.',
    official_url: 'https://www.telangana.gov.in/departments/agriculture-and-co-operation/',
    official_source: 'Department of Agriculture & Cooperation, Telangana (telangana.gov.in)',
    last_verified: 'August 2026',
    is_verified: true,
    tags: ['telangana', 'rythu bandhu', 'rythu bharosa', 'income support', 'dharani', 'cash transfer']
  },
  {
    id: 'rythu-bima-telangana',
    title: 'Rythu Bima (Telangana Farmers Group Life Insurance Scheme)',
    short_name: 'Rythu Bima Telangana',
    category: 'Insurance',
    scope: 'State',
    state: 'Telangana',
    target_crops: ['All', 'Paddy', 'Cotton', 'Chilli', 'Tomato', 'Maize'],
    max_land_limit: null,
    description: 'Pioneering state-funded comprehensive life insurance scheme providing immediate financial relief and livelihood security to the nominee/family in the unfortunate event of a farmer\'s demise.',
    benefits: '₹5,00,000 (Five Lakh Rupees) assured death claim deposited within 10 days into the designated nominee\'s bank account. Entire premium is 100% paid by the Telangana State Government.',
    eligibility_summary: 'Pattadar farmers aged 18 to 59 years holding cultivable land in Telangana with title recorded in Dharani.',
    required_documents: [
      'Dharani Pattadar Passbook',
      'Farmer Aadhaar Card & Age Proof',
      'Designated Nominee Aadhaar Card & Bank Account Passbook'
    ],
    department: 'Department of Agriculture & LIC of India, Government of Telangana',
    application_process: 'Enrollment is handled through the Agriculture Extension Officer (AEO) in each cluster during the annual enrollment window.',
    official_url: 'https://www.telangana.gov.in/departments/agriculture-and-co-operation/',
    official_source: 'Department of Agriculture & Cooperation, Telangana (telangana.gov.in)',
    last_verified: 'August 2026',
    is_verified: true,
    tags: ['telangana', 'rythu bima', 'insurance', 'life insurance', 'lic', 'nominee', 'state']
  },
  {
    id: 'telangana-micro-irrigation',
    title: 'Telangana Micro Irrigation Project (T-MIP) Drip & Sprinkler Subsidy',
    short_name: 'T-MIP Drip Irrigation Subsidy',
    category: 'Irrigation',
    scope: 'State',
    state: 'Telangana',
    target_crops: ['Tomato', 'Chilli', 'Cotton', 'Maize', 'Horticulture', 'Vegetables', 'All'],
    max_land_limit: null,
    description: 'State-wide micro-irrigation project offering the highest subsidy levels in the country for water efficiency in drought-prone and groundwater stressed districts of Telangana.',
    benefits: '100% subsidy for SC/ST small & marginal farmers up to 5 acres; 90% subsidy for BC small & marginal farmers; 80% subsidy for other general category farmers.',
    eligibility_summary: 'Farmers in Telangana owning agricultural land with functional borewell / water source.',
    required_documents: [
      'Pattadar Passbook / Dharani Record',
      'Aadhaar Card',
      'Caste Certificate (for 100% SC/ST and 90% BC subsidy tier)',
      'Electricity Bill / Water Source Proof'
    ],
    department: 'Telangana State Micro Irrigation Project (TSMIP), Horticulture Department',
    application_process: 'Apply through MeeSeva center or online on TSMIP official portal with land and water source details.',
    official_url: 'https://horticulturedept.telangana.gov.in/',
    official_source: 'Horticulture Department, Government of Telangana (horticulturedept.telangana.gov.in)',
    last_verified: 'August 2026',
    is_verified: true,
    tags: ['telangana', 't-mip', 'drip', 'sprinkler', 'subsidy', 'irrigation', 'horticulture']
  },
  {
    id: 'telangana-loan-waiver',
    title: 'Telangana Crop Loan Waiver Scheme (Runa Mafi)',
    short_name: 'Crop Loan Waiver Scheme',
    category: 'Loans',
    scope: 'State',
    state: 'Telangana',
    target_crops: ['All', 'Paddy', 'Cotton', 'Maize', 'Chilli', 'Tomato'],
    max_land_limit: null,
    description: 'Comprehensive institutional debt relief initiative by the State Government waiving outstanding short-term agricultural crop loans up to ₹2,00,000 per farming household.',
    benefits: 'Complete waiver and clearance of outstanding crop loan balance up to ₹2,00,000 directly settled with the creditor bank.',
    eligibility_summary: 'Farmers who availed crop loans from Scheduled Commercial Banks, RRBs, or DCCBs within the notified loan period in Telangana.',
    required_documents: [
      'Bank Crop Loan Account Passbook',
      'Pattadar Passbook & Aadhaar Card',
      'Ration Card / Food Security Card (for family unit determination)'
    ],
    department: 'Finance & Agriculture Department, Government of Telangana',
    application_process: 'Automated verification through Bank Portal & Agriculture Department database.',
    official_url: 'https://clw.telangana.gov.in/',
    official_source: 'Government of Telangana (clw.telangana.gov.in)',
    last_verified: 'August 2026',
    is_verified: true,
    tags: ['telangana', 'loan waiver', 'runa mafi', 'crop loan', 'debt relief']
  },

  // -------------------------------------------------------------
  // STATE GOVERNMENT SCHEMES: ANDHRA PRADESH
  // -------------------------------------------------------------
  {
    id: 'ysr-rythu-bharosa',
    title: 'YSR Rythu Bharosa - PM KISAN Support',
    short_name: 'YSR Rythu Bharosa',
    category: 'Income Support',
    scope: 'State',
    state: 'Andhra Pradesh',
    target_crops: ['All', 'Paddy', 'Chilli', 'Cotton', 'Tomato', 'Groundnut'],
    max_land_limit: null,
    description: 'Financial assistance program by the Government of Andhra Pradesh providing seasonal investment support to landowning and tenant farmers.',
    benefits: '₹13,500 per year per farmer family (including ₹6,000 PM-KISAN share) paid in 3 seasonal installments before crop sowing.',
    eligibility_summary: 'All farmer families owning cultivable land as well as eligible tenant farmers registered through Rythu Bharosa Kendras (RBKs).',
    required_documents: [
      'Aadhaar Card',
      'Pattadar Passbook (1B / Adangal)',
      'Crop Cultivator Rights Card (CCRC) for tenant farmers',
      'Bank Passbook'
    ],
    department: 'Department of Agriculture, Government of Andhra Pradesh',
    application_process: 'Register at your village Rythu Bharosa Kendram (RBK) with Village Agriculture Assistant.',
    official_url: 'https://karshak.ap.gov.in/',
    official_source: 'Department of Agriculture, Government of Andhra Pradesh (karshak.ap.gov.in)',
    last_verified: 'August 2026',
    is_verified: true,
    tags: ['andhra pradesh', 'rythu bharosa', 'income support', 'rbk', 'tenant farmer']
  },

  // -------------------------------------------------------------
  // STATE GOVERNMENT SCHEMES: KARNATAKA
  // -------------------------------------------------------------
  {
    id: 'krishi-bhagya-karnataka',
    title: 'Krishi Bhagya Dryland Farming & Farm Pond Scheme',
    short_name: 'Krishi Bhagya Scheme',
    category: 'Irrigation',
    scope: 'State',
    state: 'Karnataka',
    target_crops: ['All', 'Paddy', 'Maize', 'Cotton', 'Millets', 'Pulses'],
    max_land_limit: null,
    description: 'Flagship scheme of Karnataka for rainfed farming areas providing rainwater harvesting farm ponds (Krishi Honda), diesel pump sets, polythene lining, and micro-irrigation.',
    benefits: '80% to 90% subsidy on construction of farm ponds (Krishi Honda) and up to 90% subsidy for drip/sprinkler sets in rainfed zones.',
    eligibility_summary: 'Farmers cultivating land in rainfed/dryland agro-climatic zones of Karnataka.',
    required_documents: [
      'Pahani (RTC) Record',
      'Aadhaar Card',
      'Bank Passbook Copy',
      'Caste Certificate (if applicable)'
    ],
    department: 'Department of Agriculture, Government of Karnataka',
    application_process: 'Apply via Raitha Samparka Kendra (RSK) or Karnataka Farmer Registration and Unified Beneficiary Information System (FRUITS portal).',
    official_url: 'https://raitamitra.karnataka.gov.in/',
    official_source: 'Department of Agriculture, Karnataka (raitamitra.karnataka.gov.in)',
    last_verified: 'August 2026',
    is_verified: true,
    tags: ['karnataka', 'krishi bhagya', 'farm pond', 'irrigation', 'fruits portal']
  },

  // -------------------------------------------------------------
  // STATE GOVERNMENT SCHEMES: MAHARASHTRA
  // -------------------------------------------------------------
  {
    id: 'namo-shetkari-maharashtra',
    title: 'Namo Shetkari Mahasanman Nidhi Yojana',
    short_name: 'Namo Shetkari Yojana',
    category: 'Income Support',
    scope: 'State',
    state: 'Maharashtra',
    target_crops: ['All', 'Cotton', 'Soybean', 'Paddy', 'Tomato', 'Sugarcane'],
    max_land_limit: null,
    description: 'Maharashtra State Government income supplement program providing additional direct benefit transfer alongside PM-KISAN.',
    benefits: '₹6,00 per year per farmer family from Maharashtra Government, making total annual benefit ₹12,000 when combined with PM-KISAN.',
    eligibility_summary: 'All farmers in Maharashtra who are active approved beneficiaries under the central PM-KISAN database.',
    required_documents: [
      'Aadhaar Card',
      '7/12 Extract and 8A Extract',
      'PM-KISAN Registered Farmer ID',
      'Aadhaar Linked Bank Account'
    ],
    department: 'Department of Agriculture, Government of Maharashtra',
    application_process: 'Eligible PM-KISAN farmers in Maharashtra are enrolled automatically on the MahaDBT farmer portal.',
    official_url: 'https://mahadbt.maharashtra.gov.in/',
    official_source: 'Government of Maharashtra (mahadbt.maharashtra.gov.in)',
    last_verified: 'August 2026',
    is_verified: true,
    tags: ['maharashtra', 'namo shetkari', 'income support', 'mahadbt', '7/12']
  },

  // -------------------------------------------------------------
  // STATE GOVERNMENT SCHEMES: PUNJAB
  // -------------------------------------------------------------
  {
    id: 'punjab-crop-diversification',
    title: 'Punjab Crop Diversification & Surface Seeder Scheme',
    short_name: 'Punjab Crop Diversification',
    category: 'Equipment',
    scope: 'State',
    state: 'Punjab',
    target_crops: ['Paddy', 'Wheat', 'Maize', 'Cotton', 'Basmati', 'Pulses'],
    max_land_limit: null,
    description: 'State initiative promoting crop residue management, in-situ stubble management machinery, and shifting acreage from water-intensive paddy to cotton, maize, and basmati.',
    benefits: '50% individual subsidy (80% for Custom Hiring Centers) on Super Seeder, Surface Seeder, and Happy Seeder machinery; financial incentives for direct-seeded rice (DSR).',
    eligibility_summary: 'Farmers cultivating land in Punjab registered on the state agriculture portal.',
    required_documents: [
      'Aadhaar Card',
      'Jamabandi / Fard Land Ownership Record',
      'Bank Passbook with IFSC',
      'Tractor RC Book'
    ],
    department: 'Department of Agriculture & Farmers Welfare, Government of Punjab',
    application_process: 'Apply on the Punjab Agri Machinery DBT portal (agrimachinerypb.com) or contact Block Agriculture Officer.',
    official_url: 'https://agri.punjab.gov.in/',
    official_source: 'Government of Punjab (agri.punjab.gov.in)',
    last_verified: 'August 2026',
    is_verified: true,
    tags: ['punjab', 'crop diversification', 'super seeder', 'stubble management', 'dbt']
  }
];

export function computeClientSchemes(params: {
  state?: string;
  district?: string;
  crops?: string;
  land_area?: number;
  category?: string;
  search?: string;
  scope?: string;
} = {}): SchemesResponse {
  const farmerState = params.state || 'Telangana';
  const farmerDistrict = params.district || 'Ranga Reddy';
  const farmerCrops = params.crops
    ? params.crops.split(',').map((c) => c.trim()).filter(Boolean)
    : ['Paddy', 'Tomato', 'Cotton', 'Chilli'];

  const results: GovernmentScheme[] = OFFICIAL_GOVERNMENT_SCHEMES.map((item) => {
    const s = { ...item };
    const scope = s.scope || 'Central';
    const schemeState = (s.state || 'All').toLowerCase();
    const targetCrops = s.target_crops || ['All'];
    const farmerStateClean = farmerState.toLowerCase();

    let cropMatched = false;
    if (targetCrops.includes('All')) {
      cropMatched = true;
    } else {
      for (const fc of farmerCrops) {
        if (targetCrops.some((tc) => tc.toLowerCase().includes(fc.toLowerCase()) || fc.toLowerCase().includes(tc.toLowerCase()))) {
          cropMatched = true;
          break;
        }
      }
    }

    const isStateSpecific = scope === 'State' && (schemeState.includes(farmerStateClean) || farmerStateClean.includes(schemeState));

    if (scope === 'State' && schemeState !== 'all' && !isStateSpecific) {
      s.eligibility_status = 'Check Eligibility';
      s.eligibility_code = 'check';
      s.eligibility_badge_color = 'yellow';
      s.relevance_reason = `Primarily administered by the Government of ${s.state}. Check if your state provides an equivalent program.`;
      s.priority_score = 10;
    } else if (isStateSpecific) {
      if (cropMatched) {
        s.eligibility_status = 'Likely Relevant';
        s.eligibility_code = 'likely';
        s.eligibility_badge_color = 'green';
        s.relevance_reason = `Active state scheme in ${farmerState} directly supporting your selected crops (${farmerCrops.slice(0, 3).join(', ')}).`;
        s.priority_score = 130;
      } else {
        s.eligibility_status = 'Check Eligibility';
        s.eligibility_code = 'check';
        s.eligibility_badge_color = 'yellow';
        s.relevance_reason = `Available in ${farmerState}. Verify if your specific crop rotation qualifies.`;
        s.priority_score = 110;
      }
    } else if (scope === 'Central') {
      if (cropMatched) {
        s.eligibility_status = 'Likely Relevant';
        s.eligibility_code = 'likely';
        s.eligibility_badge_color = 'green';
        s.relevance_reason = 'National flagship program open to all eligible Indian farmers cultivating your profile crops.';
        s.priority_score = 80;
      } else {
        s.eligibility_status = 'Check Eligibility';
        s.eligibility_code = 'check';
        s.eligibility_badge_color = 'yellow';
        s.relevance_reason = 'National program with general eligibility. Verify specific crop guidelines before applying.';
        s.priority_score = 60;
      }
    } else {
      s.eligibility_status = 'More Info Required';
      s.eligibility_code = 'info';
      s.eligibility_badge_color = 'gray';
      s.relevance_reason = 'Additional land holding or crop verification required by local agriculture department.';
      s.priority_score = 20;
    }

    return s;
  });

  let filtered = results;

  // Category filter
  if (params.category && params.category.toLowerCase() !== 'all') {
    const catLower = params.category.trim().toLowerCase();
    if (catLower === 'state schemes' || catLower === 'state') {
      filtered = filtered.filter(
        (s) => s.scope === 'State' && (s.state.toLowerCase().includes(farmerState.toLowerCase()) || farmerState.toLowerCase().includes(s.state.toLowerCase()))
      );
    } else if (catLower === 'subsidies') {
      filtered = filtered.filter(
        (s) => s.title.toLowerCase().includes('subsidy') || ['Equipment', 'Irrigation', 'Seeds & Fertilizers'].includes(s.category)
      );
    } else {
      filtered = filtered.filter((s) => s.category.toLowerCase() === catLower);
    }
  }

  // Search filter
  if (params.search && params.search.trim()) {
    const q = params.search.trim().toLowerCase();
    filtered = filtered.filter((s) => {
      const text = `${s.title} ${s.short_name} ${s.description} ${s.benefits} ${s.department} ${s.category} ${s.tags.join(' ')} ${s.target_crops.join(' ')}`.toLowerCase();
      return text.includes(q);
    });
  }

  // Sort by priority score descending
  filtered.sort((a, b) => (b.priority_score || 0) - (a.priority_score || 0));

  const likelyCount = filtered.filter((s) => s.eligibility_code === 'likely').length;

  return {
    farmer_context: {
      state: farmerState,
      district: farmerDistrict,
      crops: farmerCrops,
      land_area: params.land_area
    },
    total_schemes: filtered.length,
    recommended_count: likelyCount,
    schemes: filtered,
    last_verified_all: 'August 2026'
  };
}
