import React from "react";
import {
  Search,
  Filter,
  UserPlus,
  Mail,
  Phone,
  Briefcase,
  MapPin,
  X,
  Plus,
  Eye,
  Trash2,
  Edit2,
  FileText,
  UploadCloud,
  CheckCircle,
  Building
} from "lucide-react";
import { Employee, UserRole } from "../types";

interface EmployeeManagerProps {
  role: UserRole;
  selectedBranch: string;
  employees: Employee[];
  setEmployees: (employees: Employee[]) => void;
  saveFullStateToBackend: (updatedEmployees: Employee[]) => void;
}

export default function EmployeeManager({
  role,
  selectedBranch,
  employees,
  setEmployees,
  saveFullStateToBackend,
}: EmployeeManagerProps) {
  const [search, setSearch] = React.useState("");
  const [deptFilter, setDeptFilter] = React.useState("All");
  const [statusFilter, setStatusFilter] = React.useState("All");

  const [selectedEmp, setSelectedEmp] = React.useState<Employee | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = React.useState(false);
  const [isEditMode, setIsEditMode] = React.useState(false);

  // Tabs for the Form Modal
  const [activeFormTab, setActiveFormTab] = React.useState<"personal" | "contact" | "employment" | "banking" | "docs">("personal");

  // Form State
  const initialFormState: Partial<Employee> = {
    id: "",
    fullName: "",
    gender: "Male",
    dateOfBirth: "",
    nationalId: "",
    passport: "",
    bloodGroup: "O+",
    maritalStatus: "Single",
    nationality: "",
    mobile: "",
    email: "",
    emergencyContact: { name: "", relationship: "", phone: "" },
    currentAddress: "",
    permanentAddress: "",
    joiningDate: "",
    confirmationDate: "",
    employmentType: "Full-Time",
    department: "Engineering",
    designation: "",
    branch: selectedBranch !== "All Branches" ? selectedBranch : "Gilgit",
    reportingManagerId: "",
    workLocation: "On-site",
    shift: "General Shift",
    employmentStatus: "Active",
    bankName: "",
    branchCode: "",
    accountNumber: "",
    iban: "",
    taxNumber: "",
    basicSalary: 5000,
  };

  const [formData, setFormData] = React.useState<Partial<Employee>>(initialFormState);
  const [uploadedFiles, setUploadedFiles] = React.useState<{ name: string; size: string; category: string }[]>([
    { name: "National_ID_Verified.pdf", size: "1.2 MB", category: "National ID" },
    { name: "Academic_Degree_Transcript.pdf", size: "3.4 MB", category: "Educational" },
    { name: "Signed_Contract_NDA.pdf", size: "2.1 MB", category: "Contract" },
  ]);

  const [dragActive, setDragActive] = React.useState(false);

  // Filter lists based on search & filters
  const filteredEmployees = React.useMemo(() => {
    return employees.filter((e) => {
      // Branch filter
      if (selectedBranch !== "All Branches" && e.branch !== selectedBranch) return false;
      // Search term
      const matchesSearch =
        e.fullName.toLowerCase().includes(search.toLowerCase()) ||
        e.id.toLowerCase().includes(search.toLowerCase()) ||
        e.email.toLowerCase().includes(search.toLowerCase()) ||
        e.department.toLowerCase().includes(search.toLowerCase()) ||
        (e.designation && e.designation.toLowerCase().includes(search.toLowerCase()));
      // Dept filter
      const matchesDept = deptFilter === "All" || e.department === deptFilter;
      // Status filter
      const matchesStatus = statusFilter === "All" || e.employmentStatus === statusFilter;

      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [employees, search, deptFilter, statusFilter, selectedBranch]);

  // Unique departments for filter dropdown
  const departments = React.useMemo(() => {
    const set = new Set(employees.map((e) => e.department));
    return ["All", ...Array.from(set)];
  }, [employees]);

  // Read-only checker
  const isReadOnly = role === "Auditor";

  const handleOpenNewModal = () => {
    if (isReadOnly) return;
    setFormData({
      ...initialFormState,
      id: `EMP-${Math.floor(100 + Math.random() * 900)}`,
      branch: selectedBranch !== "All Branches" ? selectedBranch : "Gilgit",
    });
    setIsEditMode(false);
    setActiveFormTab("personal");
    setIsNewModalOpen(true);
  };

  const handleOpenEditModal = (emp: Employee, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isReadOnly) return;
    setFormData({ ...emp });
    setIsEditMode(true);
    setActiveFormTab("personal");
    setIsNewModalOpen(true);
  };

  const handleDeleteEmployee = (empId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isReadOnly) return;
    if (window.confirm(`Are you sure you want to offboard employee: ${empId}?`)) {
      const updated = employees.filter((emp) => emp.id !== empId);
      setEmployees(updated);
      saveFullStateToBackend(updated);
      if (selectedEmp?.id === empId) setSelectedEmp(null);
    }
  };

  const handleSaveEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;

    if (!formData.fullName || !formData.email || !formData.id) {
      alert("Please fill out Name, Email, and Employee ID.");
      return;
    }

    let updatedList: Employee[];
    if (isEditMode) {
      updatedList = employees.map((emp) => (emp.id === formData.id ? (formData as Employee) : emp));
    } else {
      updatedList = [...employees, formData as Employee];
    }

    setEmployees(updatedList);
    saveFullStateToBackend(updatedList);
    setIsNewModalOpen(false);
    setSelectedEmp(formData as Employee);
  };

  // Drag and drop mechanics for documents
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setUploadedFiles((prev) => [
        ...prev,
        {
          name: file.name,
          size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          category: "Other Document",
        },
      ]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFiles((prev) => [
        ...prev,
        {
          name: file.name,
          size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          category: "Other Document",
        },
      ]);
    }
  };

  return (
    <div className="space-y-6" id="employees-view">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
            Employee Directory
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            View employment status, personal portfolios, banking records, and critical contract documentation.
          </p>
        </div>
        {!isReadOnly && (
          <button
            onClick={handleOpenNewModal}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-md transition-all shrink-0"
            id="add-employee-btn"
          >
            <UserPlus className="h-4 w-4" />
            Add Employee
          </button>
        )}
      </div>

      {/* Directory filter bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-white dark:bg-gray-900 p-4 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm">
        <div className="relative sm:col-span-2">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </span>
          <input
            type="text"
            placeholder="Search by Name, Department, Designation, Email, ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            id="employee-search-input"
          />
        </div>

        {/* Dept Filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-gray-400 shrink-0" />
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="w-full text-xs bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg py-1.5 px-2 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
            id="employee-dept-filter"
          >
            {departments.map((d) => (
              <option key={d} value={d}>
                Dept: {d}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full text-xs bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg py-1.5 px-2 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
          id="employee-status-filter"
        >
          <option value="All">Status: All</option>
          <option value="Active">Active</option>
          <option value="On Leave">On Leave</option>
          <option value="Suspended">Suspended</option>
          <option value="Terminated">Terminated</option>
        </select>
      </div>

      {/* Directory listing grid and layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: List */}
        <div className="lg:col-span-2 space-y-3 max-h-[600px] overflow-y-auto pr-1">
          {filteredEmployees.length > 0 ? (
            filteredEmployees.map((emp) => {
              const isSelected = selectedEmp?.id === emp.id;
              return (
                <div
                  key={emp.id}
                  onClick={() => setSelectedEmp(emp)}
                  className={`p-4 bg-white dark:bg-gray-900 border ${
                    isSelected
                      ? "border-blue-500 ring-1 ring-blue-500 bg-blue-50/10"
                      : "border-gray-200 dark:border-gray-800"
                  } rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4`}
                  id={`emp-card-${emp.id}`}
                >
                  <div className="flex items-center gap-4">
                    {emp.photo ? (
                      <img
                        src={emp.photo}
                        alt={emp.fullName}
                        className="h-12 w-12 rounded-full object-cover shrink-0 border border-gray-200 dark:border-gray-700"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400 font-bold flex items-center justify-center text-sm shrink-0">
                        {emp.fullName.split(" ").map((n) => n[0]).join("")}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-gray-900 dark:text-white truncate">
                          {emp.fullName}
                        </h4>
                        <span className="text-[10px] text-gray-400 font-mono font-bold">
                          {emp.id}
                        </span>
                      </div>
                      <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold truncate">
                        {emp.designation} • {emp.department}
                      </p>
                      <div className="flex items-center gap-3 text-slate-400 text-[11px] mt-1.5">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 shrink-0" /> {emp.branch}
                        </span>
                        <span className="flex items-center gap-1">
                          <Briefcase className="h-3 w-3 shrink-0" /> {emp.employmentType}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3.5 border-t sm:border-t-0 pt-2.5 sm:pt-0 border-gray-100 dark:border-gray-800">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        emp.employmentStatus === "Active"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                          : emp.employmentStatus === "On Leave"
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                          : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                      }`}
                    >
                      {emp.employmentStatus}
                    </span>
                    {!isReadOnly && (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => handleOpenEditModal(emp, e)}
                          className="p-1.5 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 rounded transition-colors"
                          title="Edit Portfolio"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteEmployee(emp.id, e)}
                          className="p-1.5 text-gray-500 hover:text-red-600 dark:hover:text-red-400 rounded transition-colors"
                          title="Offboard Employee"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm text-gray-400">
              No employees match the current filters.
            </div>
          )}
        </div>

        {/* Right column: Selected Employee Portfolio detail view */}
        <div className="lg:col-span-1">
          {selectedEmp ? (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm p-5 sticky top-20 max-h-[600px] overflow-y-auto space-y-5">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
                <h3 className="font-bold text-sm text-gray-900 dark:text-white uppercase tracking-wider">
                  Employee Dossier
                </h3>
                <button
                  onClick={() => setSelectedEmp(null)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                >
                  <X className="h-4 w-4 text-gray-400" />
                </button>
              </div>

              {/* Profile Card Header */}
              <div className="text-center space-y-2">
                {selectedEmp.photo ? (
                  <img
                    src={selectedEmp.photo}
                    alt={selectedEmp.fullName}
                    className="h-20 w-20 rounded-full mx-auto object-cover border-2 border-blue-500 shadow-sm"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400 font-bold flex items-center justify-center text-2xl mx-auto shadow-inner">
                    {selectedEmp.fullName.split(" ").map((n) => n[0]).join("")}
                  </div>
                )}
                <div>
                  <h4 className="font-extrabold text-base text-gray-900 dark:text-white">
                    {selectedEmp.fullName}
                  </h4>
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold">
                    {selectedEmp.designation} • {selectedEmp.department}
                  </p>
                  <p className="text-[10px] text-gray-400 font-mono font-bold uppercase">
                    ID: {selectedEmp.id}
                  </p>
                </div>
              </div>

              {/* Personal details accordion/subgroups */}
              <div className="space-y-4 text-xs">
                {/* Employment Block */}
                <div className="bg-gray-50 dark:bg-gray-800/40 p-3.5 rounded-lg space-y-2.5">
                  <h5 className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5 border-b border-gray-200 dark:border-gray-700 pb-1 text-[11px]">
                    <Building className="h-3.5 w-3.5 text-blue-500" /> Employment Details
                  </h5>
                  <div className="grid grid-cols-2 gap-2 text-gray-600 dark:text-gray-300">
                    <div>
                      <p className="text-[10px] text-gray-400">Join Date</p>
                      <p className="font-semibold">{selectedEmp.joiningDate}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400">Shift</p>
                      <p className="font-semibold">{selectedEmp.shift}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400">Work Type</p>
                      <p className="font-semibold">{selectedEmp.employmentType}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400">Location</p>
                      <p className="font-semibold">{selectedEmp.workLocation}</p>
                    </div>
                  </div>
                </div>

                {/* Personal & Contact Details */}
                <div className="bg-gray-50 dark:bg-gray-800/40 p-3.5 rounded-lg space-y-2.5">
                  <h5 className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5 border-b border-gray-200 dark:border-gray-700 pb-1 text-[11px]">
                    👤 Personal Information
                  </h5>
                  <div className="grid grid-cols-2 gap-2 text-gray-600 dark:text-gray-300">
                    <div>
                      <p className="text-[10px] text-gray-400">Gender</p>
                      <p className="font-semibold">{selectedEmp.gender}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400">Blood Group</p>
                      <p className="font-semibold">{selectedEmp.bloodGroup}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400">DOB</p>
                      <p className="font-semibold">{selectedEmp.dateOfBirth}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400">Nationality</p>
                      <p className="font-semibold">{selectedEmp.nationality}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-[10px] text-gray-400">Current Address</p>
                      <p className="font-medium">{selectedEmp.currentAddress}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400">Mobile</p>
                      <p className="font-semibold">{selectedEmp.mobile}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400">Email</p>
                      <p className="font-semibold truncate">{selectedEmp.email}</p>
                    </div>
                  </div>
                </div>

                {/* Banking details block */}
                <div className="bg-gray-50 dark:bg-gray-800/40 p-3.5 rounded-lg space-y-2.5">
                  <h5 className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5 border-b border-gray-200 dark:border-gray-700 pb-1 text-[11px]">
                    🏦 Banking & Tax Records
                  </h5>
                  <div className="space-y-1.5 text-gray-600 dark:text-gray-300">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Bank Name</span>
                      <span className="font-semibold">{selectedEmp.bankName || "Chase Bank"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Account No.</span>
                      <span className="font-mono font-semibold">{selectedEmp.accountNumber || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">IBAN</span>
                      <span className="font-mono text-[10px] font-semibold truncate max-w-[150px]">{selectedEmp.iban || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Tax Number</span>
                      <span className="font-mono font-semibold">{selectedEmp.taxNumber || "—"}</span>
                    </div>
                  </div>
                </div>

                {/* Verification Documents List */}
                <div className="bg-gray-50 dark:bg-gray-800/40 p-3.5 rounded-lg space-y-2">
                  <h5 className="font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-1 text-[11px]">
                    📂 Verification Files
                  </h5>
                  <div className="space-y-1.5">
                    {uploadedFiles.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between p-1.5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded">
                        <span className="flex items-center gap-1 text-[10px] text-gray-600 dark:text-gray-300 truncate">
                          <FileText className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                          <span className="truncate max-w-[120px]">{file.name}</span>
                        </span>
                        <span className="text-[8px] font-bold text-blue-500 bg-blue-50 dark:bg-blue-950 px-1 py-0.5 rounded">
                          {file.category}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center border border-dashed border-gray-300 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900 text-center p-6 text-gray-400">
              <Eye className="h-8 w-8 mb-2" />
              <p className="text-xs font-semibold">No Employee Selected</p>
              <p className="text-[10px] max-w-[180px] mt-1 text-gray-500">
                Click on any directory record card on the left to view their comprehensive portfolio.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Multi-Tab Form Modal for Adding/Editing Employees */}
      {isNewModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-gray-200 dark:border-gray-800 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
              <h3 className="font-extrabold text-gray-900 dark:text-white text-base">
                {isEditMode ? "Modify Employee Portfolio" : "Initiate Employee Onboarding"}
              </h3>
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
              >
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            {/* Modal Tabs navigation */}
            <div className="flex border-b border-gray-100 dark:border-gray-800 text-xs bg-gray-50 dark:bg-gray-950/40">
              {(["personal", "contact", "employment", "banking", "docs"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveFormTab(tab)}
                  className={`flex-1 py-3 text-center font-bold capitalize border-b-2 transition-all ${
                    activeFormTab === tab
                      ? "border-blue-600 text-blue-600 dark:text-blue-400 font-extrabold bg-white dark:bg-gray-900"
                      : "border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Form body */}
            <form onSubmit={handleSaveEmployee} className="flex-1 overflow-y-auto p-5 space-y-4">
              {activeFormTab === "personal" && (
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-gray-400 font-bold mb-1">Employee ID*</label>
                    <input
                      type="text"
                      required
                      value={formData.id}
                      disabled={isEditMode}
                      onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded p-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 font-bold mb-1">Full Name*</label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded p-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 font-bold mb-1">Gender</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded p-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Non-Binary">Non-Binary</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-400 font-bold mb-1">Date of Birth</label>
                    <input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded p-2 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 font-bold mb-1">National ID Number</label>
                    <input
                      type="text"
                      value={formData.nationalId}
                      onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded p-2 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 font-bold mb-1">Passport Number</label>
                    <input
                      type="text"
                      value={formData.passport}
                      onChange={(e) => setFormData({ ...formData, passport: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded p-2 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 font-bold mb-1">Blood Group</label>
                    <select
                      value={formData.bloodGroup}
                      onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded p-2"
                    >
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-400 font-bold mb-1">Marital Status</label>
                    <select
                      value={formData.maritalStatus}
                      onChange={(e) => setFormData({ ...formData, maritalStatus: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded p-2"
                    >
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                      <option value="Divorced">Divorced</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-gray-400 font-bold mb-1">Nationality</label>
                    <input
                      type="text"
                      value={formData.nationality}
                      onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded p-2"
                    />
                  </div>
                </div>
              )}

              {activeFormTab === "contact" && (
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-gray-400 font-bold mb-1">Mobile Line</label>
                    <input
                      type="tel"
                      value={formData.mobile}
                      onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 font-bold mb-1">Email Portfolio*</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded p-2"
                    />
                  </div>
                  <div className="col-span-2 bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-gray-100 dark:border-gray-800 space-y-3">
                    <h4 className="font-bold text-gray-800 dark:text-slate-200">Emergency Contact Detail</h4>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[10px] text-gray-400 mb-0.5">Contact Name</label>
                        <input
                          type="text"
                          value={formData.emergencyContact?.name || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              emergencyContact: {
                                ...(formData.emergencyContact as any),
                                name: e.target.value,
                              },
                            })
                          }
                          className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded p-1.5"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-400 mb-0.5">Relationship</label>
                        <input
                          type="text"
                          value={formData.emergencyContact?.relationship || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              emergencyContact: {
                                ...(formData.emergencyContact as any),
                                relationship: e.target.value,
                              },
                            })
                          }
                          className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded p-1.5"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-400 mb-0.5">Phone Line</label>
                        <input
                          type="text"
                          value={formData.emergencyContact?.phone || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              emergencyContact: {
                                ...(formData.emergencyContact as any),
                                phone: e.target.value,
                              },
                            })
                          }
                          className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded p-1.5"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-gray-400 font-bold mb-1">Current Residential Address</label>
                    <textarea
                      value={formData.currentAddress}
                      onChange={(e) => setFormData({ ...formData, currentAddress: e.target.value })}
                      rows={2}
                      className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded p-2"
                    />
                  </div>
                </div>
              )}

              {activeFormTab === "employment" && (
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-gray-400 font-bold mb-1">Joining Date</label>
                    <input
                      type="date"
                      value={formData.joiningDate}
                      onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 font-bold mb-1">Employment Type</label>
                    <select
                      value={formData.employmentType}
                      onChange={(e) => setFormData({ ...formData, employmentType: e.target.value as any })}
                      className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded p-2"
                    >
                      <option value="Full-Time">Full-Time</option>
                      <option value="Part-Time">Part-Time</option>
                      <option value="Contract">Contract</option>
                      <option value="Intern">Intern</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-400 font-bold mb-1">Department</label>
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded p-2"
                    >
                      <option value="Engineering">Engineering</option>
                      <option value="Product Management">Product Management</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Human Resources">Human Resources</option>
                      <option value="Executive Management">Executive Management</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-400 font-bold mb-1">Designation</label>
                    <input
                      type="text"
                      value={formData.designation}
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                      placeholder="e.g. Lead Dev, Designer"
                      className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 font-bold mb-1">Branch</label>
                    <select
                      value={formData.branch || "Gilgit"}
                      onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded p-2"
                    >
                      <option value="Gilgit">Gilgit</option>
                      <option value="Hunza">Hunza</option>
                      <option value="Skardu">Skardu</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-400 font-bold mb-1">Basic Salary Monthly ($)</label>
                    <input
                      type="number"
                      value={formData.basicSalary}
                      onChange={(e) => setFormData({ ...formData, basicSalary: Number(e.target.value) })}
                      className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded p-2"
                    />
                  </div>
                </div>
              )}

              {activeFormTab === "banking" && (
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-gray-400 font-bold mb-1">Bank Name</label>
                    <input
                      type="text"
                      value={formData.bankName}
                      onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 font-bold mb-1">Branch Code / SWIFT</label>
                    <input
                      type="text"
                      value={formData.branchCode}
                      onChange={(e) => setFormData({ ...formData, branchCode: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 font-bold mb-1">Account Number</label>
                    <input
                      type="text"
                      value={formData.accountNumber}
                      onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 font-bold mb-1">IBAN No.</label>
                    <input
                      type="text"
                      value={formData.iban}
                      onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded p-2"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-gray-400 font-bold mb-1">Corporate Tax Identifier</label>
                    <input
                      type="text"
                      value={formData.taxNumber}
                      onChange={(e) => setFormData({ ...formData, taxNumber: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded p-2"
                    />
                  </div>
                </div>
              )}

              {activeFormTab === "docs" && (
                <div className="space-y-4 text-xs">
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer ${
                      dragActive
                        ? "border-blue-600 bg-blue-50/10"
                        : "border-gray-300 dark:border-gray-800 hover:border-blue-400"
                    }`}
                  >
                    <UploadCloud className="h-10 w-10 text-blue-500 mx-auto mb-2" />
                    <p className="font-semibold text-gray-700 dark:text-gray-300">
                      Drag & Drop verification papers or browse
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1">
                      Supports PDF, PNG, JPG (Max 10MB)
                    </p>
                    <input
                      type="file"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="onboarding-file-picker"
                    />
                    <label
                      htmlFor="onboarding-file-picker"
                      className="mt-3 inline-block px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-[11px] font-bold shadow-md cursor-pointer"
                    >
                      Browse Files
                    </label>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-bold text-gray-800 dark:text-white">Uploaded Document Files</h4>
                    <div className="space-y-2 max-h-[150px] overflow-y-auto">
                      {uploadedFiles.map((f, i) => (
                        <div key={i} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-950 rounded border border-gray-100 dark:border-gray-900">
                          <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300 truncate">
                            <FileText className="h-4 w-4 text-blue-500 shrink-0" />
                            <span className="truncate max-w-[180px]">{f.name}</span>
                            <span className="text-[9px] text-gray-400">({f.size})</span>
                          </span>
                          <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded">
                            {f.category}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Modal controls */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded font-bold shadow-md"
                  id="save-employee-btn"
                >
                  {isEditMode ? "Save Changes" : "Confirm Onboarding"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
