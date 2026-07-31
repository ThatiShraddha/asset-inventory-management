import React, { useState } from 'react';
import { 
  FileText, CheckCircle2, XCircle, RefreshCw, FolderSync, Hourglass, 
  User, Calendar, DollarSign, MessageSquare, AlertCircle, Sparkles, ClipboardCheck
} from 'lucide-react';
import { RequisitionRequest, InventoryItem, Department, UserSession, hasPermission } from '../types';

interface AppRequisitionsProps {
  db: {
    requisitions: RequisitionRequest[];
    inventory: InventoryItem[];
    departments: Department[];
  };
  currentUser: UserSession;
  onSubmitRequisition: (itemId: string, quantity: number, justification: string) => { success: boolean; error?: string } | Promise<{ success: boolean; error?: string }>;
  onProcessApproval: (reqId: string, action: 'APPROVE' | 'DENY', denialReason?: string) => { success: boolean; error?: string } | Promise<{ success: boolean; error?: string }>;
  onRegisterReturn: (reqId: string) => { success: boolean; error?: string } | Promise<{ success: boolean; error?: string }>;
  triggerToast: (msg: string, type: 'success' | 'info' | 'warning' | 'error') => void;
  // External hooks
  openRequestExternal: boolean;
  onCloseRequestExternal: () => void;
}

