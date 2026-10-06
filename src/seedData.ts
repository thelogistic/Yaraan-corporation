import {
  Employee,
  JobOpening,
  Applicant,
  Attendance,
  Leave,
  LeaveBalance,
  Payroll,
  PerformanceGoal,
  TrainingCourse,
  Asset,
  ExpenseClaim,
  Loan,
  HelpTicket,
  LetterTemplate,
  GeneratedDoc,
  AuditLog
} from "./types";

export const initialEmployees: Employee[] = [];

export const initialJobOpenings: JobOpening[] = [
  {
    id: "JOB-001",
    title: "Senior Full-Stack Engineer",
    department: "Engineering",
    location: "Gilgit",
    experience: "5+ Years",
    type: "Full-Time",
    status: "Open",
    description: "We are seeking a seasoned Full-Stack developer proficient in React, Node.js, and Postgres to lead our HR Analytics core modules."
  },
  {
    id: "JOB-002",
    title: "HR Generalist",
    department: "Human Resources",
    location: "Hunza",
    experience: "2-4 Years",
    type: "Full-Time",
    status: "Open",
    description: "Looking for an energetic HR Generalist to manage recruitment pipelines, employee orientation, and leave coordination."
  },
  {
    id: "JOB-003",
    title: "Product Designer",
    department: "Product Management",
    location: "Remote",
    experience: "3+ Years",
    type: "Contract",
    status: "Draft",
    description: "Create beautiful mockups, user flow charts, and functional designs for our next-gen dashboard workflows."
  }
];

export const initialApplicants: Applicant[] = [
  {
    id: "APP-301",
    jobId: "JOB-001",
    jobTitle: "Senior Full-Stack Engineer",
    fullName: "Arjun Mehta",
    email: "arjun.mehta@example.com",
    phone: "+1 (555) 013-3392",
    status: "Interviewing",
    rating: 4,
    interviewDate: "2026-07-22T10:00:00.000Z",
    interviewFeedback: "Strong systems architecture knowledge. Solid React 19 skills. Needs slight calibration on database schema design, but highly recommended.",
    resumeText: "Arjun Mehta - Full Stack Engineer with 6 years experience in building React and Node applications. Proficient in Postgres, TypeScript, Docker, and AWS."
  },
  {
    id: "APP-302",
    jobId: "JOB-001",
    jobTitle: "Senior Full-Stack Engineer",
    fullName: "Chloe Dubois",
    email: "chloe.dubois@example.com",
    phone: "+1 (555) 018-4482",
    status: "Applied",
    rating: 3,
    resumeText: "Chloe Dubois - Graduate in Computer Science. Worked for 3 years at French tech startups. Focuses on Vue.js, Node, MongoDB, and CSS layouts."
  },
  {
    id: "APP-303",
    jobId: "JOB-002",
    jobTitle: "HR Generalist",
    fullName: "Isabella Martinez",
    email: "isabella.m@example.com",
    phone: "+1 (555) 017-5501",
    status: "Offered",
    rating: 5,
    interviewFeedback: "Superb behavioral interview. Handled difficult management scenario questions with extreme maturity and tact. Offer letter generated.",
    resumeText: "Isabella Martinez - HR specialist with 4 years background. Managed payroll processing support, benefits compliance, and recruitment pipelines."
  }
];

export const initialLeaveBalances: LeaveBalance[] = [];

export const initialLeaves: Leave[] = [];

export const initialAttendance: Attendance[] = [];

export const initialPayroll: Payroll[] = [];

export const initialPerformanceGoals: PerformanceGoal[] = [];

export const initialTrainingCourses: TrainingCourse[] = [
  {
    id: "TR-501",
    title: "Generative AI Integration Patterns",
    description: "Learn how to use @google/genai on full-stack node apps, streaming content, and structured JSON schema responses.",
    trainer: "DeepMind Tech Lead",
    startDate: "2026-07-25",
    endDate: "2026-07-26",
    skills: ["AI Integration", "Prompt Engineering", "TypeScript SDK"],
    attendees: []
  },
  {
    id: "TR-502",
    title: "Modern HR Management & Legal Compliances",
    description: "Understanding GDPR constraints, equitable salary distributions, and legal work policies across branches.",
    trainer: "Legal Counsel Team",
    startDate: "2026-08-10",
    endDate: "2026-08-11",
    skills: ["Compliance", "Corporate Management", "Legal Oversight"],
    attendees: []
  }
];

export const initialAssets: Asset[] = [
  { id: "AST-704", name: "Corporate Shuttle RFID Card", type: "ID Card", serialNumber: "RFID-100481", status: "Available" }
];

export const initialExpenses: ExpenseClaim[] = [];

export const initialLoans: Loan[] = [];

export const initialHelpTickets: HelpTicket[] = [];

export const initialTemplates: LetterTemplate[] = [
  {
    id: "TMP-001",
    title: "Job Offer Letter",
    placeholderDescription: "fullName, designation, branch, joiningDate, salary",
    defaultText: "Dear {{fullName}},\n\nWe are pleased to offer you the position of {{designation}} at our {{branch}} branch. Your joining date will be {{joiningDate}}.\n\nYour starting basic salary will be ${{salary}} per month, plus standard allowances. Please review and sign this offer.\n\nBest regards,\nSarah Jenkins\nVP of HR & Operations"
  },
  {
    id: "TMP-002",
    title: "Promotion Letter",
    placeholderDescription: "fullName, designation, branch, salary",
    defaultText: "Dear {{fullName}},\n\nCongratulations! We are delighted to promote you to the designation of {{designation}} at our {{branch}} branch.\n\nYour new basic salary will be ${{salary}} per month effective next payroll cycle. We thank you for your continued dedication.\n\nBest regards,\nSarah Jenkins\nVP of HR & Operations"
  },
  {
    id: "TMP-003",
    title: "Performance Warning Notice",
    placeholderDescription: "fullName, designation, managerName",
    defaultText: "Dear {{fullName}},\n\nThis notice serves to officially address performance concerns regarding your role as {{designation}}.\n\nYour manager, {{managerName}}, has highlighted specific areas of improvement needed. Please coordinate with HR to setup a Performance Improvement Plan (PIP).\n\nBest regards,\nHR Department"
  }
];

export const initialGeneratedDocs: GeneratedDoc[] = [];

export const initialAuditLogs: AuditLog[] = [
  { id: "LOG-001", timestamp: "2026-07-18T02:30:00.000Z", user: "Sarah Jenkins", role: "VP of HR & Operations", action: "Access Dashboard", ip: "192.168.1.44", details: "Sarah Jenkins logged in and accessed the Super Admin dashboard." }
];
