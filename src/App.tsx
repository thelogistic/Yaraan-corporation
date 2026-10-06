import React from "react";
import Sidebar from "./components/Sidebar";
import Dashboards from "./components/Dashboards";
import EmployeeManager from "./components/EmployeeManager";
import Recruitment from "./components/Recruitment";
import AttendanceModule from "./components/Attendance";
import Leaves from "./components/Leaves";
import PayrollModule from "./components/Payroll";
import Performance, { Goal, Appraisal } from "./components/Performance";
import OperationsDesk from "./components/OperationsDesk";

import {
  Employee,
  JobOpening,
  Applicant,
  LeaveBalance,
  Leave,
  Attendance,
  Payroll,
  PerformanceGoal,
  Asset,
  ExpenseClaim,
  Loan,
  HelpTicket,
  UserRole
} from "./types";

export default function App() {
  // Navigation & Config States
  const [currentTab, setCurrentTab] = React.useState("dashboard");
  const [currentUserRole, setCurrentUserRole] = React.useState<UserRole>("Super Administrator");
  const [selectedBranch, setSelectedBranch] = React.useState("All Branches");
  const [lang, setLang] = React.useState("en");
  const [theme, setTheme] = React.useState<"light" | "dark">("light");

  // Core Data States
  const [employees, setEmployees] = React.useState<Employee[]>([]);
  const [jobOpenings, setJobOpenings] = React.useState<JobOpening[]>([]);
  const [applicants, setApplicants] = React.useState<Applicant[]>([]);
  const [leaveBalances, setLeaveBalances] = React.useState<LeaveBalance[]>([]);
  const [leaves, setLeaves] = React.useState<Leave[]>([]);
  const [attendance, setAttendance] = React.useState<Attendance[]>([]);
  const [payroll, setPayroll] = React.useState<Payroll[]>([]);
  const [performanceGoals, setPerformanceGoals] = React.useState<PerformanceGoal[]>([]);
  const [assets, setAssets] = React.useState<Asset[]>([]);
  const [expenses, setExpenses] = React.useState<ExpenseClaim[]>([]);
  const [loans, setLoans] = React.useState<Loan[]>([]);
  const [tickets, setTickets] = React.useState<HelpTicket[]>([]);
  const [auditLogs, setAuditLogs] = React.useState<any[]>([]);

  const [loading, setLoading] = React.useState(true);

  // Fetch initial system state on boot
  React.useEffect(() => {
    fetch("/api/state")
      .then((res) => res.json())
      .then((data) => {
        setEmployees(data.employees || []);
        setJobOpenings(data.jobOpenings || []);
        setApplicants(data.applicants || []);
        setLeaveBalances(data.leaveBalances || []);
        setLeaves(data.leaves || []);
        setAttendance(data.attendance || []);
        setPayroll(data.payroll || []);
        setPerformanceGoals(data.performanceGoals || []);
        setAssets(data.assets || []);
        setExpenses(data.expenses || []);
        setLoans(data.loans || []);
        setTickets(data.helpTickets || []);
        setAuditLogs(data.auditLogs || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading system state:", err);
        setLoading(false);
      });
  }, []);

  // Sync state changes with document element class for theme toggling
  React.useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  // Master synchronization function
  const saveFullStateToBackend = (
    updatedEmployees?: Employee[],
    updatedJobs?: JobOpening[],
    updatedApplicants?: Applicant[],
    updatedLeaves?: Leave[],
    updatedBalances?: LeaveBalance[],
    updatedAttendance?: Attendance[],
    updatedPayroll?: Payroll[]
  ) => {
    const freshEmployees = updatedEmployees || employees;
    const freshJobs = updatedJobs || jobOpenings;
    const freshApplicants = updatedApplicants || applicants;
    const freshLeaves = updatedLeaves || leaves;
    const freshBalances = updatedBalances || leaveBalances;
    const freshAttendance = updatedAttendance || attendance;
    const freshPayroll = updatedPayroll || payroll;

    const fullStatePayload = {
      employees: freshEmployees,
      jobOpenings: freshJobs,
      applicants: freshApplicants,
      leaveBalances: freshBalances,
      leaves: freshLeaves,
      attendance: freshAttendance,
      payroll: freshPayroll,
      performanceGoals,
      assets,
      expenses,
      loans,
      helpTickets: tickets,
      auditLogs,
    };

    fetch("/api/state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fullStatePayload),
    })
      .then((res) => res.json())
      .then((res) => {
        if (!res.success) {
          console.error("Backend failed state save sync operation.");
        }
      })
      .catch((err) => console.error("Error saving state payload:", err));
  };

  // Callback wrappers for individual modules
  const handleUpdateEmployees = (list: Employee[]) => {
    setEmployees(list);
    saveFullStateToBackend(list);
  };

  const handleUpdateJobOpenings = (list: JobOpening[]) => {
    setJobOpenings(list);
    saveFullStateToBackend(undefined, list);
  };

  const handleUpdateApplicants = (list: Applicant[], updatedJobs?: JobOpening[]) => {
    setApplicants(list);
    saveFullStateToBackend(undefined, updatedJobs, list);
  };

  const handleUpdateLeaves = (list: Leave[], updatedBalances?: LeaveBalance[]) => {
    setLeaves(list);
    if (updatedBalances) setLeaveBalances(updatedBalances);
    saveFullStateToBackend(undefined, undefined, undefined, list, updatedBalances);
  };

  const handleUpdateAttendance = (list: Attendance[]) => {
    setAttendance(list);
    saveFullStateToBackend(undefined, undefined, undefined, undefined, undefined, list);
  };

  const handleUpdatePayroll = (list: Payroll[]) => {
    setPayroll(list);
    saveFullStateToBackend(undefined, undefined, undefined, undefined, undefined, undefined, list);
  };

  const handleUpdateAppraisalsAndGoals = (updatedAppraisals: any[], updatedGoals?: any[]) => {
    // Simply sync and trigger master update
    if (updatedGoals) setPerformanceGoals(updatedGoals);
    // Write full block
    const fullStatePayload = {
      employees,
      jobOpenings,
      applicants,
      leaveBalances,
      leaves,
      attendance,
      payroll,
      performanceGoals: updatedGoals || performanceGoals,
      assets,
      expenses,
      loans,
      helpTickets: tickets,
      auditLogs,
    };
    fetch("/api/state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fullStatePayload),
    });
  };

  const handleUpdateOperations = () => {
    // Simply sync existing structures
    const fullStatePayload = {
      employees,
      jobOpenings,
      applicants,
      leaveBalances,
      leaves,
      attendance,
      payroll,
      performanceGoals,
      assets,
      expenses,
      loans,
      helpTickets: tickets,
      auditLogs,
    };
    fetch("/api/state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fullStatePayload),
    });
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-200">
      {/* Navigation Sidebar */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        currentUserRole={currentUserRole}
        setCurrentUserRole={setCurrentUserRole}
        selectedBranch={selectedBranch}
        setSelectedBranch={setSelectedBranch}
        lang={lang}
        setLang={setLang}
        theme={theme}
        setTheme={setTheme}
      />

      {/* Main Panel Content */}
      <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full space-y-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-[60vh] text-gray-400 space-y-4">
            <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-semibold">Initializing Yaraan Corporation Database State Node...</p>
          </div>
        ) : (
          <>
            {currentTab === "dashboard" && (
              <Dashboards
                role={currentUserRole}
                branch={selectedBranch}
                employees={employees}
                jobOpenings={jobOpenings}
                applicants={applicants}
                leaves={leaves}
                attendance={attendance}
                payroll={payroll}
                performanceGoals={performanceGoals}
                assets={assets}
                expenses={expenses}
                loans={loans}
                tickets={tickets}
                onActionClick={(tab) => setCurrentTab(tab)}
              />
            )}

            {currentTab === "employees" && (
              <EmployeeManager
                role={currentUserRole}
                selectedBranch={selectedBranch}
                employees={employees}
                setEmployees={handleUpdateEmployees}
                saveFullStateToBackend={(list) => saveFullStateToBackend(list)}
              />
            )}

            {currentTab === "recruitment" && (
              <Recruitment
                role={currentUserRole}
                jobOpenings={jobOpenings}
                setJobOpenings={handleUpdateJobOpenings}
                applicants={applicants}
                setApplicants={(list) => handleUpdateApplicants(list)}
                saveFullStateToBackend={(app, jobs) => handleUpdateApplicants(app, jobs)}
              />
            )}

            {currentTab === "attendance" && (
              <AttendanceModule
                role={currentUserRole}
                employees={employees}
                attendance={attendance}
                setAttendance={handleUpdateAttendance}
                saveFullStateToBackend={handleUpdateAttendance}
              />
            )}

            {currentTab === "leaves" && (
              <Leaves
                role={currentUserRole}
                employees={employees}
                leaves={leaves}
                setLeaves={setLeaves}
                leaveBalances={leaveBalances}
                setLeaveBalances={setLeaveBalances}
                saveFullStateToBackend={(lv, bal) => handleUpdateLeaves(lv, bal)}
              />
            )}

            {currentTab === "payroll" && (
              <PayrollModule
                role={currentUserRole}
                employees={employees}
                payroll={payroll}
                setPayroll={handleUpdatePayroll}
                saveFullStateToBackend={handleUpdatePayroll}
              />
            )}

            {currentTab === "performance" && (
              <Performance
                role={currentUserRole}
                employees={employees}
                goals={performanceGoals as any}
                setGoals={(gList) => setPerformanceGoals(gList as any)}
                appraisals={[]} // Seeded dynamically inside component state on load or empty array mapping
                setAppraisals={() => {}}
                saveFullStateToBackend={handleUpdateAppraisalsAndGoals}
              />
            )}

            {(currentTab === "assets" || currentTab === "support" || currentTab === "documents") && (
              <OperationsDesk
                role={currentUserRole}
                auditLogs={auditLogs}
                setAuditLogs={setAuditLogs}
                saveFullStateToBackend={handleUpdateOperations}
              />
            )}

            {currentTab === "analytics" && (
              <Dashboards
                role={currentUserRole}
                branch={selectedBranch}
                employees={employees}
                jobOpenings={jobOpenings}
                applicants={applicants}
                leaves={leaves}
                attendance={attendance}
                payroll={payroll}
                performanceGoals={performanceGoals}
                assets={assets}
                expenses={expenses}
                loans={loans}
                tickets={tickets}
                onActionClick={(tab) => setCurrentTab(tab)}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}