export default function AppRequisitions({
  db, currentUser, onSubmitRequisition, onProcessApproval, onRegisterReturn, triggerToast,
  openRequestExternal, onCloseRequestExternal
}: AppRequisitionsProps) {
  
  // Tab Queue navigation
  const [activeQueue, setActiveQueue] = useState<'PENDING' | 'APPROVED' | 'DENIED' | 'RETURNED' | 'ALL'>('PENDING');

  // Direct Requisition Catalog States
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [itemSearch, setItemSearch] = useState('');
  const [itemJustifications, setItemJustifications] = useState<Record<string, string>>({});
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>({});

  // Denial Reason State Dialog
  const [showDenyDialog, setShowDenyDialog] = useState(false);
  const [selectedDenyReqId, setSelectedDenyReqId] = useState<string | null>(null);
  const [denialReasonText, setDenialReasonText] = useState('');

  // Search filter
  const [reqSearch, setReqSearch] = useState('');

  // Handle external launch trigger
  React.useEffect(() => {
    if (openRequestExternal) {
      setShowRequestForm(true);
      onCloseRequestExternal();
    }
  }, [openRequestExternal]);

  // Quick Request Handler for inline card list buttons
  const handleQuickRequest = async (item: InventoryItem) => {
    const qty = itemQuantities[item.id] || 1;
    const justification = itemJustifications[item.id] || '';
    if (!justification.trim()) {
      triggerToast("Please enter a clear business operational justification.", "warning");
      return;
    }

    const res = await onSubmitRequisition(item.id, qty, justification);
    if (res.success) {
      triggerToast(`Requisition request for ${qty}x ${item.name} registered. Routed to Manager signature channel.`, "success");
      
      // Reset this item inputs in local state map
      setItemJustifications(prev => ({ ...prev, [item.id]: '' }));
      setItemQuantities(prev => ({ ...prev, [item.id]: 1 }));
    } else {
      triggerToast(res.error || "Failed to submit request.", "error");
    }
  };

  // Process Approval signature
  const handleApproveAction = async (reqId: string) => {
    const res = await onProcessApproval(reqId, 'APPROVE');
    if (res.success) {
      triggerToast("Disbursement signed & approved. Asset stock and budgets modified.", "success");
    } else {
      triggerToast(res.error || "Approval rejected.", "error");
    }
  };

  // Open Denial prompt
  const handleOpenDenialPrompt = (reqId: string) => {
    setSelectedDenyReqId(reqId);
    setDenialReasonText('');
    setShowDenyDialog(true);
  };

  // Complete Denial action
  const handleDenySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDenyReqId) return;
    if (!denialReasonText) {
      triggerToast("Please input a clear reason for denying this procurement.", "warning");
      return;
    }

    const res = await onProcessApproval(selectedDenyReqId, 'DENY', denialReasonText);
    if (res.success) {
      triggerToast("Requisition signature denied. Ticket closed.", "success");
      setShowDenyDialog(false);
      setSelectedDenyReqId(null);
    } else {
      triggerToast(res.error || "Failed to commit denial signature.", "error");
    }
  };

  // Process Return loops
  const handleReturnAction = async (reqId: string) => {
    const res = await onRegisterReturn(reqId);
    if (res.success) {
      triggerToast("Intake of return signed off. Units added to warehouse inventory.", "success");
    } else {
      triggerToast(res.error || "Failed to process return.", "error");
    }
  };

  // Filter queue
  const filteredRequisitions = db.requisitions.filter(req => {
    // Search match
    const asset = db.inventory.find(i => i.id === req.itemId);
    const matchesSearch = req.id.toLowerCase().includes(reqSearch.toLowerCase()) || 
                          req.requesterName.toLowerCase().includes(reqSearch.toLowerCase()) ||
                          (asset?.name || '').toLowerCase().includes(reqSearch.toLowerCase()) ||
                          (asset?.sku || '').toLowerCase().includes(reqSearch.toLowerCase());
    
    // Status match
    const matchesQueue = activeQueue === 'ALL' || req.status === activeQueue;

    return matchesSearch && matchesQueue;
  });

  return (
    <div className="space-y-6 pb-12 relative">
      
      {/* TOP HEADER */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight">Procurement Sign-Off & Approvals</h2>
          <p className="text-xs text-slate-400">Track department budget restrictions, SRE approvals, and item return pipelines.</p>
        </div>
        <button
          onClick={() => setShowRequestForm(prev => !prev)}
          className="w-full md:w-auto bg-[#39A5AD] hover:bg-[#2D8E95] text-white font-extrabold text-xs px-4 py-2.5 rounded-xl inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
        >
          <FileText className="w-4 h-4" /> Request Asset Disbursement
        </button>
      </div>

      {/* REQUISITION SUBMISSION CARD DRAWER */}
      {showRequestForm && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-md space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-[#39A5AD]" /> Direct Catalog Procurement Checkout
            </h3>
            <button 
              onClick={() => setShowRequestForm(false)}
              className="text-xs font-extrabold text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              Close Drawer [x]
            </button>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search catalog hardware by name or SKU..."
                value={itemSearch}
                onChange={(e) => setItemSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs outline-none focus:border-[#39A5AD]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[420px] overflow-y-auto pr-1">
              {db.inventory
                .filter(item => 
                  item.name.toLowerCase().includes(itemSearch.toLowerCase()) ||
                  item.sku.toLowerCase().includes(itemSearch.toLowerCase())
                )
                .map((item) => {
                  const qty = itemQuantities[item.id] || 1;
                  const justification = itemJustifications[item.id] || '';
                  const inStock = item.quantityInStock;
                  const isOutOfStock = inStock <= 0;

                  return (
                    <div key={item.id} className={`p-4 border rounded-2xl flex flex-col justify-between space-y-3.5 transition-all ${
                      isOutOfStock ? 'border-slate-150 bg-slate-50/50 opacity-60' : 'border-slate-200 bg-white hover:shadow-sm'
                    }`}>
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <span className="text-[9px] font-mono font-bold bg-slate-100 border border-slate-200 text-slate-600 px-1.5 py-0.5 rounded uppercase">{item.sku}</span>
                          <h4 className="text-xs font-black text-slate-900 block mt-1">{item.name}</h4>
                          <span className="text-[10px] text-slate-450 font-bold block mt-0.5">${item.unitCost.toFixed(2)} unit cost</span>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider shrink-0 ${
                          isOutOfStock ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-250'
                        }`}>
                          {isOutOfStock ? 'Out of Stock' : `${inStock} in stock`}
                        </span>
                      </div>

                      <div className="space-y-2.5">
                        <div className="flex items-center gap-3">
                          <label className="text-[9px] font-bold text-slate-450 uppercase tracking-wider shrink-0">Quantity:</label>
                          <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white shrink-0">
                            <button
                              type="button"
                              disabled={isOutOfStock || qty <= 1}
                              onClick={() => setItemQuantities(prev => ({ ...prev, [item.id]: Math.max(1, qty - 1) }))}
                              className="px-2.5 py-1 text-slate-500 hover:bg-slate-50 text-xs font-bold disabled:opacity-30 cursor-pointer select-none"
                            >
                              -
                            </button>
                            <span className="px-3 text-xs font-black text-slate-800">{qty}</span>
                            <button
                              type="button"
                              disabled={isOutOfStock || qty >= inStock}
                              onClick={() => setItemQuantities(prev => ({ ...prev, [item.id]: Math.min(inStock, qty + 1) }))}
                              className="px-2.5 py-1 text-slate-500 hover:bg-slate-50 text-xs font-bold disabled:opacity-30 cursor-pointer select-none"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        <input
                          type="text"
                          disabled={isOutOfStock}
                          placeholder="Operational justification required..."
                          value={justification}
                          onChange={(e) => setItemJustifications(prev => ({ ...prev, [item.id]: e.target.value }))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-[11px] outline-none focus:border-[#39A5AD] disabled:cursor-not-allowed text-slate-800"
                        />
                      </div>

                      <button
                        type="button"
                        disabled={isOutOfStock}
                        onClick={() => handleQuickRequest(item)}
                        className={`w-full text-center font-black text-[11px] uppercase tracking-wider py-2.5 rounded-xl cursor-pointer transition-all ${
                          isOutOfStock 
                            ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed' 
                            : 'bg-[#39A5AD] hover:bg-[#2D8E95] text-white shadow-sm hover:shadow-md'
                        }`}
                      >
                        Request Asset
                      </button>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* FILTER SEARCH QUEUE PIPELINE */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <input 
              type="text"
              placeholder="Filter queues by Request ID, employee name, or SKU barcode..."
              value={reqSearch}
              onChange={(e) => setReqSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs outline-none focus:border-[#39A5AD]"
            />
          </div>

          <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
            {[
              { key: 'PENDING', label: 'Pending Signature' },
              { key: 'APPROVED', label: 'Approved active' },
              { key: 'DENIED', label: 'Denied Closed' },
              { key: 'RETURNED', label: 'Returned Logistics' },
              { key: 'ALL', label: 'All Audits' }
            ].map(q => (
              <button
                key={q.key}
                onClick={() => setActiveQueue(q.key as any)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black tracking-tight transition-all cursor-pointer ${
                  activeQueue === q.key 
                    ? 'bg-white text-slate-900 shadow-sm' 
                    : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                {q.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* REQUISITION QUEUE MAIN CONTAINER */}
      <div className="space-y-4">
        {filteredRequisitions.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400">
            <ClipboardCheck className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            No procurement requisitions located in your active queue profile.
          </div>
        ) : (
          filteredRequisitions.map((req) => {
            const asset = db.inventory.find(i => i.id === req.itemId);
            const dept = db.departments.find(d => d.id === req.departmentId);
            const reqCost = asset ? asset.unitCost * req.quantityRequested : 0;
            const remainingBudget = dept ? dept.budgetLimit - dept.budgetConsumed : 0;
            const budgetViolation = reqCost > remainingBudget;

            return (
              <div 
                key={req.id} 
                className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-6 shadow-sm space-y-4 transition-all"
              >
                {/* Header card details */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold font-mono text-slate-400">TICKET: {req.id}</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                      req.status === 'PENDING' 
                        ? 'bg-amber-100 text-amber-800' 
                        : req.status === 'APPROVED' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : req.status === 'RETURNED' 
                        ? 'bg-indigo-100 text-indigo-800' 
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {req.status}
                    </span>
                  </div>

                  <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Submitted: {new Date(req.requestedAt).toLocaleString()}</span>
                  </div>
                </div>

                {/* Main description grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-semibold">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-mono">REQUESTER IDENTITY</span>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[#39A5AD] text-xs">
                        {req.requesterName[0]}
                      </div>
                      <div>
                        <span className="text-slate-800 block">{req.requesterName}</span>
                        <span className="text-[9px] text-slate-400 font-medium block leading-none">{req.requesterEmail}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-mono">SPECIFIED SKU TARGET</span>
                    <span className="text-slate-800 block">{asset?.name || "MISSING PRODUCT"}</span>
                    <span className="text-[9px] text-slate-400 block font-mono">SKU: {asset?.sku || "N/A"} (Zone {asset?.locationCode})</span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-mono">VOLUME & UNIT VALUATION</span>
                    <span className="text-slate-800 block">{req.quantityRequested} Unit(s) requested</span>
                    <span className="text-[9px] text-slate-400 block font-mono">Estimated cost: ${reqCost.toFixed(2)}</span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-mono">BUDGET VERIFICATION</span>
                    <span className="text-slate-800 block">Dept: {dept?.name || "Global Office"}</span>
                    <span className={`text-[10px] font-extrabold flex items-center gap-1 ${budgetViolation ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {budgetViolation ? "Budget Cap Overrun!" : "Budget limits verified"} (${remainingBudget.toFixed(2)} rem.)
                    </span>
                  </div>
                </div>

                {/* Justification details */}
                <div className="bg-slate-50 border border-slate-150 p-3 rounded-xl flex items-start gap-2">
                  <MessageSquare className="w-4 h-4 text-[#39A5AD] shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-500 leading-relaxed">
                    <strong>Employee Justification:</strong> "{req.justification}"
                  </div>
                </div>

                {/* Denial justification if denied */}
                {req.status === 'DENIED' && req.denialReason && (
                  <div className="bg-rose-50 border border-rose-100 p-3 rounded-xl flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <div className="text-xs text-rose-600 leading-relaxed font-semibold">
                      <strong>Denial Sign-Off Reason:</strong> "{req.denialReason}"
                    </div>
                  </div>
                )}

                {/* ACTION BOX WORKFLOWS depending on roles */}
                {req.status === 'PENDING' && (
                  <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="text-[10px] text-slate-400 flex items-center gap-1.5 font-bold">
                      <Hourglass className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                      <span>{hasPermission(currentUser.role, 'requests.approve') ? "Signature sign-off action required" : "Awaiting Admin signature approval"}</span>
                    </div>

                    {/* Show approval actions ONLY if has requests.approve permission */}
                    {hasPermission(currentUser.role, 'requests.approve') ? (
                      <div className="flex gap-2 w-full sm:w-auto">
                        <button
                          onClick={() => handleOpenDenialPrompt(req.id)}
                          className="w-1/2 sm:w-auto border border-rose-200 text-rose-600 font-extrabold text-[11px] px-4 py-2 rounded-xl hover:bg-rose-50 cursor-pointer"
                        >
                          Deny request
                        </button>
                        <button
                          disabled={budgetViolation}
                          onClick={() => handleApproveAction(req.id)}
                          className="w-1/2 sm:w-auto bg-[#39A5AD] hover:bg-[#2D8E95] text-white font-extrabold text-[11px] px-4 py-2 rounded-xl shadow-sm disabled:opacity-30 cursor-pointer"
                        >
                          Approve Sign-Off
                        </button>
                      </div>
                    ) : (
                      <span className="text-[10px] font-mono bg-slate-50 px-2.5 py-1 rounded text-slate-400 select-none">
                        AUTH LOCKED: SIGNATURE PREREQ
                      </span>
                    )}
                  </div>
                )}

                {/* Return button for Approved Disbursements */}
                {req.status === 'APPROVED' && (
                  <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-xs">
                    <span className="text-[10px] text-emerald-600 font-black tracking-wider block uppercase font-mono flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Disbursed active
                    </span>
                    <button
                      onClick={() => handleReturnAction(req.id)}
                      className="border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-[11px] px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer"
                    >
                      <FolderSync className="w-3.5 h-3.5" /> Return Asset to warehouse
                    </button>
                  </div>
                )}

                {/* Returned timeline info */}
                {req.status === 'RETURNED' && (
                  <div className="pt-3 border-t border-slate-100 text-[10px] font-bold text-slate-400">
                    Logistics closure confirmed. All assets cataloged returned successfully to warehouse shelf location.
                  </div>
                )}

              </div>
            );
          })
        )}
      </div>

      {/* DIALOG: SPECIFY DENIAL JUSTIFICATION */}
      {showDenyDialog && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 shadow-2xl rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-black text-slate-900 tracking-tight">Specify Denial Justification</h3>
            <p className="text-xs text-slate-400">State the compliance or budget constraints that prevent approving this requisition.</p>

            <form onSubmit={handleDenySubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Denial Reason description</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Over-spending limits. Project requirements lack valid active corporate sponsor approval..."
                  value={denialReasonText}
                  onChange={(e) => setDenialReasonText(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-[#39A5AD]"
                />
              </div>

              <div className="flex gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => { setShowDenyDialog(false); setSelectedDenyReqId(null); }}
                  className="w-1/2 border border-slate-200 text-slate-600 font-bold text-xs py-2.5 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs py-2.5 rounded-xl cursor-pointer"
                >
                  Confirm Denial
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
