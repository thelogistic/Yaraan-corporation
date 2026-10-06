export type UserRole =
  | "Super Administrator"
  | "HR Administrator"
  | "Company Administrator"
  | "Department Manager"
  | "Team Leader"
  | "Employee"
  | "Payroll Officer"
  | "Recruiter"
  | "Auditor";

export interface Employee {
  id: string; // e.g., "EMP-001"
  photo?: string;
  fullName: string;
  gender: string;
  dateOfBirth: string;
  nationalId: string;
  passport?: string;
  bloodGroup: string;
  maritalStatus: string;
  nationality: string;
  // Contact
  mobile: string;
  email: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  currentAddress: string;
  permanentAddress: string;
  // Employment
  joiningDate: string;
  confirmationDate?: string;
  employmentType: "Full-Time" | "Part-Time" | "Contract" | "Intern";
  department: string;
  designation: string;
  branch: string; // Multi-tenant / Multi-company toggle support
  reportingManagerId?: string; // EMP-ID of manager
  workLocation: string;
  shift: string; // e.g., "General Shift", "Night Shift", "Rotating"
  employmentStatus: "Active" | "Suspended" | "Terminated" | "On Leave";
  // Banking
  bankName: string;
  branchCode: string;
  accountNumber: string;
  iban: string;
  taxNumber: string;
  // Salary
  basicSalary: number;
}

export interface JobOpening {
  id: string;
  title: string;
  department: string;
  location: string;
  experience: string;
  type: string;
  status: "Open" | "Closed" | "Draft";
  description: string;
}

export interface Applicant {
  id: string;
  jobId: string;
  jobTitle: string;
  fullName: string;
  email: string;
  phone: string;
  resumeUrl?: string;
  resumeText?: string;
  parsedData?: {
    skills?: string[];
    experience?: string;
    recommendation?: string;
  };
  rating: number; // 1-5 stars
  interviewDate?: string;
  interviewFeedback?: string;
  status: "Applied" | "Screened" | "Interviewing" | "Offered" | "Rejected";
}

export interface Attendance {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string; // YYYY-MM-DD
  checkIn?: string; // HH:MM:SS
  checkOut?: string; // HH:MM:SS
  lat?: number;
  lng?: number;
  status: "Present" | "Absent" | "Late" | "Half-Day" | "On Leave";
  overtimeMinutes: number;
  shift: string;
  notes?: string;
}

export interface Leave {
  id: string;
  employeeId: string;
  employeeName: string;
  type: "Annual" | "Casual" | "Sick" | "Maternity" | "Paternity" | "Emergency" | "Unpaid" | "Half Day";
  startDate: string;
  endDate: string;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
  managerApproval?: "Pending" | "Approved" | "Rejected";
  hrApproval?: "Pending" | "Approved" | "Rejected";
  managerComment?: string;
  hrComment?: string;
}

export interface LeaveBalance {
  employeeId: string;
  annual: number;
  casual: number;
  sick: number;
  unpaid: number;
}

export interface Payroll {
  id: string;
  employeeId: string;
  employeeName: string;
  month: string; // e.g. "July"
  year: number; // e.g. 2026
  basicSalary: number;
  allowances: {
    housing: number;
    travel: number;
    medical: number;
  };
  overtimePay: number;
  bonuses: number;
  deductions: {
    tax: number;
    providentFund: number;
    insurance: number;
    loanRecovery: number;
  };
  netSalary: number;
  status: "Draft" | "Paid" | "Processing";
}

export interface PerformanceGoal {
  id: string;
  employeeId: string;
  employeeName: string;
  title: string;
  kpi: string;
  okr: string;
  target: string;
  progress: number; // 0 - 100
  rating: number; // 1 - 5
  selfReview?: string;
  managerReview?: string;
  appraisalStatus: "Draft" | "Self-Reviewed" | "Manager-Reviewed" | "Completed";
  promotionRecommendation?: string; // e.g. "Recommend Promotion to Senior"
}

export interface TrainingCourse {
  id: string;
  title: string;
  description: string;
  trainer: string;
  startDate: string;
  endDate: string;
  skills: string[];
  attendees: string[]; // employeeIds
}

export interface Asset {
  id: string;
  name: string;
  type: "Laptop" | "Mobile" | "Vehicle" | "ID Card" | "Uniform" | "SIM" | "Equipment";
  serialNumber: string;
  assignedTo?: string; // employeeId
  assignedName?: string;
  assignDate?: string;
  returnDate?: string;
  status: "Available" | "Assigned" | "Maintenance" | "Lost";
}

export interface ExpenseClaim {
  id: string;
  employeeId: string;
  employeeName: string;
  title: string;
  category: "Travel" | "Fuel" | "Medical" | "Entertainment" | "Office Purchase";
  amount: number;
  date: string;
  status: "Pending" | "Approved" | "Paid" | "Rejected";
  managerApproval?: "Pending" | "Approved" | "Rejected";
  financeApproval?: "Pending" | "Approved" | "Rejected";
}

export interface Loan {
  id: string;
  employeeId: string;
  employeeName: string;
  amount: number;
  purpose: string;
  installmentCount: number;
  installmentAmount: number;
  balance: number;
  status: "Pending" | "Approved" | "Completed" | "Rejected";
  dateApplied: string;
}

export interface HelpTicket {
  id: string;
  employeeId: string;
  employeeName: string;
  category: "HR" | "IT" | "Finance" | "Admin";
  subject: string;
  description: string;
  priority: "Low" | "Medium" | "High";
  status: "Open" | "In Progress" | "Resolved" | "Closed";
  date: string;
}

export interface LetterTemplate {
  id: string;
  title: string;
  placeholderDescription: string;
  defaultText: string;
}

export interface GeneratedDoc {
  id: string;
  employeeId: string;
  employeeName: string;
  templateId: string;
  title: string;
  content: string;
  dateGenerated: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  ip: string;
  details: string;
}
