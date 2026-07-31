import React, { useState } from 'react';
import { 
  FileText, Download, SlidersHorizontal, Sliders, Calendar, List, Sparkles, RefreshCw, CheckCircle, Info
} from 'lucide-react';
import { AuditLog, InventoryItem, Category, Department } from '../types';

interface AppReportsProps {
  db: {
    auditLogs: AuditLog[];
    inventory: InventoryItem[];
    categories: Category[];
    departments: Department[];
  };
  triggerToast: (msg: string, type: 'success' | 'info' | 'warning' | 'error') => void;
}

export default function AppReports({ db, triggerToast }: AppReportsProps) {
  
  // Builder parameters
  const [reportType, setReportType] = useState<'AUDIT' | 'VALUATION' | 'BUDGET'>('AUDIT');
  const [selectedDeptId, setSelectedDeptId] = useState('ALL');
  const [selectedCatId, setSelectedCatId] = useState('ALL');
  const [showResultTable, setShowResultTable] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);

  // Search filter for history log timeline
  const [logSearch, setLogSearch] = useState('');
  const [logTypeFilter, setLogTypeFilter] = useState('ALL');

  // Compile Report
  const handleCompileReport = (e: React.FormEvent) => {
    e.preventDefault();
    setIsCompiling(true);
    
    setTimeout(() => {
      setIsCompiling(false);
      setShowResultTable(true);
      triggerToast(`${reportType} corporate report compiled successfully with ${getReportRowsCount()} matches.`, "success");
    }, 600);
  };

  const getReportRowsCount = () => {
    if (reportType === 'AUDIT') return db.auditLogs.length;
    if (reportType === 'VALUATION') {
      return db.inventory.filter(i => selectedCatId === 'ALL' || i.categoryId === selectedCatId).length;
    }
    return db.departments.filter(d => selectedDeptId === 'ALL' || d.id === selectedDeptId).length;
  };

  // Trigger Dynamic Direct File download of matching content as formatted CSV
  const handleDownloadFile = (format: 'CSV' | 'TXT') => {
    let fileContent = '';
    let fileName = `AssetFlow_${reportType}_Report_${new Date().toISOString().split('T')[0]}`;

    if (reportType === 'AUDIT') {
      fileContent = "Log ID,Timestamp,Actor,Action,Details,SKU Affected,Qty Changed\n";
      db.auditLogs.forEach(log => {
        fileContent += `"${log.id}","${log.timestamp}","${log.actorName}","${log.actionType}","${log.details.replace(/"/g, '""')}","${log.skuAffected || ''}","${log.quantityChanged || ''}"\n`;
      });
      fileName += format === 'CSV' ? '.csv' : '.txt';
    } else if (reportType === 'VALUATION') {
      fileContent = "SKU Barcode,Product Name,In Stock,Unit Cost,Asset Valuation,Location,Reorder Point\n";
      db.inventory
        .filter(i => selectedCatId === 'ALL' || i.categoryId === selectedCatId)
        .forEach(i => {
          fileContent += `"${i.sku}","${i.name.replace(/"/g, '""')}",${i.quantityInStock},${i.unitCost},${i.quantityInStock * i.unitCost},"${i.locationCode}",${i.reorderPoint}\n`;
        });
      fileName += format === 'CSV' ? '.csv' : '.txt';
    } else {
      fileContent = "Department ID,Department Name,Budget Limit,Budget Consumed,Budget Remaining,Usage %\n";
      db.departments
        .filter(d => selectedDeptId === 'ALL' || d.id === selectedDeptId)
        .forEach(d => {
          const rem = d.budgetLimit - d.budgetConsumed;
          const usage = d.budgetLimit > 0 ? Math.round((d.budgetConsumed / d.budgetLimit) * 100) : 0;
          fileContent += `"${d.id}","${d.name.replace(/"/g, '""')}",${d.budgetLimit},${d.budgetConsumed},${rem},${usage}%\n`;
        });
      fileName += format === 'CSV' ? '.csv' : '.txt';
    }

    // Direct Browser Download Hook
    const blob = new Blob([fileContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    triggerToast(`Direct direct download triggered: ${fileName}`, "success");
  };

  // Filtered timeline logs
  const filteredTimelineLogs = db.auditLogs.filter(log => {
    const matchesSearch = log.actorName.toLowerCase().includes(logSearch.toLowerCase()) ||
                          log.details.toLowerCase().includes(logSearch.toLowerCase()) ||
                          (log.skuAffected || '').toLowerCase().includes(logSearch.toLowerCase()) ||
                          log.actionType.toLowerCase().includes(logSearch.toLowerCase());
    
    const matchesType = logTypeFilter === 'ALL' || log.actionType === logTypeFilter;

    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-8 pb-12">
      
      {/* SECTION 1: REPORT COMPILER BUILDER */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="border-b border-slate-100 pb-4 mb-6">
          <h2 className="text-lg font-black text-slate-900 tracking-tight">Enterprise Multi-Criteria Report Builders</h2>
          <p className="text-xs text-slate-400">Assemble financial, valuation, or ledger audit records into formatted spreadsheets.</p>
        </div>

        <form onSubmit={handleCompileReport} className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-end text-xs font-semibold">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Select Scope Target</label>
            <select
              value={reportType}
              onChange={(e) => { setReportType(e.target.value as any); setShowResultTable(false); }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none font-bold text-slate-600"
            >
              <option value="AUDIT">Ledger Audit Timelines</option>
              <option value="VALUATION">Asset Valuations Catalog</option>
              <option value="BUDGET">Department Budgets allocation</option>
            </select>
          </div>

          {reportType === 'VALUATION' ? (
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Filter category scope</label>
              <select
                value={selectedCatId}
                onChange={(e) => { setSelectedCatId(e.target.value); setShowResultTable(false); }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none"
              >
                <option value="ALL">All category weights</option>
                {db.categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          ) : reportType === 'BUDGET' ? (
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Filter department scope</label>
              <select
                value={selectedDeptId}
                onChange={(e) => { setSelectedDeptId(e.target.value); setShowResultTable(false); }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none"
              >
                <option value="ALL">All organizational departments</option>
                {db.departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
          ) : (
            <div className="text-slate-400 text-[11px] p-3 leading-tight bg-slate-50 border border-slate-150 rounded-xl">
              Includes double-signature audit logs, stock adjustments, and returned logistics.
            </div>
          )}

          <div>
            <span className="text-[10px] text-slate-400 block mb-1">Format Template</span>
            <div className="bg-slate-50 border border-slate-150 p-2.5 rounded-xl text-center text-slate-500 block font-mono select-none">
              STANDARD CSV COMPILED
            </div>
          </div>

          <button
            type="submit"
            disabled={isCompiling}
            className="bg-[#39A5AD] hover:bg-[#2D8E95] text-white font-extrabold p-3 rounded-xl shadow-md shadow-[#39A5AD]/10 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isCompiling ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Compiling dataset...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" /> Compile Dataset Report
              </>
            )}
          </button>
        </form>

        {/* RESULTS COMPLIANCE CONTAINER */}
        {showResultTable && (
          <div className="mt-8 border border-slate-200/80 rounded-2xl p-6 bg-slate-50/50 space-y-4 animate-fade-in">
            <div className="flex justify-between items-center border-b border-slate-200/60 pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-black text-slate-900 uppercase tracking-wider">Compiler Build Complete</span>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => handleDownloadFile('TXT')}
                  className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 font-extrabold text-[10px] px-3.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-slate-400" /> Export PDF .TXT
                </button>
                <button
                  onClick={() => handleDownloadFile('CSV')}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-[10px] px-3.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Export Excel .CSV
                </button>
              </div>
            </div>

            {/* Simulated matching output parameters */}
            <div className="overflow-x-auto text-xs">
              {reportType === 'AUDIT' && (
                <table className="w-full text-left border-collapse bg-white border border-slate-150 rounded-xl overflow-hidden">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                      <th className="p-3">Actor</th>
                      <th className="p-3">Action</th>
                      <th className="p-3">Details Log</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {db.auditLogs.slice(0, 4).map(l => (
                      <tr key={l.id} className="text-slate-600">
                        <td className="p-3 text-slate-800">{l.actorName}</td>
                        <td className="p-3"><span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded font-black font-mono">{l.actionType}</span></td>
                        <td className="p-3">{l.details}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {reportType === 'VALUATION' && (
                <table className="w-full text-left border-collapse bg-white border border-slate-150 rounded-xl overflow-hidden">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                      <th className="p-3">SKU</th>
                      <th className="p-3">Item Description</th>
                      <th className="p-3">Available Stock</th>
                      <th className="p-3">Asset valuation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {db.inventory
                      .filter(i => selectedCatId === 'ALL' || i.categoryId === selectedCatId)
                      .slice(0, 4)
                      .map(i => (
                        <tr key={i.id} className="text-slate-600">
                          <td className="p-3 font-mono text-[10px] text-slate-800 font-bold">{i.sku}</td>
                          <td className="p-3">{i.name}</td>
                          <td className="p-3 font-extrabold text-slate-900">{i.quantityInStock} units</td>
                          <td className="p-3 font-black text-slate-800">${(i.quantityInStock * i.unitCost).toLocaleString()}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}

              {reportType === 'BUDGET' && (
                <table className="w-full text-left border-collapse bg-white border border-slate-150 rounded-xl overflow-hidden">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                      <th className="p-3">Department</th>
                      <th className="p-3">Allocated Cap</th>
                      <th className="p-3">Consumed Balance</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {db.departments
                      .filter(d => selectedDeptId === 'ALL' || d.id === selectedDeptId)
                      .slice(0, 4)
                      .map(d => (
                        <tr key={d.id} className="text-slate-600">
                          <td className="p-3 text-slate-800 font-bold">{d.name}</td>
                          <td className="p-3">${d.budgetLimit.toLocaleString()}</td>
                          <td className="p-3">${d.budgetConsumed.toLocaleString()}</td>
                          <td className="p-3">
                            <span className="text-emerald-600 font-extrabold">Verified Limit</span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

      </div>

      {/* SECTION 2: COMPREHENSIVE HISTORICAL AUDIT TIMELINE LOG */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="border-b border-slate-100 pb-4 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest block">Double-Signature Ledger Log Timeline</h3>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">Chronological ledger timeline of stock adjustments, requisitions approvals, and returns</p>
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <input
              type="text"
              placeholder="Search actor name or SKU Affected..."
              value={logSearch}
              onChange={(e) => setLogSearch(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none w-full md:w-48 focus:border-[#39A5AD]"
            />
            <select
              value={logTypeFilter}
              onChange={(e) => setLogTypeFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none font-bold text-slate-600"
            >
              <option value="ALL">All Actions</option>
              <option value="STOCK_IN">Stock In</option>
              <option value="STOCK_ADJUSTMENT">Adjust Safety Point</option>
              <option value="REQUISITION_SUBMIT">Submissions</option>
              <option value="REQUISITION_APPROVE">Approvals</option>
              <option value="REQUISITION_DENY">Denials</option>
              <option value="ITEM_RETURN">Returns Intake</option>
              <option value="BUDGET_ADJUSTMENT">Budget Modifications</option>
            </select>
          </div>
        </div>

        {/* LOG TILES LIST */}
        <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-2">
          {filteredTimelineLogs.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              <Info className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              No ledger log events match search parameters in the corporate archive.
            </div>
          ) : (
            filteredTimelineLogs.map((log) => {
              const isDisburse = log.actionType.startsWith('REQUISITION_APPROVE');
              const isDeny = log.actionType.startsWith('REQUISITION_DENY');
              const isStockIn = log.actionType.startsWith('STOCK_IN');

              return (
                <div 
                  key={log.id}
                  className="p-4 bg-slate-50/50 hover:bg-slate-50 border border-slate-150 rounded-xl flex items-start gap-4 transition-all"
                >
                  <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center font-bold text-xs ${
                    isStockIn 
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/50' 
                      : isDisburse 
                      ? 'bg-indigo-50 text-indigo-600 border border-indigo-200/50' 
                      : isDeny 
                      ? 'bg-rose-50 text-rose-600 border border-rose-200/50' 
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}>
                    {log.actionType[0]}
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1">
                      <div className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono text-[10px] text-slate-400">[{log.actionType}]</span>
                        <span>Logged: {log.actorName}</span>
                        <span className="text-[10px] text-slate-400 font-normal">({log.actorEmail})</span>
                      </div>
                      <span className="text-[10px] font-medium text-slate-400 font-mono">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 font-medium leading-relaxed">
                      {log.details}
                    </p>

                    {log.skuAffected && (
                      <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 pt-1 font-mono">
                        <span>SKU Affected: {log.skuAffected}</span>
                        {log.quantityChanged !== undefined && (
                          <span className={log.quantityChanged > 0 ? 'text-emerald-600' : 'text-rose-600'}>
                            Qty Delta: {log.quantityChanged > 0 ? '+' : ''}{log.quantityChanged}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
}
