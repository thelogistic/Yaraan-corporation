import React from "react";
import {
  CalendarDays,
  Plus,
  X,
  FileCheck2,
  AlertCircle,
  Clock,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  List,
  Calendar
} from "lucide-react";
import { Leave, LeaveBalance, Employee, UserRole } from "../types";

interface LeavesProps {
  role: UserRole;
  employees: Employee[];
  leaves: Leave[];
  setLeaves: (leaves: Leave[]) => void;
  leaveBalances: LeaveBalance[];
  setLeaveBalances: (balances: LeaveBalance[]) => void;
  saveFullStateToBackend: (updatedLeaves: Leave[], updatedBalances?: LeaveBalance[]) => void;
}

export default function Leaves({
  role,
  employees,
  leaves,
  setLeaves,
  leaveBalances,
  setLeaveBalances,
  saveFullStateToBackend,
}: LeavesProps) {
  const [isApplyModalOpen, setIsApplyModalOpen] = React.useState(false);
  const [filterEmpId, setFilterEmpId] = React.useState("All");
  const [viewMode, setViewMode] = React.useState<"list" | "calendar">("calendar");
  const [calendarDate, setCalendarDate] = React.useState(() => new Date(2026, 6, 18)); // Default to July 18, 2026
  const [selectedDateLeaves, setSelectedDateLeaves] = React.useState<{ date: string; leaves: Leave[] } | null>(null);

  // Acting Employee (simulated login)
  const actingEmpId = "EMP-102"; // Marcus Vance
  const actingEmp = employees.find((e) => e.id === actingEmpId);

  // Form State
  const [leaveForm, setLeaveForm] = React.useState({
    type: "Annual" as Leave["type"],
    startDate: "",
    endDate: "",
    reason: "",
  });

  const isReadOnly = role === "Auditor";

  // Balance for acting employee
  const currentBalance = React.useMemo(() => {
    return leaveBalances.find((b) => b.employeeId === actingEmpId) || {
      employeeId: actingEmpId,
      annual: 15,
      casual: 5,
      sick: 10,
      unpaid: 0,
    };
  }, [leaveBalances, actingEmpId]);

  // Apply Leave Handler
  const handleApplyLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;

    if (!leaveForm.startDate || !leaveForm.endDate || !leaveForm.reason) {
      alert("Please fill in dates and reason.");
      return;
    }

    const newLeave: Leave = {
      id: `LV-${Math.floor(100 + Math.random() * 900)}`,
      employeeId: actingEmpId,
      employeeName: actingEmp?.fullName || "Marcus Vance",
      type: leaveForm.type,
      startDate: leaveForm.startDate,
      endDate: leaveForm.endDate,
      reason: leaveForm.reason,
      status: "Pending",
      managerApproval: "Pending",
      hrApproval: "Pending",
    };

    const updatedLeaves = [newLeave, ...leaves];
    setLeaves(updatedLeaves);
    saveFullStateToBackend(updatedLeaves);
    setIsApplyModalOpen(false);
    setLeaveForm({
      type: "Annual",
      startDate: "",
      endDate: "",
      reason: "",
    });
    alert("Leave application submitted successfully for review!");
  };

  // Manager/HR approval handlers
  const handleApproval = (
    leaveId: string,
    action: "Approved" | "Rejected",
    level: "manager" | "hr",
    comment: string
  ) => {
    if (isReadOnly) return;

    const leaveToUpdate = leaves.find((l) => l.id === leaveId);
    if (!leaveToUpdate) return;

    let managerApproval = leaveToUpdate.managerApproval;
    let hrApproval = leaveToUpdate.hrApproval;
    let status: Leave["status"] = leaveToUpdate.status;

    if (level === "manager") {
      managerApproval = action;
      // In manager view, if rejected, final status is rejected
      if (action === "Rejected") status = "Rejected";
    } else if (level === "hr") {
      hrApproval = action;
      if (action === "Approved" && managerApproval === "Approved") {
        status = "Approved";

        // Deduct from Balance!
        const start = new Date(leaveToUpdate.startDate);
        const end = new Date(leaveToUpdate.endDate);
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

        deductLeaveBalance(leaveToUpdate.employeeId, leaveToUpdate.type, days);
      } else if (action === "Rejected") {
        status = "Rejected";
      }
    }

    const updatedLeaves = leaves.map((l) =>
      l.id === leaveId
        ? {
            ...l,
            managerApproval,
            hrApproval,
            status,
            managerComment: level === "manager" ? comment : l.managerComment,
            hrComment: level === "hr" ? comment : l.hrComment,
          }
        : l
    );

    setLeaves(updatedLeaves);
    saveFullStateToBackend(updatedLeaves);
    alert(`Leave application has been ${action.toLowerCase()} at the ${level} level.`);
  };

  const deductLeaveBalance = (empId: string, type: Leave["type"], days: number) => {
    const updatedBalances = leaveBalances.map((b) => {
      if (b.employeeId === empId) {
        if (type === "Annual") return { ...b, annual: Math.max(0, b.annual - days) };
        if (type === "Casual") return { ...b, casual: Math.max(0, b.casual - days) };
        if (type === "Sick") return { ...b, sick: Math.max(0, b.sick - days) };
        if (type === "Unpaid") return { ...b, unpaid: b.unpaid + days };
      }
      return b;
    });
    setLeaveBalances(updatedBalances);
    saveFullStateToBackend(leaves, updatedBalances);
  };

  // Calendar view helper functions
  const getDaysInMonth = (y: number, m: number) => {
    return new Date(y, m + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (y: number, m: number) => {
    return new Date(y, m, 1).getDay();
  };

  const checkLeaveOnDate = (y: number, m: number, d: number) => {
    const targetDate = new Date(y, m, d);
    targetDate.setHours(0, 0, 0, 0);

    return leaves.filter((lv) => {
      if (lv.status !== "Approved") return false;
      if (filterEmpId !== "All" && lv.employeeId !== filterEmpId) return false;

      const start = new Date(lv.startDate + "T00:00:00");
      const end = new Date(lv.endDate + "T00:00:00");
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);

      return targetDate >= start && targetDate <= end;
    });
  };

  const handlePrevMonth = () => {
    setCalendarDate((prev) => {
      const y = prev.getFullYear();
      const m = prev.getMonth();
      return new Date(m === 0 ? y - 1 : y, m === 0 ? 11 : m - 1, 1);
    });
  };

  const handleNextMonth = () => {
    setCalendarDate((prev) => {
      const y = prev.getFullYear();
      const m = prev.getMonth();
      return new Date(m === 11 ? y + 1 : y, m === 11 ? 0 : m + 1, 1);
    });
  };

  const handleGoToToday = () => {
    setCalendarDate(new Date(2026, 6, 18));
  };

  const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const calYear = calendarDate.getFullYear();
  const calMonth = calendarDate.getMonth();
  const daysInMonth = getDaysInMonth(calYear, calMonth);
  const firstDayIndex = getFirstDayOfMonth(calYear, calMonth);

  const blankCells = Array.from({ length: firstDayIndex });
  const dayCells = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="space-y-6" id="leaves-view">
      {/* Title banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
            Leave & Time-Off Management
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Submit time-off requests, compute dynamic quotas, and coordinate HR/manager multi-tier approval workflows.
          </p>
        </div>
        {!isReadOnly && (
          <button
            onClick={() => setIsApplyModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-md transition-all shrink-0"
            id="apply-leave-btn"
          >
            <Plus className="h-4 w-4" />
            Apply for Leave
          </button>
        )}
      </div>

      {/* Acting Employee Leave Balances widget */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-sm space-y-4">
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">My Leave Balances (Acting Employee)</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-4 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100/40 dark:border-blue-950/60 rounded-xl space-y-1">
            <span className="font-bold text-gray-400">Annual Quota</span>
            <p className="text-2xl font-extrabold text-blue-700 dark:text-blue-400">{currentBalance.annual} Days</p>
          </div>
          <div className="p-4 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100/40 dark:border-amber-950/60 rounded-xl space-y-1">
            <span className="font-bold text-gray-400">Casual Allowance</span>
            <p className="text-2xl font-extrabold text-amber-700 dark:text-amber-400">{currentBalance.casual} Days</p>
          </div>
          <div className="p-4 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100/40 dark:border-rose-950/60 rounded-xl space-y-1">
            <span className="font-bold text-gray-400">Sick Allotment</span>
            <p className="text-2xl font-extrabold text-rose-700 dark:text-rose-400">{currentBalance.sick} Days</p>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1">
            <span className="font-bold text-gray-400">Unpaid Accrued</span>
            <p className="text-2xl font-extrabold text-slate-700 dark:text-slate-300">{currentBalance.unpaid} Days</p>
          </div>
        </div>
      </div>

      {/* Grid of Pending Applications & Full approvals history */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left columns: Requests feed or interactive calendar */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3 gap-3">
            <h4 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-1.5 font-display">
              <CalendarDays className="h-4 w-4 text-blue-500" /> Active Applications
            </h4>
            <div className="flex items-center gap-2">
              {/* Toggle Buttons */}
              <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5 border border-gray-200/60 dark:border-gray-700/60">
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                    viewMode === "list"
                      ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
                      : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <List className="h-3 w-3" />
                  List
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("calendar")}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                    viewMode === "calendar"
                      ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
                      : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <Calendar className="h-3 w-3" />
                  Calendar
                </button>
              </div>

              {/* Employee Filter */}
              <select
                value={filterEmpId}
                onChange={(e) => setFilterEmpId(e.target.value)}
                className="text-xs bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded py-1 px-2 focus:outline-none font-semibold"
              >
                <option value="All">All Staff Leaves</option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.fullName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {viewMode === "calendar" ? (
            <div className="space-y-4">
              {/* Calendar Navigation Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50 dark:bg-gray-800/30 p-3 rounded-xl border border-gray-200/50 dark:border-gray-800/40">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-750 text-gray-600 dark:text-gray-300 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors"
                    title="Previous Month"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextMonth}
                    className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-750 text-gray-600 dark:text-gray-300 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors"
                    title="Next Month"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleGoToToday}
                    className="px-2.5 py-1 text-[11px] font-bold bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors"
                  >
                    Today
                  </button>
                </div>
                <div className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 font-display">
                  <CalendarDays className="h-4 w-4 text-blue-500" />
                  {MONTH_NAMES[calMonth]} {calYear}
                </div>
                <div className="flex flex-wrap items-center gap-2 text-[10px] text-gray-500 font-medium">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    Annual
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    Sick
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    Casual
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    Emergency
                  </div>
                </div>
              </div>

              {/* Grid Wrapper */}
              <div className="grid grid-cols-7 gap-1 bg-gray-100 dark:bg-gray-800 border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden text-xs">
                {/* Day headers */}
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((dayName) => (
                  <div key={dayName} className="bg-gray-50 dark:bg-gray-900/80 py-2 text-center text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                    {dayName}
                  </div>
                ))}

                {/* Blank cells */}
                {blankCells.map((_, idx) => (
                  <div key={`blank-${idx}`} className="bg-gray-50/30 dark:bg-gray-950/20 min-h-[90px]" />
                ))}

                {/* Day cells */}
                {dayCells.map((day) => {
                  const dayLeaves = checkLeaveOnDate(calYear, calMonth, day);
                  const isToday = calYear === 2026 && calMonth === 6 && day === 18;

                  return (
                    <div
                      key={`day-${day}`}
                      onClick={() => {
                        if (dayLeaves.length > 0) {
                          setSelectedDateLeaves({
                            date: `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
                            leaves: dayLeaves
                          });
                        }
                      }}
                      className={`bg-white dark:bg-gray-900 min-h-[90px] p-1.5 flex flex-col justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors relative group select-none ${
                        dayLeaves.length > 0 ? "cursor-pointer" : ""
                      } ${isToday ? "ring-2 ring-blue-500 ring-inset bg-blue-50/5 dark:bg-blue-950/5" : ""}`}
                    >
                      <div className="flex justify-between items-center">
                        {isToday ? (
                          <span className="bg-blue-600 text-white rounded-full h-5 w-5 flex items-center justify-center font-bold text-[10px] shadow shadow-blue-500/20">
                            {day}
                          </span>
                        ) : (
                          <span className="text-gray-500 dark:text-gray-400 font-bold text-[10px]">
                            {day}
                          </span>
                        )}
                        {dayLeaves.length > 0 && (
                          <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full h-4 px-1.5 flex items-center justify-center font-extrabold text-[8px]">
                            {dayLeaves.length}
                          </span>
                        )}
                      </div>

                      {/* Display first 2 approved leaves */}
                      <div className="mt-1 space-y-1 overflow-hidden flex-1 flex flex-col justify-end">
                        {dayLeaves.slice(0, 2).map((lv) => {
                          let colorClasses = "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900";
                          if (lv.type === "Sick") {
                            colorClasses = "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900";
                          } else if (lv.type === "Casual") {
                            colorClasses = "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900";
                          } else if (lv.type === "Emergency") {
                            colorClasses = "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-900";
                          } else if (lv.type === "Unpaid") {
                            colorClasses = "bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700";
                          }

                          return (
                            <div
                              key={lv.id}
                              title={`${lv.employeeName} - ${lv.type}: ${lv.reason}`}
                              className={`truncate px-1 py-0.5 rounded text-[8px] font-semibold border ${colorClasses} leading-tight transition-all group-hover:scale-[1.02]`}
                            >
                              {lv.employeeName.split(" ")[0]} ({lv.type[0]})
                            </div>
                          );
                        })}
                        {dayLeaves.length > 2 && (
                          <div className="text-[7.5px] text-gray-400 font-bold text-center leading-none">
                            +{dayLeaves.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1 text-xs">
              {leaves.filter((l) => filterEmpId === "All" || l.employeeId === filterEmpId).length > 0 ? (
                leaves
                  .filter((l) => filterEmpId === "All" || l.employeeId === filterEmpId)
                  .map((lv) => (
                    <div key={lv.id} className="p-4 bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800/60 rounded-xl space-y-3.5" id={`leave-card-${lv.id}`}>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h5 className="font-bold text-gray-900 dark:text-white">{lv.employeeName}</h5>
                          <p className="text-[10px] text-gray-400">Type: <span className="font-bold text-blue-600 dark:text-blue-400">{lv.type}</span> • ID: {lv.id}</p>
                        </div>
                        <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${
                          lv.status === "Approved" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400" :
                          lv.status === "Rejected" ? "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400" : "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                        }`}>
                          {lv.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 p-2 bg-white dark:bg-gray-900 rounded-lg text-[10px]">
                        <div>
                          <span className="text-gray-400">Start Date</span>
                          <p className="font-bold text-gray-700 dark:text-gray-300">{lv.startDate}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">End Date</span>
                          <p className="font-bold text-gray-700 dark:text-gray-300">{lv.endDate}</p>
                        </div>
                      </div>

                      <p className="text-gray-600 dark:text-gray-400 leading-relaxed italic">
                        "{lv.reason}"
                      </p>

                      {/* Sub-steps approval tracking */}
                      <div className="grid grid-cols-2 gap-4 text-[10px] pt-2 border-t border-gray-100 dark:border-gray-800/60">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-gray-400">Manager Sign:</span>
                          <span className={`font-bold uppercase ${lv.managerApproval === "Approved" ? "text-emerald-500" : lv.managerApproval === "Rejected" ? "text-red-500" : "text-amber-500"}`}>
                            {lv.managerApproval}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-gray-400">HR Clearance:</span>
                          <span className={`font-bold uppercase ${lv.hrApproval === "Approved" ? "text-emerald-500" : lv.hrApproval === "Rejected" ? "text-red-500" : "text-amber-500"}`}>
                            {lv.hrApproval}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  No leave applications registered.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right columns: Approvals workflow center */}
        <div className="lg:col-span-1">
          {role !== "Employee" ? (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-sm space-y-4 sticky top-20">
              <div className="border-b border-gray-100 dark:border-gray-800 pb-3">
                <h4 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-1.5">
                  <FileCheck2 className="h-4.5 w-4.5 text-blue-500" /> Approvals Bureau
                </h4>
                <p className="text-[11px] text-gray-400 mt-1">Actions on team leave applications</p>
              </div>

              <div className="space-y-4 max-h-[350px] overflow-y-auto">
                {leaves.filter((l) => l.status === "Pending").length > 0 ? (
                  leaves
                    .filter((l) => l.status === "Pending")
                    .map((lv) => (
                      <div key={lv.id} className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-gray-100 dark:border-gray-800 text-[11px] space-y-3">
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white">{lv.employeeName}</p>
                          <p className="text-[10px] text-gray-400">{lv.type} ({lv.startDate} to {lv.endDate})</p>
                        </div>

                        {/* Approval comments field */}
                        <input
                          type="text"
                          id={`comment-${lv.id}`}
                          placeholder="Add approval comment..."
                          className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded p-1 text-[10px]"
                        />

                        {/* Actions */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              const el = document.getElementById(`comment-${lv.id}`) as HTMLInputElement;
                              handleApproval(lv.id, "Approved", role === "Department Manager" ? "manager" : "hr", el?.value || "");
                            }}
                            className="flex-1 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold shadow-sm"
                          >
                            ✓ Approve
                          </button>
                          <button
                            onClick={() => {
                              const el = document.getElementById(`comment-${lv.id}`) as HTMLInputElement;
                              handleApproval(lv.id, "Rejected", role === "Department Manager" ? "manager" : "hr", el?.value || "");
                            }}
                            className="flex-1 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded font-bold shadow-sm"
                          >
                            ✗ Reject
                          </button>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-6 text-gray-400">
                    No pending applications.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-sm space-y-3.5">
              <h4 className="font-bold text-xs text-gray-900 dark:text-white">Need emergency clearance?</h4>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Emergency leaves (e.g. sick, immediate casualties) bypass regular queueing blocks. Please contact the Operations desk immediately for override logs.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Apply Leave Modal Form */}
      {isApplyModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleApplyLeave} className="bg-white dark:bg-gray-900 rounded-xl max-w-md w-full border border-gray-200 dark:border-gray-800 p-5 space-y-4 text-xs shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white">Apply for Leave</h3>
              <button
                type="button"
                onClick={() => setIsApplyModalOpen(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-gray-400 font-bold mb-1">Leave Type</label>
                <select
                  value={leaveForm.type}
                  onChange={(e) => setLeaveForm({ ...leaveForm, type: e.target.value as any })}
                  className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded p-2"
                >
                  <option value="Annual">Annual Leave</option>
                  <option value="Casual">Casual Leave</option>
                  <option value="Sick">Sick Leave</option>
                  <option value="Emergency">Emergency Leave</option>
                  <option value="Maternity">Maternity Leave</option>
                  <option value="Paternity">Paternity Leave</option>
                  <option value="Half Day">Half Day</option>
                  <option value="Unpaid">Unpaid Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-gray-400 font-bold mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={leaveForm.startDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded p-2"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 font-bold mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={leaveForm.endDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded p-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 font-bold mb-1">Reason / Statement</label>
                <textarea
                  required
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                  placeholder="Explain why you are requesting off-time..."
                  rows={4}
                  className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded p-2"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={() => setIsApplyModalOpen(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold shadow"
              >
                Submit Application
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Selected Date Leaves Details Popup */}
      {selectedDateLeaves && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-md w-full border border-gray-200 dark:border-gray-800 p-5 space-y-4 text-xs shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <div>
                <h3 className="font-bold text-sm text-gray-900 dark:text-white font-display">Approved Leaves</h3>
                <p className="text-[10px] text-gray-400 font-mono">Date: {selectedDateLeaves.date}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDateLeaves(null)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            </div>
            <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
              {selectedDateLeaves.leaves.map((lv) => (
                <div key={lv.id} className="p-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/60 rounded-lg space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white">{lv.employeeName}</h4>
                      <p className="text-[10px] text-gray-400 font-mono">Employee ID: {lv.employeeId}</p>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 rounded text-[9px] font-bold uppercase border border-emerald-200/50 dark:border-emerald-900/50">
                      {lv.type}
                    </span>
                  </div>
                  <div className="p-2 bg-white dark:bg-gray-900 rounded text-[10px] grid grid-cols-2 gap-2 border border-gray-100 dark:border-gray-800 font-mono">
                    <div>
                      <span className="text-gray-400 block font-semibold">Start</span>
                      <span className="font-bold text-gray-700 dark:text-gray-300">{lv.startDate}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block font-semibold">End</span>
                      <span className="font-bold text-gray-700 dark:text-gray-300">{lv.endDate}</span>
                    </div>
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 italic">
                    "{lv.reason}"
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end pt-2 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={() => setSelectedDateLeaves(null)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold shadow transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
