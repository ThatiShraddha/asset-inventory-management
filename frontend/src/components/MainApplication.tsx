import React, { useState, useEffect } from 'react';
import { 
  getDB,
  syncFromBackend,
  logoutUser,
  postStockIn,
  adjustStockPoint,
  createNewItem,
  submitRequisition,
  processApproval,
  registerReturn,
  adjustDepartmentBudget,
  createNewCategory,
  resetToDefault
} from '../data/dbStore';
import { UserSession, Role, hasPermission } from '../types';
import { 
  Layers, Search, SlidersHorizontal, LogOut, LayoutDashboard, Package, FileText, 
  FileSpreadsheet, BarChart3, Settings2, Sparkles, Terminal, Bell, HelpCircle, Laptop, ShieldCheck, AlignLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Import newly created sub-components
import MarketingPage from './MarketingPage';
import AuthPages from './AuthPages';
import AppDashboard from './AppDashboard';
import AppInventory from './AppInventory';
import AppRequisitions from './AppRequisitions';
import AppReports from './AppReports';
import AppAnalytics from './AppAnalytics';
import AppSettings from './AppSettings';
import AppERP from './AppERP';

interface ToastItem {
  id: number;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

export default function MainApplication() {
  
  // SESSION ROUTING STATES
  // 'marketing' | 'auth' | 'console'
  const [sessionState, setSessionState] = useState<'marketing' | 'auth' | 'console'>('marketing');
  
  // Current logged in user (null by default so they arrive on the beautiful marketing deck first)
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);

  // DB Sync State
  const [db, setDb] = useState(getDB());
  const refreshDB = async () => {
    const data = await syncFromBackend();
    setDb(data);
  };

  // ACTIVE CONSOLE TAB
  const [activeTab, setActiveTab] = useState<'dashboard' | 'inventory' | 'requisitions' | 'reports' | 'analytics' | 'settings'>('dashboard');
  
  // Responsive sidebar state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Global Toast State
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const triggerToast = (message: string, type: 'success' | 'info' | 'warning' | 'error') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Keyboard Shortcuts navigation state helper
  const [lastKey, setLastKey] = useState<string>('');

  // Global Command Palette (Ctrl + K) State
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [paletteSearch, setPaletteSearch] = useState('');
  const [paletteCursor, setPaletteCursor] = useState(0);

  // Tab Switching Loading Shimmer
  const [tabLoading, setTabLoading] = useState(false);

  // External triggers for actions from dashboard
  const [openNewItemFromDashboard, setOpenNewItemFromDashboard] = useState(false);
  const [openStockInFromDashboard, setOpenStockInFromDashboard] = useState(false);
  const [openRequestFromDashboard, setOpenRequestFromDashboard] = useState(false);
  const [openBudgetFromDashboard, setOpenBudgetFromDashboard] = useState(false);

  // Trigger quick loading shimmers when switching tabs
  useEffect(() => {
    setTabLoading(true);
    const timer = setTimeout(() => {
      setTabLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, [activeTab]);

  // Route Guard to prevent unauthorized tab access
  useEffect(() => {
    if (currentUser) {
      const role = currentUser.role;
      if (activeTab === 'settings' && role !== 'ADMIN') {
        setActiveTab('dashboard');
        triggerToast("Access restricted: Workspace Settings require Admin privileges.", "warning");
      } else if (activeTab === 'erp' && !['ADMIN', 'STORE_MANAGER'].includes(role)) {
        setActiveTab('dashboard');
        triggerToast("Access restricted: Asset Lifecycle ERP requires Admin or Store Manager role.", "warning");
      } else if ((activeTab === 'analytics' || activeTab === 'reports') && !['ADMIN', 'STORE_MANAGER', 'AUDITOR'].includes(role)) {
        setActiveTab('dashboard');
        triggerToast("Access restricted: You do not have permission to view BI analytics or reports.", "warning");
      }
    }
  }, [currentUser, activeTab]);

  // Command palette keyboard bindings + navigation shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (!e.key) return;
      // Toggle Command Palette (Ctrl + K)
      if (e.key === 'k' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
        setPaletteSearch('');
        setPaletteCursor(0);
        return;
      }

      // Close overlays on Escape
      if (e.key === 'Escape') {
        setCommandPaletteOpen(false);
        return;
      }

      // SEQUENCE NAVIGATION (G + key)
      // Ignore if user is inside form inputs
      const activeEl = document.activeElement;
      const isInput = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.tagName === 'SELECT');
      if (isInput) return;

      if (e.key.toLowerCase() === 'g') {
        setLastKey('g');
        setTimeout(() => setLastKey(''), 1500); // clear after 1.5s
        return;
      }

      if (lastKey === 'g') {
        const targetKey = e.key.toLowerCase();
        if (targetKey === 'd') {
          setActiveTab('dashboard');
          triggerToast("Navigated to Dashboard Console", "info");
        } else if (targetKey === 'i') {
          setActiveTab('inventory');
          triggerToast("Navigated to Active Inventory Ledger", "info");
        } else if (targetKey === 'r') {
          setActiveTab('requisitions');
          triggerToast("Navigated to Procurement Requisitions", "info");
        } else if (targetKey === 'a') {
          setActiveTab('analytics');
          triggerToast("Navigated to BI Spend Analytics", "info");
        } else if (targetKey === 'p') {
          setActiveTab('reports');
          triggerToast("Navigated to Reports Builders", "info");
        } else if (targetKey === 's') {
          setActiveTab('settings');
          triggerToast("Navigated to Workspace Settings", "info");
        }
        setLastKey('');
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [lastKey]);

  // Command palette items
  const commandPaletteOptions = [
    { label: "Go to Dashboard Console", action: () => { setActiveTab('dashboard'); setCommandPaletteOpen(false); }, category: "Navigation", allowedRoles: ['ADMIN', 'STORE_MANAGER', 'EMPLOYEE', 'AUDITOR'] },
    { label: "Go to Active Inventory Ledger", action: () => { setActiveTab('inventory'); setCommandPaletteOpen(false); }, category: "Navigation", allowedRoles: ['ADMIN', 'STORE_MANAGER', 'EMPLOYEE', 'AUDITOR'] },
    { label: "Go to Procurement Requisitions", action: () => { setActiveTab('requisitions'); setCommandPaletteOpen(false); }, category: "Navigation", allowedRoles: ['ADMIN', 'STORE_MANAGER', 'EMPLOYEE', 'AUDITOR'] },
    { label: "Go to BI Spend Analytics", action: () => { setActiveTab('analytics'); setCommandPaletteOpen(false); }, category: "Navigation", allowedRoles: ['ADMIN', 'STORE_MANAGER', 'AUDITOR'] },
    { label: "Go to Reports Center", action: () => { setActiveTab('reports'); setCommandPaletteOpen(false); }, category: "Navigation", allowedRoles: ['ADMIN', 'STORE_MANAGER', 'AUDITOR'] },
    { label: "Go to Workspace Settings", action: () => { setActiveTab('settings'); setCommandPaletteOpen(false); }, category: "Navigation", allowedRoles: ['ADMIN'] },
    
    { label: "Perform Stock-In Delivery", action: () => { setActiveTab('inventory'); setOpenStockInFromDashboard(true); setCommandPaletteOpen(false); }, category: "Actions", allowedRoles: ['ADMIN', 'STORE_MANAGER'] },
    { label: "Register New Product SKU", action: () => { setActiveTab('inventory'); setOpenNewItemFromDashboard(true); setCommandPaletteOpen(false); }, category: "Actions", allowedRoles: ['ADMIN', 'STORE_MANAGER'] },
    { label: "Request Asset Disbursement", action: () => { setActiveTab('requisitions'); setOpenRequestFromDashboard(true); setCommandPaletteOpen(false); }, category: "Actions", allowedRoles: ['ADMIN', 'STORE_MANAGER', 'EMPLOYEE', 'AUDITOR'] },
    { label: "Reset Local Database sandbox", action: () => { setActiveTab('settings'); setCommandPaletteOpen(false); }, category: "Admin", allowedRoles: ['ADMIN'] },
  ];

  const filteredPaletteOptions = commandPaletteOptions.filter(item => 
    (item.allowedRoles ? item.allowedRoles.includes(currentUser?.role || '') : true) &&
    (item.label.toLowerCase().includes(paletteSearch.toLowerCase()) ||
     item.category.toLowerCase().includes(paletteSearch.toLowerCase()))
  );

  const handlePaletteKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setPaletteCursor(prev => Math.min(prev + 1, filteredPaletteOptions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setPaletteCursor(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredPaletteOptions[paletteCursor]) {
        filteredPaletteOptions[paletteCursor].action();
      }
    }
  };

  // Database mutation handlers — await API call then refresh UI state
  const handlePostStockIn = async (itemId: string, qty: number, costOverride?: number) => {
    if (!currentUser) return;
    await postStockIn(itemId, qty, currentUser, costOverride);
    await refreshDB();
  };

  const handleAdjustStockPoint = async (itemId: string, reorderPoint: number, location: string) => {
    if (!currentUser) return;
    await adjustStockPoint(itemId, reorderPoint, location, currentUser);
    await refreshDB();
  };

  const handleRegisterNewItem = async (itemData: any) => {
    if (!currentUser) return { success: false, error: "Access denied" };
    const res = await createNewItem(itemData, currentUser);
    await refreshDB();
    return res;
  };

  const handleSubmitRequisition = async (itemId: string, quantity: number, justification: string) => {
    if (!currentUser) return { success: false, error: "Access denied" };
    const res = await submitRequisition(itemId, quantity, justification, currentUser);
    await refreshDB();
    return res;
  };

  const handleProcessApproval = async (reqId: string, action: 'APPROVE' | 'DENY', denialReason?: string) => {
    if (!currentUser) return { success: false, error: "Access denied" };
    const res = await processApproval(reqId, action, currentUser, denialReason);
    await refreshDB();
    return res;
  };

  const handleRegisterReturn = async (reqId: string) => {
    if (!currentUser) return { success: false, error: "Access denied" };
    const res = await registerReturn(reqId, currentUser);
    await refreshDB();
    return res;
  };

  const handleResetDB = async () => {
    await resetToDefault();
    await refreshDB();
  };

  const handleRoleChange = (newRole: Role) => {
    if (!currentUser) return;
    const updated = { ...currentUser, role: newRole };
    setCurrentUser(updated);
  };

  const handleLoginSuccess = async (user: UserSession) => {
    setCurrentUser(user);
    setSessionState('console');
    await refreshDB();
  };

  const handleLogout = async () => {
    await logoutUser();
    setCurrentUser(null);
    setSessionState('marketing');
    triggerToast("Workspace session terminated successfully.", "info");
  };

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans selection:bg-[#39A5AD]/25 antialiased relative">
      
      {/* GLOBAL TOAST STACK */}
      <div className="fixed bottom-6 right-6 z-[100] space-y-3 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
              className={`p-4 rounded-xl shadow-xl border bg-white text-xs font-bold flex items-start gap-3 pointer-events-auto ${
                toast.type === 'success' 
                  ? 'border-emerald-200 shadow-emerald-500/5' 
                  : toast.type === 'error' 
                  ? 'border-rose-200 shadow-rose-500/5' 
                  : toast.type === 'warning' 
                  ? 'border-amber-200 shadow-amber-500/5' 
                  : 'border-slate-200 shadow-slate-500/5'
              }`}
            >
              <div className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${
                toast.type === 'success' 
                  ? 'bg-emerald-500' 
                  : toast.type === 'error' 
                  ? 'bg-rose-500' 
                  : toast.type === 'warning' 
                  ? 'bg-amber-500' 
                  : 'bg-[#39A5AD]'
              }`} />
              <div className="flex-1 text-slate-700 leading-normal">
                {toast.message}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* GLOBAL COMMAND PALETTE OVERLAY (Ctrl+K) */}
      <AnimatePresence>
        {commandPaletteOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[90] flex items-start justify-center pt-24 p-4"
            onClick={() => setCommandPaletteOpen(false)}
          >
            <motion.div 
              initial={{ scale: 0.97, y: -10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.97, y: -10 }}
              className="bg-white border border-slate-200/80 shadow-2xl rounded-2xl max-w-lg w-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Search Bar Input */}
              <div className="p-4 border-b border-slate-100 flex items-center gap-3 relative">
                <Search className="w-5 h-5 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Type a page name or action to execute..."
                  value={paletteSearch}
                  onChange={(e) => { setPaletteSearch(e.target.value); setPaletteCursor(0); }}
                  onKeyDown={handlePaletteKeyDown}
                  className="w-full bg-transparent text-sm outline-none text-slate-800 font-semibold"
                  autoFocus
                />
                <span className="text-[10px] font-mono bg-slate-50 border border-slate-200 text-slate-400 px-2.5 py-1 rounded-md shadow-sm">
                  ESC to close
                </span>
              </div>

              {/* Options lists with arrow keys navigation */}
              <div className="max-h-80 overflow-y-auto py-2">
                {filteredPaletteOptions.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs font-semibold">
                    No results match your criteria.
                  </div>
                ) : (
                  filteredPaletteOptions.map((item, index) => {
                    const isSelected = index === paletteCursor;
                    return (
                      <button
                        key={index}
                        onClick={item.action}
                        onMouseEnter={() => setPaletteCursor(index)}
                        className={`w-full text-left px-5 py-3 text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                          isSelected ? 'bg-slate-50 text-[#39A5AD]' : 'text-slate-600'
                        }`}
                      >
                        <span>{item.label}</span>
                        <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest bg-slate-100 px-2 py-0.5 rounded font-mono">
                          {item.category}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>

              {/* Bottom footer guide */}
              <div className="bg-slate-50 border-t border-slate-100 p-3.5 flex justify-between items-center text-[10px] text-slate-400 font-semibold">
                <span>Use arrow keys ↑↓ to navigate, Enter to sign off</span>
                <span>AssetFlow Command Deck</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SESSION SCREEN ROUTER */}
      {sessionState === 'marketing' && (
        <div className="bg-white">
          {/* Main Public navbar */}
          <nav className="bg-white border-b border-slate-100 py-4 px-6 flex justify-between items-center max-w-7xl mx-auto">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#39A5AD] flex items-center justify-center text-white shadow-sm shadow-[#39A5AD]/25">
                <Layers className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-sm text-slate-900 tracking-tight">AssetFlow</span>
            </div>
            
            <div className="hidden md:flex items-center gap-6 text-xs font-black text-slate-500">
              <a href="#features" className="hover:text-slate-800">Features</a>
              <a href="#solutions" className="hover:text-slate-800">Solutions</a>
              <a href="#pricing" className="hover:text-slate-800">Pricing</a>
              <a href="#faq" className="hover:text-slate-800">FAQ</a>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setSessionState('auth')}
                className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs px-4 py-2 rounded-xl cursor-pointer"
              >
                Launch Console
              </button>
            </div>
          </nav>

          <MarketingPage 
            onLaunchConsole={() => setSessionState('auth')}
            triggerToast={triggerToast}
          />
        </div>
      )}

      {sessionState === 'auth' && (
        <AuthPages 
          onBackToMarketing={() => setSessionState('marketing')}
          onLoginSuccess={handleLoginSuccess}
          triggerToast={triggerToast}
        />
      )}

      {sessionState === 'console' && currentUser && (
        <div className="min-h-screen flex flex-col md:flex-row bg-slate-50/50">
          
          {/* DESKTOP SIDEBAR PANEL */}
          <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 p-6 space-y-6 shrink-0 relative z-30 select-none justify-between">
            <div className="space-y-6">
              {/* Org branding */}
              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
                <div className="w-8 h-8 rounded-lg bg-[#39A5AD] flex items-center justify-center text-white shadow-sm shadow-[#39A5AD]/20">
                  <Laptop className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-extrabold text-xs text-slate-900 tracking-tight block">Quantum Labs</span>
                  <span className="text-[10px] text-slate-400 font-bold tracking-wider uppercase block leading-none font-mono">Tenant Zone</span>
                </div>
              </div>

              {/* CMD PALETTE TOGGLE BUTTON */}
              <button
                onClick={() => setCommandPaletteOpen(true)}
                className="w-full bg-slate-50 hover:bg-slate-100/80 border border-slate-200 text-slate-400 rounded-xl p-2.5 text-left text-xs font-semibold flex items-center justify-between cursor-pointer"
              >
                <span className="inline-flex items-center gap-1.5">
                  <Search className="w-4 h-4 text-slate-400" /> Search commands...
                </span>
                <kbd className="text-[9px] bg-white border border-slate-200 px-1.5 py-0.5 rounded shadow-sm font-mono font-bold">
                  Ctrl+K
                </kbd>
              </button>

              {/* Navigation list */}
              <nav className="space-y-1 text-xs">
                {[
                  { key: 'dashboard', label: 'EIMS Dashboard', icon: LayoutDashboard },
                  { key: 'erp', label: 'Asset Lifecycle ERP', icon: SlidersHorizontal },
                  { key: 'inventory', label: 'Inventory Ledger', icon: Package },
                  { key: 'requisitions', label: 'Requests & Signoffs', icon: FileText, badge: db.requisitions.filter(r => r.status === 'PENDING').length },
                  { key: 'analytics', label: 'BI Spend Analytics', icon: BarChart3 },
                  { key: 'reports', label: 'Reports Builders', icon: FileSpreadsheet },
                  { key: 'settings', label: 'Workspace Settings', icon: Settings2 },
                ].filter(item => {
                  if (item.key === 'settings') {
                    return currentUser.role === 'ADMIN';
                  }
                  if (item.key === 'erp') {
                    return ['ADMIN', 'STORE_MANAGER'].includes(currentUser.role);
                  }
                  if (item.key === 'analytics' || item.key === 'reports') {
                    return ['ADMIN', 'STORE_MANAGER', 'AUDITOR'].includes(currentUser.role);
                  }
                  return true;
                }).map((item) => {
                  const isActive = activeTab === item.key;
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.key}
                      onClick={() => setActiveTab(item.key as any)}
                      className={`w-full text-left p-3 rounded-xl font-bold flex items-center justify-between transition-all cursor-pointer ${
                        isActive 
                          ? 'bg-[#39A5AD]/10 text-[#39A5AD]' 
                          : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/40'
                      }`}
                    >
                      <span className="inline-flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-[#39A5AD]' : 'text-slate-400'}`} />
                        {item.label}
                      </span>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="bg-[#39A5AD] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Profile & Logout row */}
            <div className="border-t border-slate-100 pt-4 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center font-black text-[#39A5AD] border border-slate-200">
                  {currentUser.name[0]}
                </div>
                <div>
                  <span className="font-extrabold text-xs text-slate-800 block">{currentUser.name}</span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block leading-none font-mono">
                    {currentUser.role}
                  </span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="w-full text-left p-2.5 rounded-xl text-rose-500 hover:bg-rose-50 text-[11px] font-extrabold flex items-center gap-2 transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" /> Disconnect Session
              </button>
            </div>
          </aside>

          {/* MOBILE RESPONSIVE SIDEBAR DRAWER OVERLAY */}
          <AnimatePresence>
            {isMobileSidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[80] md:hidden"
                onClick={() => setIsMobileSidebarOpen(false)}
              >
                <motion.div
                  initial={{ x: -260 }}
                  animate={{ x: 0 }}
                  exit={{ x: -260 }}
                  className="bg-white h-full w-64 p-6 flex flex-col justify-between"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#39A5AD] flex items-center justify-center text-white">
                          <Laptop className="w-4 h-4" />
                        </div>
                        <span className="font-extrabold text-xs text-slate-900">Quantum Labs</span>
                      </div>
                      <button onClick={() => setIsMobileSidebarOpen(false)} className="text-slate-400 hover:text-slate-700 text-xs font-black">
                        [x]
                      </button>
                    </div>

                    <nav className="space-y-1 text-xs font-bold">
                      {[
                        { key: 'dashboard', label: 'EIMS Dashboard', icon: LayoutDashboard },
                        { key: 'inventory', label: 'Inventory Ledger', icon: Package },
                        { key: 'requisitions', label: 'Requests & Signoffs', icon: FileText, badge: db.requisitions.filter(r => r.status === 'PENDING').length },
                        { key: 'analytics', label: 'BI Spend Analytics', icon: BarChart3 },
                        { key: 'reports', label: 'Reports Builders', icon: FileSpreadsheet },
                        { key: 'settings', label: 'Workspace Settings', icon: Settings2 },
                      ].filter(item => {
                        if (currentUser.role === 'EMPLOYEE' && (item.key === 'analytics' || item.key === 'reports')) {
                          return false;
                        }
                        return true;
                      }).map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.key;

                        return (
                          <button
                            key={item.key}
                            onClick={() => { setActiveTab(item.key as any); setIsMobileSidebarOpen(false); }}
                            className={`w-full text-left p-3 rounded-xl flex items-center justify-between cursor-pointer ${
                              isActive ? 'bg-[#39A5AD]/10 text-[#39A5AD]' : 'text-slate-500 hover:bg-slate-50'
                            }`}
                          >
                            <span className="inline-flex items-center gap-2.5">
                              <Icon className="w-4 h-4" />
                              {item.label}
                            </span>
                            {item.badge && (
                              <span className="bg-[#39A5AD] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                                {item.badge}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </nav>
                  </div>

                  <div className="border-t border-slate-100 pt-4 space-y-3">
                    <span className="text-[10px] text-slate-400 block font-mono font-bold">Active: {currentUser.name}</span>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left p-2.5 text-rose-500 hover:bg-rose-50 text-[11px] font-extrabold flex items-center gap-2 transition-all cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" /> Disconnect
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* MAIN WORKSPACE WRAPPER */}
          <div className="flex-1 flex flex-col min-w-0">
            
            {/* MOBILE TOP NAVIGATION BAR */}
            <header className="bg-white border-b border-slate-200 px-6 py-4 flex md:hidden justify-between items-center select-none relative z-20">
              <button 
                onClick={() => setIsMobileSidebarOpen(true)}
                className="text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                <AlignLeft className="w-6 h-6" />
              </button>
              
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#39A5AD] flex items-center justify-center text-white font-extrabold">
                  <Laptop className="w-4 h-4" />
                </div>
                <span className="font-extrabold text-xs text-slate-900 tracking-tight">AssetFlow</span>
              </div>

              <div className="w-6" /> {/* spacer balance */}
            </header>

            {/* MAIN INTERNAL CONTAINER SCREEN */}
            <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
              
              {/* BREADCRUMB INDICATOR trail */}
              <div className="mb-6 select-none flex items-center gap-2 text-[10px] font-black tracking-widest text-slate-400 uppercase font-mono">
                <span>Workspace</span>
                <span>/</span>
                <span className="text-slate-700">{activeTab}</span>
                {activeTab === 'inventory' && (
                  <>
                    <span>/</span>
                    <span className="text-[#39A5AD]">Ledger</span>
                  </>
                )}
              </div>

              {/* DYNAMIC SHIMMER SKELETON ON TAB SWITCHES */}
              {tabLoading ? (
                <div className="space-y-6 animate-pulse">
                  <div className="h-24 bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-center space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-1/4" />
                    <div className="h-3 bg-slate-150 rounded w-1/2" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="h-36 bg-white border border-slate-200 rounded-2xl p-5" />
                    <div className="h-36 bg-white border border-slate-200 rounded-2xl p-5" />
                    <div className="h-36 bg-white border border-slate-200 rounded-2xl p-5" />
                  </div>
                  <div className="h-64 bg-white border border-slate-200 rounded-2xl" />
                </div>
              ) : (
                <div className="animate-fade-in">
                  
                  {/* TAB 1: DASHBOARD */}
                  {activeTab === 'dashboard' && (
                    <AppDashboard 
                      db={db}
                      currentUser={currentUser}
                      onOpenStockIn={() => setOpenStockInFromDashboard(true)}
                      onOpenNewItem={() => setOpenNewItemFromDashboard(true)}
                      onOpenRequest={() => setOpenRequestFromDashboard(true)}
                      onOpenBudget={() => triggerToast("Dynamic budget caps are configured in settings.", "info")}
                      triggerToast={triggerToast}
                    />
                  )}

                  {/* TAB 2: INVENTORY */}
                  {activeTab === 'inventory' && (
                    <AppInventory 
                      db={db}
                      currentUser={currentUser}
                      onPostStockIn={handlePostStockIn}
                      onAdjustStockPoint={handleAdjustStockPoint}
                      onRegisterNewItem={handleRegisterNewItem}
                      triggerToast={triggerToast}
                      // external triggers
                      openNewItemExternal={openNewItemFromDashboard}
                      onCloseNewItemExternal={() => setOpenNewItemFromDashboard(false)}
                      openStockInExternal={openStockInFromDashboard}
                      onCloseStockInExternal={() => setOpenStockInFromDashboard(false)}
                    />
                  )}

                  {/* TAB: ERP */}
                  {activeTab === 'erp' && (
                    <AppERP 
                      currentUser={currentUser}
                      triggerToast={triggerToast}
                    />
                  )}

                  {/* TAB 3: REQUISITIONS */}
                  {activeTab === 'requisitions' && (
                    <AppRequisitions 
                      db={db}
                      currentUser={currentUser}
                      onSubmitRequisition={handleSubmitRequisition}
                      onProcessApproval={handleProcessApproval}
                      onRegisterReturn={handleRegisterReturn}
                      triggerToast={triggerToast}
                      // external trigger
                      openRequestExternal={openRequestFromDashboard}
                      onCloseRequestExternal={() => setOpenRequestFromDashboard(false)}
                    />
                  )}

                  {/* TAB 4: ANALYTICS */}
                  {activeTab === 'analytics' && (
                    <AppAnalytics db={db} />
                  )}

                  {/* TAB 5: REPORTS */}
                  {activeTab === 'reports' && (
                    <AppReports 
                      db={db}
                      triggerToast={triggerToast}
                    />
                  )}

                  {/* TAB 6: SETTINGS */}
                  {activeTab === 'settings' && (
                    <AppSettings 
                      currentUser={currentUser}
                      departments={db.departments}
                      onRoleChange={handleRoleChange}
                      onResetDB={handleResetDB}
                      triggerToast={triggerToast}
                    />
                  )}

                </div>
              )}

            </main>
          </div>

        </div>
      )}

    </div>
  );
}
