import React from "react";
import {
  TrendingUp,
  Target,
  Users,
  Award,
  Sparkles,
  ShieldCheck,
  Star,
  Plus,
  ArrowUpRight,
  X
} from "lucide-react";
import { Employee, UserRole } from "../types";

export interface Goal {
  id: string;
  employeeId: string;
  employeeName: string;
  title: string;
  weight: number;
  progress: number;
  target?: string;
  status?: string;
}

export interface Appraisal {
  id: string;
  employeeId: string;
  employeeName: string;
  quarter: string;
  ratingSelf: number;
  ratingManager: number;
  commentsSelf: string;
  commentsManager: string;
  status: "Draft" | "Self-Reviewed" | "Manager-Reviewed" | "Completed" | "Approved";
  period?: string;
  score?: number;
  remarks?: string;
}

interface PerformanceProps {
  role: UserRole;
  employees: Employee[];
  goals: Goal[];
  setGoals: (goals: Goal[]) => void;
  appraisals: Appraisal[];
  setAppraisals: (appraisals: Appraisal[]) => void;
  saveFullStateToBackend: (updatedAppraisals: Appraisal[], updatedGoals?: Goal[]) => void;
}

export default function Performance({
  role,
  employees,
  goals,
  setGoals,
  appraisals,
  setAppraisals,
  saveFullStateToBackend,
}: PerformanceProps) {
  const actingEmpId = "EMP-102";
  const [activeTab, setActiveTab] = React.useState<"kpis" | "appraisals" | "goals" | "peers">("kpis");
  const [selectedAppraisal, setSelectedAppraisal] = React.useState<Appraisal | null>(null);

  // New Goal State
  const [isGoalModalOpen, setIsGoalModalOpen] = React.useState(false);
  const [newGoal, setNewGoal] = React.useState({
    employeeId: "EMP-102", // default Marcus Vance
    title: "",
    target: "100%",
    weight: 20,
  });

  // Peer feedback submission state
  const [peerFeedback, setPeerFeedback] = React.useState({
    recipientId: "EMP-103", // standard fallback
    feedbackText: "",
    rating: 5,
  });

  const [peerReviewsList, setPeerReviewsList] = React.useState<any[]>([
    { reviewerName: "Marcus Vance", recipientName: "Lydia Patel", rating: 5, text: "Excellent collaborator! Lead the migration workflow flawlessly." },
    { reviewerName: "Lydia Patel", recipientName: "Sarah Jenkins", rating: 5, text: "Very supportive leadership, clear vision, and fosters cross-team communication." },
  ]);

  const isReadOnly = role === "Auditor";

  // Handle Goal Creation
  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;

    if (!newGoal.title) {
      alert("Please specify a goal description title.");
      return;
    }

    const goalObj: Goal = {
      id: `G-${Math.floor(100 + Math.random() * 900)}`,
      employeeId: newGoal.employeeId,
      employeeName: employees.find((e) => e.id === newGoal.employeeId)?.fullName || "Marcus Vance",
      title: newGoal.title,
      target: newGoal.target,
      progress: 0,
      weight: newGoal.weight,
      status: "In Progress",
    };

    const updatedGoals = [...goals, goalObj];
    setGoals(updatedGoals);
    saveFullStateToBackend(appraisals, updatedGoals);
    setIsGoalModalOpen(false);
    setNewGoal({ employeeId: "EMP-102", title: "", target: "100%", weight: 20 });
    alert("Goal registered successfully!");
  };

  // Adjust Goal Progress slider
  const handleUpdateGoalProgress = (goalId: string, progress: number) => {
    if (isReadOnly) return;

    const updatedGoals = goals.map((g) => {
      if (g.id === goalId) {
        const status: Goal["status"] = progress >= 100 ? "Completed" : "In Progress";
        return { ...g, progress, status };
      }
      return g;
    });

    setGoals(updatedGoals);
    saveFullStateToBackend(appraisals, updatedGoals);
  };

  // Submit appraisal review from Manager/HR
  const handleAppraiseScore = (appId: string, score: number, remarks: string) => {
    if (isReadOnly) return;

    const updated = appraisals.map((ap) => {
      if (ap.id === appId) {
        return {
          ...ap,
          score,
          remarks,
          status: "Approved" as const,
        };
      }
      return ap;
    });

    setAppraisals(updated);
    saveFullStateToBackend(updated);
    if (selectedAppraisal?.id === appId) {
      setSelectedAppraisal((prev) => (prev ? { ...prev, score, remarks, status: "Approved" } : null));
    }
    alert("Performance Appraisal approved & score updated!");
  };

  // Add Peer Review Feedback
  const handleAddPeerReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!peerFeedback.feedbackText.trim()) return;

    const recipient = employees.find((emp) => emp.id === peerFeedback.recipientId)?.fullName || "Employee";
    const item = {
      reviewerName: "Marcus Vance", // Simulated active user
      recipientName: recipient,
      rating: peerFeedback.rating,
      text: peerFeedback.feedbackText,
    };

    setPeerReviewsList([item, ...peerReviewsList]);
    setPeerFeedback({ recipientId: "EMP-103", feedbackText: "", rating: 5 });
    alert("Your peer review has been logged anonymously!");
  };

  return (
    <div className="space-y-6" id="performance-view">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
            Performance & Appraisals
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Establish performance targets, coordinate peer-to-peer reviews, and approve formal quarterly competency appraisal scores.
          </p>
        </div>
        {!isReadOnly && activeTab === "goals" && (
          <button
            onClick={() => setIsGoalModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-md transition-all shrink-0"
            id="create-goal-btn"
          >
            <Plus className="h-4 w-4" />
            Set Team Goal
          </button>
        )}
      </div>

      {/* Tabs navigation */}
      <div className="flex border-b border-gray-200 dark:border-gray-800 text-xs">
        <button
          onClick={() => setActiveTab("kpis")}
          className={`py-3 px-6 font-bold border-b-2 transition-all ${
            activeTab === "kpis"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white"
          }`}
          id="perf-tab-kpis"
        >
          📈 KPI Target Dashboard
        </button>
        <button
          onClick={() => setActiveTab("appraisals")}
          className={`py-3 px-6 font-bold border-b-2 transition-all ${
            activeTab === "appraisals"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white"
          }`}
          id="perf-tab-appraisals"
        >
          🏆 Appraisal reviews ({appraisals.length})
        </button>
        <button
          onClick={() => setActiveTab("goals")}
          className={`py-3 px-6 font-bold border-b-2 transition-all ${
            activeTab === "goals"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white"
          }`}
          id="perf-tab-goals"
        >
          🎯 Goal Milestones
        </button>
        <button
          onClick={() => setActiveTab("peers")}
          className={`py-3 px-6 font-bold border-b-2 transition-all ${
            activeTab === "peers"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white"
          }`}
          id="perf-tab-peers"
        >
          🤝 Peer Feedback & Reviews
        </button>
      </div>

      {/* TAB 1: KPI OVERVIEW SHIELDS */}
      {activeTab === "kpis" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-gray-500">
            {/* KPI 1 */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 rounded-xl shadow-sm flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold uppercase text-[10px] tracking-wider text-slate-400">Competency Growth</span>
                <TrendingUp className="h-4.5 w-4.5 text-blue-500" />
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">92.4%</p>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full" style={{ width: "92.4%" }}></div>
                </div>
              </div>
              <p className="text-[10px] text-gray-400">Aggregate benchmark compliance on core task assignments</p>
            </div>

            {/* KPI 2 */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 rounded-xl shadow-sm flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold uppercase text-[10px] tracking-wider text-slate-400">Goal Completion Rate</span>
                <Target className="h-4.5 w-4.5 text-blue-500" />
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">85.0%</p>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full" style={{ width: "85%" }}></div>
                </div>
              </div>
              <p className="text-[10px] text-gray-400">Total metrics completed versus quarterly benchmarks</p>
            </div>

            {/* KPI 3 */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 rounded-xl shadow-sm flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold uppercase text-[10px] tracking-wider text-slate-400">Competency Peer Score</span>
                <Users className="h-4.5 w-4.5 text-blue-500" />
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">4.8 / 5.0</p>
                <div className="flex text-amber-500 gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-amber-500" />
                  ))}
                </div>
              </div>
              <p className="text-[10px] text-gray-400">Average review feedback stars generated from peer networks</p>
            </div>
          </div>

          {/* Core Competencies Audit log */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-sm text-xs space-y-3.5">
            <h4 className="font-extrabold text-gray-900 dark:text-white flex items-center gap-1.5 border-b border-gray-100 dark:border-gray-800 pb-2 text-sm">
              <Award className="h-4.5 w-4.5 text-blue-500" /> Organizational Competency Matrix
            </h4>
            <div className="space-y-3">
              <div className="space-y-1">
                <div className="flex justify-between font-bold">
                  <span>Product Quality & Accuracy</span>
                  <span>95%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1 rounded">
                  <div className="bg-blue-500 h-full rounded" style={{ width: "95%" }}></div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between font-bold">
                  <span>Speed & Execution Timelines</span>
                  <span>88%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1 rounded">
                  <div className="bg-blue-500 h-full rounded" style={{ width: "88%" }}></div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between font-bold">
                  <span>Communication & Collaborative Spirit</span>
                  <span>91%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1 rounded">
                  <div className="bg-blue-500 h-full rounded" style={{ width: "91%" }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: APPRAISAL WORKFLOW & SCORE REVIEWS */}
      {activeTab === "appraisals" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-3 max-h-[450px] overflow-y-auto pr-1">
            {appraisals.map((app) => {
              const isSelected = selectedAppraisal?.id === app.id;
              return (
                <div
                  key={app.id}
                  onClick={() => setSelectedAppraisal(app)}
                  className={`p-4 bg-white dark:bg-gray-900 border ${
                    isSelected ? "border-blue-500 ring-1 ring-blue-500" : "border-gray-200 dark:border-gray-800"
                  } rounded-xl shadow-sm hover:shadow-md cursor-pointer transition-all text-xs space-y-2`}
                  id={`appraisal-card-${app.id}`}
                >
                  <div className="flex justify-between items-center">
                    <h5 className="font-bold text-gray-900 dark:text-white truncate">{app.employeeName}</h5>
                    <span className="text-[10px] font-bold text-gray-400 font-mono">{app.id}</span>
                  </div>
                  <div className="flex justify-between text-gray-500 text-[11px]">
                    <span>Period: <span className="font-bold text-gray-700 dark:text-gray-300">{app.period}</span></span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                      app.status === "Approved" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                    }`}>
                      {app.status}
                    </span>
                  </div>
                  {app.score > 0 && (
                    <div className="flex items-center gap-1 mt-1 text-blue-600 dark:text-blue-400 font-bold">
                      🏆 Approved Score: {app.score} / 5
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Details & Action Panel */}
          <div className="lg:col-span-2">
            {selectedAppraisal ? (
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-sm text-xs space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                  <div>
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white">{selectedAppraisal.employeeName}</h4>
                    <p className="text-[11px] text-gray-400">Quarterly Appraisal Assessment Review</p>
                  </div>
                  <span className="font-mono text-blue-500 font-semibold">{selectedAppraisal.period}</span>
                </div>

                {/* Self Statement Block */}
                <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-gray-100 dark:border-gray-900 space-y-1">
                  <h5 className="font-bold text-blue-600 dark:text-blue-400">Employee Self Appraisal Statement</h5>
                  <p className="text-gray-600 dark:text-gray-300 italic leading-relaxed">
                    "{selectedAppraisal.selfAppraisalText || "Executed team benchmarks, supported lead developers on migration architectures."}"
                  </p>
                </div>

                {/* Appraisal Action Forms (Visible to non-employees) */}
                {role !== "Employee" && selectedAppraisal.status !== "Approved" ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const score = Number((e.currentTarget.elements.namedItem("score") as HTMLSelectElement).value);
                      const remarks = (e.currentTarget.elements.namedItem("remarks") as HTMLTextAreaElement).value;
                      handleAppraiseScore(selectedAppraisal.id, score, remarks);
                    }}
                    className="space-y-3.5 bg-blue-50/25 dark:bg-blue-950/10 p-4 border border-blue-100/40 dark:border-blue-950/60 rounded-xl"
                  >
                    <h5 className="font-bold text-gray-900 dark:text-white flex items-center gap-1">
                      <Sparkles className="h-4 w-4 text-blue-500" /> Manager Assessment Console
                    </h5>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="col-span-1">
                        <label className="block text-gray-400 mb-1">Score Scale (1-5)</label>
                        <select
                          name="score"
                          className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded p-1.5"
                        >
                          <option value="5">5 - Outstanding</option>
                          <option value="4">4 - Exceeds Goals</option>
                          <option value="3">3 - Standard Fit</option>
                          <option value="2">2 - Needs Guidance</option>
                          <option value="1">1 - Unsatisfactory</option>
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-gray-400 mb-1">Feedback Remarks</label>
                        <textarea
                          name="remarks"
                          placeholder="Log formal appraisal comments..."
                          rows={2}
                          className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded p-1.5"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold shadow-md"
                        id="submit-appraisal-feedback-btn"
                      >
                        Approve & Log Competency
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-950 rounded-xl text-emerald-800 dark:text-emerald-400 space-y-2">
                    <div className="flex items-center gap-1.5 font-bold">
                      <ShieldCheck className="h-4 w-4" /> Assessment Finalized & Approved
                    </div>
                    <div className="text-[11px] space-y-1">
                      <p><span className="font-bold">Assigned Rating:</span> {selectedAppraisal.score} / 5</p>
                      <p><span className="font-bold">Manager Remarks:</span> "{selectedAppraisal.remarks || "No feedback logged."}"</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-44 border border-dashed border-gray-300 dark:border-gray-800 rounded-xl flex items-center justify-center p-6 text-center text-xs text-gray-400">
                Select an appraisal record on the left to verify competency ratings and add feedback remarks.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: GOALS & MILESTONES PROGRESS SLIDERS */}
      {activeTab === "goals" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 rounded-xl shadow-sm text-xs">
          <div className="space-y-4">
            <h4 className="font-extrabold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-2">
              Active Milestone Tracks
            </h4>
            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
              {goals.map((g) => (
                <div key={g.id} className="p-3.5 bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 rounded-lg space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h5 className="font-bold text-gray-900 dark:text-white">{g.title}</h5>
                      <p className="text-[10px] text-gray-400">Staff: <span className="font-bold text-blue-600 dark:text-blue-400">{g.employeeName}</span></p>
                    </div>
                    <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded ${
                      g.status === "Completed" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                    }`}>
                      {g.status}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-gray-500">
                      <span>Progress Status ({g.progress}%)</span>
                      <span>Target: {g.target}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      disabled={isReadOnly}
                      value={g.progress}
                      onChange={(e) => handleUpdateGoalProgress(g.id, Number(e.target.value))}
                      className="w-full accent-blue-600 h-1 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-50/40 dark:bg-blue-950/10 border border-blue-100 dark:border-blue-950 p-4 rounded-xl flex items-start gap-3">
            <Target className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h5 className="font-bold text-blue-950 dark:text-blue-300">Milestone Guidance</h5>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-[11px]">
                Milestones weights must aggregate to exactly 100% per employee per quarter. Adjust progress sliders on the left as teams dispatch weekly checklist sprints.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PEER REVIEWS FEED */}
      {activeTab === "peers" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-gray-500">
          {/* Add Feedback */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 rounded-xl shadow-sm space-y-4">
            <div>
              <h4 className="font-extrabold text-gray-900 dark:text-white">Submit Anonymous Peer Review</h4>
              <p className="text-[11px] text-gray-400 mt-0.5">Share constructive feedback on colleagues to build collaborative excellence.</p>
            </div>

            <form onSubmit={handleAddPeerReview} className="space-y-3">
              <div>
                <label className="block text-gray-400 mb-1">Colleague Recipient</label>
                <select
                  value={peerFeedback.recipientId}
                  onChange={(e) => setPeerFeedback({ ...peerFeedback, recipientId: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded p-1.5 focus:outline-none"
                >
                  {employees.filter((e) => e.id !== actingEmpId).map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.fullName} ({emp.designation})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Feedback Rating (1-5)</label>
                <select
                  value={peerFeedback.rating}
                  onChange={(e) => setPeerFeedback({ ...peerFeedback, rating: Number(e.target.value) })}
                  className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded p-1.5 focus:outline-none"
                >
                  <option value="5">⭐⭐⭐⭐⭐ Outstanding collaboration</option>
                  <option value="4">⭐⭐⭐⭐ Supportive coworker</option>
                  <option value="3">⭐⭐⭐ Met expectations</option>
                  <option value="2">⭐⭐ Fair involvement</option>
                  <option value="1">⭐ Needs improvement</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Feedback Note</label>
                <textarea
                  required
                  placeholder="Share details on coworker strength or supportive actions..."
                  value={peerFeedback.feedbackText}
                  onChange={(e) => setPeerFeedback({ ...peerFeedback, feedbackText: e.target.value })}
                  rows={4}
                  className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded p-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded shadow transition-all flex items-center justify-center gap-1"
              >
                <Plus className="h-4 w-4" /> Log Anonymous Review
              </button>
            </form>
          </div>

          {/* Active Reviews Feed */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 rounded-xl shadow-sm space-y-4">
            <h4 className="font-extrabold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-2">
              Peer Reviews Feed
            </h4>
            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
              {peerReviewsList.map((rev, i) => (
                <div key={i} className="p-3 bg-slate-50 dark:bg-slate-950 border border-gray-100 dark:border-gray-950 rounded-lg space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">{rev.recipientName}</p>
                      <p className="text-[9px] text-gray-400">Reviewer: Anonymous coworker</p>
                    </div>
                    <div className="flex text-amber-500">
                      {Array.from({ length: rev.rating }).map((_, r) => (
                        <Star key={r} className="h-3 w-3 fill-amber-500" />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 italic leading-relaxed text-[11px]">
                    "{rev.text}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Goal creation modal */}
      {isGoalModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreateGoal} className="bg-white dark:bg-gray-900 rounded-xl max-w-md w-full border border-gray-200 dark:border-gray-800 p-5 space-y-4 text-xs shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white">Set Team Goal</h3>
              <button
                type="button"
                onClick={() => setIsGoalModalOpen(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-gray-400 font-bold mb-1">Target Employee</label>
                <select
                  value={newGoal.employeeId}
                  onChange={(e) => setNewGoal({ ...newGoal, employeeId: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded p-2"
                >
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.fullName} ({e.id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-400 font-bold mb-1">Goal description / Target*</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lead migration sprint, complete API refactoring..."
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded p-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-gray-400 font-bold mb-1">Target metric</label>
                  <input
                    type="text"
                    value={newGoal.target}
                    onChange={(e) => setNewGoal({ ...newGoal, target: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded p-2"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 font-bold mb-1">Weight (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={newGoal.weight}
                    onChange={(e) => setNewGoal({ ...newGoal, weight: Number(e.target.value) })}
                    className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded p-2"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={() => setIsGoalModalOpen(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold shadow"
              >
                Set Goal
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
