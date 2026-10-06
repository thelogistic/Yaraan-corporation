import React from "react";
import {
  BookOpen,
  Laptop,
  Receipt,
  LifeBuoy,
  FileSpreadsheet,
  Plus,
  X,
  CheckCircle,
  AlertTriangle,
  Clock,
  ShieldCheck,
  UserCheck
} from "lucide-react";
import { UserRole } from "../types";

interface OperationsDeskProps {
  role: UserRole;
  auditLogs: { timestamp: string; action: string; category: string; ipAddress: string }[];
  setAuditLogs: (logs: any[]) => void;
  saveFullStateToBackend: () => void;
}

export default function OperationsDesk({
  role,
  auditLogs,
  setAuditLogs,
  saveFullStateToBackend,
}: OperationsDeskProps) {
  const [activeTab, setActiveTab] = React.useState<"training" | "assets" | "expenses" | "helpdesk" | "audit">("training");

  // State: Training Module
  const [courses, setCourses] = React.useState([
    { id: "C-101", title: "GDPR Data Compliance & Security", category: "Security", hours: 4, enrolled: ["Marcus Vance", "Lydia Patel"], completed: ["Sarah Jenkins"] },
    { id: "C-102", title: "Advanced Lead React Design Principles", category: "Technical", hours: 8, enrolled: ["Marcus Vance"], completed: [] },
    { id: "C-103", title: "Managerial Leadership & Feedback Sprints", category: "Management", hours: 6, enrolled: [], completed: ["Sarah Jenkins"] },
  ]);
  const [newCourse, setNewCourse] = React.useState({ title: "", category: "Security", hours: 4 });
  const [isCourseModalOpen, setIsCourseModalOpen] = React.useState(false);

  // State: Asset Management
  const [assets, setAssets] = React.useState([
    { id: "AST-4412", type: "MacBook Pro M3", serial: "SN-991A882", assignedTo: "Marcus Vance", status: "Active", dateAssigned: "2026-02-12" },
    { id: "AST-8211", type: "UltraWide 34 Monitor", serial: "SN-112B565", assignedTo: "Lydia Patel", status: "Active", dateAssigned: "2026-03-01" },
    { id: "AST-3001", type: "Internal Kubernetes VM Cluster", serial: "K8S-VPC-01", assignedTo: "Engineering Team", status: "Provisioned", dateAssigned: "2026-01-10" },
  ]);
  const [newAsset, setNewAsset] = React.useState({ type: "MacBook Pro M3", serial: "", assignedTo: "Marcus Vance" });
  const [isAssetModalOpen, setIsAssetModalOpen] = React.useState(false);

  // State: Expense Claims
  const [expenses, setExpenses] = React.useState([
    { id: "EXP-901", description: "AWS Cloud Ingress Overages", category: "Software", amount: 480, status: "Approved", dateSubmitted: "2026-07-10", employee: "Marcus Vance" },
    { id: "EXP-902", description: "AWS Architect Certificate Exam Voucher", category: "Training", amount: 150, status: "Pending", dateSubmitted: "2026-07-16", employee: "Lydia Patel" },
    { id: "EXP-903", description: "Client Dinner meeting (New York Steak HQ)", category: "Meals", amount: 185, status: "Pending", dateSubmitted: "2026-07-17", employee: "Sarah Jenkins" },
  ]);
  const [newExpense, setNewExpense] = React.useState({ description: "", category: "Software", amount: 100 });
  const [isExpenseModalOpen, setIsExpenseModalOpen] = React.useState(false);

  // State: Help Desk Support tickets
  const [tickets, setTickets] = React.useState([
    { id: "TCK-5512", subject: "Inability to access VPC server gateway", priority: "High", status: "Open", assignee: "IT Ops Desk", dateLogged: "2026-07-18 09:30 AM" },
    { id: "TCK-4102", subject: "Broken ergonomics keyboard key", priority: "Low", status: "Pending", assignee: "Office Ops", dateLogged: "2026-07-17 02:15 PM" },
    { id: "TCK-3901", subject: "Requesting access permission to Figma project sheets", priority: "Medium", status: "Resolved", assignee: "Design Lead", dateLogged: "2026-07-15 11:00 AM" },
  ]);
  const [newTicket, setNewTicket] = React.useState({ subject: "", priority: "Medium" });
  const [isTicketModalOpen, setIsTicketModalOpen] = React.useState(false);

  const isReadOnly = role === "Auditor";

  // Action log helper
  const logEvent = (action: string, cat: string) => {
    const todayStr = new Date().toISOString().replace("T", " ").substring(0, 19);
    const newLog = {
      timestamp: todayStr,
      action,
      category: cat,
      ipAddress: "192.168.1.102", // simulated VPC IP
    };
    const updatedLogs = [newLog, ...auditLogs];
    setAuditLogs(updatedLogs);
    // write to server State if required
    saveFullStateToBackend();
  };

  // Course actions
  const handleAddCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;
    const course = {
      id: `C-${Math.floor(100 + Math.random() * 900)}`,
      title: newCourse.title,
      category: newCourse.category,
      hours: newCourse.hours,
      enrolled: [],
      completed: [],
    };
    setCourses([...courses, course]);
    setIsCourseModalOpen(false);
    setNewCourse({ title: "", category: "Security", hours: 4 });
    logEvent(`Published new training program: ${course.title}`, "Training");
  };

  const handleEnroll = (courseId: string) => {
    if (isReadOnly) return;
    setCourses(
      courses.map((c) => {
        if (c.id === courseId) {
          if (c.enrolled.includes("Marcus Vance")) return c; // already enrolled
          return { ...c, enrolled: [...c.enrolled, "Marcus Vance"] };
        }
        return c;
      })
    );
    logEvent(`Enrolled Marcus Vance in training course: ${courseId}`, "Training");
  };

  const handleMarkCompleted = (courseId: string) => {
    if (isReadOnly) return;
    setCourses(
      courses.map((c) => {
        if (c.id === courseId) {
          const filtered = c.enrolled.filter((e) => e !== "Marcus Vance");
          if (c.completed.includes("Marcus Vance")) return c;
          return { ...c, enrolled: filtered, completed: [...c.completed, "Marcus Vance"] };
        }
        return c;
      })
    );
    logEvent(`Successfully completed training program: ${courseId}`, "Training");
  };

  // Asset actions
  const handleAddAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;
    const asset = {
      id: `AST-${Math.floor(1000 + Math.random() * 9000)}`,
      type: newAsset.type,
      serial: newAsset.serial || `SN-${Math.floor(100000 + Math.random() * 900000)}`,
      assignedTo: newAsset.assignedTo,
      status: "Active",
      dateAssigned: new Date().toISOString().split("T")[0],
    };
    setAssets([...assets, asset]);
    setIsAssetModalOpen(false);
    setNewAsset({ type: "MacBook Pro M3", serial: "", assignedTo: "Marcus Vance" });
    logEvent(`Assigned ${asset.type} to employee: ${asset.assignedTo}`, "Assets");
  };

  const handleRevokeAsset = (assetId: string) => {
    if (isReadOnly) return;
    const item = assets.find((a) => a.id === assetId);
    setAssets(assets.filter((a) => a.id !== assetId));
    if (item) {
      logEvent(`Revoked ${item.type} from assigned staff: ${item.assignedTo}`, "Assets");
    }
  };

  // Expense actions
  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;
    const exp = {
      id: `EXP-${Math.floor(100 + Math.random() * 900)}`,
      description: newExpense.description,
      category: newExpense.category,
      amount: newExpense.amount,
      status: "Pending",
      dateSubmitted: new Date().toISOString().split("T")[0],
      employee: "Marcus Vance", // Simulated submitter
    };
    setExpenses([...expenses, exp]);
    setIsExpenseModalOpen(false);
    setNewExpense({ description: "", category: "Software", amount: 100 });
    logEvent(`Submitted new expense claim request: $${exp.amount}`, "Finance");
  };

  const handleApproveExpense = (expId: string, action: "Approved" | "Rejected") => {
    if (isReadOnly) return;
    setExpenses(
      expenses.map((e) => (e.id === expId ? { ...e, status: action } : e))
    );
    logEvent(`${action} expense claim authorization: ${expId}`, "Finance");
  };

  // Support Ticket actions
  const handleAddTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;
    const tck = {
      id: `TCK-${Math.floor(1000 + Math.random() * 9000)}`,
      subject: newTicket.subject,
      priority: newTicket.priority,
      status: "Open",
      assignee: "Unassigned Queue",
      dateLogged: new Date().toISOString().replace("T", " ").substring(0, 16),
    };
    setTickets([...tickets, tck]);
    setIsTicketModalOpen(false);
    setNewTicket({ subject: "", priority: "Medium" });
    logEvent(`Created support ticket: ${tck.subject}`, "HelpDesk");
  };

  const handleResolveTicket = (tckId: string) => {
    if (isReadOnly) return;
    setTickets(
      tickets.map((t) => (t.id === tckId ? { ...t, status: "Resolved" } : t))
    );
    logEvent(`Resolved support ticket: ${tckId}`, "HelpDesk");
  };

  return (
    <div className="space-y-6" id="operations-desk-view">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
            Operations & Compliance
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Dispatch company hardware assets, coordinate course curricula, approve travel expenses, and manage internal support tickets.
          </p>
        </div>
      </div>

      {/* Navigation tabs inside operations desk */}
      <div className="flex border-b border-gray-200 dark:border-gray-800 text-xs">
        <button
          onClick={() => setActiveTab("training")}
          className={`py-3 px-6 font-bold border-b-2 transition-all ${
            activeTab === "training"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white"
          }`}
          id="ops-tab-training"
        >
          🎓 Corporate Training
        </button>
        <button
          onClick={() => setActiveTab("assets")}
          className={`py-3 px-6 font-bold border-b-2 transition-all ${
            activeTab === "assets"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white"
          }`}
          id="ops-tab-assets"
        >
          💻 Asset Ledger
        </button>
        <button
          onClick={() => setActiveTab("expenses")}
          className={`py-3 px-6 font-bold border-b-2 transition-all ${
            activeTab === "expenses"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white"
          }`}
          id="ops-tab-expenses"
        >
          🪙 Expense Claims
        </button>
        <button
          onClick={() => setActiveTab("helpdesk")}
          className={`py-3 px-6 font-bold border-b-2 transition-all ${
            activeTab === "helpdesk"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white"
          }`}
          id="ops-tab-helpdesk"
        >
          🛠️ Help Desk Tickets
        </button>
        <button
          onClick={() => setActiveTab("audit")}
          className={`py-3 px-6 font-bold border-b-2 transition-all ${
            activeTab === "audit"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white"
          }`}
          id="ops-tab-audit"
        >
          🛡️ Security Logs
        </button>
      </div>

      {/* SUB TAB 1: CORPORATE TRAINING */}
      {activeTab === "training" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-bold text-sm text-gray-900 dark:text-white">Active Courses & Curricula</h4>
            {!isReadOnly && (
              <button
                onClick={() => setIsCourseModalOpen(true)}
                className="flex items-center gap-1 bg-blue-600 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow hover:bg-blue-500"
              >
                <Plus className="h-4 w-4" /> Add Training Course
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            {courses.map((course) => {
              const isEnrolled = course.enrolled.includes("Marcus Vance");
              const isCompleted = course.completed.includes("Marcus Vance");
              return (
                <div key={course.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-[9px] bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded uppercase">
                        {course.category}
                      </span>
                      <span className="text-gray-400 text-[10px] font-mono">{course.hours} Hours Course</span>
                    </div>
                    <h5 className="font-bold text-sm text-gray-900 dark:text-white leading-tight">{course.title}</h5>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex justify-between text-[10px] text-gray-400">
                      <span>{course.enrolled.length} Enrolled staff</span>
                      <span>{course.completed.length} Completed</span>
                    </div>

                    {!isReadOnly && (
                      <div className="flex gap-2">
                        {isCompleted ? (
                          <span className="w-full text-center text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 py-1.5 rounded font-bold text-[10px] flex items-center justify-center gap-1">
                            <CheckCircle className="h-3.5 w-3.5" /> Course Completed
                          </span>
                        ) : isEnrolled ? (
                          <button
                            onClick={() => handleMarkCompleted(course.id)}
                            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] py-1.5 rounded shadow"
                          >
                            Mark Completed
                          </button>
                        ) : (
                          <button
                            onClick={() => handleEnroll(course.id)}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] py-1.5 rounded shadow"
                          >
                            Enroll Course
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB TAB 2: ASSET LEDGER */}
      {activeTab === "assets" && (
        <div className="space-y-4 text-xs">
          <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-2">
            <h4 className="font-bold text-sm text-gray-900 dark:text-white">Physical & Software Asset Inventory</h4>
            {!isReadOnly && (
              <button
                onClick={() => setIsAssetModalOpen(true)}
                className="flex items-center gap-1 bg-blue-600 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow hover:bg-blue-500"
              >
                <Plus className="h-4 w-4" /> Issue Asset Track
              </button>
            )}
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800 text-gray-400 font-bold uppercase text-[9px] tracking-wider bg-slate-50 dark:bg-slate-950/40 px-4 py-2">
                  <th className="p-3">Asset Description</th>
                  <th className="p-3">Serial / ID</th>
                  <th className="p-3">Assigned Staff</th>
                  <th className="p-3">Issue Date</th>
                  <th className="p-3">Asset Status</th>
                  <th className="p-3 text-right">Revocation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 font-medium text-gray-600 dark:text-gray-300">
                {assets.map((ast) => (
                  <tr key={ast.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/20">
                    <td className="p-3 flex items-center gap-2">
                      <Laptop className="h-4 w-4 text-blue-500 shrink-0" />
                      <span className="font-bold text-gray-900 dark:text-white">{ast.type}</span>
                    </td>
                    <td className="p-3 font-mono text-[11px]">{ast.serial}</td>
                    <td className="p-3 font-bold text-gray-700 dark:text-slate-200">{ast.assignedTo}</td>
                    <td className="p-3 font-mono">{ast.dateAssigned}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-700">
                        {ast.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {!isReadOnly && (
                        <button
                          onClick={() => handleRevokeAsset(ast.id)}
                          className="text-rose-600 hover:text-rose-500 font-bold text-[10px]"
                        >
                          Revoke
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB TAB 3: EXPENSE CLAIMS */}
      {activeTab === "expenses" && (
        <div className="space-y-4 text-xs">
          <div className="flex justify-between items-center">
            <h4 className="font-bold text-sm text-gray-900 dark:text-white">Active Reimbursements claims</h4>
            {!isReadOnly && (
              <button
                onClick={() => setIsExpenseModalOpen(true)}
                className="flex items-center gap-1 bg-blue-600 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow hover:bg-blue-500"
              >
                <Plus className="h-4 w-4" /> File Expense Claim
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {expenses.map((exp) => (
              <div key={exp.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-sm space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-gray-400 text-[10px]">{exp.id} • {exp.category}</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                      exp.status === "Approved" ? "bg-emerald-100 text-emerald-700" :
                      exp.status === "Rejected" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                    }`}>
                      {exp.status}
                    </span>
                  </div>
                  <h5 className="font-bold text-sm text-gray-900 dark:text-white">{exp.description}</h5>
                  <p className="text-gray-400">Claimant: <span className="font-bold text-gray-700 dark:text-gray-300">{exp.employee}</span></p>
                </div>

                <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                  <span className="text-base font-extrabold text-blue-600 dark:text-blue-400 font-mono">${exp.amount}</span>
                  {role !== "Employee" && exp.status === "Pending" && (
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleApproveExpense(exp.id, "Approved")}
                        className="bg-emerald-600 text-white font-bold px-2.5 py-1 rounded text-[10px]"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleApproveExpense(exp.id, "Rejected")}
                        className="bg-rose-600 text-white font-bold px-2.5 py-1 rounded text-[10px]"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB TAB 4: HELPDESK TICKETS */}
      {activeTab === "helpdesk" && (
        <div className="space-y-4 text-xs">
          <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-2">
            <h4 className="font-bold text-sm text-gray-900 dark:text-white">Support & Facilities Ticketing</h4>
            {!isReadOnly && (
              <button
                onClick={() => setIsTicketModalOpen(true)}
                className="flex items-center gap-1 bg-blue-600 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow hover:bg-blue-500"
              >
                <Plus className="h-4 w-4" /> Log Support Ticket
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tickets.map((tck) => (
              <div key={tck.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-sm space-y-3.5 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-gray-400 text-[10px] font-bold">{tck.id} • Assigned: {tck.assignee}</span>
                    <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded ${
                      tck.priority === "High" ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-700"
                    }`}>
                      {tck.priority} Priority
                    </span>
                  </div>
                  <h5 className="font-bold text-gray-900 dark:text-white leading-relaxed">{tck.subject}</h5>
                  <p className="text-gray-400 text-[10px]">{tck.dateLogged}</p>
                </div>

                <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                    tck.status === "Resolved" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                  }`}>
                    {tck.status}
                  </span>
                  {!isReadOnly && tck.status !== "Resolved" && (
                    <button
                      onClick={() => handleResolveTicket(tck.id)}
                      className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] px-3 py-1 rounded shadow"
                    >
                      Mark Resolved
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB TAB 5: AUDIT LOGS TIMELINE */}
      {activeTab === "audit" && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-sm space-y-4 text-xs">
          <div className="flex items-center gap-1.5 border-b border-gray-100 dark:border-gray-800 pb-3">
            <ShieldCheck className="h-4.5 w-4.5 text-blue-500" />
            <h4 className="font-bold text-sm text-gray-900 dark:text-white">Secured Enterprise Audit Timeline</h4>
          </div>

          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
            {auditLogs.map((log, idx) => (
              <div key={idx} className="flex gap-4 items-start relative pb-4 border-l border-gray-100 dark:border-gray-800 pl-4 last:pb-0">
                <span className="absolute left-0 -translate-x-1/2 mt-1.5 h-2 w-2 rounded-full bg-blue-500"></span>
                <div className="space-y-1">
                  <p className="font-semibold text-gray-800 dark:text-gray-200">{log.action}</p>
                  <div className="flex gap-3 text-[10px] text-gray-400 font-medium">
                    <span className="font-mono">{log.timestamp}</span>
                    <span className="bg-blue-50 dark:bg-blue-950 px-1 py-0.2 rounded font-bold">{log.category}</span>
                    <span className="font-mono">VPC IP: {log.ipAddress}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODALS */}
      {/* Course Modal */}
      {isCourseModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleAddCourse} className="bg-white dark:bg-gray-900 rounded-xl max-w-sm w-full border border-gray-200 dark:border-gray-800 p-5 space-y-4 text-xs shadow-2xl">
            <div className="flex justify-between items-center border-b pb-2">
              <h4 className="font-bold text-gray-900 dark:text-white">Publish New Training Curricula</h4>
              <button type="button" onClick={() => setIsCourseModalOpen(false)}><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-gray-400 font-bold mb-1 block">Course Name</label>
                <input required type="text" placeholder="e.g. Lead Kubernetes Architect Suite" value={newCourse.title} onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })} className="w-full border border-gray-200 dark:border-gray-700 rounded p-1.5 dark:bg-gray-800 text-gray-900 dark:text-white" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-gray-400 font-bold mb-1 block">Category</label>
                  <select value={newCourse.category} onChange={(e) => setNewCourse({ ...newCourse, category: e.target.value })} className="w-full border border-gray-200 dark:border-gray-700 rounded p-1.5 dark:bg-gray-800 text-gray-900 dark:text-white">
                    <option value="Security">Security Compliance</option>
                    <option value="Technical">Technical</option>
                    <option value="Management">Management</option>
                  </select>
                </div>
                <div>
                  <label className="text-gray-400 font-bold mb-1 block">Hours</label>
                  <input type="number" value={newCourse.hours} onChange={(e) => setNewCourse({ ...newCourse, hours: Number(e.target.value) })} className="w-full border border-gray-200 dark:border-gray-700 rounded p-1.5 dark:bg-gray-800 text-gray-900 dark:text-white" />
                </div>
              </div>
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2 rounded">Publish Course</button>
          </form>
        </div>
      )}

      {/* Asset Modal */}
      {isAssetModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleAddAsset} className="bg-white dark:bg-gray-900 rounded-xl max-w-sm w-full border border-gray-200 dark:border-gray-800 p-5 space-y-4 text-xs shadow-2xl">
            <div className="flex justify-between items-center border-b pb-2">
              <h4 className="font-bold text-gray-900 dark:text-white">Issue Physical Asset</h4>
              <button type="button" onClick={() => setIsAssetModalOpen(false)}><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-gray-400 font-bold mb-1 block">Hardware Type</label>
                <select value={newAsset.type} onChange={(e) => setNewAsset({ ...newAsset, type: e.target.value })} className="w-full border border-gray-200 dark:border-gray-700 rounded p-1.5 dark:bg-gray-800 text-gray-900 dark:text-white">
                  <option value="MacBook Pro M3">MacBook Pro M3</option>
                  <option value="UltraWide 34 Monitor">UltraWide 34 Monitor</option>
                  <option value="Figma License Corporate">Figma License Corporate</option>
                  <option value="Secured HSM Hardware Key">Secured HSM Hardware Key</option>
                </select>
              </div>
              <div>
                <label className="text-gray-400 font-bold mb-1 block">Assigned Employee</label>
                <select value={newAsset.assignedTo} onChange={(e) => setNewAsset({ ...newAsset, assignedTo: e.target.value })} className="w-full border border-gray-200 dark:border-gray-700 rounded p-1.5 dark:bg-gray-800 text-gray-900 dark:text-white">
                  <option value="Marcus Vance">Marcus Vance</option>
                  <option value="Lydia Patel">Lydia Patel</option>
                  <option value="Sarah Jenkins">Sarah Jenkins</option>
                </select>
              </div>
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2 rounded">Assign Asset Track</button>
          </form>
        </div>
      )}

      {/* Expense Modal */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleAddExpense} className="bg-white dark:bg-gray-900 rounded-xl max-w-sm w-full border border-gray-200 dark:border-gray-800 p-5 space-y-4 text-xs shadow-2xl">
            <div className="flex justify-between items-center border-b pb-2">
              <h4 className="font-bold text-gray-900 dark:text-white">File Expense claim</h4>
              <button type="button" onClick={() => setIsExpenseModalOpen(false)}><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-gray-400 font-bold mb-1 block">Expense description</label>
                <input required type="text" placeholder="e.g. AWS voucher, taxi to NYC HQ" value={newExpense.description} onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })} className="w-full border border-gray-200 dark:border-gray-700 rounded p-1.5 dark:bg-gray-800 text-gray-900 dark:text-white" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-gray-400 font-bold mb-1 block">Category</label>
                  <select value={newExpense.category} onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })} className="w-full border border-gray-200 dark:border-gray-700 rounded p-1.5 dark:bg-gray-800 text-gray-900 dark:text-white">
                    <option value="Software">Software Tooling</option>
                    <option value="Meals">Meal Allowance</option>
                    <option value="Travel">Business Travel</option>
                    <option value="Training">Certification voucher</option>
                  </select>
                </div>
                <div>
                  <label className="text-gray-400 font-bold mb-1 block">Amount ($)</label>
                  <input type="number" min="1" value={newExpense.amount} onChange={(e) => setNewExpense({ ...newExpense, amount: Number(e.target.value) })} className="w-full border border-gray-200 dark:border-gray-700 rounded p-1.5 dark:bg-gray-800 text-gray-900 dark:text-white" />
                </div>
              </div>
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2 rounded">Submit Claim File</button>
          </form>
        </div>
      )}

      {/* Ticket Modal */}
      {isTicketModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleAddTicket} className="bg-white dark:bg-gray-900 rounded-xl max-w-sm w-full border border-gray-200 dark:border-gray-800 p-5 space-y-4 text-xs shadow-2xl">
            <div className="flex justify-between items-center border-b pb-2">
              <h4 className="font-bold text-gray-900 dark:text-white">Log Support Ticket</h4>
              <button type="button" onClick={() => setIsTicketModalOpen(false)}><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-gray-400 font-bold mb-1 block">Subject Topic*</label>
                <input required type="text" placeholder="e.g. Ergonomics chair requests, SSO issues" value={newTicket.subject} onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })} className="w-full border border-gray-200 dark:border-gray-700 rounded p-1.5 dark:bg-gray-800 text-gray-900 dark:text-white" />
              </div>
              <div>
                <label className="text-gray-400 font-bold mb-1 block">Priority</label>
                <select value={newTicket.priority} onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })} className="w-full border border-gray-200 dark:border-gray-700 rounded p-1.5 dark:bg-gray-800 text-gray-900 dark:text-white">
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High Priority</option>
                </select>
              </div>
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2 rounded">Log Support Request</button>
          </form>
        </div>
      )}
    </div>
  );
}
