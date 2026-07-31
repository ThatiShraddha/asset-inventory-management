import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, AlertTriangle, CheckSquare, Sparkles, SlidersHorizontal, Eye, EyeOff, 
  ArrowUp, ArrowDown, HelpCircle, ArrowRight, Play, CheckCircle, Package, Users2, DollarSign, Clock,
  Cpu, Activity, ShieldCheck, ListTodo, ShieldAlert, BarChart3, HelpCircle as HelpIcon, FileText,
  UserCheck, Terminal, Ban, RefreshCw, Layers, QrCode, ClipboardList, PenTool, Calendar, Shield, Inbox
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';
import { InventoryItem, RequisitionRequest, Department, AuditLog, UserSession, Role, hasPermission } from '../types';

interface AppDashboardProps {
  db: {
    inventory: InventoryItem[];
    requisitions: RequisitionRequest[];
    departments: Department[];
    auditLogs: AuditLog[];
  };
  currentUser: UserSession;
  onOpenStockIn: () => void;
  onOpenNewItem: () => void;
  onOpenRequest: () => void;
  onOpenBudget: () => void;
  triggerToast: (msg: string, type: 'success' | 'info' | 'warning' | 'error') => void;
}

export default function AppDashboard({ 
  db, currentUser, onOpenStockIn, onOpenNewItem, onOpenRequest, onOpenBudget, triggerToast 
}: AppDashboardProps) {
  

  // Simulated System Telemetry for Super Admin
  const [telemetry, setTelemetry] = useState({
    cpu: 18,
    memory: 44,
    dbConnections: 8,
    uptime: "99.98%"
  });

  // Simulated Maintenance Workorders for Store Manager
  const [workorders, setWorkorders] = useState([
    { id: "WO-901", asset: "Ultra Ergonomic Mechanical Keyboard", company: "Apex Repair", date: "2026-07-20", status: "SCHEDULED" },
    { id: "WO-902", asset: "Enterprise 10\" Android Testing Tablet", company: "Silicon Services", date: "2026-07-24", status: "SCHEDULED" }
  ]);
  const [woAsset, setWoAsset] = useState('');
  const [woCompany, setWoCompany] = useState('');
  const [woDate, setWoDate] = useState('');

  // Local Requisition creation for Employee dashboard
  const [selectedItemId, setSelectedItemId] = useState('');
  const [requestQty, setRequestQty] = useState(1);
  const [requestReason, setRequestReason] = useState('');

  // QR & Barcode interactive state for Store Manager
  const [barcodeSku, setBarcodeSku] = useState(db.inventory[0]?.sku || '');
  const [showBarcodePrint, setShowBarcodePrint] = useState(false);

  // Auditor audit log search
  const [auditorSearch, setAuditorSearch] = useState('');

  // Periodic simulated telemetries update for Super Admin
  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry(prev => ({
        ...prev,
        cpu: Math.floor(10 + Math.random() * 25),
        memory: Math.floor(40 + Math.random() * 8)
      }));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Shared database metrics
  const totalValuation = db.inventory.reduce((sum, item) => sum + (item.quantityInStock * item.unitCost), 0);
  const lowStockCount = db.inventory.filter(i => i.quantityInStock <= i.reorderPoint).length;
  const pendingCount = db.requisitions.filter(r => r.status === 'PENDING').length;
  const totalBudgetLimit = db.departments.reduce((sum, d) => sum + d.budgetLimit, 0);
  const totalBudgetConsumed = db.departments.reduce((sum, d) => sum + d.budgetConsumed, 0);

  // Chart preparation
  const categoryData = db.departments.map(dept => ({
    name: dept.name.split(' ')[0],
    Limit: dept.budgetLimit,
    Consumed: dept.budgetConsumed
  }));

  const pieColors = ['#39A5AD', '#6366F1', '#EC4899', '#F59E0B', '#10B981'];
  const stockByCat = db.inventory.reduce((acc: Record<string, number>, item) => {
    acc[item.categoryId] = (acc[item.categoryId] || 0) + item.quantityInStock;
    return acc;
  }, {});
  
  const pieData = Object.keys(stockByCat).map(catId => {
    const count = stockByCat[catId];
    return {
      name: catId === 'cat-periph' ? 'Peripherals' : catId === 'cat-test' ? 'Test Dev' : catId === 'cat-net' ? 'Network' : 'Furniture',
      value: count
    };
  });

  const handleCreateWorkorder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!woAsset || !woCompany || !woDate) {
      triggerToast("Please populate all workorder fields.", "warning");
      return;
    }
    const newWo = {
      id: `WO-${Math.floor(100 + Math.random() * 900)}`,
      asset: woAsset,
      company: woCompany,
      date: woDate,
      status: "SCHEDULED"
    };
    setWorkorders(prev => [newWo, ...prev]);
    triggerToast(`Maintenance workorder ${newWo.id} scheduled with ${woCompany}.`, "success");
    setWoAsset('');
    setWoCompany('');
    setWoDate('');
  };

  const handleEmployeeSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemId || requestQty <= 0 || !requestReason) {
      triggerToast("Please populate all procurement fields.", "warning");
      return;
    }
    const item = db.inventory.find(i => i.id === selectedItemId);
    if (!item) return;

    if (item.quantityInStock < requestQty) {
      triggerToast(`Insufficient stock! Only ${item.quantityInStock} units left.`, "error");
      return;
    }

    // Direct binding trigger
    onOpenRequest(); // open original request trigger
    triggerToast("Request prepared. Please click 'Submit Procurement Ticket' in Requests tab.", "info");
  };

  // --- RENDERING CONFIGURATIONS FOR THE 5 INDIVIDUAL ROLES ---

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      
      {/* 5-ROLE COCKPIT SUB-BANNER */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-[-30%] right-[-5%] w-[400px] h-[400px] rounded-full bg-[#39A5AD]/20 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider bg-[#39A5AD]/20 text-[#49c2cb] px-2.5 py-1 rounded-md font-mono">
              Role-Specific Dashboard Console
            </span>
            <h2 className="text-xl font-black tracking-tight mt-1.5 flex items-center gap-2">
              <span>Welcome Back, {currentUser.name}</span>
              <span className="text-base font-normal text-slate-400">({currentUser.email})</span>
            </h2>
            <p className="text-xs text-slate-400 max-w-xl">
              You are signed in under security level <strong className="text-white">{currentUser.role}</strong>. Your dashboard features has been dynamically tailored to your operational authorization credentials.
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 px-4 py-3 rounded-xl flex items-center gap-2 font-mono text-[11px] text-slate-300">
            <ShieldCheck className="w-4 h-4 text-[#39A5AD] shrink-0" />
            <div>
              <span className="block text-slate-500 font-extrabold uppercase text-[9px]">SAML TOKEN STATE</span>
              <span className="text-emerald-400 font-bold">AUTHORIZED SECURE</span>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== ROLE 1: UNIFIED ADMIN COCKPIT ==================== */}
      {currentUser.role === 'ADMIN' && (
        <div className="space-y-8 animate-fade-in">
          
          {/* Section: Operations Desk Overview */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-[#39A5AD] uppercase tracking-widest font-mono">Operations Desk Overview</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-5 border border-slate-200 bg-white rounded-2xl space-y-2 shadow-sm">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-mono">Pending Requisitions</span>
                <div className="text-2xl font-black text-amber-600">{pendingCount} Requests</div>
                <div className="text-[10px] text-amber-500 font-bold flex items-center gap-1">
                  <CheckSquare className="w-3.5 h-3.5" /> Requires signature signoff
                </div>
              </div>

              <div className="p-5 border border-slate-200 bg-white rounded-2xl space-y-2 shadow-sm">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-mono">Inbound Warnings</span>
                <div className="text-2xl font-black text-rose-600">{lowStockCount} SKUs</div>
                <div className="text-[10px] text-rose-500 font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Stock depletion threat limits
                </div>
              </div>

              <div className="p-5 border border-slate-200 bg-white rounded-2xl space-y-2 shadow-sm">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-mono">Consolidated Valuation</span>
                <div className="text-2xl font-black text-slate-900">${totalValuation.toLocaleString()}</div>
                <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" /> Active asset value index
                </div>
              </div>

              <div className="p-5 border border-slate-200 bg-white rounded-2xl space-y-2 shadow-sm">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-mono">Allocated Budget Progress</span>
                <div className="text-2xl font-black text-indigo-600">${totalBudgetConsumed.toLocaleString()}</div>
                <div className="text-[10px] text-indigo-500 font-bold">
                  Limit Cap: ${totalBudgetLimit.toLocaleString()} ({Math.round((totalBudgetConsumed / totalBudgetLimit) * 100)}%)
                </div>
              </div>
            </div>
          </div>

          {/* Section: System Telemetry & Clusters */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-indigo-500 uppercase tracking-widest font-mono">System Telemetry & Clusters</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-5 border border-slate-200 bg-white rounded-2xl space-y-2 shadow-sm">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-mono">Node Container Health</span>
                <div className="text-2xl font-black text-indigo-650">99.98%</div>
                <div className="text-[10px] text-slate-400 font-bold flex items-center gap-1.5 font-mono">
                  <Cpu className="w-3.5 h-3.5 text-slate-300" /> Latency: 12ms | CPU: {telemetry.cpu}%
                </div>
              </div>

              <div className="p-5 border border-slate-200 bg-white rounded-2xl space-y-2 shadow-sm">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-mono">Active Personnel Directory</span>
                <div className="text-2xl font-black text-emerald-600">5 Security Roles</div>
                <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5" /> All SAML directories connected
                </div>
              </div>

              <div className="p-5 border border-slate-200 bg-white rounded-2xl space-y-2 shadow-sm">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-mono">Prisma DB Pool</span>
                <div className="text-2xl font-black text-slate-800">{telemetry.dbConnections} Connections</div>
                <div className="text-[10px] text-slate-400 font-semibold font-mono">Active PostgreSQL Threads</div>
              </div>

              <div className="p-5 border border-slate-200 bg-white rounded-2xl space-y-2 shadow-sm">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-mono">Immutable Log Stream</span>
                <div className="text-2xl font-black text-slate-800">{db.auditLogs.length} Audit Logs</div>
                <div className="text-[10px] text-amber-500 font-bold flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" /> SHA-256 Signatures active
                </div>
              </div>
            </div>
          </div>

          {/* Double Column Charts & Controls */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Charts Area */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <div className="border-b border-slate-100 pb-3 mb-4">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Enterprise Capital Allocation & Burn</h3>
                  <p className="text-[11px] text-slate-400">Comparison of allocated budget limits vs active operational consumption</p>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorLimitAdmin" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#39A5AD" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#39A5AD" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorConsumedAdmin" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366F1" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                      <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} tickLine={false} />
                      <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} />
                      <Tooltip />
                      <Area type="monotone" dataKey="Limit" stroke="#39A5AD" strokeWidth={2} fillOpacity={1} fill="url(#colorLimitAdmin)" />
                      <Area type="monotone" dataKey="Consumed" stroke="#6366F1" strokeWidth={2} fillOpacity={1} fill="url(#colorConsumedAdmin)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Cluster Virtualization Node Panel */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Microservices Cluster Nodes</h3>
                  <p className="text-[11px] text-slate-400">Live virtualization parameters of PostgreSQL clusters and API route queries</p>
                </div>
                <div className="grid grid-cols-3 gap-4 font-mono text-[11px]">
                  <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl space-y-1.5">
                    <span className="text-slate-400 block text-[9px] uppercase font-bold tracking-wider">CPU Util</span>
                    <div className="text-slate-800 font-extrabold flex items-center justify-between">
                      <span>{telemetry.cpu}%</span>
                      <Activity className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl space-y-1.5">
                    <span className="text-slate-400 block text-[9px] uppercase font-bold tracking-wider">RAM Load</span>
                    <div className="text-slate-800 font-extrabold flex items-center justify-between">
                      <span>{telemetry.memory}%</span>
                      <Activity className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl space-y-1.5">
                    <span className="text-slate-400 block text-[9px] uppercase font-bold tracking-wider">Connection Pool</span>
                    <div className="text-slate-800 font-extrabold">
                      <span>{telemetry.dbConnections} of 100</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Active Procurement Approval Desk */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Active Procurement Approval Desk</h3>
                  <p className="text-[11px] text-slate-400">Process signatures immediately from your operational landing cockpit</p>
                </div>

                <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto pr-1">
                  {db.requisitions.filter(r => r.status === 'PENDING').length === 0 ? (
                    <div className="py-12 text-center text-slate-400 text-xs">
                      No pending signature requests recorded. Corporate SLA is pristine!
                    </div>
                  ) : (
                    db.requisitions.filter(r => r.status === 'PENDING').map((req) => {
                      const item = db.inventory.find(i => i.id === req.itemId);
                      return (
                        <div key={req.id} className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                          <div className="space-y-1">
                            <span className="text-[9px] font-mono bg-amber-50 border border-amber-200 text-amber-800 font-bold px-1.5 py-0.5 rounded">TICKET: {req.id}</span>
                            <span className="text-xs font-black block text-slate-800">{req.requesterName} requests {req.quantityRequested}x {item?.name}</span>
                            <p className="text-[11px] text-slate-400 italic">Justification: "{req.justification}"</p>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <button
                              onClick={() => {
                                triggerToast(`Denied request ${req.id} immediately from desk.`, "success");
                                req.status = 'DENIED';
                              }}
                              className="bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                            >
                              Deny
                            </button>
                            <button
                              onClick={() => {
                                if (item && item.quantityInStock >= req.quantityRequested) {
                                  item.quantityInStock -= req.quantityRequested;
                                  req.status = 'APPROVED';
                                  triggerToast(`Disbursement signed & approved. Asset stock reduced.`, "success");
                                } else {
                                  triggerToast("Insufficient stock to sign off.", "error");
                                }
                              }}
                              className="bg-[#39A5AD] hover:bg-[#2D8E95] text-white text-[10px] font-extrabold px-3.5 py-1.5 rounded-lg transition-all cursor-pointer"
                            >
                              Approve Signoff
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Right Controls Column */}
            <div className="space-y-6">
              
              {/* Category Weight Chart */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <div className="border-b border-slate-100 pb-3 mb-4">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Inventory Category Weight</h3>
                  <p className="text-[11px] text-slate-400">Total units cataloged across departments</p>
                </div>
                <div className="h-44 flex items-center justify-center relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={65}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 pt-2 border-t border-slate-50">
                  {pieData.map((d, index) => (
                    <div key={index} className="flex justify-between items-center text-[10px] font-bold text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: pieColors[index] }} />
                        <span>{d.name}</span>
                      </div>
                      <span>{d.value} units</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Personnel Directory Grid */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <div className="border-b border-slate-100 pb-3 mb-4">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Tenant Personas Access Grid</h3>
                  <p className="text-[11px] text-slate-400">View registered security profiles, role levels, and deactivation switches</p>
                </div>
                <div className="space-y-3.5">
                  {[
                    { name: "Alexander Wright", role: "ADMIN", avatar: "👑", active: true },
                    { name: "Sarah Jenkins", role: "ADMIN", avatar: "👩‍💼", active: true },
                    { name: "Elena Rostova", role: "STORE_MANAGER", avatar: "📦", active: true },
                    { name: "Marcus Thorne", role: "EMPLOYEE", avatar: "👨‍💻", active: true },
                    { name: "Diana Prince", role: "AUDITOR", avatar: "🕵️‍♀️", active: true },
                  ].map((usr, i) => (
                    <div key={i} className="flex items-center justify-between p-3.5 border border-slate-100 rounded-xl text-xs hover:bg-slate-50 transition-all">
                      <div className="flex items-center gap-2.5">
                        <span className="text-sm select-none">{usr.avatar}</span>
                        <div>
                          <span className="font-extrabold text-slate-800 block leading-tight">{usr.name}</span>
                          <span className="text-[9px] font-mono text-indigo-500 uppercase font-black">{usr.role}</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => triggerToast(`Access security override: Toggled ${usr.name} status to ${usr.active ? 'Suspended' : 'Active'}`, "info")}
                        className="text-[9px] font-mono uppercase bg-slate-100 border border-slate-200 px-2 py-1 rounded hover:bg-rose-50 hover:text-rose-600 transition-all font-bold cursor-pointer"
                      >
                        Deactivate
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Security Audit Log Stream */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <div className="border-b border-slate-100 pb-3 mb-4">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Live Security Audit Log</h3>
                  <p className="text-[11px] text-slate-400">Decoupled transaction history tracked under corporate policies</p>
                </div>
                <div className="space-y-3.5 max-h-60 overflow-y-auto pr-1">
                  {db.auditLogs.slice(0, 4).map((log, lIdx) => (
                    <div key={lIdx} className="text-[11px] leading-relaxed border-b border-slate-50 pb-2.5 space-y-1">
                      <div className="flex justify-between items-center text-[9px] font-mono font-bold text-slate-400">
                        <span>{log.actorName}</span>
                        <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-slate-600 font-medium">
                        <span className="bg-slate-100 text-slate-800 border border-slate-200 px-1 py-0.5 rounded text-[8px] font-black font-mono uppercase mr-1.5">{log.actionType}</span>
                        {log.details}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ==================== ROLE 3: STORE MANAGER (WAREHOUSE) DASHBOARD ==================== */}
      {currentUser.role === 'STORE_MANAGER' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 border border-slate-200 bg-white rounded-2xl space-y-2 shadow-sm">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-mono">Today's Active Sign-Outs</span>
              <div className="text-2xl font-black text-[#39A5AD]">
                {db.requisitions.filter(r => r.status === 'APPROVED').length} Issues
              </div>
              <div className="text-[10px] text-slate-400 font-bold block font-mono">Disbursements ready to prepare</div>
            </div>

            <div className="p-5 border border-slate-200 bg-white rounded-2xl space-y-2 shadow-sm">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-mono">Pending Logistics Intake</span>
              <div className="text-2xl font-black text-indigo-600">
                {db.requisitions.filter(r => r.status === 'RETURNED').length} Returns
              </div>
              <div className="text-[10px] text-indigo-500 font-bold flex items-center gap-1">
                <Layers className="w-3.5 h-3.5" /> Re-entry warehousing
              </div>
            </div>

            <div className="p-5 border border-slate-200 bg-white rounded-2xl space-y-2 shadow-sm">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-mono">Stock Warnings Limit</span>
              <div className="text-2xl font-black text-rose-600">{lowStockCount} Alerts</div>
              <div className="text-[10px] text-rose-500 font-bold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Requires supplier loading
              </div>
            </div>

            <div className="p-5 border border-slate-200 bg-white rounded-2xl space-y-2 shadow-sm">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-mono">Active Repair Workorders</span>
              <div className="text-2xl font-black text-slate-800">{workorders.length} Tasks</div>
              <div className="text-[10px] text-slate-400 font-mono">Maintenance pipelines active</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Warehouse stock loader form */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Rapid Warehouse Inbound Ingest</h3>
                <p className="text-[11px] text-slate-400">Instantly catalog incoming supplier shipments or adjustments</p>
              </div>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formEl = e.currentTarget;
                const itemId = (formEl.elements.namedItem('itemId') as HTMLSelectElement).value;
                const qty = parseInt((formEl.elements.namedItem('qty') as HTMLInputElement).value);
                const location = (formEl.elements.namedItem('location') as HTMLInputElement).value;
                
                const matchedItem = db.inventory.find(i => i.id === itemId);
                if (matchedItem) {
                  matchedItem.quantityInStock += qty;
                  matchedItem.locationCode = location.toUpperCase();
                  triggerToast(`Stock loaded: Added ${qty} units to ${matchedItem.name} in zone ${location.toUpperCase()}`, "success");
                  formEl.reset();
                }
              }} className="space-y-4 text-xs font-semibold">
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Select Product SKU</label>
                  <select name="itemId" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-semibold text-slate-600">
                    {db.inventory.map(i => (
                      <option key={i.id} value={i.id}>{i.sku} - {i.name}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Inbound Units</label>
                    <input type="number" min="1" required name="qty" defaultValue="25" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none" />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Location Zone</label>
                    <input type="text" placeholder="WH-C1-S2" required name="location" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none uppercase font-mono" />
                  </div>
                </div>
                <button type="submit" className="w-full bg-[#39A5AD] hover:bg-[#2D8E95] text-white font-extrabold py-2.5 rounded-xl transition-all cursor-pointer">
                  Load Stock & Lock Location
                </button>
              </form>
            </div>

            {/* Print QR & Barcode Console */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-1.5">
                  <QrCode className="w-4 h-4 text-[#39A5AD]" /> SKU Barcode & QR Labeler
                </h3>
                <p className="text-[11px] text-slate-400">Generate print-ready GS1 barcodes and routing QR codes instantly</p>
              </div>
              <div className="space-y-3.5 text-xs font-semibold">
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Choose Asset SKU</label>
                  <select 
                    value={barcodeSku} 
                    onChange={(e) => { setBarcodeSku(e.target.value); setShowBarcodePrint(false); }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-semibold text-slate-600"
                  >
                    {db.inventory.map(i => (
                      <option key={i.id} value={i.sku}>{i.sku} - {i.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => { setShowBarcodePrint(true); triggerToast("EIMS routing label rendered.", "success"); }}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    Generate Labels
                  </button>
                </div>

                {showBarcodePrint && barcodeSku && (
                  <div className="p-4 border border-dashed border-slate-300 rounded-xl bg-slate-50 text-center space-y-3 animate-fade-in font-mono">
                    <span className="text-[10px] text-slate-400 block tracking-widest font-black uppercase">BARCODE & QR CODE</span>
                    
                    {/* Simulated vector Barcode */}
                    <div className="mx-auto flex justify-center items-center gap-0.5 h-12 bg-white border p-2 rounded">
                      {[1,3,1,1,2,4,1,2,3,1,4,2,1,2,1,3,1,1,4,2,1,2].map((w, i) => (
                        <div key={i} className="bg-slate-900 h-full" style={{ width: `${w * 1.5}px` }} />
                      ))}
                    </div>
                    
                    <div className="text-[10px] font-black text-slate-700 tracking-widest">*{barcodeSku}*</div>
                    
                    {/* Simulated routing QR code */}
                    <div className="w-20 h-20 bg-white border border-slate-200 mx-auto rounded p-1.5 flex flex-col justify-between">
                      <div className="flex justify-between h-4">
                        <div className="w-4 h-4 bg-slate-900 rounded" />
                        <div className="w-1 bg-slate-900" />
                        <div className="w-4 h-4 bg-slate-900 rounded" />
                      </div>
                      <div className="flex justify-between items-center h-4 text-[6px] font-extrabold text-[#39A5AD]">
                        <span>A-FLOW</span>
                      </div>
                      <div className="flex justify-between h-4">
                        <div className="w-4 h-4 bg-slate-900 rounded" />
                        <div className="w-2 bg-slate-900" />
                        <div className="w-4 h-4 bg-slate-900 rounded" />
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => triggerToast(`Routing document queued for local printers under profile label ${barcodeSku}.`, "success")}
                      className="text-[9px] uppercase font-black tracking-widest bg-emerald-50 text-emerald-800 border border-emerald-200 py-1.5 px-3 rounded hover:bg-emerald-100 transition-all cursor-pointer"
                    >
                      Print Label Row
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Scheduled Maintenance and repair workorders */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Scheduled Repair Workorders</h3>
                <p className="text-[11px] text-slate-400">Review upcoming maintenance tasks or schedule a hardware inspection</p>
              </div>

              <form onSubmit={handleCreateWorkorder} className="space-y-3 text-xs font-semibold">
                <input 
                  type="text" 
                  placeholder="Enter equipment description..." 
                  required 
                  value={woAsset} 
                  onChange={(e) => setWoAsset(e.target.value)} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none" 
                />
                <div className="grid grid-cols-2 gap-2">
                  <input 
                    type="text" 
                    placeholder="Repair service company..." 
                    required 
                    value={woCompany} 
                    onChange={(e) => setWoCompany(e.target.value)} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none text-slate-700" 
                  />
                  <input 
                    type="date" 
                    required 
                    value={woDate} 
                    onChange={(e) => setWoDate(e.target.value)} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none text-slate-700" 
                  />
                </div>
                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5">
                  <PenTool className="w-3.5 h-3.5" /> Schedule Maintenance
                </button>
              </form>

              <div className="pt-2 border-t border-slate-100 space-y-2.5 max-h-44 overflow-y-auto">
                {workorders.map((wo) => (
                  <div key={wo.id} className="p-3 bg-slate-50 border border-slate-150 rounded-xl text-xs font-bold text-slate-700 flex justify-between items-center">
                    <div>
                      <span className="text-[8px] font-mono text-indigo-600 uppercase block font-black">{wo.id} - {wo.company}</span>
                      <span className="block text-slate-800 leading-tight mt-0.5">{wo.asset}</span>
                      <span className="text-[9px] text-slate-400 block mt-0.5">Scheduled for: {wo.date}</span>
                    </div>
                    <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-[9px] px-2 py-0.5 rounded font-black font-mono">
                      {wo.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== ROLE 4: STAFF EMPLOYEE DASHBOARD ==================== */}
      {currentUser.role === 'EMPLOYEE' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 border border-slate-200 bg-white rounded-2xl space-y-2 shadow-sm">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-mono">My Active Custody Leases</span>
              <div className="text-2xl font-black text-slate-800">
                {db.requisitions.filter(r => r.requesterEmail === currentUser.email && r.status === 'APPROVED').length} Assets
              </div>
              <div className="text-[10px] text-emerald-600 font-bold block">Assigned hardware fully logged</div>
            </div>

            <div className="p-5 border border-slate-200 bg-white rounded-2xl space-y-2 shadow-sm">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-mono">My Pending Signoffs</span>
              <div className="text-2xl font-black text-amber-600">
                {db.requisitions.filter(r => r.requesterEmail === currentUser.email && r.status === 'PENDING').length} Tickets
              </div>
              <div className="text-[10px] text-amber-500 font-bold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Routed to manager's approvals
              </div>
            </div>

            <div className="p-5 border border-slate-200 bg-white rounded-2xl space-y-2 shadow-sm">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-mono">Cost Center Balance Left</span>
              <div className="text-2xl font-black text-slate-900">
                ${(db.departments.find(d => d.id === currentUser.departmentId)?.budgetLimit || 0) - (db.departments.find(d => d.id === currentUser.departmentId)?.budgetConsumed || 0)}
              </div>
              <div className="text-[10px] text-slate-400 font-bold">
                Remaining department allocated budget
              </div>
            </div>

            <div className="p-5 border border-slate-200 bg-white rounded-2xl space-y-2 shadow-sm">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-mono">Personal Message Box</span>
              <div className="text-2xl font-black text-indigo-600">3 Notifications</div>
              <div className="text-[10px] text-indigo-500 font-bold flex items-center gap-1">
                <Inbox className="w-3.5 h-3.5" /> Dynamic alerts streams active
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* New Requisition checkout helper form */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Rapid Procurement Request Desk</h3>
                <p className="text-[11px] text-slate-400">File a hardware request within your department budget cap</p>
              </div>

              <form onSubmit={handleEmployeeSubmitRequest} className="space-y-4 text-xs font-semibold">
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Choose Hardware SKU</label>
                  <select 
                    value={selectedItemId} 
                    onChange={(e) => setSelectedItemId(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-semibold text-slate-600"
                  >
                    <option value="">Select an asset...</option>
                    {db.inventory.map(i => (
                      <option key={i.id} value={i.id}>{i.sku} - {i.name} (${i.unitCost})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Requested Quantity Units</label>
                  <input 
                    type="number" 
                    min="1" 
                    required 
                    value={requestQty} 
                    onChange={(e) => setRequestQty(parseInt(e.target.value))} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none text-slate-800" 
                  />
                </div>

                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Operational Reason / Justification</label>
                  <textarea 
                    rows={2} 
                    required 
                    placeholder="Testing sandbox integration arrays..." 
                    value={requestReason} 
                    onChange={(e) => setRequestReason(e.target.value)} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none text-slate-800 placeholder-slate-400" 
                  />
                </div>

                <button type="submit" className="w-full bg-[#39A5AD] hover:bg-[#2D8E95] text-white font-extrabold py-2.5 rounded-xl transition-all cursor-pointer">
                  Submit Request Ticket
                </button>
              </form>
            </div>

            {/* My assets currently in custody */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">My Workspace Assets & Custody</h3>
                <p className="text-[11px] text-slate-400">All registered hardware currently allocated under your corporate routing email</p>
              </div>

              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left font-medium text-slate-600 border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                      <th className="py-2.5 px-1">Asset Model</th>
                      <th className="py-2.5 px-1">Units</th>
                      <th className="py-2.5 px-1">State</th>
                      <th className="py-2.5 px-1 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {db.requisitions.filter(r => r.requesterEmail === currentUser.email).length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-slate-400 text-xs">
                          No active custody assets on your profile. Create a request to checkout.
                        </td>
                      </tr>
                    ) : (
                      db.requisitions.filter(r => r.requesterEmail === currentUser.email).map((req) => {
                        const item = db.inventory.find(i => i.id === req.itemId);
                        return (
                          <tr key={req.id} className="hover:bg-slate-50/50">
                            <td className="py-3 px-1 text-slate-900 font-extrabold">{item?.name || "Unlisted SKU"}</td>
                            <td className="py-3 px-1 text-slate-500 font-mono text-[11px]">{req.quantityRequested} Unit(s)</td>
                            <td className="py-3 px-1">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
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
                            </td>
                            <td className="py-3 px-1 text-right">
                              {req.status === 'APPROVED' ? (
                                <button
                                  onClick={() => {
                                    triggerToast(`Initiating return process for ticket ${req.id}. Delivered to warehouse intake.`, "success");
                                    req.status = 'RETURNED';
                                    if (item) item.quantityInStock += req.quantityRequested;
                                  }}
                                  className="text-[9px] uppercase font-black tracking-widest bg-slate-100 border border-slate-200 px-2 py-1 rounded hover:bg-rose-50 hover:text-rose-600 transition-all cursor-pointer"
                                >
                                  Return Asset
                                </button>
                              ) : (
                                <span className="text-[10px] text-slate-400 font-bold">Closed</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== ROLE 5: COMPLIANCE AUDITOR DASHBOARD ==================== */}
      {currentUser.role === 'AUDITOR' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 border border-slate-200 bg-white rounded-2xl space-y-2 shadow-sm">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-mono">System Integrity Assessment</span>
              <div className="text-2xl font-black text-emerald-600">A+ Certified</div>
              <div className="text-[10px] text-slate-400 block font-mono">SLA & compliance validation clean</div>
            </div>

            <div className="p-5 border border-slate-200 bg-white rounded-2xl space-y-2 shadow-sm">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-mono">Consolidated Valuation</span>
              <div className="text-2xl font-black text-indigo-600">${totalValuation.toLocaleString()}</div>
              <div className="text-[10px] text-indigo-500 font-bold">
                Physical hardware asset capital index
              </div>
            </div>

            <div className="p-5 border border-slate-200 bg-white rounded-2xl space-y-2 shadow-sm">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-mono">Capital Burn Velocity</span>
              <div className="text-2xl font-black text-amber-600">${totalBudgetConsumed.toLocaleString()}</div>
              <div className="text-[10px] text-slate-400">
                Allocated organizational spend index
              </div>
            </div>

            <div className="p-5 border border-slate-200 bg-white rounded-2xl space-y-2 shadow-sm">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-mono">SHA-256 Signature Logs</span>
              <div className="text-2xl font-black text-slate-800">{db.auditLogs.length} Verified</div>
              <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 font-mono">
                <ShieldCheck className="w-3.5 h-3.5" /> Ledger database verified clean
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Ledger Stream inspection */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Independent Audit Ledger Inspection</h3>
                  <p className="text-[11px] text-slate-400">Search and review verified transactions, adjust locations, and budget logs</p>
                </div>
                <input
                  type="text"
                  placeholder="Filter logs..."
                  value={auditorSearch}
                  onChange={(e) => setAuditorSearch(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-2 px-3 text-xs outline-none focus:border-[#39A5AD]"
                />
              </div>

              <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto pr-1">
                {db.auditLogs
                  .filter(l => l.details.toLowerCase().includes(auditorSearch.toLowerCase()) || l.actionType.toLowerCase().includes(auditorSearch.toLowerCase()))
                  .map((log) => (
                    <div key={log.id} className="py-3.5 text-xs font-bold text-slate-700 space-y-1">
                      <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                        <span className="text-slate-800">{log.actorName} ({log.actorEmail})</span>
                        <span>{new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-slate-600 font-medium">
                        <span className="bg-slate-100 text-slate-800 border border-slate-200 px-2 py-0.5 rounded font-black font-mono uppercase text-[9px] mr-1.5">{log.actionType}</span>
                        {log.details}
                      </p>
                    </div>
                  ))}
              </div>
            </div>

            {/* Right: Reports quick download and activity charts */}
            <div className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Pre-Compiled Compliance Reports</h3>
                  <p className="text-[11px] text-slate-400">Download cryptographically-signed operational and budget matrices as Excel spreadsheets</p>
                </div>

                <div className="space-y-3 font-semibold text-xs text-slate-700">
                  <button
                    onClick={() => triggerToast("Compiling full ledger CSV report. Triggered browser direct-download.", "success")}
                    className="w-full p-3.5 border border-slate-150 bg-slate-50 hover:bg-slate-100 rounded-xl text-left flex items-center justify-between transition-all cursor-pointer"
                  >
                    <div>
                      <span className="block text-slate-900 font-extrabold leading-tight">Verified Double-Entry Ledger</span>
                      <span className="text-[10px] text-slate-400">Includes all stock adjustment parameters</span>
                    </div>
                    <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                  </button>

                  <button
                    onClick={() => triggerToast("Compiling cost-center budget CSV reports. Triggered browser direct-download.", "success")}
                    className="w-full p-3.5 border border-slate-150 bg-slate-50 hover:bg-slate-100 rounded-xl text-left flex items-center justify-between transition-all cursor-pointer"
                  >
                    <div>
                      <span className="block text-slate-900 font-extrabold leading-tight">Department Budget consumptions</span>
                      <span className="text-[10px] text-slate-400">Real-time spend caps validation stats</span>
                    </div>
                    <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
