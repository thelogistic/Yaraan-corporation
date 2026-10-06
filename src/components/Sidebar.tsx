import React from "react";
import {
  Users,
  Briefcase,
  CalendarCheck,
  CalendarDays,
  CreditCard,
  TrendingUp,
  FileText,
  HelpCircle,
  BarChart3,
  LogOut,
  Sliders,
  Building,
  Menu,
  X,
  MapPin,
  Laptop
} from "lucide-react";
import { UserRole } from "../types";

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  currentUserRole: UserRole;
  setCurrentUserRole: (role: UserRole) => void;
  selectedBranch: string;
  setSelectedBranch: (branch: string) => void;
  lang: string;
  setLang: (lang: string) => void;
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
}

const ROLES: UserRole[] = [
  "Super Administrator",
  "HR Administrator",
  "Company Administrator",
  "Department Manager",
  "Team Leader",
  "Employee",
  "Payroll Officer",
  "Recruiter",
  "Auditor",
];

const BRANCHES = ["All Branches", "Gilgit", "Hunza", "Skardu"];

const TRANSLATIONS: Record<string, Record<string, string>> = {
  en: {
    dashboard: "Dashboard",
    employees: "Employees",
    recruitment: "Recruitment",
    attendance: "Attendance",
    leaves: "Leaves",
    payroll: "Payroll",
    performance: "Performance",
    assetsLoansExpenses: "Assets & Finance",
    trainingHelp: "Training & Support",
    documents: "Document Hub",
    analytics: "Global Analytics",
    branch: "Branch",
    role: "User Role",
    language: "Language",
    theme: "Theme",
    appName: "Yaraan Corporation",
  },
  es: {
    dashboard: "Panel de Control",
    employees: "Empleados",
    recruitment: "Reclutamiento",
    attendance: "Asistencia",
    leaves: "Licencias",
    payroll: "Nómina de Sueldos",
    performance: "Rendimiento",
    assetsLoansExpenses: "Activos y Finanzas",
    trainingHelp: "Capacitación y Soporte",
    documents: "Centro de Documentos",
    analytics: "Análisis Global",
    branch: "Sucursal",
    role: "Rol de Usuario",
    language: "Idioma",
    theme: "Tema",
    appName: "Yaraan Corporation",
  },
  ur: {
    dashboard: "ڈیش بورڈ",
    employees: "ملازمین",
    recruitment: "بھرتی",
    attendance: "حاضری",
    leaves: "رخصتیاں",
    payroll: "تنخواہیں",
    performance: "کارکردگی",
    assetsLoansExpenses: "اثاثے اور فنانس",
    trainingHelp: "تربیت اور سپورٹ",
    documents: "دستاویزات",
    analytics: "تجزیات",
    branch: "شاخ",
    role: "صارف کا کردار",
    language: "زبان",
    theme: "تھیم",
    appName: "یاراں کارپوریشن",
  },
  ar: {
    dashboard: "لوحة التحكم",
    employees: "الموظفين",
    recruitment: "التوظيف",
    attendance: "الحضور والغياب",
    leaves: "الإجازات",
    payroll: "الرواتب",
    performance: "الأداء المالي",
    assetsLoansExpenses: "الأصول والتمويل",
    trainingHelp: "التدريب والدعم",
    documents: "مركز المستندات",
    analytics: "التحليلات العامة",
    branch: "الفرع",
    role: "دور المستخدم",
    language: "اللغة",
    theme: "المظهر",
    appName: "مؤسسة ياران",
  },
};

