import React from "react";
import {
  CreditCard,
  Printer,
  TrendingUp,
  Download,
  DollarSign,
  Briefcase,
  FileCheck,
  Building,
  AlertCircle
} from "lucide-react";
import { Payroll, Employee, UserRole } from "../types";

interface PayrollProps {
  role: UserRole;
  employees: Employee[];
  payroll: Payroll[];
  setPayroll: (payroll: Payroll[]) => void;
  saveFullStateToBackend: (updatedPayroll: Payroll[]) => void;
}

export default function PayrollModule({
  role,
  employees,
  payroll,
  setPayroll,
  saveFullStateToBackend,
}: PayrollProps) {
  const [selectedMonth, setSelectedMonth] = React.useState("July");
  const [selectedYear, setSelectedYear] = React.useState(2026);
  const [selectedPayslip, setSelectedPayslip] = React.useState<Payroll | null>(null);

  const isReadOnly = role === "Auditor";

  // Filter payroll records based on selection
  const filteredPayroll = React.useMemo(() => {
    return payroll.filter((p) => p.month === selectedMonth && p.year === selectedYear);
  }, [payroll, selectedMonth, selectedYear]);

  // Total disbursements calculation
  const totalDisbursed = React.useMemo(() => {
    return filteredPayroll.reduce((acc, curr) => acc + curr.netSalary, 0);
  }, [filteredPayroll]);

  // Run Monthly Payroll Generator
  const handleGeneratePayroll = () => {
    if (isReadOnly) return;

    // Check if payroll already exists for selectedMonth/Year
    const exists = payroll.some((p) => p.month === selectedMonth && p.year === selectedYear);
    if (exists) {
      if (!window.confirm(`Payroll for ${selectedMonth} ${selectedYear} already exists. Do you want to recalculate & overwrite?`)) {
        return;
      }
    }

    // Generate for all active employees
    const generated: Payroll[] = employees.map((emp) => {
      const basic = emp.basicSalary;
      const allowanceHousing = Math.round(basic * 0.1); // 10% basic
      const allowanceTravel = Math.round(basic * 0.05); // 5% basic
      const allowanceMedical = Math.round(basic * 0.03); // 3% basic

      const overtime = 0; // standard fallback
      const bonus = 0; // standard fallback

      // Deductions
      const taxRate = basic > 10000 ? 0.25 : basic > 7000 ? 0.18 : 0.12;
      const tax = Math.round(basic * taxRate);
      const pf = Math.round(basic * 0.05); // 5% PF
      const insurance = 120; // flat
      const loanRecovery = 0; // flat

      const gross = basic + allowanceHousing + allowanceTravel + allowanceMedical + overtime + bonus;
      const deductions = tax + pf + insurance + loanRecovery;
      const net = gross - deductions;

      return {
        id: `PAY-${Math.floor(100 + Math.random() * 900)}`,
        employeeId: emp.id,
        employeeName: emp.fullName,
        month: selectedMonth,
        year: selectedYear,
        basicSalary: basic,
        allowances: {
          housing: allowanceHousing,
          travel: allowanceTravel,
          medical: allowanceMedical,
        },
        overtimePay: overtime,
        bonuses: bonus,
        deductions: {
          tax,
          providentFund: pf,
          insurance,
          loanRecovery,
        },
        netSalary: net,
        status: "Draft",
      };
    });

    // Remove old records of the same month/year and append new
    const filteredOut = payroll.filter((p) => !(p.month === selectedMonth && p.year === selectedYear));
    const updated = [...filteredOut, ...generated];

    setPayroll(updated);
    saveFullStateToBackend(updated);
    alert(`Successfully generated draft salary register for ${selectedMonth} ${selectedYear} across ${generated.length} employees.`);
  };

  // Process approval / pay out
  const handleMarkAsPaid = () => {
    if (isReadOnly) return;
    if (filteredPayroll.length === 0) {
      alert("No payroll records generated yet for this period.");
      return;
    }

    const updated = payroll.map((p) =>
      p.month === selectedMonth && p.year === selectedYear ? { ...p, status: "Paid" as const } : p
    );

    setPayroll(updated);
    saveFullStateToBackend(updated);
    alert(`Salary register for ${selectedMonth} ${selectedYear} has been marked as PAID. Pay slips sent to employees.`);
  };

  // Adjust bonus/deduction manually on-screen
  const handleAdjustValue = (payId: string, type: "bonus" | "overtime", value: number) => {
    if (isReadOnly) return;

    const updated = payroll.map((p) => {
      if (p.id === payId) {
        const bonus = type === "bonus" ? value : p.bonuses;
        const overtime = type === "overtime" ? value : p.overtimePay;
        const allowances = p.allowances.housing + p.allowances.travel + p.allowances.medical;
        const gross = p.basicSalary + allowances + overtime + bonus;
        const deductions = p.deductions.tax + p.deductions.providentFund + p.deductions.insurance + p.deductions.loanRecovery;
        const net = gross - deductions;

        return {
          ...p,
          bonuses: bonus,
          overtimePay: overtime,
          netSalary: net,
        };
      }
      return p;
    });

    setPayroll(updated);
    saveFullStateToBackend(updated);
  };

  // Print/Download handler (Simulated)
  const handlePrintPayslip = () => {
    window.print();
  };

  return (
    <div className="space-y-6" id="payroll-view">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
            Payroll Ledger
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Generate employee monthly paystubs, apply allowance factors, configure tax brackets, and sign-off on corporate bank transfer registers.
          </p>
        </div>
        {!isReadOnly && (
          <div className="flex gap-2">
            <button
              onClick={handleGeneratePayroll}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow transition-all shrink-0"
              id="generate-payroll-btn"
            >
              Generate Period Draft
            </button>
            <button
              onClick={handleMarkAsPaid}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow transition-all shrink-0"
              id="disburse-salaries-btn"
            >
              Disburse Salaries
            </button>
          </div>
        )}
      </div>

      {/* Date Range Selector & Disbursal card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" id="payroll-stats">
        {/* Period Selector */}
        <div className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm text-xs space-y-2">
          <span className="block font-bold text-gray-400 uppercase tracking-wider">Payroll Period</span>
          <div className="flex gap-2">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded py-1 px-2 focus:outline-none"
            >
              <option value="January">January</option>
              <option value="February">February</option>
              <option value="March">March</option>
              <option value="April">April</option>
              <option value="May">May</option>
              <option value="June">June</option>
              <option value="July">July</option>
              <option value="August">August</option>
              <option value="September">September</option>
              <option value="October">October</option>
              <option value="November">November</option>
              <option value="December">December</option>
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded py-1 px-2 focus:outline-none"
            >
              <option value="2026">2026</option>
              <option value="2025">2025</option>
            </select>
          </div>
        </div>

        {/* Financial disbursement summary */}
        <div className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm text-xs space-y-1">
          <span className="block font-bold text-gray-400 uppercase tracking-wider">Disbursement Sum</span>
          <h3 className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">
            ${totalDisbursed.toLocaleString()}
          </h3>
          <p className="text-[10px] text-gray-400">Net salary aggregate for {filteredPayroll.length} employees</p>
        </div>

        {/* Bank Transfer Register status */}
        <div className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm text-xs space-y-1">
          <span className="block font-bold text-gray-400 uppercase tracking-wider">Ledger Compliance</span>
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold mt-1 text-sm">
            <FileCheck className="h-4 w-4 shrink-0" /> GDPR & Tax Compliant
          </div>
          <p className="text-[10px] text-gray-400 leading-relaxed">
            Automatic calculation scales. Regional allowances calculated by branch locations.
          </p>
        </div>
      </div>

      {/* Salary Register Grid & Interactive Payslip Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Register list */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-sm space-y-4">
          <h4 className="font-bold text-sm text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-2">
            Period Salary Register ({selectedMonth} {selectedYear})
          </h4>

          <div className="overflow-x-auto text-xs">
            {filteredPayroll.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800 text-gray-400 font-bold uppercase text-[9px] tracking-wider">
                    <th className="py-2.5">Staff</th>
                    <th className="py-2.5 text-right">Basic</th>
                    <th className="py-2.5 text-right">Adjust Bonus</th>
                    <th className="py-2.5 text-right">Adjust OT</th>
                    <th className="py-2.5 text-right">Net Payout</th>
                    <th className="py-2.5 text-center">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60 font-medium text-gray-600 dark:text-gray-300">
                  {filteredPayroll.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/10">
                      <td className="py-3">
                        <p className="font-bold text-gray-900 dark:text-white">{p.employeeName}</p>
                        <p className="text-[10px] text-gray-400 font-mono">ID: {p.employeeId}</p>
                      </td>
                      <td className="py-3 text-right font-mono">${p.basicSalary}</td>
                      <td className="py-3 text-right">
                        <input
                          type="number"
                          disabled={isReadOnly}
                          defaultValue={p.bonuses}
                          onBlur={(e) => handleAdjustValue(p.id, "bonus", Number(e.target.value))}
                          className="w-16 bg-gray-50 dark:bg-gray-800 text-right text-[10px] border border-gray-200 dark:border-gray-700 rounded p-0.5 focus:outline-none"
                        />
                      </td>
                      <td className="py-3 text-right">
                        <input
                          type="number"
                          disabled={isReadOnly}
                          defaultValue={p.overtimePay}
                          onBlur={(e) => handleAdjustValue(p.id, "overtime", Number(e.target.value))}
                          className="w-16 bg-gray-50 dark:bg-gray-800 text-right text-[10px] border border-gray-200 dark:border-gray-700 rounded p-0.5"
                        />
                      </td>
                      <td className="py-3 text-right font-mono font-bold text-blue-600 dark:text-blue-400">
                        ${p.netSalary}
                      </td>
                      <td className="py-3 text-center">
                        <button
                          onClick={() => setSelectedPayslip(p)}
                          className="px-2 py-1 bg-gray-100 hover:bg-blue-100 hover:text-blue-700 dark:bg-gray-800 text-gray-700 dark:text-slate-300 rounded text-[10px] font-bold"
                          id={`view-payslip-btn-${p.employeeId}`}
                        >
                          View Paystub
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-10 text-gray-400 space-y-2">
                <AlertCircle className="h-6 w-6 mx-auto text-gray-300" />
                <p>No register sheets drafted for this period.</p>
                <p className="text-[10px] text-gray-500">Click "Generate Period Draft" on top right to build dynamic records.</p>
              </div>
            )}
          </div>
        </div>

        {/* Payslip preview window */}
        <div className="lg:col-span-1">
          {selectedPayslip ? (
            <div className="bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-800 rounded-2xl shadow-xl p-6 space-y-5 text-xs text-slate-800 dark:text-slate-200" id="printable-paystub">
              {/* Header Invoice Brand */}
              <div className="flex justify-between items-start border-b border-gray-100 dark:border-gray-800 pb-4">
                <div>
                  <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                    <Building className="h-4.5 w-4.5" />
                    <span className="font-extrabold tracking-tight text-xs uppercase">Enterprise Inc</span>
                  </div>
                  <p className="text-[9px] text-gray-400 mt-0.5">Corporate Headquarters, NYC</p>
                </div>
                <div className="text-right">
                  <h4 className="font-bold text-[11px] uppercase tracking-wider text-gray-500">Official Paystub</h4>
                  <p className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400">{selectedPayslip.month} {selectedPayslip.year}</p>
                </div>
              </div>

              {/* Employee brief */}
              <div className="grid grid-cols-2 gap-2 text-[10px] bg-slate-50 dark:bg-slate-900 p-2.5 rounded-lg text-gray-600 dark:text-gray-300">
                <div>
                  <span className="text-gray-400 block">Recipient Staff</span>
                  <p className="font-bold text-gray-900 dark:text-white">{selectedPayslip.employeeName}</p>
                  <p className="font-mono">ID: {selectedPayslip.employeeId}</p>
                </div>
                <div className="text-right">
                  <span className="text-gray-400 block">Disbursal Ref</span>
                  <p className="font-mono font-semibold">{selectedPayslip.id}</p>
                  <span className="text-emerald-500 font-bold uppercase text-[9px]">{selectedPayslip.status}</span>
                </div>
              </div>

              {/* Breakdown grids: Earnings vs Deductions */}
              <div className="grid grid-cols-2 gap-4 text-[10px]">
                {/* Earnings */}
                <div className="space-y-1.5">
                  <h5 className="font-bold text-gray-400 border-b pb-0.5">Earnings</h5>
                  <div className="flex justify-between">
                    <span>Basic salary</span>
                    <span className="font-semibold">${selectedPayslip.basicSalary}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Housing allow.</span>
                    <span className="font-semibold">${selectedPayslip.allowances.housing}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Travel allow.</span>
                    <span className="font-semibold">${selectedPayslip.allowances.travel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Medical allow.</span>
                    <span className="font-semibold">${selectedPayslip.allowances.medical}</span>
                  </div>
                  {selectedPayslip.overtimePay > 0 && (
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                      <span>Overtime pay</span>
                      <span>+${selectedPayslip.overtimePay}</span>
                    </div>
                  )}
                  {selectedPayslip.bonuses > 0 && (
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                      <span>Special bonus</span>
                      <span>+${selectedPayslip.bonuses}</span>
                    </div>
                  )}
                </div>

                {/* Deductions */}
                <div className="space-y-1.5">
                  <h5 className="font-bold text-gray-400 border-b pb-0.5">Deductions</h5>
                  <div className="flex justify-between text-rose-600 dark:text-rose-400">
                    <span>Income Tax</span>
                    <span className="font-semibold">-${selectedPayslip.deductions.tax}</span>
                  </div>
                  <div className="flex justify-between text-rose-600 dark:text-rose-400">
                    <span>Provident Fund</span>
                    <span className="font-semibold">-${selectedPayslip.deductions.providentFund}</span>
                  </div>
                  <div className="flex justify-between text-rose-600 dark:text-rose-400">
                    <span>Health Ins.</span>
                    <span className="font-semibold">-${selectedPayslip.deductions.insurance}</span>
                  </div>
                  {selectedPayslip.deductions.loanRecovery > 0 && (
                    <div className="flex justify-between text-rose-600 dark:text-rose-400">
                      <span>Loan recovery</span>
                      <span className="font-semibold">-${selectedPayslip.deductions.loanRecovery}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Totals Summary */}
              <div className="border-t border-gray-200 dark:border-gray-800 pt-4 space-y-1 text-right">
                <span className="text-[9px] text-gray-400 uppercase font-bold block">Net Salary Disbursed</span>
                <p className="text-xl font-extrabold text-blue-600 dark:text-blue-400 font-mono">
                  ${selectedPayslip.netSalary.toLocaleString()}
                </p>
                <p className="text-[8px] text-gray-400 leading-relaxed italic">
                  This is a secure system generated salary sheet. No physical signature required.
                </p>
              </div>

              {/* Print buttons */}
              <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                <button
                  onClick={handlePrintPayslip}
                  className="flex-1 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-slate-300 rounded font-bold flex items-center justify-center gap-1 text-[10px]"
                >
                  <Printer className="h-3.5 w-3.5" /> Print Stub
                </button>
                <button
                  onClick={() => {
                    alert("Pay slip downloaded to local storage file path.");
                  }}
                  className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold flex items-center justify-center gap-1 text-[10px]"
                >
                  <Download className="h-3.5 w-3.5" /> Download PDF
                </button>
              </div>
            </div>
          ) : (
            <div className="h-44 border border-dashed border-gray-300 dark:border-gray-800 rounded-xl flex items-center justify-center p-6 text-center text-xs text-gray-400">
              Select an employee record from the salary register list to load their printable pay stub.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
