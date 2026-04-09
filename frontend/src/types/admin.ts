export interface DonationAllocation {
  allocationId: number;
  safehouseId: number | null;
  safehouse: string | null;
  programArea: string;
  amountAllocated: number;
  allocationDate: string;
  allocationNotes: string | null;
}

export interface DonorRecord {
  id: number;
  displayName: string;
  linkedEmail: string | null;
  supporterType: string;
  organizationName: string | null;
  firstName: string | null;
  lastName: string | null;
  relationshipType: string | null;
  region: string | null;
  country: string | null;
  phone: string | null;
  status: string;
  totalGivenPhp: number;
  firstDonationAt: string | null;
  lastDonationAt: string | null;
  acquisitionChannel: string | null;
}

export interface ContributionRecord {
  id: number;
  donorId: number;
  donorName: string;
  donationType: string;
  amountPhp: number | null;
  estimatedValuePhp: number | null;
  programArea: string;
  description: string;
  channelSource: string | null;
  campaignName: string | null;
  contributionAt: string;
  allocations: DonationAllocation[];
}

export interface ResidentRecord {
  id: number;
  caseControlNo: string | null;
  codeName: string;
  safehouseId: number;
  safehouse: string;
  caseStatus: string;
  sex: string | null;
  dateOfBirth: string | null;
  birthStatus: string | null;
  placeOfBirth: string | null;
  religion: string | null;
  caseCategory: string;
  subCatOrphaned: boolean;
  subCatTrafficked: boolean;
  subCatChildLabor: boolean;
  subCatPhysicalAbuse: boolean;
  subCatSexualAbuse: boolean;
  subCatOsaec: boolean;
  subCatCicl: boolean;
  subCatAtRisk: boolean;
  subCatStreetChild: boolean;
  subCatChildWithHiv: boolean;
  isPwd: boolean;
  pwdType: string | null;
  hasSpecialNeeds: boolean;
  specialNeedsDiagnosis: string | null;
  familyIs4Ps: boolean;
  familySoloParent: boolean;
  familyIndigenous: boolean;
  familyParentPwd: boolean;
  familyInformalSettler: boolean;
  dateOfAdmission: string | null;
  ageUponAdmission: string | null;
  presentAge: string | null;
  lengthOfStay: string | null;
  referralSource: string | null;
  referringAgencyPerson: string | null;
  dateColbRegistered: string | null;
  dateColbObtained: string | null;
  assignedStaff: string;
  initialCaseAssessment: string | null;
  dateCaseStudyPrepared: string | null;
  reintegrationType: string | null;
  reintegrationStatus: string | null;
  initialRiskLevel: string | null;
  riskLevel: string;
  dateEnrolled: string | null;
  dateClosed: string | null;
  createdAt: string | null;
  notesRestricted: string | null;
  progressPercent: number;
  lastSessionAt: string | null;
  nextConferenceAt: string | null;
  openInterventionPlans: number;
}

export interface RecordingRecord {
  id: number;
  residentId: number;
  residentName: string;
  sessionAt: string;
  staffName: string;
  sessionType: string;
  sessionDurationMinutes: number;
  emotionalState: string;
  emotionalStateEnd: string;
  summary: string;
  interventions: string;
  followUp: string;
  progressNoted: boolean;
  concernsFlagged: boolean;
  referralMade: boolean;
  notesRestricted: string | null;
}

export interface VisitationRecord {
  id: number;
  residentId: number;
  residentName: string;
  visitAt: string;
  socialWorker: string;
  visitType: string;
  locationVisited: string;
  familyMembersPresent: string | null;
  purpose: string;
  observations: string;
  familyCooperation: string;
  safetyConcernsNoted: boolean;
  followUpNeeded: boolean;
  followUpNotes: string | null;
  visitOutcome: string;
}

export interface ConferenceRecord {
  planId: number;
  residentId: number;
  residentCode: string;
  safehouse: string;
  planCategory: string;
  status: string;
  conferenceDate: string;
  targetDate: string | null;
  planDescription: string;
  servicesProvided: string | null;
}

export interface SocialPerformanceRecord {
  platform: string;
  posts: number;
  reach: number;
  donationReferrals: number;
  estimatedDonationValuePhp: number;
  avgEngagementRate: number;
}

export interface SocialPostRecord {
  postId: number;
  platform: string;
  platformPostId: string | null;
  postUrl: string | null;
  createdAt: string | null;
  postType: string | null;
  contentTopic: string | null;
  sentimentTone: string | null;
  hasCallToAction: boolean;
  campaignName: string | null;
  impressions: number;
  reach: number;
  likes: number;
  comments: number;
  shares: number;
  clickThroughs: number;
  engagementRate: number;
  donationReferrals: number;
  estimatedDonationValuePhp: number;
}

export interface SafehouseComparisonRecord {
  safehouseId: number;
  safehouse: string;
  occupancy: number;
  capacity: number;
  activeResidents: number;
  highRiskResidents: number;
}

export interface AdminPortalOverview {
  dashboard: {
    metrics: Array<{ label: string; value: string; detail: string }>;
    alerts: Array<{ severity: string; title: string; detail: string }>;
    recentActivity: Array<{ activityAt: string; label: string; detail: string }>;
  };
  donors: DonorRecord[];
  contributions: ContributionRecord[];
  residents: ResidentRecord[];
  recordings: RecordingRecord[];
  visitations: VisitationRecord[];
  reports: {
    monthlyTrends: Array<{
      monthLabel: string;
      donationsPhp: number;
      activeResidents: number;
      processRecordings: number;
      visitations: number;
    }>;
    safehouseComparison: SafehouseComparisonRecord[];
    programOutcomes: Array<{ programArea: string; outcome: string; value: string }>;
    reintegrationQueue: Array<{
      residentId: number;
      residentCode: string;
      safehouse: string;
      caseStatus: string;
      reintegrationReadinessProbability: number;
      predictedReadyWithin180Days: boolean;
      predictionTimestamp: string | null;
      modelName: string;
    }>;
    conferenceSchedule: ConferenceRecord[];
    socialPerformance: SocialPerformanceRecord[];
  };
  generatedAt: string;
  sourceTables: string[];
}
