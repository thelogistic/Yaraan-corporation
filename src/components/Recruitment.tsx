import React from "react";
import {
  Briefcase,
  Users,
  Calendar,
  Sparkles,
  Star,
  CheckCircle,
  FileText,
  Clock,
  Plus,
  Send,
  AlertCircle,
  X
} from "lucide-react";
import { JobOpening, Applicant, UserRole } from "../types";

interface RecruitmentProps {
  role: UserRole;
  jobOpenings: JobOpening[];
  setJobOpenings: (openings: JobOpening[]) => void;
  applicants: Applicant[];
  setApplicants: (applicants: Applicant[]) => void;
  saveFullStateToBackend: (updatedApplicants: Applicant[], updatedJobs?: JobOpening[]) => void;
}

export default function Recruitment({
  role,
  jobOpenings,
  setJobOpenings,
  applicants,
  setApplicants,
  saveFullStateToBackend,
}: RecruitmentProps) {
  const [activeTab, setActiveTab] = React.useState<"jobs" | "applicants" | "parser">("jobs");
  const [selectedJob, setSelectedJob] = React.useState<JobOpening | null>(null);
  const [selectedApplicant, setSelectedApplicant] = React.useState<Applicant | null>(null);

  // Resume Parser state
  const [resumeText, setResumeText] = React.useState("");
  const [isParsing, setIsParsing] = React.useState(false);
  const [parsedResult, setParsedResult] = React.useState<any>(null);

  // New Job Opening State
  const [isNewJobOpen, setIsNewJobOpen] = React.useState(false);
  const [newJob, setNewJob] = React.useState<Partial<JobOpening>>({
    title: "",
    department: "Engineering",
    location: "Gilgit",
    experience: "3+ Years",
    type: "Full-Time",
    status: "Open",
    description: "",
  });

  // Offer Letter Generated State
  const [generatedOfferText, setGeneratedOfferText] = React.useState("");
  const [isGeneratingOffer, setIsGeneratingOffer] = React.useState(false);

  const isReadOnly = role === "Auditor";

  // Filter applicants based on job selection
  const visibleApplicants = React.useMemo(() => {
    if (!selectedJob) return applicants;
    return applicants.filter((a) => a.jobId === selectedJob.id);
  }, [applicants, selectedJob]);

  // Handle rating change
  const handleRateApplicant = (appId: string, rating: number) => {
    if (isReadOnly) return;
    const updated = applicants.map((a) => (a.id === appId ? { ...a, rating } : a));
    setApplicants(updated);
    saveFullStateToBackend(updated);
    if (selectedApplicant?.id === appId) {
      setSelectedApplicant((prev) => (prev ? { ...prev, rating } : null));
    }
  };

  // Handle status workflow change
  const handleStatusChange = (appId: string, status: Applicant["status"]) => {
    if (isReadOnly) return;
    const updated = applicants.map((a) => (a.id === appId ? { ...a, status } : a));
    setApplicants(updated);
    saveFullStateToBackend(updated);
    if (selectedApplicant?.id === appId) {
      setSelectedApplicant((prev) => (prev ? { ...prev, status } : null));
    }
  };

  // Handle Interview Schedule
  const handleScheduleInterview = (appId: string, date: string) => {
    if (isReadOnly) return;
    const updated = applicants.map((a) => (a.id === appId ? { ...a, interviewDate: date, status: "Interviewing" as const } : a));
    setApplicants(updated);
    saveFullStateToBackend(updated);
    if (selectedApplicant?.id === appId) {
      setSelectedApplicant((prev) => (prev ? { ...prev, interviewDate: date, status: "Interviewing" } : null));
    }
    alert("Interview schedule updated successfully!");
  };

  // Handle feedback submit
  const handleSubmitFeedback = (appId: string, feedback: string) => {
    if (isReadOnly) return;
    const updated = applicants.map((a) => (a.id === appId ? { ...a, interviewFeedback: feedback } : a));
    setApplicants(updated);
    saveFullStateToBackend(updated);
    if (selectedApplicant?.id === appId) {
      setSelectedApplicant((prev) => (prev ? { ...prev, interviewFeedback: feedback } : null));
    }
    alert("Interview feedback logged!");
  };

  // Gemini Resume Parser integration
  const handleParseResume = async () => {
    if (!resumeText.trim()) return;
    setIsParsing(true);
    setParsedResult(null);

    try {
      const res = await fetch("/api/gemini/parse-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText }),
      });
      const data = await res.json();
      setParsedResult(data);
    } catch (e) {
      console.error(e);
      alert("Error invoking Gemini parsing layer.");
    } finally {
      setIsParsing(false);
    }
  };

  // Add Candidate from Parser
  const handleAddCandidateFromParsed = () => {
    if (!parsedResult) return;
    const newApp: Applicant = {
      id: `APP-${Math.floor(400 + Math.random() * 500)}`,
      jobId: selectedJob?.id || "JOB-001",
      jobTitle: selectedJob?.title || "Senior Full-Stack Engineer",
      fullName: "Auto-Parsed Candidate",
      email: "parsed.candidate@example.com",
      phone: "+1 (555) 990-1122",
      status: "Applied",
      rating: 4,
      resumeText: resumeText,
      parsedData: {
        skills: parsedResult.skills || [],
        experience: parsedResult.experience || "",
        recommendation: parsedResult.recommendation || "",
      },
    };

    const updated = [...applicants, newApp];
    setApplicants(updated);
    saveFullStateToBackend(updated);
    alert("New candidate imported to directory!");
    setActiveTab("applicants");
    setSelectedApplicant(newApp);
  };

  // Add Job Opening
  const handleAddJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;
    const job: JobOpening = {
      id: `JOB-${Math.floor(100 + Math.random() * 900)}`,
      title: newJob.title || "New Opening",
      department: newJob.department || "Engineering",
      location: newJob.location || "Gilgit",
      experience: newJob.experience || "3+ Years",
      type: newJob.type || "Full-Time",
      status: "Open",
      description: newJob.description || "",
    };

    const updatedJobs = [...jobOpenings, job];
    setJobOpenings(updatedJobs);
    saveFullStateToBackend(applicants, updatedJobs);
    setIsNewJobOpen(false);
    setNewJob({
      title: "",
      department: "Engineering",
      location: "Gilgit",
      experience: "3+ Years",
      type: "Full-Time",
      status: "Open",
      description: "",
    });
  };

  // Generate Letter from Gemini
  const handleGenerateOfferLetter = async () => {
    if (!selectedApplicant) return;
    setIsGeneratingOffer(true);
    setGeneratedOfferText("");

    const templateText = `Dear {{fullName}},\n\nWe are pleased to offer you the position of {{designation}} at our {{branch}} branch. Your joining date will be {{joiningDate}}.\n\nYour starting basic salary will be \${{salary}} per month, plus standard allowances. Please review and sign this offer.\n\nBest regards,\nSarah Jenkins\nVP of HR & Operations`;

    const variables = {
      fullName: selectedApplicant.fullName,
      designation: selectedApplicant.jobTitle,
      branch: "Gilgit",
      joiningDate: "2026-08-01",
      salary: "8500",
    };

    try {
      const res = await fetch("/api/gemini/generate-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateText, variables }),
      });
      const data = await res.json();
      setGeneratedOfferText(data.content);
    } catch (e) {
      console.error(e);
      alert("Could not generate letter dynamically.");
    } finally {
      setIsGeneratingOffer(false);
    }
  };

  return (
    <div className="space-y-6" id="recruitment-view">
      {/* Module Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
            Recruitment Desk
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Publish job profiles, rate candidates, schedule technical interviews, and use Gemini AI to parse resumes or draft offer sheets.
          </p>
        </div>
        {!isReadOnly && activeTab === "jobs" && (
          <button
            onClick={() => setIsNewJobOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-md transition-all shrink-0"
            id="publish-job-btn"
          >
            <Plus className="h-4 w-4" />
            Publish Job Opening
          </button>
        )}
      </div>

      {/* Navigation tabs inside recruitment */}
      <div className="flex border-b border-gray-200 dark:border-gray-800 text-xs">
        <button
          onClick={() => setActiveTab("jobs")}
          className={`py-3 px-6 font-bold border-b-2 transition-all ${
            activeTab === "jobs"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white"
          }`}
          id="rec-tab-jobs"
        >
          💼 Job Openings ({jobOpenings.length})
        </button>
        <button
          onClick={() => setActiveTab("applicants")}
          className={`py-3 px-6 font-bold border-b-2 transition-all ${
            activeTab === "applicants"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white"
          }`}
          id="rec-tab-applicants"
        >
          👥 Candidate Funnel ({applicants.length})
        </button>
        <button
          onClick={() => setActiveTab("parser")}
          className={`py-3 px-6 font-bold border-b-2 transition-all ${
            activeTab === "parser"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white"
          }`}
          id="rec-tab-parser"
        >
          ✨ Gemini Resume Screen
        </button>
      </div>

      {/* TAB 1: JOB OPENINGS LIST */}
      {activeTab === "jobs" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            {jobOpenings.map((job) => {
              const appCount = applicants.filter((a) => a.jobId === job.id).length;
              const isSelected = selectedJob?.id === job.id;
              return (
                <div
                  key={job.id}
                  onClick={() => setSelectedJob(job)}
                  className={`p-5 bg-white dark:bg-gray-900 border ${
                    isSelected ? "border-blue-500 ring-1 ring-blue-500" : "border-gray-200 dark:border-gray-800"
                  } rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer space-y-3`}
                  id={`job-opening-${job.id}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="font-extrabold text-sm text-gray-900 dark:text-white">
                        {job.title}
                      </h4>
                      <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold mt-0.5">
                        {job.department} • {job.experience}
                      </p>
                    </div>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                        job.status === "Open"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                          : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                      }`}
                    >
                      {job.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed truncate">
                    {job.description}
                  </p>
                  <div className="flex items-center gap-4 text-[11px] text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-800">
                    <span className="flex items-center gap-1">
                      📍 {job.location}
                    </span>
                    <span className="flex items-center gap-1">
                      🕒 {job.type}
                    </span>
                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                      👥 {appCount} Applicants
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Job Details Sidebar (applicants quick glance) */}
          <div className="md:col-span-1">
            {selectedJob ? (
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 space-y-4 shadow-sm sticky top-20">
                <div className="border-b border-gray-100 dark:border-gray-800 pb-3">
                  <h4 className="font-extrabold text-sm text-gray-900 dark:text-white">
                    {selectedJob.title}
                  </h4>
                  <p className="text-xs text-gray-400 mt-1">Applicants list matching this profile</p>
                </div>
                <div className="space-y-2.5 max-h-[300px] overflow-y-auto">
                  {visibleApplicants.length > 0 ? (
                    visibleApplicants.map((app) => (
                      <div
                        key={app.id}
                        onClick={() => {
                          setSelectedApplicant(app);
                          setActiveTab("applicants");
                        }}
                        className="p-3 bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800/60 rounded-lg cursor-pointer hover:bg-blue-50/10 hover:border-blue-400 transition-colors flex items-center justify-between"
                      >
                        <div>
                          <p className="text-xs font-bold text-gray-900 dark:text-white">{app.fullName}</p>
                          <p className="text-[10px] text-blue-600 dark:text-blue-400 mt-0.5">{app.status}</p>
                        </div>
                        <div className="flex items-center text-amber-500">
                          {Array.from({ length: app.rating }).map((_, i) => (
                            <Star key={i} className="h-3 w-3 fill-amber-500" />
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-xs text-gray-400">
                      No candidate submissions yet.
                    </div>
                  )}
                </div>
                <button
                  onClick={() => {
                    setActiveTab("parser");
                  }}
                  className="w-full py-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-950/80 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-bold transition-all"
                >
                  ✨ Run Gemini Resume Screen
                </button>
              </div>
            ) : (
              <div className="h-44 border border-dashed border-gray-300 dark:border-gray-800 rounded-xl flex items-center justify-center p-6 text-center text-xs text-gray-400">
                Select a job opening on the left to see applicant tracking data.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: CANDIDATE PIPELINE & WORKFLOWS */}
      {activeTab === "applicants" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Candidates selector */}
          <div className="lg:col-span-1 space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {applicants.map((app) => {
              const isSelected = selectedApplicant?.id === app.id;
              return (
                <div
                  key={app.id}
                  onClick={() => {
                    setSelectedApplicant(app);
                    setGeneratedOfferText(""); // reset
                  }}
                  className={`p-3.5 bg-white dark:bg-gray-900 border ${
                    isSelected ? "border-blue-500 ring-1 ring-blue-500" : "border-gray-200 dark:border-gray-800"
                  } rounded-xl shadow-sm hover:shadow-md cursor-pointer transition-all space-y-1.5`}
                  id={`applicant-card-${app.id}`}
                >
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-xs text-gray-900 dark:text-white truncate">
                      {app.fullName}
                    </h5>
                    <span className="text-[9px] text-gray-400 font-mono font-bold">{app.id}</span>
                  </div>
                  <p className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold truncate">
                    {app.jobTitle}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-gray-400">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${
                      app.status === "Offered" ? "bg-emerald-100 text-emerald-700" :
                      app.status === "Interviewing" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600"
                    }`}>
                      {app.status}
                    </span>
                    <div className="flex items-center gap-0.5 text-amber-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRateApplicant(app.id, i + 1);
                          }}
                          className={`h-3 w-3 ${i < app.rating ? "fill-amber-500" : "text-gray-300"}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Workflow panels */}
          <div className="lg:col-span-2">
            {selectedApplicant ? (
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 space-y-5 shadow-sm">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                  <div>
                    <h3 className="font-extrabold text-base text-gray-900 dark:text-white">
                      {selectedApplicant.fullName}
                    </h3>
                    <p className="text-xs text-gray-400">{selectedApplicant.email} • {selectedApplicant.phone}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-400 font-bold font-mono">Status workflow:</span>
                    <select
                      value={selectedApplicant.status}
                      onChange={(e) => handleStatusChange(selectedApplicant.id, e.target.value as any)}
                      className="text-xs bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded py-1 px-2 focus:outline-none"
                    >
                      <option value="Applied">Applied</option>
                      <option value="Screened">Screened</option>
                      <option value="Interviewing">Interviewing</option>
                      <option value="Offered">Offered</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>
                </div>

                {/* Resume block */}
                {selectedApplicant.resumeText && (
                  <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-lg space-y-1.5">
                    <h5 className="font-bold text-xs text-gray-900 dark:text-white">📄 Core Resume Excerpt</h5>
                    <p className="text-xs text-gray-600 dark:text-gray-300 italic leading-relaxed">
                      "{selectedApplicant.resumeText}"
                    </p>
                  </div>
                )}

                {/* Gemini Screening Feedback block if exists */}
                {selectedApplicant.parsedData && (
                  <div className="bg-blue-50/40 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-100 dark:border-blue-950 space-y-2">
                    <h5 className="font-bold text-xs text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4" /> Gemini AI Screener Evaluation
                    </h5>
                    <div className="text-xs space-y-1.5 text-gray-600 dark:text-gray-300">
                      <div>
                        <span className="font-bold text-blue-600 dark:text-blue-400">Extracted Skills:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedApplicant.parsedData.skills?.map((sk: string) => (
                            <span key={sk} className="bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 text-[10px] font-semibold px-2 py-0.5 rounded">
                              {sk}
                            </span>
                          ))}
                        </div>
                      </div>
                      <p>
                        <span className="font-bold text-blue-600 dark:text-blue-400">Experience Profile:</span>{" "}
                        {selectedApplicant.parsedData.experience}
                      </p>
                      <p className="bg-blue-50 dark:bg-blue-950/40 p-2 rounded text-blue-800 dark:text-blue-300 font-medium">
                        💡 {selectedApplicant.parsedData.recommendation}
                      </p>
                    </div>
                  </div>
                )}

                {/* Scheduling and Interview logs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="bg-gray-50 dark:bg-gray-800/40 p-4 rounded-lg space-y-3">
                    <h5 className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-blue-500" /> Schedule Interview
                    </h5>
                    <div>
                      <label className="block text-gray-400 mb-1">Select Date & Time</label>
                      <input
                        type="datetime-local"
                        defaultValue={selectedApplicant.interviewDate?.substring(0, 16) || ""}
                        onChange={(e) => handleScheduleInterview(selectedApplicant.id, new Date(e.target.value).toISOString())}
                        className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded p-1.5"
                      />
                    </div>
                    {selectedApplicant.interviewDate && (
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/20 p-2 rounded">
                        ✓ Scheduled for: {new Date(selectedApplicant.interviewDate).toLocaleString()}
                      </p>
                    )}
                  </div>

                  {/* Feedback logs */}
                  <div className="bg-gray-50 dark:bg-gray-800/40 p-4 rounded-lg space-y-2.5">
                    <h5 className="font-bold text-gray-900 dark:text-white">✍️ Interview Feedback & Rating</h5>
                    <textarea
                      placeholder="Input evaluation feedback and notes..."
                      defaultValue={selectedApplicant.interviewFeedback || ""}
                      onBlur={(e) => handleSubmitFeedback(selectedApplicant.id, e.target.value)}
                      rows={3}
                      className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded p-1.5"
                    />
                    <p className="text-[10px] text-gray-400 italic">Logs are auto-saved on field unfocus.</p>
                  </div>
                </div>

                {/* Offer Letter Creator tool */}
                {selectedApplicant.status === "Offered" && (
                  <div className="border-t border-gray-200 dark:border-gray-800 pt-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-xs text-gray-900 dark:text-white">
                          ✉️ Gemini AI Offer Letter Generator
                        </h4>
                        <p className="text-[11px] text-gray-400">Draft an elevated formal contract using applicant properties.</p>
                      </div>
                      <button
                        onClick={handleGenerateOfferLetter}
                        disabled={isGeneratingOffer}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded shadow transition-all flex items-center gap-1.5"
                      >
                        {isGeneratingOffer ? "Generating with Gemini..." : "✨ Draft Letter"}
                      </button>
                    </div>

                    {generatedOfferText && (
                      <div className="bg-slate-50 dark:bg-slate-950 border border-gray-200 dark:border-gray-800 rounded-lg p-4 space-y-3 max-h-[300px] overflow-y-auto">
                        <pre className="text-xs text-gray-800 dark:text-gray-200 font-sans whitespace-pre-wrap leading-relaxed">
                          {generatedOfferText}
                        </pre>
                        <div className="flex justify-end pt-2 border-t border-gray-100 dark:border-gray-800">
                          <button
                            onClick={() => {
                              alert("Offer document officially signed & dispatched to applicant inbox!");
                            }}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold text-xs shadow"
                          >
                            ✓ Dispatch Formal Offer
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="h-64 border border-dashed border-gray-300 dark:border-gray-800 rounded-xl flex items-center justify-center p-6 text-center text-xs text-gray-400">
                Select a candidate on the left to handle rating scales, schedule interviews, and log feedback.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: RESUME SCREENING PARSER */}
      {activeTab === "parser" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 rounded-xl shadow-sm">
          <div className="space-y-4 text-xs">
            <div>
              <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                ✨ Paste Raw Resume / Candidate Bio
              </h3>
              <p className="text-gray-400 mt-1">
                Input any raw applicant text (bio, resume sections, linkedin summary) to use Gemini's deep screening intelligence.
              </p>
            </div>
            <textarea
              placeholder="Paste candidate text here..."
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              rows={12}
              className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg p-3.5 focus:outline-none focus:ring-1 focus:ring-blue-500 leading-relaxed font-sans"
            />
            <button
              onClick={handleParseResume}
              disabled={isParsing || !resumeText.trim()}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-400 text-white text-xs font-bold rounded-lg shadow shadow-blue-600/10 flex items-center justify-center gap-2 transition-all"
            >
              {isParsing ? "Analyzing Text & Recommending..." : "🔮 Parse with Gemini Intelligence"}
            </button>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-xl border border-gray-100 dark:border-gray-900 flex flex-col justify-between">
            <div className="space-y-4 text-xs">
              <h4 className="font-bold text-sm text-blue-700 dark:text-blue-400 flex items-center gap-1.5 border-b border-blue-100 dark:border-blue-900/60 pb-2">
                Parsed Screening Evaluation
              </h4>

              {parsedResult ? (
                <div className="space-y-4 leading-relaxed">
                  <div className="space-y-1.5">
                    <span className="font-bold text-gray-400">Extracted Skills</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {parsedResult.skills && parsedResult.skills.length > 0 ? (
                        parsedResult.skills.map((skill: string) => (
                          <span
                            key={skill}
                            className="bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded"
                          >
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-400">No skills identified.</span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="font-bold text-gray-400">Experience Profile</span>
                    <p className="text-gray-700 dark:text-gray-300 font-medium">
                      {parsedResult.experience || "No experience summary extracted."}
                    </p>
                  </div>

                  <div className="space-y-1 bg-white dark:bg-gray-900 p-3.5 border border-blue-100 dark:border-blue-950 rounded-lg">
                    <span className="font-bold text-blue-600 dark:text-blue-400">Suitability Recommendation</span>
                    <p className="text-gray-800 dark:text-blue-200 mt-1 font-bold">
                      {parsedResult.recommendation || "Pending parsing."}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="h-44 flex flex-col items-center justify-center text-center text-gray-400 space-y-1.5">
                  <AlertCircle className="h-6 w-6 text-gray-300" />
                  <p className="font-semibold">Awaiting Parser Run</p>
                  <p className="text-[10px] text-gray-500 max-w-[200px]">
                    Paste candidate profile details and click parsing button to fetch Gemini metadata response.
                  </p>
                </div>
              )}
            </div>

            {parsedResult && (
              <div className="pt-4 border-t border-gray-100 dark:border-gray-900/60 space-y-2.5">
                <div className="text-[10px] text-gray-400">
                  Import candidate directly into database:
                </div>
                <button
                  onClick={handleAddCandidateFromParsed}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold shadow transition-all"
                >
                  ✓ Import into Candidate Directory
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* New Job Modal Form */}
      {isNewJobOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleAddJob} className="bg-white dark:bg-gray-900 rounded-xl max-w-md w-full border border-gray-200 dark:border-gray-800 p-5 space-y-4 text-xs shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white">Publish New Job Opening</h3>
              <button
                type="button"
                onClick={() => setIsNewJobOpen(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-gray-400 font-bold mb-1">Job Title*</label>
                <input
                  type="text"
                  required
                  value={newJob.title}
                  onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                  placeholder="e.g. Lead Dev, Product Designer"
                  className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded p-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-gray-400 font-bold mb-1">Department</label>
                  <select
                    value={newJob.department}
                    onChange={(e) => setNewJob({ ...newJob, department: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded p-2"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Product Management">Product Management</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Human Resources">Human Resources</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 font-bold mb-1">Experience</label>
                  <input
                    type="text"
                    value={newJob.experience}
                    onChange={(e) => setNewJob({ ...newJob, experience: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded p-2"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-gray-400 font-bold mb-1">Location / Branch</label>
                  <select
                    value={newJob.location || "Gilgit"}
                    onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded p-2"
                  >
                    <option value="Gilgit">Gilgit</option>
                    <option value="Hunza">Hunza</option>
                    <option value="Skardu">Skardu</option>
                    <option value="Remote">Remote</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 font-bold mb-1">Type</label>
                  <select
                    value={newJob.type}
                    onChange={(e) => setNewJob({ ...newJob, type: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded p-2"
                  >
                    <option value="Full-Time">Full-Time</option>
                    <option value="Part-Time">Part-Time</option>
                    <option value="Contract">Contract</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-gray-400 font-bold mb-1">Job Description</label>
                <textarea
                  value={newJob.description}
                  onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                  rows={4}
                  className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded p-2"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2.5 pt-3 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={() => setIsNewJobOpen(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold shadow"
              >
                Publish Opening
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
