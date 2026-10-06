import React from "react";
import {
  Users,
  CalendarDays,
  CalendarCheck,
  UserPlus,
  Clock,
  Briefcase,
  AlertCircle,
  Gift,
  Coins,
  CheckSquare,
  Award,
  Volume2,
  TrendingUp,
  MapPin,
  FileSpreadsheet
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import {
  Employee,
  JobOpening,
  Applicant,
  Attendance,
  Leave,
  Payroll,
  PerformanceGoal,
  Asset,
  ExpenseClaim,
  Loan,
  HelpTicket,
  UserRole
} from "../types";

interface DashboardsProps {
  role: UserRole;
  branch: string;
  employees: Employee[];
  jobOpenings: JobOpening[];
  applicants: Applicant[];
  leaves: Leave[];
  attendance: Attendance[];
  payroll: Payroll[];
  performanceGoals: PerformanceGoal[];
  assets: Asset[];
  expenses: ExpenseClaim[];
  loans: Loan[];
  tickets: HelpTicket[];
  onActionClick: (tab: string) => void;
}

export default function Dashboards({
  role,
  branch,
  employees,
  jobOpenings,
  applicants,
  leaves,
  attendance,
  payroll,
  performanceGoals,
  assets,
  expenses,
  loans,
  tickets,
  onActionClick,
}: DashboardsProps) {
  // Filter core data based on branch selected
  const filteredEmployees = React.useMemo(() => {
    if (branch === "All Branches") return employees;
    return employees.filter((e) => e.branch === branch);
  }, [employees, branch]);

  const filteredEmpIds = React.useMemo(() => {
    return new Set(filteredEmployees.map((e) => e.id));
  }, [filteredEmployees]);

  const filteredLeaves = React.useMemo(() => {
    return leaves.filter((l) => filteredEmpIds.has(l.employeeId));
  }, [leaves, filteredEmpIds]);

  const filteredAttendance = React.useMemo(() => {
    return attendance.filter((a) => filteredEmpIds.has(a.employeeId));
  }, [attendance, filteredEmpIds]);

  const filteredPayroll = React.useMemo(() => {
    return payroll.filter((p) => filteredEmpIds.has(p.employeeId));
  }, [payroll, filteredEmpIds]);

  const filteredExpenses = React.useMemo(() => {
    return expenses.filter((ex) => filteredEmpIds.has(ex.employeeId));
  }, [expenses, filteredEmpIds]);

  const filteredLoans = React.useMemo(() => {
    return loans.filter((ln) => filteredEmpIds.has(ln.employeeId));
  }, [loans, filteredEmpIds]);

  // Compute stats
  const totalEmployeesCount = filteredEmployees.length;
  const newEmployeesCount = filteredEmployees.filter(
    (e) => new Date(e.joiningDate) > new Date("2024-01-01")
  ).length;
  const leavesTodayCount = filteredLeaves.filter((l) => l.status === "Approved").length;

  const todayStr = "2026-07-17"; // Grounded with the latest seed date
  const todayAttendance = filteredAttendance.filter((a) => a.date === todayStr);
  const presentToday = todayAttendance.filter((a) => a.status === "Present" || a.status === "Late").length;
  const lateToday = todayAttendance.filter((a) => a.status === "Late").length;

  const pendingApprovalsCount =
    filteredLeaves.filter((l) => l.status === "Pending").length +
    filteredExpenses.filter((e) => e.status === "Pending").length +
    filteredLoans.filter((ln) => ln.status === "Pending").length;

  const recruitmentOpenings = jobOpenings.filter((j) => j.status === "Open").length;
  const ongoingInterviews = applicants.filter((a) => a.status === "Interviewing").length;

  // Static holidays for 2026
  const upcomingHolidays = [
    { name: "Labor Day", date: "2026-09-07", day: "Monday" },
    { name: "Thanksgiving", date: "2026-11-26", day: "Thursday" },
    { name: "Christmas Day", date: "2026-12-25", day: "Friday" },
  ];

  // Static company announcements
  const announcements = [
    {
      id: "1",
      title: "Generative AI Hackathon 2026",
      desc: "Our annual developer innovation challenge kicks off on August 1st. Great prizes and cloud credits!",
      tag: "Event",
      color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    },
    {
      id: "2",
      title: "New Hybrid Workspace Policy",
      desc: "Starting next month, employees can select standard rotating remote days with manager alignment.",
      tag: "Policy",
      color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    },
  ];

  // Employee birthdays in July (Current local time is July 2026)
  const birthdays = filteredEmployees.filter((e) => {
    const dobMonth = e.dateOfBirth.split("-")[1];
    return dobMonth === "07";
  });

  // Recharts Chart Data Formatting
  // 1. Employee Growth Over Years
  const growthData = [
    { year: "2021", Headcount: 2 },
    { year: "2022", Headcount: 3 },
    { year: "2023", Headcount: 4 },
    { year: "2024", Headcount: 5 },
    { year: "2026", Headcount: totalEmployeesCount },
  ];

  // 2. Department Distribution
  const deptMap: Record<string, number> = {};
  filteredEmployees.forEach((e) => {
    deptMap[e.department] = (deptMap[e.department] || 0) + 1;
  });
  const deptData = Object.keys(deptMap).map((k) => ({
    name: k,
    value: deptMap[k],
  }));

  // 3. Attendance Trend (past 3 days)
  const attendanceTrend = [
    { date: "July 15", Present: 4, Late: 0, Absent: 1 },
    { date: "July 16", Present: 4, Late: 1, Absent: 0 },
    { date: "July 17", Present: 5, Late: 1, Absent: 0 },
  ];

  // 4. Salary Distribution
  const salaryData = filteredEmployees.map((e) => ({
    name: e.fullName.split(" ")[0],
    Salary: e.basicSalary,
  }));

  // 5. Leave Analytics by Type
  const leaveAnalytics = [
    { name: "Annual", Days: 12 },
    { name: "Casual", Days: 5 },
    { name: "Sick", Days: 8 },
    { name: "Unpaid", Days: 2 },
  ];

  // 6. Recruitment Funnel
  const funnelData = [
    { phase: "Applied", Count: applicants.length },
    { phase: "Interviewing", Count: applicants.filter((a) => a.status === "Interviewing").length },
    { phase: "Offered", Count: applicants.filter((a) => a.status === "Offered").length },
  ];

  const COLORS = ["#2563eb", "#0ea5e9", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6"];

  return (
    <div className="space-y-6" id="dashboard-view">
      {/* Top Welcome Title Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-5">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            {role} Dashboard
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-sans">
            Welcome back to your organizational suite. Scope current statistics for{" "}
            <span className="font-semibold text-blue-600 dark:text-blue-400">{branch}</span>.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-500 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700">
            🔒 IP Status: Secure Node
          </span>
          <span className="text-xs font-medium text-green-700 bg-green-100 dark:bg-green-950/40 dark:text-green-400 px-3 py-1.5 rounded-full border border-green-200 dark:border-green-800">
            ● Enterprise Live
          </span>
        </div>
      </div>

      {/* Main KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="kpi-grid">
        {/* Total Headcount */}
        <div
          onClick={() => onActionClick("employees")}
          className="p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Headcount</p>
              <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors font-display">
                {totalEmployeesCount}
              </h3>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-lg">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2.5">
            <span className="text-emerald-500 font-semibold">+{newEmployeesCount}</span> added this fiscal year
          </p>
        </div>

        {/* Daily Attendance Rate */}
        <div
          onClick={() => onActionClick("attendance")}
          className="p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Attendance Today</p>
              <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1">
                {presentToday} / {totalEmployeesCount}
              </h3>
            </div>
            <div className="p-3 bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 rounded-lg">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2.5">
            <span className="text-amber-500 font-semibold">{lateToday}</span> late arrivals flagged
          </p>
        </div>

        {/* Leave status today */}
        <div
          onClick={() => onActionClick("leaves")}
          className="p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Active Leaves Today</p>
              <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1">
                {leavesTodayCount}
              </h3>
            </div>
            <div className="p-3 bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 rounded-lg">
              <CalendarDays className="h-5 w-5" />
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2.5">
            With <span className="text-blue-600 dark:text-blue-400 font-semibold">{leaves.filter((l) => l.status === "Pending").length}</span> applications pending HR sign-off
          </p>
        </div>

        {/* Action center / Pending */}
        <div className="p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Needs Clearance</p>
              <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1">
                {pendingApprovalsCount}
              </h3>
            </div>
            <div className="p-3 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-lg">
              <AlertCircle className="h-5 w-5" />
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2.5">
            Requires active manager / finance approvals
          </p>
        </div>
      </div>

      {/* Role-Based Dashboard customization if it's Employee Self Service */}
      {role === "Employee" && (
        <div className="p-6 bg-gradient-to-r from-blue-900 via-slate-900 to-slate-950 text-white rounded-xl shadow-lg space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold font-display">Employee Quick Clock-In Portal</h3>
              <p className="text-xs text-blue-200">
                Register daily shift attendance using secured web geolocation logs.
              </p>
            </div>
            <button
              onClick={() => onActionClick("attendance")}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/15 transition-all shrink-0"
              id="dash-emp-clockin"
            >
              ⏱️ Go to Attendance Desk
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="bg-white/10 p-3 rounded-lg">
              <p className="text-[10px] text-blue-200 uppercase font-semibold">Leave Balance</p>
              <p className="text-xl font-extrabold mt-1 font-mono">18 Days</p>
            </div>
            <div className="bg-white/10 p-3 rounded-lg">
              <p className="text-[10px] text-blue-200 uppercase font-semibold">Active Goals</p>
              <p className="text-xl font-extrabold mt-1 font-mono">2 OKRs</p>
            </div>
            <div className="bg-white/10 p-3 rounded-lg">
              <p className="text-[10px] text-blue-200 uppercase font-semibold">Pending Claims</p>
              <p className="text-xl font-extrabold mt-1 font-mono">$850.00</p>
            </div>
            <div className="bg-white/10 p-3 rounded-lg">
              <p className="text-[10px] text-blue-200 uppercase font-semibold">Assigned Assets</p>
              <p className="text-xl font-extrabold mt-1 font-mono">3 Items</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Charts & Analytics Hub */}
      {role !== "Employee" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="dashboard-charts-grid">
          {/* Headcount growth over years */}
          <div className="lg:col-span-2 p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2 font-display">
              <TrendingUp className="h-4 w-4 text-blue-500" /> Employee Headcount Growth
            </h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={growthData}>
                  <defs>
                    <linearGradient id="colorHeadcount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="year" stroke="#9ca3af" fontSize={11} />
                  <YAxis stroke="#9ca3af" fontSize={11} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="Headcount"
                    stroke="#2563eb"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorHeadcount)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Department distribution Pie Chart */}
          <div className="p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4">
              Department Distribution
            </h4>
            <div className="h-64 flex flex-col justify-between">
              <div className="h-44">
                {deptData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={deptData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={75}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {deptData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-gray-400">
                    No department data found
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-[11px] font-medium text-gray-500 dark:text-gray-400 px-2 mt-2">
                {deptData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-1.5 truncate">
                    <span
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{ backgroundColor: COLORS[i % COLORS.length] }}
                    />
                    <span className="truncate">{d.name} ({d.value})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Attendance trends past week */}
          <div className="p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4">
              Daily Attendance Trend
            </h4>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="date" stroke="#9ca3af" fontSize={11} />
                  <YAxis stroke="#9ca3af" fontSize={11} />
                  <Tooltip />
                  <Legend fontSize={10} wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey="Present" fill="#10b981" stackId="a" />
                  <Bar dataKey="Late" fill="#f59e0b" stackId="a" />
                  <Bar dataKey="Absent" fill="#ef4444" stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Salary scale representation */}
          <div className="p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4 font-display">
              Basic Salary Distribution
            </h4>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salaryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="name" stroke="#9ca3af" fontSize={11} />
                  <YAxis stroke="#9ca3af" fontSize={11} />
                  <Tooltip formatter={(v) => [`$${v}`, "Salary"]} />
                  <Bar dataKey="Salary" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recruitment candidates funnel */}
          <div className="p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4">
              Recruitment Process Funnel
            </h4>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={funnelData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="phase" stroke="#9ca3af" fontSize={11} />
                  <YAxis stroke="#9ca3af" fontSize={11} />
                  <Tooltip />
                  <Line type="monotone" dataKey="Count" stroke="#ec4899" strokeWidth={2} dot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Grid of Announcements, Holidays, Birthdays */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="dashboard-noticeboard">
        {/* Active Company Announcements */}
        <div className="p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-3">
            <Volume2 className="h-4.5 w-4.5 text-blue-500" />
            <h4 className="text-sm font-bold text-gray-900 dark:text-white font-display">Announcements</h4>
          </div>
          <div className="space-y-3.5">
            {announcements.map((ann) => (
              <div key={ann.id} className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${ann.color}`}>
                    {ann.tag}
                  </span>
                  <span className="text-xs font-semibold text-gray-400">July 18, 2026</span>
                </div>
                <h5 className="text-xs font-bold text-gray-900 dark:text-white">{ann.title}</h5>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">{ann.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Holidays */}
        <div className="p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-3">
            <CalendarCheck className="h-4.5 w-4.5 text-blue-500" />
            <h4 className="text-sm font-bold text-gray-900 dark:text-white font-display">Upcoming Holidays</h4>
          </div>
          <div className="space-y-3">
            {upcomingHolidays.map((h, idx) => (
              <div key={idx} className="flex items-center justify-between py-1 border-b border-gray-50 dark:border-gray-800 last:border-0">
                <div>
                  <h5 className="text-xs font-bold text-gray-900 dark:text-white">{h.name}</h5>
                  <p className="text-[10px] text-gray-400">{h.day}</p>
                </div>
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                  {h.date}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Birthday Celebrations */}
        <div className="p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-3">
            <Gift className="h-4.5 w-4.5 text-pink-500" />
            <h4 className="text-sm font-bold text-gray-900 dark:text-white">July Birthdays</h4>
          </div>
          <div className="space-y-3">
            {birthdays.length > 0 ? (
              birthdays.map((e) => (
                <div key={e.id} className="flex items-center gap-3">
                  {e.photo ? (
                    <img
                      src={e.photo}
                      alt={e.fullName}
                      className="h-8 w-8 rounded-full object-cover shrink-0 border border-gray-200 dark:border-gray-700"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-pink-100 text-pink-700 font-bold text-xs flex items-center justify-center shrink-0">
                      {e.fullName.split(" ").map((n) => n[0]).join("")}
                    </div>
                  )}
                  <div>
                    <h5 className="text-xs font-bold text-gray-900 dark:text-white">{e.fullName}</h5>
                    <p className="text-[10px] text-gray-400">
                      🎂 {e.dateOfBirth.substring(5)} — {e.designation}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-xs text-gray-400">
                No team birthdays this month
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
