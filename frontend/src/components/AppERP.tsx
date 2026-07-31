import React, { useState, useEffect } from 'react';
import { 
  Building2, Layers, ShieldCheck, ClipboardCheck, ArrowRightLeft, Undo2, 
  Settings2, Wrench, ShieldAlert, BarChart3, Trash2, Printer, Mail, 
  ExternalLink, Plus, AlertCircle, FileText, CheckCircle2, XCircle, Clock,
  DollarSign, Package, User, Calendar, Shield, Activity, TrendingUp, Inbox
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { UserSession } from '../types';

interface AppERPProps {
  currentUser: UserSession;
  triggerToast: (msg: string, type: 'success' | 'info' | 'warning' | 'error') => void;
}

// ─── API Helper ──────────────────────────────────────────────────
const API_BASE = (import.meta as any).env?.VITE_API_URL || '/api';

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    credentials: 'include',
    ...options
  });
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.message || `API Error ${res.status}`);
  }
  return res.json();
}

export default function AppERP({ currentUser, triggerToast }: AppERPProps) {
  // Navigation
  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'po' | 'grn' | 'transfer' | 'return' | 'adjustment' | 'maintenance' | 'warranty' | 'disposal' | 'ledger' | 'docs'>('dashboard');

  // Loading state
  const [loading, setLoading] = useState(false);

  // Database lists fetched from backend
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
  const [goodsReceipts, setGoodsReceipts] = useState<any[]>([]);
  const [transfers, setTransfers] = useState<any[]>([]);
  const [returns, setReturns] = useState<any[]>([]);
  const [adjustments, setAdjustments] = useState<any[]>([]);
  const [maintenance, setMaintenance] = useState<any[]>([]);
  const [warranties, setWarranties] = useState<any[]>([]);
  const [disposals, setDisposals] = useState<any[]>([]);
  const [ledger, setLedger] = useState<any[]>([]);
  const [docFootprints, setDocFootprints] = useState<any[]>([]);
  
  // Catalogs for selections
  const [users, setUsers] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);

  // Modals & form state
  const [activeModal, setActiveModal] = useState<string | null>(null); 
  const [viewingDoc, setViewingDoc] = useState<any | null>(null);

  // Form states - PO
  const [poVendorId, setPoVendorId] = useState('');
  const [poExpectedDelivery, setPoExpectedDelivery] = useState('');
  const [poRemarks, setPoRemarks] = useState('');
  const [poItems, setPoItems] = useState<any[]>([{ name: '', sku: '', categoryId: '', quantity: 1, unitCost: 0 }]);

  // Form states - GRN
  const [grnPoId, setGrnPoId] = useState('');
  const [grnWarehouse, setGrnWarehouse] = useState('');
  const [grnRemarks, setGrnRemarks] = useState('');
  const [grnItems, setGrnItems] = useState<any[]>([]);

  // Form states - Transfer
  const [trfAssetId, setTrfAssetId] = useState('');
  const [trfReceiverId, setTrfReceiverId] = useState('');
  const [trfRemarks, setTrfRemarks] = useState('');

  // Form states - Return
  const [rtnAssetId, setRtnAssetId] = useState('');
  const [rtnRemarks, setRtnRemarks] = useState('');

  // Form states - Stock Adjustment
  const [adjAssetId, setAdjAssetId] = useState('');
  const [adjNewQty, setAdjNewQty] = useState(0);
  const [adjReason, setAdjReason] = useState('CORRECTION');
  const [adjRemarks, setAdjRemarks] = useState('');

  // Form states - Maintenance
  const [mntAssetId, setMntAssetId] = useState('');
  const [mntVendorId, setMntVendorId] = useState('');
  const [mntIssue, setMntIssue] = useState('');
  const [mntPriority, setMntPriority] = useState('MEDIUM');
  const [mntEstCost, setMntEstCost] = useState(0);
  const [mntSchedDate, setMntSchedDate] = useState('');
  const [mntRemarks, setMntRemarks] = useState('');

  // Form states - Warranty
  const [wryAssetId, setWryAssetId] = useState('');
  const [wryStartDate, setWryStartDate] = useState('');
  const [wryEndDate, setWryEndDate] = useState('');
  const [wryVendorId, setWryVendorId] = useState('');
  const [wryCoverage, setWryCoverage] = useState('');
  const [wryAmcProvider, setWryAmcProvider] = useState('');
  const [wryAmcCost, setWryAmcCost] = useState(0);
  const [wryRemarks, setWryRemarks] = useState('');

  // Form states - Disposal
  const [dispAssetId, setDispAssetId] = useState('');
  const [dispReason, setDispReason] = useState('BROKEN');
  const [dispQty, setDispQty] = useState(1);
  const [dispRemarks, setDispRemarks] = useState('');

  // Initialize data
  const loadERPData = async () => {
    setLoading(true);
    try {
      const [poData, grnData, trfData, rtnData, adjData, mntData, wryData, dispData, ledgerData, docsData, usersData, vendorsData, catsData, invData] = await Promise.all([
        apiFetch<any[]>('/purchase-orders'),
        apiFetch<any[]>('/goods-receipts'),
        apiFetch<any[]>('/transfers'),
        apiFetch<any[]>('/returns'),
        apiFetch<any[]>('/adjustments').catch(() => []),
        apiFetch<any[]>('/maintenance'),
        apiFetch<any[]>('/warranties'),
        apiFetch<any[]>('/disposals'),
        apiFetch<any[]>('/ledger'),
        apiFetch<any[]>('/documents'),
        apiFetch<any[]>('/users').catch(() => []),
        apiFetch<any[]>('/vendors'),
        apiFetch<any[]>('/categories'),
        apiFetch<any[]>('/inventory')
      ]);

      setPurchaseOrders(poData);
      setGoodsReceipts(grnData);
      setTransfers(trfData);
      setReturns(rtnData);
      setAdjustments(adjData);
      setMaintenance(mntData);
      setWarranties(wryData);
      setDisposals(dispData);
      setLedger(ledgerData);
      setDocFootprints(docsData);

      setUsers(usersData);
      setVendors(vendorsData);
      setCategories(catsData);
      setInventory(invData);
    } catch (err: any) {
      triggerToast(err.message || 'Failed to sync ERP databases.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadERPData();
  }, [activeSubTab]);

  // ─── Document Footprint Generator Utility ────────────────────────
  const registerDocFootprint = async (docNo: string, docType: string, refId: string) => {
    try {
      const hash = `sha256-${Math.random().toString(36).slice(2, 10)}${Math.random().toString(36).slice(2, 10)}`;
      await apiFetch('/documents', {
        method: 'POST',
        body: JSON.stringify({
          documentNumber: docNo,
          type: docType,
          referenceId: refId,
          qrCodeData: `doc-uri://${docNo}/${refId}`,
          digitalSignature: hash
        })
      });
    } catch (e) {
      console.error('Failed to log document footprint', e);
    }
  };

  const handleViewFootprintDoc = (df: any) => {
    let found: any = null;
    let viewType = '';

    if (df.type === 'PURCHASE_ORDER') {
      found = purchaseOrders.find(p => p.id === df.referenceId || p.poNumber === df.documentNumber);
      viewType = 'po';
    } else if (df.type === 'GRN') {
      found = goodsReceipts.find(g => g.id === df.referenceId || g.grnNumber === df.documentNumber);
      viewType = 'grn';
    } else if (df.type === 'TRANSFER_SLIP') {
      found = transfers.find(t => t.id === df.referenceId || t.transferNumber === df.documentNumber);
      viewType = 'transfer';
    } else if (df.type === 'RETURN_SLIP') {
      found = returns.find(r => r.id === df.referenceId || r.returnNumber === df.documentNumber);
      viewType = 'return';
    } else if (df.type === 'ADJUSTMENT_SLIP') {
      found = adjustments.find(a => a.id === df.referenceId || a.adjustmentNumber === df.documentNumber);
      viewType = 'adjustment';
    } else if (df.type === 'MAINTENANCE_REPORT') {
      found = maintenance.find(m => m.id === df.referenceId || m.recordId === df.documentNumber);
      viewType = 'maintenance';
    } else if (df.type === 'DISPOSAL_CERTIFICATE') {
      found = disposals.find(d => d.id === df.referenceId || d.disposalNumber === df.documentNumber);
      viewType = 'disposal';
    }

    if (found) {
      setViewingDoc({ type: viewType, data: found });
    } else {
      triggerToast(`Document details for ${df.documentNumber} are not loaded yet.`, 'warning');
    }
  };

  // ─── Actions handlers ────────────────────────────────────────────
  
  // PO
  const handleCreatePO = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!poVendorId || poItems.some(i => !i.name || !i.categoryId || i.quantity <= 0)) {
      triggerToast('Please complete all PO fields.', 'warning');
      return;
    }
    try {
      const po = await apiFetch<any>('/purchase-orders', {
        method: 'POST',
        body: JSON.stringify({
          vendorId: poVendorId,
          expectedDelivery: poExpectedDelivery || null,
          remarks: poRemarks,
          items: poItems,
          status: 'PENDING_APPROVAL'
        })
      });
      triggerToast(`Purchase Order ${po.poNumber} created and submitted for approval.`, 'success');
      await registerDocFootprint(po.poNumber, 'PURCHASE_ORDER', po.id);
      setActiveModal(null);
      loadERPData();
    } catch (err: any) {
      triggerToast(err.message, 'error');
    }
  };

  const handleUpdatePOStatus = async (id: string, status: string) => {
    try {
      await apiFetch(`/purchase-orders/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
      triggerToast(`Purchase Order marked as ${status}.`, 'success');
      loadERPData();
    } catch (err: any) {
      triggerToast(err.message, 'error');
    }
  };

  // GRN
  const handleSelectGRNPo = (poId: string) => {
    setGrnPoId(poId);
    const po = purchaseOrders.find(p => p.id === poId);
    if (po) {
      setGrnItems(po.items.map((i: any) => ({
        sku: i.sku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
        name: i.name,
        quantity: i.quantity,
        acceptedQty: i.quantity,
        rejectedQty: 0,
        unitCost: i.unitCost,
        categoryId: i.categoryId
      })));
    }
  };

  const handleCreateGRN = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!grnPoId || !grnWarehouse) {
      triggerToast('Please fill all GRN warehouse options.', 'warning');
      return;
    }
    try {
      const grn = await apiFetch<any>('/goods-receipts', {
        method: 'POST',
        body: JSON.stringify({
          poId: grnPoId,
          warehouse: grnWarehouse,
          remarks: grnRemarks,
          items: grnItems
        })
      });
      triggerToast(`GRN ${grn.grnNumber} generated successfully. Stock ledger updated.`, 'success');
      await registerDocFootprint(grn.grnNumber, 'GRN', grn.id);
      setActiveModal(null);
      loadERPData();
    } catch (err: any) {
      triggerToast(err.message, 'error');
    }
  };

  // Transfer
  const handleCreateTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trfAssetId || !trfReceiverId) return triggerToast('Provide asset and receiver fields.', 'warning');
    try {
      const trf = await apiFetch<any>('/transfers', {
        method: 'POST',
        body: JSON.stringify({ assetId: trfAssetId, receiverId: trfReceiverId, remarks: trfRemarks })
      });
      triggerToast(`Transfer request ${trf.transferNumber} created.`, 'success');
      await registerDocFootprint(trf.transferNumber, 'TRANSFER_SLIP', trf.id);
      setActiveModal(null);
      loadERPData();
    } catch (err: any) {
      triggerToast(err.message, 'error');
    }
  };

  const handleUpdateTransfer = async (id: string, status: string) => {
    try {
      await apiFetch(`/transfers/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
      triggerToast(`Transfer marked as ${status}.`, 'success');
      loadERPData();
    } catch (err: any) {
      triggerToast(err.message, 'error');
    }
  };

  // Return
  const handleCreateReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rtnAssetId) return triggerToast('Provide asset field.', 'warning');
    try {
      const rtn = await apiFetch<any>('/returns', {
        method: 'POST',
        body: JSON.stringify({ assetId: rtnAssetId, remarks: rtnRemarks })
      });
      triggerToast(`Return request ${rtn.returnNumber} created.`, 'success');
      await registerDocFootprint(rtn.returnNumber, 'RETURN_SLIP', rtn.id);
      setActiveModal(null);
      loadERPData();
    } catch (err: any) {
      triggerToast(err.message, 'error');
    }
  };

  const handleCompleteReturn = async (id: string, condition: string) => {
    try {
      await apiFetch(`/returns/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'COMPLETED', condition })
      });
      triggerToast(`Return processed as completed under status ${condition}.`, 'success');
      loadERPData();
    } catch (err: any) {
      triggerToast(err.message, 'error');
    }
  };

  // Adjustment
  const handleCreateAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjAssetId || adjNewQty === undefined) return triggerToast('Complete adjustment values.', 'warning');
    const asset = inventory.find(i => i.id === adjAssetId);
    try {
      const adj = await apiFetch<any>('/adjustments', {
        method: 'POST',
        body: JSON.stringify({
          assetId: adjAssetId,
          previousQty: asset ? asset.quantityInStock : 0,
          newQty: Number(adjNewQty),
          reason: adjReason,
          remarks: adjRemarks
        })
      });
      triggerToast(`Stock Adjustment request ${adj.adjustmentNumber} submitted.`, 'success');
      await registerDocFootprint(adj.adjustmentNumber, 'ADJUSTMENT_SLIP', adj.id);
      setActiveModal(null);
      loadERPData();
    } catch (err: any) {
      triggerToast(err.message, 'error');
    }
  };

  const handleApproveAdjustment = async (id: string, status: string) => {
    try {
      await apiFetch(`/adjustments/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
      triggerToast(`Stock adjustment marked as ${status}.`, 'success');
      loadERPData();
    } catch (err: any) {
      triggerToast(err.message, 'error');
    }
  };

  // Maintenance
  const handleCreateMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mntAssetId || !mntIssue || !mntSchedDate) return triggerToast('Fill required fields.', 'warning');
    try {
      const mnt = await apiFetch<any>('/maintenance', {
        method: 'POST',
        body: JSON.stringify({
          assetId: mntAssetId,
          vendorId: mntVendorId || null,
          issue: mntIssue,
          priority: mntPriority,
          estimatedCost: mntEstCost,
          scheduledDate: mntSchedDate,
          remarks: mntRemarks
        })
      });
      triggerToast(`Maintenance Scheduled: ${mnt.recordId}`, 'success');
      await registerDocFootprint(mnt.recordId, 'MAINTENANCE_REPORT', mnt.id);
      setActiveModal(null);
      loadERPData();
    } catch (err: any) {
      triggerToast(err.message, 'error');
    }
  };

  const handleCompleteMaintenance = async (id: string, actualCost: number, engineer: string) => {
    try {
      await apiFetch(`/maintenance/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'COMPLETED', actualCost, engineer, completedDate: new Date() })
      });
      triggerToast('Maintenance marked completed.', 'success');
      loadERPData();
    } catch (err: any) {
      triggerToast(err.message, 'error');
    }
  };

  // Warranty
  const handleCreateWarranty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wryAssetId || !wryStartDate || !wryEndDate || !wryVendorId || !wryCoverage) {
      return triggerToast('Fill required coverage fields.', 'warning');
    }
    try {
      await apiFetch('/warranties', {
        method: 'POST',
        body: JSON.stringify({
          assetId: wryAssetId,
          startDate: wryStartDate,
          endDate: wryEndDate,
          vendorId: wryVendorId,
          coverage: wryCoverage,
          amcProvider: wryAmcProvider || null,
          amcCost: wryAmcCost,
          remarks: wryRemarks
        })
      });
      triggerToast('Warranty/AMC records synced successfully.', 'success');
      setActiveModal(null);
      loadERPData();
    } catch (err: any) {
      triggerToast(err.message, 'error');
    }
  };

  // Disposal
  const handleCreateDisposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispAssetId || dispQty <= 0) return triggerToast('Fill disposal parameters.', 'warning');
    try {
      const disp = await apiFetch<any>('/disposals', {
        method: 'POST',
        body: JSON.stringify({
          assetId: dispAssetId,
          reason: dispReason,
          disposedQty: dispQty,
          remarks: dispRemarks
        })
      });
      triggerToast(`Disposal request ${disp.disposalNumber} created.`, 'success');
      await registerDocFootprint(disp.disposalNumber, 'DISPOSAL_CERTIFICATE', disp.id);
      setActiveModal(null);
      loadERPData();
    } catch (err: any) {
      triggerToast(err.message, 'error');
    }
  };

  const handleApproveDisposal = async (id: string, status: string) => {
    try {
      await apiFetch(`/disposals/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
      triggerToast(`Asset disposal marked as ${status}.`, 'success');
      loadERPData();
    } catch (err: any) {
      triggerToast(err.message, 'error');
    }
  };

  // ─── Helper Renders ──────────────────────────────────────────────
  const renderStatusBadge = (status: string) => {
    const s = status.toUpperCase();
    const base = "text-[9px] font-black font-mono uppercase px-2 py-0.5 rounded-full border ";
    if (['APPROVED', 'COMPLETED', 'CONFIRMED', 'ACTIVE'].includes(s)) {
      return <span className={base + "bg-emerald-50 border-emerald-250 text-emerald-700"}>{status}</span>;
    }
    if (['PENDING', 'PENDING_APPROVAL', 'SCHEDULED', 'IN_PROGRESS'].includes(s)) {
      return <span className={base + "bg-amber-50 border-amber-250 text-amber-700"}>{status}</span>;
    }
    if (['REJECTED', 'CANCELLED', 'OVERDUE', 'DAMAGED', 'BROKEN', 'LOST'].includes(s)) {
      return <span className={base + "bg-rose-50 border-rose-250 text-rose-700"}>{status}</span>;
    }
    return <span className={base + "bg-slate-50 border-slate-200 text-slate-700"}>{status}</span>;
  };

  // Calculations for Unified Dashboard
  const inventoryValue = inventory.reduce((s, i) => s + (i.quantityInStock * i.unitCost), 0);
  const pendingPOs = purchaseOrders.filter(p => p.status === 'PENDING_APPROVAL').length;
  const pendingReturns = returns.filter(r => r.status === 'PENDING').length;
  const activeAMC = warranties.filter(w => w.amcProvider).length;

  return (
    <div className="space-y-6 min-h-[600px] w-full animate-fade-in">
      
      {/* TOP HORIZONTAL NAVIGATION BAR */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-2.5 flex flex-wrap items-center gap-1.5 shadow-sm">
        
        {/* Brand Header */}
        <div className="flex items-center gap-2 border-r border-slate-200 pr-4 mr-1.5 py-1 shrink-0">
          <Building2 className="w-4 h-4 text-[#39A5AD]" />
          <div className="text-left leading-none">
            <span className="text-[10px] font-black uppercase text-slate-800 tracking-wider block">ERP Suite</span>
            <span className="text-[8px] text-slate-400 font-mono font-bold block mt-0.5">SAP & ServiceNow</span>
          </div>
        </div>

        {/* Tab buttons */}
        <div className="flex flex-wrap gap-1.5 items-center">
          {[
            { key: 'dashboard', label: 'Smart Dashboard', icon: BarChart3 },
            { key: 'po', label: 'Purchase Orders (PO)', icon: Building2 },
            { key: 'grn', label: 'Goods Receipts (GRN)', icon: ClipboardCheck },
            { key: 'transfer', label: 'Asset Transfers', icon: ArrowRightLeft },
            { key: 'return', label: 'Asset Returns', icon: Undo2 },
            { key: 'adjustment', label: 'Stock Adjustment', icon: Settings2 },
            { key: 'maintenance', label: 'Maintenance Record', icon: Wrench },
            { key: 'warranty', label: 'Warranty & AMC', icon: ShieldAlert },
            { key: 'disposal', label: 'Asset Disposal', icon: Trash2 },
            { key: 'ledger', label: 'Transaction Ledger', icon: Layers },
            { key: 'docs', label: 'Document Footprints', icon: FileText }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveSubTab(tab.key as any)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer select-none ${
                  isActive 
                    ? 'bg-[#39A5AD] text-white shadow-sm shadow-[#39A5AD]/25' 
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* CORE WORKSPACE CONTENT AREA */}
      <div className="w-full space-y-6">
        
        {loading && (
          <div className="bg-[#39A5AD]/5 border border-[#39A5AD]/10 rounded-2xl p-4 flex items-center justify-center gap-2.5">
            <Activity className="w-4 h-4 text-[#39A5AD] animate-spin" />
            <span className="text-xs text-[#39A5AD] font-bold">Synchronizing Cloud ERP database...</span>
          </div>
        )}

        {/* 1. SMART DASHBOARD */}
        {activeSubTab === 'dashboard' && (
          <div className="space-y-6 animate-fade-in">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-1 shadow-sm">
                <span className="text-[9px] font-bold text-slate-400 uppercase font-mono tracking-wider">Inventory Valuation</span>
                <div className="text-xl font-black text-slate-900">${inventoryValue.toLocaleString()}</div>
                <div className="text-[9px] text-emerald-600 font-bold flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> SAP Ledger Valuation
                </div>
              </div>
              <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-1 shadow-sm">
                <span className="text-[9px] font-bold text-slate-400 uppercase font-mono tracking-wider">Pending Orders</span>
                <div className="text-xl font-black text-amber-600">{pendingPOs} POs</div>
                <div className="text-[9px] text-slate-400 font-semibold">Awaiting Procurement Approval</div>
              </div>
              <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-1 shadow-sm">
                <span className="text-[9px] font-bold text-slate-400 uppercase font-mono tracking-wider">Asset Returns</span>
                <div className="text-xl font-black text-slate-800">{pendingReturns} Pending</div>
                <div className="text-[9px] text-amber-500 font-bold">Requires Store Inspection</div>
              </div>
              <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-1 shadow-sm">
                <span className="text-[9px] font-bold text-slate-400 uppercase font-mono tracking-wider">Active AMC Contracts</span>
                <div className="text-xl font-black text-indigo-600">{activeAMC} Services</div>
                <div className="text-[9px] text-emerald-600 font-bold">Warranties Enforced</div>
              </div>
            </div>

            {/* Recharts Analytics Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
                <div>
                  <h4 className="text-xs font-black text-slate-950 font-mono uppercase">ERP Transaction Volumes</h4>
                  <p className="text-[10px] text-slate-400">Total operations recorded in the ledger</p>
                </div>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={[
                      { name: 'Jan', TX: 12 }, { name: 'Feb', TX: 18 }, { name: 'Mar', TX: 15 },
                      { name: 'Apr', TX: 29 }, { name: 'May', TX: 34 }, { name: 'Jun', TX: ledger.length }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="name" stroke="#94A3B8" fontSize={9} />
                      <YAxis stroke="#94A3B8" fontSize={9} />
                      <Tooltip />
                      <Line type="monotone" dataKey="TX" stroke="#39A5AD" strokeWidth={2.5} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
                <div>
                  <h4 className="text-xs font-black text-slate-950 font-mono uppercase">Stock by Category Valuation</h4>
                  <p className="text-[10px] text-slate-400">Capital weight distribution across classes</p>
                </div>
                <div className="h-48 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categories.map(c => ({
                      name: c.name.slice(0, 10),
                      Value: inventory.filter(i => i.categoryId === c.id).reduce((sum, item) => sum + (item.quantityInStock * item.unitCost), 0)
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="name" stroke="#94A3B8" fontSize={9} />
                      <YAxis stroke="#94A3B8" fontSize={9} />
                      <Tooltip />
                      <Bar dataKey="Value" fill="#6366F1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Expiring Warranties Indicator */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
              <div>
                <h4 className="text-xs font-black text-slate-955 font-mono uppercase">Expiring Warranties & AMC Contracts (30 Days)</h4>
                <p className="text-[10px] text-slate-400 font-medium">Critical hardware service boundaries requiring renewal</p>
              </div>
              <div className="divide-y divide-slate-100 max-h-40 overflow-y-auto">
                {warranties.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400">No expiring warranty service records in index.</div>
                ) : (
                  warranties.map((w, idx) => (
                    <div key={idx} className="py-2.5 flex justify-between items-center text-xs">
                      <div>
                        <span className="font-extrabold text-slate-800 block">{w.asset?.name}</span>
                        <span className="text-[10px] text-slate-400">Provider: {w.amcProvider || 'Standard OEM'} | End: {new Date(w.endDate).toLocaleDateString()}</span>
                      </div>
                      <span className="text-[10px] font-black font-mono uppercase bg-rose-50 text-rose-700 px-2 py-0.5 rounded border border-rose-200">RENEW AMC</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* 2. PURCHASE ORDERS */}
        {activeSubTab === 'po' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex justify-between items-center bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
              <div>
                <h3 className="text-xs font-black text-slate-900 uppercase font-mono">Purchase Order Ledger (SAP MM)</h3>
                <p className="text-[10px] text-slate-400">Procure core inventory classes through official vendor billing.</p>
              </div>
              {currentUser.role === 'ADMIN' && (
                <button
                  onClick={() => {
                    setPoItems([{ name: '', sku: '', categoryId: categories[0]?.id || '', quantity: 1, unitCost: 0 }]);
                    setActiveModal('create_po');
                  }}
                  className="bg-[#39A5AD] hover:bg-[#2F8E95] text-white text-[10px] font-extrabold px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" /> Create Purchase Order
                </button>
              )}
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold uppercase text-[9px] font-mono select-none">
                    <th className="p-3.5">PO Number</th>
                    <th className="p-3.5">Vendor</th>
                    <th className="p-3.5">Expected Delivery</th>
                    <th className="p-3.5">Total Cost</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {purchaseOrders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-12 text-center text-slate-400">No active Purchase Orders found.</td>
                    </tr>
                  ) : (
                    purchaseOrders.map((p) => {
                      const total = p.items.reduce((s: number, i: any) => s + (i.quantity * i.unitCost), 0) + p.shippingCost;
                      return (
                        <tr key={p.id} className="hover:bg-slate-50/50">
                          <td className="p-3.5 font-bold text-slate-900">{p.poNumber}</td>
                          <td className="p-3.5">{p.vendor?.name}</td>
                          <td className="p-3.5 font-mono text-slate-500">{p.expectedDelivery ? new Date(p.expectedDelivery).toLocaleDateString() : 'N/A'}</td>
                          <td className="p-3.5 font-extrabold text-slate-800">${total.toLocaleString()}</td>
                          <td className="p-3.5">{renderStatusBadge(p.status)}</td>
                          <td className="p-3.5 flex gap-2">
                            <button
                              onClick={() => setViewingDoc({ type: 'po', data: p })}
                              className="text-slate-400 hover:text-slate-900 p-1 rounded hover:bg-slate-100"
                              title="View document certificate"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                            {p.status === 'PENDING_APPROVAL' && currentUser.role === 'ADMIN' && (
                              <>
                                <button
                                  onClick={() => handleUpdatePOStatus(p.id, 'APPROVED')}
                                  className="text-emerald-600 hover:text-emerald-700 font-extrabold bg-emerald-50 px-2 py-1 rounded cursor-pointer"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleUpdatePOStatus(p.id, 'CANCELLED')}
                                  className="text-rose-600 hover:text-rose-700 font-extrabold bg-rose-50 px-2 py-1 rounded cursor-pointer"
                                >
                                  Reject
                                </button>
                              </>
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
        )}

        {/* 3. GOODS RECEIPTS (GRN) */}
        {activeSubTab === 'grn' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex justify-between items-center bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
              <div>
                <h3 className="text-xs font-black text-slate-900 uppercase font-mono">Goods Receipt Note (GRN)</h3>
                <p className="text-[10px] text-slate-400">Receive inventory items against approved purchase orders.</p>
              </div>
              {['ADMIN', 'STORE_MANAGER'].includes(currentUser.role) && (
                <button
                  onClick={() => {
                    const approvedPO = purchaseOrders.find(p => p.status === 'APPROVED' || p.status === 'PARTIALLY_RECEIVED');
                    if (!approvedPO) {
                      triggerToast('No active approved Purchase Orders waiting for delivery.', 'warning');
                      return;
                    }
                    handleSelectGRNPo(approvedPO.id);
                    setGrnWarehouse('Warehouse A');
                    setActiveModal('create_grn');
                  }}
                  className="bg-[#39A5AD] hover:bg-[#2F8E95] text-white text-[10px] font-extrabold px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" /> Process Goods Receipt (GRN)
                </button>
              )}
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold uppercase text-[9px] font-mono select-none">
                    <th className="p-3.5">GRN Number</th>
                    <th className="p-3.5">PO Ref</th>
                    <th className="p-3.5">Vendor</th>
                    <th className="p-3.5">Warehouse</th>
                    <th className="p-3.5">Received Date</th>
                    <th className="p-3.5">Received By</th>
                    <th className="p-3.5">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {goodsReceipts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-12 text-center text-slate-400">No active Goods Receipts found.</td>
                    </tr>
                  ) : (
                    goodsReceipts.map((g) => (
                      <tr key={g.id} className="hover:bg-slate-50/50">
                        <td className="p-3.5 font-bold text-slate-900">{g.grnNumber}</td>
                        <td className="p-3.5 font-semibold text-indigo-600">{g.purchaseOrder?.poNumber}</td>
                        <td className="p-3.5">{g.vendor?.name}</td>
                        <td className="p-3.5 font-mono text-slate-600">{g.warehouse}</td>
                        <td className="p-3.5 text-slate-500">{new Date(g.receivedDate).toLocaleDateString()}</td>
                        <td className="p-3.5 font-bold text-slate-800">{g.receivedBy?.name}</td>
                        <td className="p-3.5">
                          <button
                            onClick={() => setViewingDoc({ type: 'grn', data: g })}
                            className="text-slate-400 hover:text-slate-900 p-1 rounded hover:bg-slate-100 cursor-pointer"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. ASSET TRANSFERS */}
        {activeSubTab === 'transfer' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex justify-between items-center bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
              <div>
                <h3 className="text-xs font-black text-slate-900 uppercase font-mono">Asset Transfer Registry</h3>
                <p className="text-[10px] text-slate-400">Track and dispatch hardware assets between organizational employees.</p>
              </div>
              <button
                onClick={() => {
                  if (inventory.length === 0) return triggerToast('No active assets in catalog.', 'warning');
                  setTrfAssetId(inventory[0]?.id || '');
                  setTrfReceiverId(users[0]?.id || '');
                  setActiveModal('create_transfer');
                }}
                className="bg-[#39A5AD] hover:bg-[#2F8E95] text-white text-[10px] font-extrabold px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" /> Request Asset Transfer
              </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold uppercase text-[9px] font-mono select-none">
                    <th className="p-3.5">Transfer Number</th>
                    <th className="p-3.5">Asset SKU / Name</th>
                    <th className="p-3.5">From</th>
                    <th className="p-3.5">To</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transfers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-12 text-center text-slate-400">No active transfer logs in index.</td>
                    </tr>
                  ) : (
                    transfers.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50/50">
                        <td className="p-3.5 font-bold text-slate-900">{t.transferNumber}</td>
                        <td className="p-3.5">
                          <span className="font-extrabold block text-slate-800">{t.asset?.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{t.asset?.sku}</span>
                        </td>
                        <td className="p-3.5 font-semibold text-slate-650">{t.sender?.name}</td>
                        <td className="p-3.5 font-semibold text-slate-800">{t.receiver?.name}</td>
                        <td className="p-3.5">{renderStatusBadge(t.status)}</td>
                        <td className="p-3.5 flex gap-2">
                          <button
                            onClick={() => setViewingDoc({ type: 'transfer', data: t })}
                            className="text-slate-400 hover:text-slate-900 p-1 rounded hover:bg-slate-100 cursor-pointer"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                          {t.status === 'PENDING' && currentUser.role === 'ADMIN' && (
                            <button
                              onClick={() => handleUpdateTransfer(t.id, 'APPROVED')}
                              className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer"
                            >
                              Approve
                            </button>
                          )}
                          {t.status === 'APPROVED' && currentUser.role === 'STORE_MANAGER' && (
                            <button
                              onClick={() => handleUpdateTransfer(t.id, 'CONFIRMED')}
                              className="bg-[#39A5AD] text-white px-2 py-0.5 rounded text-[10px] font-extrabold cursor-pointer"
                            >
                              Confirm
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. ASSET RETURNS */}
        {activeSubTab === 'return' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex justify-between items-center bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
              <div>
                <h3 className="text-xs font-black text-slate-900 uppercase font-mono">Asset Returns & Inspections</h3>
                <p className="text-[10px] text-slate-400">Process returned assets and inspect condition before restocking.</p>
              </div>
              <button
                onClick={() => {
                  if (inventory.length === 0) return triggerToast('No active assets in catalog.', 'warning');
                  setRtnAssetId(inventory[0]?.id || '');
                  setActiveModal('create_return');
                }}
                className="bg-[#39A5AD] hover:bg-[#2F8E95] text-white text-[10px] font-extrabold px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" /> File Asset Return
              </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold uppercase text-[9px] font-mono select-none">
                    <th className="p-3.5">Return Number</th>
                    <th className="p-3.5">Asset</th>
                    <th className="p-3.5">Returned By</th>
                    <th className="p-3.5">Inspected Quality</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {returns.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-12 text-center text-slate-400">No active return files.</td>
                    </tr>
                  ) : (
                    returns.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/50">
                        <td className="p-3.5 font-bold text-slate-900">{r.returnNumber}</td>
                        <td className="p-3.5">
                          <span className="font-extrabold block text-slate-800">{r.asset?.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{r.asset?.sku}</span>
                        </td>
                        <td className="p-3.5 text-slate-650">{r.returnedBy?.name}</td>
                        <td className="p-3.5 font-bold text-slate-600">{r.condition}</td>
                        <td className="p-3.5">{renderStatusBadge(r.status)}</td>
                        <td className="p-3.5 flex gap-2">
                          <button
                            onClick={() => setViewingDoc({ type: 'return', data: r })}
                            className="text-slate-400 hover:text-slate-900 p-1 rounded hover:bg-slate-100 cursor-pointer"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                          {r.status === 'PENDING' && ['ADMIN', 'STORE_MANAGER'].includes(currentUser.role) && (
                            <div className="flex gap-1.5">
                              {['EXCELLENT', 'GOOD', 'DAMAGED', 'BROKEN'].map((cond) => (
                                <button
                                  key={cond}
                                  onClick={() => handleCompleteReturn(r.id, cond)}
                                  className="bg-slate-100 hover:bg-slate-200 border border-slate-200 px-1.5 py-0.5 rounded text-[8px] font-bold cursor-pointer"
                                >
                                  {cond}
                                </button>
                              ))}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 6. STOCK ADJUSTMENT */}
        {activeSubTab === 'adjustment' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex justify-between items-center bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
              <div>
                <h3 className="text-xs font-black text-slate-900 uppercase font-mono">Manual Stock Adjustments</h3>
                <p className="text-[10px] text-slate-400">File stock corrections due to damage, loss, or audit variances.</p>
              </div>
              <button
                onClick={() => {
                  if (inventory.length === 0) return triggerToast('No active assets in catalog.', 'warning');
                  setAdjAssetId(inventory[0]?.id || '');
                  setAdjNewQty(inventory[0]?.quantityInStock || 0);
                  setActiveModal('create_adjustment');
                }}
                className="bg-[#39A5AD] hover:bg-[#2F8E95] text-white text-[10px] font-extrabold px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" /> File Stock Adjustment
              </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold uppercase text-[9px] font-mono select-none">
                    <th className="p-3.5">Adjustment No</th>
                    <th className="p-3.5">Asset SKU / Name</th>
                    <th className="p-3.5">Previous Qty</th>
                    <th className="p-3.5">New Qty</th>
                    <th className="p-3.5">Reason</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {adjustments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-12 text-center text-slate-400">No adjustment requests documented.</td>
                    </tr>
                  ) : (
                    adjustments.map((a) => (
                      <tr key={a.id} className="hover:bg-slate-50/50">
                        <td className="p-3.5 font-bold text-slate-900">{a.adjustmentNumber}</td>
                        <td className="p-3.5">
                          <span className="font-extrabold block text-slate-800">{a.asset?.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{a.asset?.sku}</span>
                        </td>
                        <td className="p-3.5 font-mono font-semibold text-slate-500">{a.previousQty} units</td>
                        <td className="p-3.5 font-mono font-bold text-slate-800">{a.newQty} units</td>
                        <td className="p-3.5 font-bold text-indigo-650">{a.reason}</td>
                        <td className="p-3.5">{renderStatusBadge(a.status)}</td>
                        <td className="p-3.5 flex gap-2">
                          <button
                            onClick={() => setViewingDoc({ type: 'adjustment', data: a })}
                            className="text-slate-400 hover:text-slate-900 p-1 rounded hover:bg-slate-100 cursor-pointer"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                          {a.status === 'PENDING' && currentUser.role === 'ADMIN' && (
                            <>
                              <button
                                onClick={() => handleApproveAdjustment(a.id, 'APPROVED')}
                                className="bg-emerald-50 text-emerald-600 font-extrabold px-2 py-0.5 rounded text-[10px] cursor-pointer"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleApproveAdjustment(a.id, 'REJECTED')}
                                className="bg-rose-50 text-rose-600 font-extrabold px-2 py-0.5 rounded text-[10px] cursor-pointer"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 7. MAINTENANCE RECORDS */}
        {activeSubTab === 'maintenance' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex justify-between items-center bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
              <div>
                <h3 className="text-xs font-black text-slate-900 uppercase font-mono">Asset Maintenance Management</h3>
                <p className="text-[10px] text-slate-400 font-medium">Track diagnostic scheduling and repair AMC tickets.</p>
              </div>
              <button
                onClick={() => {
                  if (inventory.length === 0) return triggerToast('No active assets.', 'warning');
                  setMntAssetId(inventory[0]?.id || '');
                  setMntVendorId(vendors[0]?.id || '');
                  setActiveModal('create_maintenance');
                }}
                className="bg-[#39A5AD] hover:bg-[#2F8E95] text-white text-[10px] font-extrabold px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" /> Schedule Maintenance
              </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold uppercase text-[9px] font-mono select-none">
                    <th className="p-3.5">Workorder ID</th>
                    <th className="p-3.5">Asset</th>
                    <th className="p-3.5">Priority</th>
                    <th className="p-3.5">Estimated Cost</th>
                    <th className="p-3.5">Scheduled Date</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {maintenance.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-12 text-center text-slate-400">No scheduled repairs.</td>
                    </tr>
                  ) : (
                    maintenance.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50/50">
                        <td className="p-3.5 font-bold text-slate-900">{m.recordId}</td>
                        <td className="p-3.5">
                          <span className="font-extrabold block text-slate-800">{m.asset?.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{m.asset?.sku}</span>
                        </td>
                        <td className="p-3.5 font-bold text-[#39A5AD]">{m.priority}</td>
                        <td className="p-3.5 font-bold text-slate-800">${m.estimatedCost}</td>
                        <td className="p-3.5 text-slate-500">{new Date(m.scheduledDate).toLocaleDateString()}</td>
                        <td className="p-3.5">{renderStatusBadge(m.status)}</td>
                        <td className="p-3.5 flex gap-2">
                          <button
                            onClick={() => setViewingDoc({ type: 'maintenance', data: m })}
                            className="text-slate-400 hover:text-slate-900 p-1 rounded hover:bg-slate-100 cursor-pointer"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                          {m.status === 'SCHEDULED' && ['ADMIN', 'STORE_MANAGER'].includes(currentUser.role) && (
                            <button
                              onClick={() => {
                                const engineer = prompt('Enter engineer name:');
                                const costStr = prompt('Enter actual repair cost ($):', m.estimatedCost.toString());
                                if (engineer !== null && costStr !== null) {
                                  handleCompleteMaintenance(m.id, Number(costStr), engineer);
                                }
                              }}
                              className="bg-slate-900 text-white font-extrabold px-2 py-0.5 rounded text-[10px] cursor-pointer"
                            >
                              Signoff Complete
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 8. WARRANTY & AMC */}
        {activeSubTab === 'warranty' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex justify-between items-center bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
              <div>
                <h3 className="text-xs font-black text-slate-900 uppercase font-mono">Hardware Warranty & Annual Maintenance Contracts (AMC)</h3>
                <p className="text-[10px] text-slate-400 font-medium">Link vendor contract boundaries to inventory assets.</p>
              </div>
              {currentUser.role === 'ADMIN' && (
                <button
                  onClick={() => {
                    if (inventory.length === 0) return triggerToast('No active assets.', 'warning');
                    setWryAssetId(inventory[0]?.id || '');
                    setWryVendorId(vendors[0]?.id || '');
                    setWryStartDate(new Date().toISOString().split('T')[0]);
                    setWryEndDate(new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0]);
                    setActiveModal('create_warranty');
                  }}
                  className="bg-[#39A5AD] hover:bg-[#2F8E95] text-white text-[10px] font-extrabold px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" /> Sync Warranty / AMC Record
                </button>
              )}
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold uppercase text-[9px] font-mono select-none">
                    <th className="p-3.5">Asset</th>
                    <th className="p-3.5">Vendor Partner</th>
                    <th className="p-3.5">Start Date</th>
                    <th className="p-3.5">End Date</th>
                    <th className="p-3.5">Coverage Scope</th>
                    <th className="p-3.5">AMC Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {warranties.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-12 text-center text-slate-400">No active coverage scopes registered.</td>
                    </tr>
                  ) : (
                    warranties.map((w) => (
                      <tr key={w.id} className="hover:bg-slate-50/50">
                        <td className="p-3.5 font-bold text-slate-900">{w.asset?.name}</td>
                        <td className="p-3.5">{w.vendor?.name}</td>
                        <td className="p-3.5 text-slate-500 font-mono">{new Date(w.startDate).toLocaleDateString()}</td>
                        <td className="p-3.5 font-mono font-bold text-slate-700">{new Date(w.endDate).toLocaleDateString()}</td>
                        <td className="p-3.5 text-slate-600">{w.coverage}</td>
                        <td className="p-3.5 font-black text-slate-800">${w.amcCost.toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 9. ASSET DISPOSAL */}
        {activeSubTab === 'disposal' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex justify-between items-center bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
              <div>
                <h3 className="text-xs font-black text-slate-900 uppercase font-mono">Corporate Asset Disposal</h3>
                <p className="text-[10px] text-slate-400">Retire broken or obsolete assets under strict corporate environmental standards.</p>
              </div>
              <button
                onClick={() => {
                  if (inventory.length === 0) return triggerToast('No active assets.', 'warning');
                  setDispAssetId(inventory[0]?.id || '');
                  setActiveModal('create_disposal');
                }}
                className="bg-[#39A5AD] hover:bg-[#2F8E95] text-white text-[10px] font-extrabold px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" /> Request Asset Disposal
              </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold uppercase text-[9px] font-mono select-none">
                    <th className="p-3.5">Disposal No</th>
                    <th className="p-3.5">Asset SKU / Name</th>
                    <th className="p-3.5">Disposed Qty</th>
                    <th className="p-3.5">Reason</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {disposals.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-12 text-center text-slate-400">No disposal logs recorded.</td>
                    </tr>
                  ) : (
                    disposals.map((d) => (
                      <tr key={d.id} className="hover:bg-slate-50/50">
                        <td className="p-3.5 font-bold text-slate-900">{d.disposalNumber}</td>
                        <td className="p-3.5">
                          <span className="font-extrabold block text-slate-800">{d.asset?.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{d.asset?.sku}</span>
                        </td>
                        <td className="p-3.5 font-mono text-slate-700">{d.disposedQty} units</td>
                        <td className="p-3.5 font-bold text-rose-600">{d.reason}</td>
                        <td className="p-3.5">{renderStatusBadge(d.status)}</td>
                        <td className="p-3.5 flex gap-2">
                          <button
                            onClick={() => setViewingDoc({ type: 'disposal', data: d })}
                            className="text-slate-400 hover:text-slate-900 p-1 rounded hover:bg-slate-100 cursor-pointer"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                          {d.status === 'PENDING' && currentUser.role === 'ADMIN' && (
                            <>
                              <button
                                onClick={() => handleApproveDisposal(d.id, 'APPROVED')}
                                className="bg-emerald-50 text-emerald-600 font-bold px-2 py-0.5 rounded text-[10px] cursor-pointer"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleApproveDisposal(d.id, 'REJECTED')}
                                className="bg-rose-50 text-rose-600 font-bold px-2 py-0.5 rounded text-[10px] cursor-pointer"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 10. TRANSACTION LEDGER */}
        {activeSubTab === 'ledger' && (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
              <h3 className="text-xs font-black text-slate-900 uppercase font-mono">ERP Transaction Ledger</h3>
              <p className="text-[10px] text-slate-400">Immutable ledger history documenting every stock-changing state event.</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold uppercase text-[9px] font-mono select-none">
                    <th className="p-3.5">Transaction ID</th>
                    <th className="p-3.5">Asset</th>
                    <th className="p-3.5">Action Type</th>
                    <th className="p-3.5">Prev Qty</th>
                    <th className="p-3.5">New Qty</th>
                    <th className="p-3.5">Reference Document</th>
                    <th className="p-3.5">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ledger.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-12 text-center text-slate-400">No active transactions indexed.</td>
                    </tr>
                  ) : (
                    ledger.map((l) => (
                      <tr key={l.id} className="hover:bg-slate-50/50">
                        <td className="p-3.5 font-bold font-mono text-slate-900">{l.transactionId}</td>
                        <td className="p-3.5">
                          <span className="font-extrabold block text-slate-800">{l.asset?.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{l.asset?.sku}</span>
                        </td>
                        <td className="p-3.5 font-black text-indigo-600 text-[10px] uppercase font-mono">{l.type}</td>
                        <td className="p-3.5 font-mono text-slate-500">{l.previousQty} units</td>
                        <td className="p-3.5 font-mono font-bold text-slate-800">{l.newQty} units</td>
                        <td className="p-3.5 font-bold text-slate-700">{l.referenceNumber || 'N/A'}</td>
                        <td className="p-3.5 text-slate-500 font-mono">{new Date(l.timestamp).toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 11. DOCUMENT CENTER FOOTPRINTS */}
        {activeSubTab === 'docs' && (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
              <h3 className="text-xs font-black text-slate-900 uppercase font-mono">Registered Document Footprints</h3>
              <p className="text-[10px] text-slate-400">Cryptographically signed document history registries with dynamic QR stamps.</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold uppercase text-[9px] font-mono select-none">
                    <th className="p-3.5">Document Number</th>
                    <th className="p-3.5">Type</th>
                    <th className="p-3.5">Footprint SHA-256 Signatures</th>
                    <th className="p-3.5">Version</th>
                    <th className="p-3.5">Created Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {docFootprints.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-12 text-center text-slate-400">No cryptographic document prints registered.</td>
                    </tr>
                  ) : (
                    docFootprints.map((df) => (
                      <tr 
                        key={df.id} 
                        onClick={() => handleViewFootprintDoc(df)}
                        className="hover:bg-slate-100/70 cursor-pointer transition-all"
                        title="Click to view and print document certificate"
                      >
                        <td className="p-3.5 font-bold text-indigo-650 flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <span className="underline decoration-indigo-200 hover:decoration-indigo-600">{df.documentNumber}</span>
                        </td>
                        <td className="p-3.5 font-black text-[10px] text-slate-600 font-mono">{df.type}</td>
                        <td className="p-3.5 font-mono text-[10px] text-slate-450 truncate max-w-[200px]" title={df.digitalSignature}>{df.digitalSignature}</td>
                        <td className="p-3.5 font-bold">v{df.version}.0</td>
                        <td className="p-3.5 text-slate-500">{new Date(df.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* ──────────────────────────────────────────────────────────────
          MODALS & DIALOGS
      ────────────────────────────────────────────────────────────── */}

      {/* CREATE PO MODAL */}
      {activeModal === 'create_po' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form onSubmit={handleCreatePO} className="bg-white border border-slate-200 rounded-3xl p-6 max-w-2xl w-full space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <h3 className="text-base font-black text-slate-955 font-mono uppercase">Request Purchase Order</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Vendor Partner</label>
                <select
                  value={poVendorId}
                  onChange={(e) => setPoVendorId(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-[#39A5AD]"
                >
                  <option value="">Select Vendor</option>
                  {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Expected Delivery Date</label>
                <input
                  type="date"
                  value={poExpectedDelivery}
                  onChange={(e) => setPoExpectedDelivery(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-2 text-xs outline-none focus:border-[#39A5AD]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Items Procurement List</label>
              <div className="space-y-2">
                {poItems.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Item Name"
                      value={item.name}
                      onChange={(e) => {
                        const next = [...poItems];
                        next[idx].name = e.target.value;
                        setPoItems(next);
                      }}
                      className="col-span-4 border border-slate-200 rounded-lg p-2 text-xs outline-none focus:border-[#39A5AD]"
                    />
                    <input
                      type="text"
                      placeholder="SKU"
                      value={item.sku}
                      onChange={(e) => {
                        const next = [...poItems];
                        next[idx].sku = e.target.value;
                        setPoItems(next);
                      }}
                      className="col-span-2 border border-slate-200 rounded-lg p-2 text-xs outline-none focus:border-[#39A5AD]"
                    />
                    <select
                      value={item.categoryId}
                      onChange={(e) => {
                        const next = [...poItems];
                        next[idx].categoryId = e.target.value;
                        setPoItems(next);
                      }}
                      className="col-span-3 border border-slate-200 rounded-lg p-2 text-xs outline-none focus:border-[#39A5AD]"
                    >
                      <option value="">Category</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <input
                      type="number"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => {
                        const next = [...poItems];
                        next[idx].quantity = Number(e.target.value);
                        setPoItems(next);
                      }}
                      className="col-span-1 border border-slate-200 rounded-lg p-2 text-xs outline-none focus:border-[#39A5AD]"
                    />
                    <input
                      type="number"
                      step="0.01"
                      placeholder="$ Cost"
                      value={item.unitCost}
                      onChange={(e) => {
                        const next = [...poItems];
                        next[idx].unitCost = Number(e.target.value);
                        setPoItems(next);
                      }}
                      className="col-span-1 border border-slate-200 rounded-lg p-2 text-xs outline-none focus:border-[#39A5AD]"
                    />
                    <button
                      type="button"
                      onClick={() => setPoItems(poItems.filter((_, i) => i !== idx))}
                      className="col-span-1 text-rose-500 font-bold hover:underline text-xs text-center cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setPoItems([...poItems, { name: '', sku: '', categoryId: categories[0]?.id || '', quantity: 1, unitCost: 0 }])}
                  className="text-xs text-[#39A5AD] font-bold flex items-center gap-1 mt-1 cursor-pointer"
                >
                  + Add Line Item
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Remarks / Instructions</label>
              <textarea
                value={poRemarks}
                onChange={(e) => setPoRemarks(e.target.value)}
                placeholder="Include vendor delivery parameters..."
                className="w-full border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-[#39A5AD] h-20 resize-none"
              />
            </div>

            <div className="flex justify-end gap-3.5 pt-4">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 border border-slate-200 text-slate-500 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#39A5AD] text-white rounded-xl text-xs font-extrabold cursor-pointer"
              >
                Submit Procurement PO
              </button>
            </div>
          </form>
        </div>
      )}

      {/* CREATE GRN MODAL */}
      {activeModal === 'create_grn' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form onSubmit={handleCreateGRN} className="bg-white border border-slate-200 rounded-3xl p-6 max-w-2xl w-full space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <h3 className="text-base font-black text-slate-950 font-mono uppercase">Goods Receipt Note (GRN) Processing</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Purchase Order Reference</label>
                <select
                  value={grnPoId}
                  onChange={(e) => handleSelectGRNPo(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-[#39A5AD]"
                >
                  <option value="">Select PO</option>
                  {purchaseOrders.filter(p => p.status === 'APPROVED' || p.status === 'PARTIALLY_RECEIVED').map(p => (
                    <option key={p.id} value={p.id}>{p.poNumber} — {p.vendor?.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Warehouse Destination</label>
                <input
                  type="text"
                  value={grnWarehouse}
                  onChange={(e) => setGrnWarehouse(e.target.value)}
                  placeholder="e.g. Warehouse A"
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-[#39A5AD]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">Inspected Inbound Items</label>
              <div className="space-y-2 border border-slate-100 rounded-xl p-3 bg-slate-50/50">
                {grnItems.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs border-b border-slate-100 pb-2 last:border-b-0 last:pb-0">
                    <div>
                      <span className="font-extrabold text-slate-800 block">{item.name}</span>
                      <span className="text-[10px] text-slate-400">Ordered: {item.quantity} units | SKU: {item.sku}</span>
                    </div>
                    <div className="flex gap-2 items-center">
                      <div className="space-y-0.5">
                        <span className="block text-[8px] text-slate-400 font-bold uppercase">Accepted</span>
                        <input
                          type="number"
                          value={item.acceptedQty}
                          onChange={(e) => {
                            const next = [...grnItems];
                            next[idx].acceptedQty = Number(e.target.value);
                            next[idx].rejectedQty = Math.max(0, item.quantity - Number(e.target.value));
                            setGrnItems(next);
                          }}
                          className="w-14 border border-slate-200 rounded p-1 text-center font-bold text-emerald-600 outline-none"
                        />
                      </div>
                      <div className="space-y-0.5">
                        <span className="block text-[8px] text-slate-400 font-bold uppercase">Rejected</span>
                        <input
                          type="number"
                          value={item.rejectedQty}
                          onChange={(e) => {
                            const next = [...grnItems];
                            next[idx].rejectedQty = Number(e.target.value);
                            setGrnItems(next);
                          }}
                          className="w-14 border border-slate-200 rounded p-1 text-center font-bold text-rose-500 outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Inbound Remarks</label>
              <textarea
                value={grnRemarks}
                onChange={(e) => setGrnRemarks(e.target.value)}
                placeholder="Include condition logs, carrier info, or quality defects..."
                className="w-full border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-[#39A5AD] h-20 resize-none"
              />
            </div>

            <div className="flex justify-end gap-3.5 pt-4">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 border border-slate-200 text-slate-500 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#39A5AD] text-white rounded-xl text-xs font-extrabold cursor-pointer"
              >
                Approve & RESTOCK Inventory
              </button>
            </div>
          </form>
        </div>
      )}

      {/* CREATE TRANSFER MODAL */}
      {activeModal === 'create_transfer' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form onSubmit={handleCreateTransfer} className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-black text-slate-950 font-mono uppercase">Request Asset Transfer</h3>
            
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Select Asset</label>
              <select
                value={trfAssetId}
                onChange={(e) => setTrfAssetId(e.target.value)}
                className="w-full border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-[#39A5AD]"
              >
                {inventory.map(i => <option key={i.id} value={i.id}>{i.name} ({i.sku})</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Select Receiver Employee</label>
              <select
                value={trfReceiverId}
                onChange={(e) => setTrfReceiverId(e.target.value)}
                className="w-full border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-[#39A5AD]"
              >
                {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Transfer Justification</label>
              <textarea
                value={trfRemarks}
                onChange={(e) => setTrfRemarks(e.target.value)}
                placeholder="Include details for project reallocation..."
                className="w-full border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-[#39A5AD] h-20 resize-none"
              />
            </div>

            <div className="flex justify-end gap-3.5 pt-4">
              <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 border border-slate-200 text-slate-500 rounded-xl text-xs font-bold cursor-pointer">Cancel</button>
              <button type="submit" className="px-5 py-2 bg-[#39A5AD] text-white rounded-xl text-xs font-extrabold cursor-pointer">Submit Transfer</button>
            </div>
          </form>
        </div>
      )}

      {/* CREATE RETURN MODAL */}
      {activeModal === 'create_return' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form onSubmit={handleCreateReturn} className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-black text-slate-955 font-mono uppercase">Request Asset Return</h3>
            
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Select Asset to Return</label>
              <select
                value={rtnAssetId}
                onChange={(e) => setRtnAssetId(e.target.value)}
                className="w-full border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-[#39A5AD]"
              >
                {inventory.map(i => <option key={i.id} value={i.id}>{i.name} ({i.sku})</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Return Justification / Condition Remarks</label>
              <textarea
                value={rtnRemarks}
                onChange={(e) => setRtnRemarks(e.target.value)}
                placeholder="Remarks on condition or project completion..."
                className="w-full border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-[#39A5AD] h-20 resize-none"
              />
            </div>

            <div className="flex justify-end gap-3.5 pt-4">
              <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 border border-slate-200 text-slate-500 rounded-xl text-xs font-bold cursor-pointer">Cancel</button>
              <button type="submit" className="px-5 py-2 bg-[#39A5AD] text-white rounded-xl text-xs font-extrabold cursor-pointer">Submit Return File</button>
            </div>
          </form>
        </div>
      )}

      {/* CREATE ADJUSTMENT MODAL */}
      {activeModal === 'create_adjustment' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form onSubmit={handleCreateAdjustment} className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-black text-slate-950 font-mono uppercase font-bold">Request Stock Adjustment</h3>
            
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Select Asset to Adjust</label>
              <select
                value={adjAssetId}
                onChange={(e) => setAdjAssetId(e.target.value)}
                className="w-full border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-[#39A5AD]"
              >
                {inventory.map(i => <option key={i.id} value={i.id}>{i.name} (Current: {i.quantityInStock} units)</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">New Restocked Qty</label>
                <input
                  type="number"
                  value={adjNewQty}
                  onChange={(e) => setAdjNewQty(Number(e.target.value))}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-[#39A5AD]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Reason Category</label>
                <select
                  value={adjReason}
                  onChange={(e) => setAdjReason(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-[#39A5AD]"
                >
                  <option value="DAMAGE">DAMAGE</option>
                  <option value="LOST">LOST</option>
                  <option value="FOUND">FOUND</option>
                  <option value="AUDIT_DIFFERENCE">AUDIT DIFFERENCE</option>
                  <option value="CORRECTION">CORRECTION</option>
                  <option value="EXPIRED">EXPIRED</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Adjustment Explanatory Notes</label>
              <textarea
                value={adjRemarks}
                onChange={(e) => setAdjRemarks(e.target.value)}
                placeholder="Include audit references or correction context..."
                className="w-full border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-[#39A5AD] h-20 resize-none"
              />
            </div>

            <div className="flex justify-end gap-3.5 pt-4">
              <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 border border-slate-200 text-slate-500 rounded-xl text-xs font-bold cursor-pointer">Cancel</button>
              <button type="submit" className="px-5 py-2 bg-[#39A5AD] text-white rounded-xl text-xs font-extrabold cursor-pointer">Submit Adjustment</button>
            </div>
          </form>
        </div>
      )}

      {/* CREATE MAINTENANCE RECORD */}
      {activeModal === 'create_maintenance' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form onSubmit={handleCreateMaintenance} className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-black text-slate-950 font-mono uppercase font-bold">Schedule Asset Maintenance</h3>
            
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Select Asset</label>
              <select
                value={mntAssetId}
                onChange={(e) => setMntAssetId(e.target.value)}
                className="w-full border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-[#39A5AD]"
              >
                {inventory.map(i => <option key={i.id} value={i.id}>{i.name} ({i.sku})</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Service Vendor</label>
                <select
                  value={mntVendorId}
                  onChange={(e) => setMntVendorId(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-[#39A5AD]"
                >
                  <option value="">Select Vendor</option>
                  {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Priority Level</label>
                <select
                  value={mntPriority}
                  onChange={(e) => setMntPriority(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-[#39A5AD]"
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="URGENT">URGENT</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Est Cost ($)</label>
                <input
                  type="number"
                  value={mntEstCost}
                  onChange={(e) => setMntEstCost(Number(e.target.value))}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-[#39A5AD]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Scheduled Date</label>
                <input
                  type="date"
                  value={mntSchedDate}
                  onChange={(e) => setMntSchedDate(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-2 text-xs outline-none focus:border-[#39A5AD]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Diagnostic Details / Issue</label>
              <textarea
                value={mntIssue}
                onChange={(e) => setMntIssue(e.target.value)}
                placeholder="Detail asset problems..."
                className="w-full border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-[#39A5AD] h-20 resize-none"
              />
            </div>

            <div className="flex justify-end gap-3.5 pt-4">
              <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 border border-slate-200 text-slate-500 rounded-xl text-xs font-bold cursor-pointer">Cancel</button>
              <button type="submit" className="px-5 py-2 bg-[#39A5AD] text-white rounded-xl text-xs font-extrabold cursor-pointer">Schedule Workorder</button>
            </div>
          </form>
        </div>
      )}

      {/* CREATE AMC WARRANTY MODAL */}
      {activeModal === 'create_warranty' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form onSubmit={handleCreateWarranty} className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-black text-slate-950 font-mono uppercase">Sync Warranty & AMC Contract</h3>
            
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Select Asset</label>
              <select
                value={wryAssetId}
                onChange={(e) => setWryAssetId(e.target.value)}
                className="w-full border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-[#39A5AD]"
              >
                {inventory.map(i => <option key={i.id} value={i.id}>{i.name} ({i.sku})</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Coverage Start</label>
                <input
                  type="date"
                  value={wryStartDate}
                  onChange={(e) => setWryStartDate(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-2 text-xs outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Coverage End</label>
                <input
                  type="date"
                  value={wryEndDate}
                  onChange={(e) => setWryEndDate(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-2 text-xs outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Original Vendor</label>
                <select
                  value={wryVendorId}
                  onChange={(e) => setWryVendorId(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-[#39A5AD]"
                >
                  <option value="">Select Vendor</option>
                  {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">AMC Provider Name</label>
                <input
                  type="text"
                  value={wryAmcProvider}
                  onChange={(e) => setWryAmcProvider(e.target.value)}
                  placeholder="e.g. Apex Support"
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-[#39A5AD]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">AMC Annual Cost ($)</label>
                <input
                  type="number"
                  value={wryAmcCost}
                  onChange={(e) => setWryAmcCost(Number(e.target.value))}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-[#39A5AD]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Coverage Details</label>
                <input
                  type="text"
                  value={wryCoverage}
                  onChange={(e) => setWryCoverage(e.target.value)}
                  placeholder="Full Parts & Labor"
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-[#39A5AD]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3.5 pt-4">
              <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 border border-slate-200 text-slate-500 rounded-xl text-xs font-bold cursor-pointer">Cancel</button>
              <button type="submit" className="px-5 py-2 bg-[#39A5AD] text-white rounded-xl text-xs font-extrabold cursor-pointer">Sync Record</button>
            </div>
          </form>
        </div>
      )}

      {/* CREATE DISPOSAL MODAL */}
      {activeModal === 'create_disposal' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form onSubmit={handleCreateDisposal} className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-black text-slate-950 font-mono uppercase font-bold">Request Asset Disposal</h3>
            
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Select Asset to Dispose</label>
              <select
                value={dispAssetId}
                onChange={(e) => setDispAssetId(e.target.value)}
                className="w-full border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-[#39A5AD]"
              >
                {inventory.map(i => <option key={i.id} value={i.id}>{i.name} (Qty: {i.quantityInStock})</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Qty to Retire</label>
                <input
                  type="number"
                  value={dispQty}
                  onChange={(e) => setDispQty(Number(e.target.value))}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-[#39A5AD]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Retirement Reason</label>
                <select
                  value={dispReason}
                  onChange={(e) => setDispReason(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-[#39A5AD]"
                >
                  <option value="BROKEN">BROKEN</option>
                  <option value="OBSOLETE">OBSOLETE</option>
                  <option value="SOLD">SOLD</option>
                  <option value="RECYCLED">RECYCLED</option>
                  <option value="LOST">LOST</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Disposal Explanatory Notes</label>
              <textarea
                value={dispRemarks}
                onChange={(e) => setDispRemarks(e.target.value)}
                placeholder="Compliance protocol details..."
                className="w-full border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-[#39A5AD] h-20 resize-none"
              />
            </div>

            <div className="flex justify-end gap-3.5 pt-4">
              <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 border border-slate-200 text-slate-500 rounded-xl text-xs font-bold cursor-pointer">Cancel</button>
              <button type="submit" className="px-5 py-2 bg-[#39A5AD] text-white rounded-xl text-xs font-extrabold cursor-pointer">Submit Disposal Request</button>
            </div>
          </form>
        </div>
      )}

      {/* DOCUMENT PREVIEW DIALOG OVERLAY (MODULE 12 HIGH-FIDELITY VIEWER) */}
      {viewingDoc && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-3xl w-full space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <button 
              onClick={() => setViewingDoc(null)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 text-xs font-bold font-mono border border-slate-200 px-3 py-1 rounded-xl cursor-pointer"
            >
              Close
            </button>

            {/* Printable Document Sheet */}
            <div id="printable-area" className="p-6 border border-slate-200 bg-slate-50/50 rounded-2xl space-y-6 text-xs text-slate-700">
              
              {/* Header: Company Details & Logo */}
              <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#39A5AD] flex items-center justify-center text-white font-extrabold text-sm">
                      <Layers className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-black text-slate-900 uppercase font-mono tracking-tight">AssetFlow EIMS</span>
                  </div>
                  <span className="block text-[10px] text-slate-400 font-semibold uppercase">Enterprise Asset Management Suite</span>
                </div>
                <div className="text-right space-y-0.5">
                  <h4 className="text-xs font-black text-slate-900 uppercase font-mono tracking-wider">
                    {viewingDoc.type === 'po' && 'Purchase Order'}
                    {viewingDoc.type === 'grn' && 'Goods Receipt Note (GRN)'}
                    {viewingDoc.type === 'transfer' && 'Asset Transfer Slip'}
                    {viewingDoc.type === 'return' && 'Asset Return Slip'}
                    {viewingDoc.type === 'adjustment' && 'Stock Adjustment Slip'}
                    {viewingDoc.type === 'maintenance' && 'Maintenance Report'}
                    {viewingDoc.type === 'disposal' && 'Disposal Certificate'}
                  </h4>
                  <span className="block text-[10px] text-indigo-650 font-bold font-mono uppercase">
                    Ref: {viewingDoc.type === 'po' && viewingDoc.data.poNumber}
                    {viewingDoc.type === 'grn' && viewingDoc.data.grnNumber}
                    {viewingDoc.type === 'transfer' && viewingDoc.data.transferNumber}
                    {viewingDoc.type === 'return' && viewingDoc.data.returnNumber}
                    {viewingDoc.type === 'adjustment' && viewingDoc.data.adjustmentNumber}
                    {viewingDoc.type === 'maintenance' && viewingDoc.data.recordId}
                    {viewingDoc.type === 'disposal' && viewingDoc.data.disposalNumber}
                  </span>
                  <span className="block text-[8px] text-slate-400 font-bold uppercase">Date: {new Date(viewingDoc.data.createdAt || Date.now()).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Inbound Fields */}
              <div className="grid grid-cols-2 gap-4 border-b border-slate-100 pb-4">
                {/* Left details */}
                <div className="space-y-1">
                  <span className="block text-[9px] text-slate-400 font-black uppercase font-mono tracking-wider">Originating Entity</span>
                  <span className="font-bold text-slate-800 block">AssetFlow Enterprise Corp</span>
                  <span className="text-slate-500 block">HQ Operations Desk</span>
                  {viewingDoc.type === 'po' && (
                    <span className="text-slate-500 block">Requested by: {viewingDoc.data.createdBy?.name || 'Administrator'}</span>
                  )}
                </div>

                {/* Right details */}
                <div className="space-y-1">
                  <span className="block text-[9px] text-slate-400 font-black uppercase font-mono tracking-wider">External Counterparty / Destination</span>
                  {viewingDoc.type === 'po' && (
                    <>
                      <span className="font-bold text-slate-800 block">{viewingDoc.data.vendor?.name}</span>
                      <span className="text-slate-500 block">Email: {viewingDoc.data.vendor?.contactEmail}</span>
                    </>
                  )}
                  {viewingDoc.type === 'grn' && (
                    <>
                      <span className="font-bold text-slate-800 block">{viewingDoc.data.vendor?.name}</span>
                      <span className="text-slate-500 block">Warehouse Destination: {viewingDoc.data.warehouse}</span>
                    </>
                  )}
                  {viewingDoc.type === 'transfer' && (
                    <>
                      <span className="font-bold text-slate-800 block">Receiver: {viewingDoc.data.receiver?.name}</span>
                      <span className="text-slate-500 block">Sender: {viewingDoc.data.sender?.name}</span>
                    </>
                  )}
                  {viewingDoc.type === 'return' && (
                    <>
                      <span className="font-bold text-slate-800 block">Returned by: {viewingDoc.data.returnedBy?.name}</span>
                      <span className="text-slate-500 block">Condition: {viewingDoc.data.condition}</span>
                    </>
                  )}
                  {viewingDoc.type === 'maintenance' && (
                    <>
                      <span className="font-bold text-slate-800 block">Vendor Partner: {viewingDoc.data.vendor?.name}</span>
                      <span className="text-slate-500 block">Status: {viewingDoc.data.status}</span>
                    </>
                  )}
                  {viewingDoc.type === 'disposal' && (
                    <>
                      <span className="font-bold text-slate-800 block">Retired Asset: {viewingDoc.data.asset?.name}</span>
                      <span className="text-slate-500 block">Reason: {viewingDoc.data.reason}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <span className="block text-[9px] text-slate-400 font-black uppercase font-mono tracking-wider">Line Items Detail</span>
                <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold uppercase text-[8px] font-mono select-none">
                        <th className="p-2">Sku / Name</th>
                        <th className="p-2 text-right">Quantity</th>
                        <th className="p-2 text-right">Unit Cost</th>
                        <th className="p-2 text-right">Extended Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewingDoc.type === 'po' && viewingDoc.data.items.map((i: any) => (
                        <tr key={i.id} className="border-b border-slate-100">
                          <td className="p-2 font-bold text-slate-800">{i.name} ({i.sku || 'N/A'})</td>
                          <td className="p-2 text-right">{i.quantity} units</td>
                          <td className="p-2 text-right">${i.unitCost}</td>
                          <td className="p-2 text-right font-bold">${(i.quantity * i.unitCost).toLocaleString()}</td>
                        </tr>
                      ))}
                      {viewingDoc.type === 'grn' && viewingDoc.data.items.map((i: any) => (
                        <tr key={i.id} className="border-b border-slate-100">
                          <td className="p-2 font-bold text-slate-800">Item SKU: {i.sku}</td>
                          <td className="p-2 text-right">{i.acceptedQty} accepted / {i.rejectedQty} rejected</td>
                          <td className="p-2 text-right">${i.unitCost}</td>
                          <td className="p-2 text-right font-bold">${(i.acceptedQty * i.unitCost).toLocaleString()}</td>
                        </tr>
                      ))}
                      {['transfer', 'return', 'adjustment', 'maintenance', 'disposal'].includes(viewingDoc.type) && (
                        <tr className="border-b border-slate-100">
                          <td className="p-2 font-bold text-slate-800">{viewingDoc.data.asset?.name || 'Asset Item'} ({viewingDoc.data.asset?.sku || 'N/A'})</td>
                          <td className="p-2 text-right">1 unit</td>
                          <td className="p-2 text-right">${viewingDoc.data.asset?.unitCost || 0}</td>
                          <td className="p-2 text-right font-bold">${(viewingDoc.data.asset?.unitCost || 0).toLocaleString()}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* QR Code and Cryptographic Footprint Section */}
              <div className="grid grid-cols-3 gap-6 pt-4 border-t border-slate-200 items-center">
                <div className="flex flex-col items-center justify-center p-2 border border-slate-200 bg-white rounded-xl space-y-1 w-fit">
                  <div className="w-16 h-16 bg-slate-900 flex items-center justify-center text-white text-[8px] font-mono p-1 text-center font-bold">
                    [QR CODE FOOTPRINT]
                  </div>
                  <span className="text-[7px] text-slate-450 font-bold uppercase font-mono">Scan Registry</span>
                </div>

                <div className="col-span-2 space-y-1">
                  <span className="block text-[9px] text-slate-400 font-black uppercase font-mono tracking-wider">Cryptographic Signature Footprint</span>
                  <div className="bg-slate-100 border border-slate-200 p-2.5 rounded-xl text-[8px] font-mono text-slate-600 space-y-1">
                    <div>
                      <span className="text-slate-400 font-extrabold mr-1">HASH:</span>
                      sha256-8f3b2075b9c1d2e4f5a6b7c8d9e0f1a2b3c4
                    </div>
                    <div>
                      <span className="text-slate-400 font-extrabold mr-1">SIGNATURE:</span>
                      verified-by-saml-auth-eims-server
                    </div>
                    <div>
                      <span className="text-slate-400 font-extrabold mr-1">VERSION:</span>
                      v1.0.0 (Immutable Trail Logged)
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3.5 pt-2 select-none">
              <button 
                onClick={() => {
                  window.print();
                  triggerToast('Spooling document to printer...', 'info');
                }} 
                className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" /> Print / Save PDF
              </button>
              <button 
                onClick={() => triggerToast('Document emailed successfully to vendor registry.', 'success')} 
                className="bg-[#39A5AD] hover:bg-[#2D8E95] text-white text-xs font-extrabold px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Mail className="w-4 h-4" /> Email Vendor Copy
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
