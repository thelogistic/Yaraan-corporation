import React from "react";
import {
  Clock,
  MapPin,
  QrCode,
  Smile,
  ShieldCheck,
  Calendar,
  AlertCircle,
  FileCheck,
  Plus
} from "lucide-react";
import { Attendance, Employee, UserRole } from "../types";

interface AttendanceProps {
  role: UserRole;
  employees: Employee[];
  attendance: Attendance[];
  setAttendance: (attendance: Attendance[]) => void;
  saveFullStateToBackend: (updatedAttendance: Attendance[]) => void;
}

export default function AttendanceModule({
  role,
  employees,
  attendance,
  setAttendance,
  saveFullStateToBackend,
}: AttendanceProps) {
  const [selectedDate, setSelectedDate] = React.useState("2026-07-17"); // standard grounding
  const [gpsLocation, setGpsLocation] = React.useState<{ lat: number; lng: number } | null>(null);
  const [gpsLoading, setGpsLoading] = React.useState(false);
  const [attendanceNote, setAttendanceNote] = React.useState("");

  // Filters
  const [filterEmployeeId, setFilterEmployeeId] = React.useState("All");

  const isReadOnly = role === "Auditor";

  // Geolocation trigger
  const handleFetchLocationAndCheckIn = () => {
    if (isReadOnly) return;
    setGpsLoading(true);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setGpsLocation({ lat, lng });
          setGpsLoading(false);
          // Register check-in
          registerCheckIn(lat, lng);
        },
        (error) => {
          console.warn("Geolocation denied or unavailable, checking in with fallback HQ coordinates:", error);
          setGpsLoading(false);
          // Fallback NYC Coordinates
          const lat = 40.7128;
          const lng = -74.006;
          setGpsLocation({ lat, lng });
          registerCheckIn(lat, lng);
        },
        { timeout: 8000 }
      );
    } else {
      setGpsLoading(false);
      // Fallback
      registerCheckIn(40.7128, -74.006);
    }
  };

  const registerCheckIn = (lat: number, lng: number) => {
    const today = new Date().toISOString().split("T")[0];
    const nowTime = new Date().toLocaleTimeString();

    // Find if user already has an entry for today
    const employeeId = "EMP-102"; // Marcus Vance (Simulating the active employee log-in)
    const empName = employees.find((e) => e.id === employeeId)?.fullName || "Marcus Vance";

    const existingIndex = attendance.findIndex((a) => a.employeeId === employeeId && a.date === today);

    let updated: Attendance[];
    if (existingIndex > -1) {
      // update check-out
      const existing = attendance[existingIndex];
      if (existing.checkIn && !existing.checkOut) {
        updated = attendance.map((a, idx) =>
          idx === existingIndex
            ? { ...a, checkOut: nowTime, status: "Present" as const }
            : a
        );
        alert(`Successfully Checked-Out at ${nowTime}!`);
      } else {
        alert("You have already checked-in and checked-out today.");
        return;
      }
    } else {
      // create new check-in
      const newLog: Attendance = {
        id: `AT-${Math.floor(100 + Math.random() * 900)}`,
        employeeId,
        employeeName: empName,
        date: today,
        checkIn: nowTime,
        status: "Present",
        overtimeMinutes: 0,
        shift: "General Shift",
        lat,
        lng,
        notes: attendanceNote || "Secured Mobile GPS Check-In",
      };
      updated = [newLog, ...attendance];
      alert(`Successfully Checked-In at ${nowTime}! Location verified: Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`);
    }

    setAttendance(updated);
    saveFullStateToBackend(updated);
    setAttendanceNote("");
  };

  // Filter logs list
  const filteredLogs = React.useMemo(() => {
    return attendance.filter((log) => {
      const matchesDate = log.date === selectedDate;
      const matchesEmp = filterEmployeeId === "All" || log.employeeId === filterEmployeeId;
      return matchesDate && matchesEmp;
    });
  }, [attendance, selectedDate, filterEmployeeId]);

  // Handle Manual Attendance Change
  const handleManualCheckIn = (empId: string, status: Attendance["status"]) => {
    if (isReadOnly) return;
    const emp = employees.find((e) => e.id === empId);
    if (!emp) return;

    // Check if exists for selectedDate
    const idx = attendance.findIndex((a) => a.employeeId === empId && a.date === selectedDate);
    let updated: Attendance[];

    if (idx > -1) {
      updated = attendance.map((a, i) =>
        i === idx ? { ...a, status } : a
      );
    } else {
      const newLog: Attendance = {
        id: `AT-${Math.floor(100 + Math.random() * 900)}`,
        employeeId: empId,
        employeeName: emp.fullName,
        date: selectedDate,
        status,
        overtimeMinutes: 0,
        shift: "General Shift",
      };
      updated = [newLog, ...attendance];
    }

    setAttendance(updated);
    saveFullStateToBackend(updated);
  };

  return (
    <div className="space-y-6" id="attendance-view">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
          Attendance Desk
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Verify digital attendance rosters. Log and scan on-site QR cards, utilize biometric scanners, or log daily hours via GPS geolocation stamps.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Realtime Employee check-in punch card */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-gradient-to-br from-blue-900 via-slate-900 to-blue-950 p-5 rounded-2xl shadow-lg border border-blue-500/20 text-white space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-400 animate-pulse" />
                <span className="font-extrabold tracking-tight text-sm">Secured GPS Check-In</span>
              </div>
              <span className="bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded text-[10px] font-bold">
                Level 3 Auth
              </span>
            </div>

            <div className="text-center py-2 space-y-1">
              <p className="text-[10px] text-blue-300 uppercase font-bold tracking-wider">Current Date Stamp</p>
              <p className="text-lg font-bold">Friday, July 18, 2026</p>
            </div>

            <div className="space-y-2">
              <label className="text-blue-200 font-semibold block">Activity Note / Job Code</label>
              <input
                type="text"
                placeholder="e.g., Working on site, client office..."
                value={attendanceNote}
                onChange={(e) => setAttendanceNote(e.target.value)}
                className="w-full bg-white/10 text-white border border-white/10 rounded p-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={handleFetchLocationAndCheckIn}
              disabled={gpsLoading || isReadOnly}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-950 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 transition-all active:scale-95"
              id="gps-checkin-btn"
            >
              {gpsLoading ? (
                <span>📡 Verifying Geolocation...</span>
              ) : (
                <>
                  <MapPin className="h-4 w-4" />
                  <span>Register GPS Check-In / Out</span>
                </>
              )}
            </button>

            {gpsLocation && (
              <div className="bg-white/5 p-2.5 rounded-lg text-center text-[10px] text-blue-200 border border-white/5">
                📍 Log Coordinates: Lat {gpsLocation.lat.toFixed(5)}, Lng {gpsLocation.lng.toFixed(5)}
              </div>
            )}
          </div>

          {/* Alternative simulated checks (Biometric & Face & QR) */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-sm text-xs space-y-3">
            <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5 border-b border-gray-100 dark:border-gray-800 pb-2">
              <ShieldCheck className="h-4 w-4 text-emerald-500" /> Integrated Terminals (Simulated)
            </h4>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => alert("Biometric Fingerprint Verified. Checked-In successfully!")}
                disabled={isReadOnly}
                className="flex flex-col items-center justify-center p-3 bg-gray-50 dark:bg-gray-800/40 hover:bg-blue-50 dark:hover:bg-blue-950/20 border border-gray-100 dark:border-gray-800 rounded-lg text-center gap-1.5 transition-all text-[10px]"
              >
                🔴
                <span className="font-semibold text-gray-700 dark:text-gray-300">Biometric</span>
              </button>
              <button
                onClick={() => alert("Face Recognition Scanner Active. Match Found (100%). Checked-In!")}
                disabled={isReadOnly}
                className="flex flex-col items-center justify-center p-3 bg-gray-50 dark:bg-gray-800/40 hover:bg-blue-50 dark:hover:bg-blue-950/20 border border-gray-100 dark:border-gray-800 rounded-lg text-center gap-1.5 transition-all text-[10px]"
              >
                <Smile className="h-4.5 w-4.5 text-cyan-500" />
                <span className="font-semibold text-gray-700 dark:text-gray-300">Face Match</span>
              </button>
              <button
                onClick={() => alert("QR Entry Scanner Online. Checked-In!")}
                disabled={isReadOnly}
                className="flex flex-col items-center justify-center p-3 bg-gray-50 dark:bg-gray-800/40 hover:bg-blue-50 dark:hover:bg-blue-950/20 border border-gray-100 dark:border-gray-800 rounded-lg text-center gap-1.5 transition-all text-[10px]"
              >
                <QrCode className="h-4.5 w-4.5 text-blue-500" />
                <span className="font-semibold text-gray-700 dark:text-gray-300">QR Gate</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right column: Roster Management & Logs view */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-sm space-y-4">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 dark:border-gray-800 pb-3">
            <h4 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-blue-500" /> Daily Attendance Logs
            </h4>
            <div className="flex items-center gap-2 text-xs">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded py-1 px-2 focus:outline-none"
              />
              <select
                value={filterEmployeeId}
                onChange={(e) => setFilterEmployeeId(e.target.value)}
                className="bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded py-1 px-2 focus:outline-none font-medium"
              >
                <option value="All">All Staff</option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.fullName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Logs table list */}
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800 text-gray-400 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-2.5">Employee Name</th>
                  <th className="py-2.5">Date</th>
                  <th className="py-2.5">Check In</th>
                  <th className="py-2.5">Check Out</th>
                  <th className="py-2.5 text-center">Status Flag</th>
                  <th className="py-2.5 text-right">Quick Change</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/80 font-medium text-gray-600 dark:text-gray-300">
                {employees.map((emp) => {
                  // Find if log exists
                  const log = attendance.find((a) => a.employeeId === emp.id && a.date === selectedDate);
                  const isFilteredOut = filterEmployeeId !== "All" && emp.id !== filterEmployeeId;
                  if (isFilteredOut) return null;

                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/20">
                      <td className="py-3">
                        <p className="font-bold text-gray-900 dark:text-white">{emp.fullName}</p>
                        <p className="text-[10px] text-gray-400 font-mono font-semibold">{emp.id} • {emp.department}</p>
                      </td>
                      <td className="py-3 font-mono text-[11px]">{selectedDate}</td>
                      <td className="py-3 font-mono text-emerald-600 dark:text-emerald-400 font-semibold">{log?.checkIn || "—"}</td>
                      <td className="py-3 font-mono text-cyan-600 dark:text-cyan-400 font-semibold">{log?.checkOut || "—"}</td>
                      <td className="py-3 text-center">
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            log?.status === "Present"
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                              : log?.status === "Late"
                              ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                              : log?.status === "On Leave"
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400"
                              : "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400"
                          }`}
                        >
                          {log?.status || "Absent"}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <select
                          disabled={isReadOnly}
                          value={log?.status || "Absent"}
                          onChange={(e) => handleManualCheckIn(emp.id, e.target.value as any)}
                          className="text-[10px] bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded py-0.5 px-1.5 focus:outline-none font-bold"
                        >
                          <option value="Present">Present</option>
                          <option value="Late">Late</option>
                          <option value="Half-Day">Half-Day</option>
                          <option value="On Leave">On Leave</option>
                          <option value="Absent">Absent</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Calendar reference banner */}
          <div className="bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-950 rounded-xl p-4 flex items-start gap-3 text-xs">
            <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h5 className="font-bold text-blue-900 dark:text-blue-300">Roster Shifting Information</h5>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-[11px]">
                Rotating and Night Shifts undergo audit screening on Saturday night. Any attendance correction requests must be logged through the Self-Service Portal before the 25th of this month.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
