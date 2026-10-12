export interface BusinessProfileVisibility {
  showPhone: boolean;
  showEmail: boolean;
  showAddress: boolean;
  showOperatingHours: boolean;
  showProprietorName: boolean;
  showUdyamNumber: boolean;
  showTrademarkInfo: boolean;
  showGstin: boolean;
  showPan: boolean;
  showCin?: boolean;
}

export interface BusinessProfile {
  companyLegalName: string;
  companyTradeName: string;
  proprietorName: string;
  udyamNumber: string;
  trademarkAppNumber: string;
  trademarkClass: string;
  enterpriseType: string;
  nicActivities: string;
  gstin: string;
  pan: string;
  cin: string;
  sacCode: string;
  sacDescription: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  district: string;
  stateName: string;
  stateCode: string;
  pincode: string;
  country: string;
  fullAddress: string;
  contactEmail: string;
  contactPhone: string;
  officialEmail: string;
  operatingHours: string;
  supportUrl: string;
  websiteUrl: string;
  enableGstInvoicing: boolean;
  visibility: BusinessProfileVisibility;
}

export const DEFAULT_BUSINESS_PROFILE: BusinessProfile = {
  companyLegalName: "ConfirmRoute AI",
  companyTradeName: "ConfirmRoute",
  proprietorName: "",
  udyamNumber: "",
  trademarkAppNumber: "",
  trademarkClass: "",
  enterpriseType: "",
  nicActivities: "",
  gstin: "",
  pan: "",
  cin: "",
  sacCode: "998313",
  sacDescription: "Information technology streaming and travel guidance services",
  addressLine1: "",
  addressLine2: "",
  city: "Noida",
  district: "Gautam Buddha Nagar",
  stateName: "Uttar Pradesh",
  stateCode: "09",
  pincode: "",
  country: "India",
  fullAddress: "Noida, Uttar Pradesh, India",
  contactEmail: "support@confirmroute.in",
  contactPhone: "",
  officialEmail: "support@confirmroute.in",
  operatingHours: "09:00 AM - 09:00 PM IST (Mon-Sat)",
  supportUrl: "https://confirmroute.in/contact",
  websiteUrl: "https://confirmroute.in",
  enableGstInvoicing: false,
  visibility: {
    showPhone: false,
    showEmail: true,
    showAddress: false,
    showOperatingHours: true,
    showProprietorName: false,
    showUdyamNumber: false,
    showTrademarkInfo: false,
    showGstin: false,
    showPan: false,
    showCin: false,
  },
};

export async function getBusinessProfile() {
  return DEFAULT_BUSINESS_PROFILE;
}