export default function Sidebar({
  currentTab,
  setCurrentTab,
  currentUserRole,
  setCurrentUserRole,
  selectedBranch,
  setSelectedBranch,
  lang,
  setLang,
  theme,
  setTheme,
}: SidebarProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const menuItems = [
    { id: "dashboard", label: t.dashboard, icon: BarChart3 },
    { id: "employees", label: t.employees, icon: Users },
    { id: "recruitment", label: t.recruitment, icon: Briefcase },
    { id: "attendance", label: t.attendance, icon: CalendarCheck },
    { id: "leaves", label: t.leaves, icon: CalendarDays },
    { id: "payroll", label: t.payroll, icon: CreditCard },
    { id: "performance", label: t.performance, icon: TrendingUp },
    { id: "assets", label: t.assetsLoansExpenses, icon: Laptop },
    { id: "support", label: t.trainingHelp, icon: HelpCircle },
    { id: "documents", label: t.documents, icon: FileText },
    { id: "analytics", label: t.analytics, icon: Sliders },
  ];

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="flex md:hidden items-center justify-between p-4 bg-slate-900 text-white sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">Y</div>
          <span className="font-bold tracking-tight text-lg font-display">{t.appName}</span>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded hover:bg-slate-800 transition-colors focus:outline-none"
          id="mobile-menu-toggle"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar Container */}
      <div
        className={`fixed inset-y-0 left-0 z-40 transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-transform duration-300 ease-in-out md:static flex flex-col w-72 bg-slate-900 text-slate-300 border-r border-slate-800 shrink-0 shadow-xl`}
        id="sidebar-nav"
      >
        {/* Logo / Brand Header */}
        <div className="hidden md:flex items-center gap-3 px-6 py-6 border-b border-slate-800">
          <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20 font-display">
            Y
          </div>
          <div>
            <h1 className="font-bold text-white tracking-tight text-lg leading-tight font-display">
              {t.appName}
            </h1>
            <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Enterprise Suite</p>
          </div>
        </div>

        {/* Dynamic Branch filter */}
        <div className="px-4 py-3 border-b border-slate-800/60 bg-slate-950/40">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            <MapPin className="h-3.5 w-3.5 text-blue-400" />
            <span>{t.branch}</span>
          </div>
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="w-full text-xs bg-slate-800 text-white rounded px-2.5 py-1.5 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium transition-all"
            id="branch-selector"
          >
            {BRANCHES.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        {/* Main Tab Navigation */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-thin scrollbar-thumb-slate-800">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentTab(item.id);
                  setIsOpen(false);
                }}
                className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-blue-600/10 text-blue-400 font-semibold"
                    : "hover:bg-white/5 hover:text-white text-slate-400"
                }`}
                id={`tab-btn-${item.id}`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-blue-400" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Global Access Config Panel (Simulated Authentication / Roles / Toggles) */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 space-y-3">
          {/* Role selector */}
          <div>
            <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              {t.role}
            </span>
            <select
              value={currentUserRole}
              onChange={(e) => {
                setCurrentUserRole(e.target.value as UserRole);
                setIsOpen(false);
              }}
              className="w-full text-xs bg-slate-800 text-white rounded px-2.5 py-1.5 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold transition-all"
              id="role-selector"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Language & Theme Controls */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                {t.language}
              </span>
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="w-full text-xs bg-slate-800 text-slate-200 rounded px-1.5 py-1 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                id="language-selector"
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="ur">اردو</option>
                <option value="ar">العربية</option>
              </select>
            </div>
            <div>
              <span className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                {t.theme}
              </span>
              <button
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                className="w-full text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded px-1.5 py-1 border border-slate-700 focus:outline-none transition-colors"
                id="theme-toggle-btn"
              >
                {theme === "light" ? "🌙 Dark" : "☀️ Light"}
              </button>
            </div>
          </div>

          {/* Profile Status Badge */}
          <div className="flex items-center gap-2.5 pt-1.5 border-t border-slate-800/80">
            <div className="h-8 w-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-inner">
              HR
            </div>
            <div className="overflow-hidden min-w-0">
              <p className="text-xs font-semibold text-white truncate">thelogistic@gmail.com</p>
              <p className="text-[10px] text-blue-400 truncate font-medium">{currentUserRole}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for Mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 md:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
