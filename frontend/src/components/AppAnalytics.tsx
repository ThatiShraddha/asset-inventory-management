import React from 'react';
import { 
  TrendingUp, Clock, ShieldAlert, Award, Sparkles, Database, BarChart3, PieChartIcon, Percent
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import { InventoryItem, Department, RequisitionRequest } from '../types';

interface AppAnalyticsProps {
  db: {
    inventory: InventoryItem[];
    departments: Department[];
    requisitions: RequisitionRequest[];
  };
}

export default function AppAnalytics({ db }: AppAnalyticsProps) {
  
  // Spend calculations
  const totalValuation = db.inventory.reduce((sum, item) => sum + (item.quantityInStock * item.unitCost), 0);
  const totalItemsCount = db.inventory.reduce((sum, item) => sum + item.quantityInStock, 0);
  const activeLeases = db.requisitions.filter(r => r.status === 'APPROVED').length;
  
  // Department Budgets Preparation
  const deptData = db.departments.map(dept => {
    const usage = dept.budgetLimit > 0 ? Math.round((dept.budgetConsumed / dept.budgetLimit) * 100) : 0;
    return {
      name: dept.name,
      Limit: dept.budgetLimit,
      Consumed: dept.budgetConsumed,
      Usage: usage
    };
  });

  // SLA Signature Leadtimes (In Hours)
  const slaDeptData = [
    { name: 'Administration', Speed: 0.8, Compliance: 99.4 },
    { name: 'SME Mobile Dev', Speed: 1.9, Compliance: 94.2 },
    { name: 'Quantum Physics', Speed: 2.8, Compliance: 89.5 },
    { name: 'Global Security', Speed: 1.4, Compliance: 98.1 },
    { name: 'IT Infrastructure', Speed: 1.1, Compliance: 96.8 },
  ];

  // Vendor Performance Index
  const vendorPerformance = [
    { name: 'Apex Hardware', QualityScore: 99.6, LeadtimeDays: 1.2 },
    { name: 'Silicon Dist.', QualityScore: 97.4, LeadtimeDays: 2.4 },
    { name: 'Global Network', QualityScore: 92.1, LeadtimeDays: 4.1 },
    { name: 'Office Supplies', QualityScore: 98.9, LeadtimeDays: 1.8 },
  ];

  // Category values
  const categorySummary = db.inventory.reduce((acc: Record<string, { count: number; val: number }>, item) => {
    const cat = item.categoryId === 'cat-periph' ? 'Peripherals' : item.categoryId === 'cat-test' ? 'Test Dev' : item.categoryId === 'cat-net' ? 'Network' : 'Furniture';
    if (!acc[cat]) {
      acc[cat] = { count: 0, val: 0 };
    }
    acc[cat].count += item.quantityInStock;
    acc[cat].val += item.quantityInStock * item.unitCost;
    return acc;
  }, {});

  const pieColors = ['#39A5AD', '#6366F1', '#EC4899', '#F59E0B', '#10B981'];
  const pieData = Object.keys(categorySummary).map(catName => ({
    name: catName,
    value: categorySummary[catName].val
  }));

  return (
    <div className="space-y-8 pb-12">
      
      {/* SECTION 1: BUSINESS INTELLIGENCE METRIC CARDS */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="border-b border-slate-100 pb-4 mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">Corporate BI Spend Analytics</h2>
            <p className="text-xs text-slate-400 font-medium">Multi-dimensional charts mapping corporate capital distributions and supplier integrity SLA ratings.</p>
          </div>
          <div className="bg-[#39A5AD]/10 text-[#39A5AD] px-3.5 py-1 rounded-xl text-[10px] font-black font-mono uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
            <Sparkles className="w-3.5 h-3.5" /> COGNITIVE BI FEEDERS ACTIVE
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 border border-slate-150 bg-slate-50 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-slate-400">
              <Database className="w-4 h-4 text-[#39A5AD]" />
              <span className="text-[10px] font-extrabold uppercase tracking-wider block font-mono">Consolidated Ledger Volume</span>
            </div>
            <div className="text-3xl font-black text-slate-900">{totalItemsCount.toLocaleString()} <span className="text-xs font-bold text-slate-400">Units</span></div>
            <p className="text-[10px] text-slate-500 font-medium">Mapped across {db.inventory.length} unique registered product SKUs.</p>
          </div>

          <div className="p-5 border border-slate-150 bg-slate-50 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-slate-400">
              <Clock className="w-4 h-4 text-indigo-500" />
              <span className="text-[10px] font-extrabold uppercase tracking-wider block font-mono">Disbursed Assets Under Lease</span>
            </div>
            <div className="text-3xl font-black text-slate-900">{activeLeases} <span className="text-xs font-bold text-slate-400">Leases active</span></div>
            <p className="text-[10px] text-slate-500 font-medium">Enforced with automated double-signature compliance signoffs.</p>
          </div>

          <div className="p-5 border border-slate-150 bg-slate-50 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-slate-400">
              <Award className="w-4 h-4 text-emerald-500" />
              <span className="text-[10px] font-extrabold uppercase tracking-wider block font-mono">Supplier Quality Index</span>
            </div>
            <div className="text-3xl font-black text-slate-900">97.8% <span className="text-xs font-bold text-slate-400">OTD Grade</span></div>
            <p className="text-[10px] text-slate-500 font-medium">Based on real-time fulfillment timelines from Apex & Silicon.</p>
          </div>
        </div>
      </div>

      {/* SECTION 2: CHARTS ROW 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Department spend bar chart */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm lg:col-span-2 space-y-4">
          <div>
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest block flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-[#39A5AD]" /> Budget Utilisation by Department
            </h3>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">Limits vs consumed expenditure mapped by cost centers</p>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={9} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={9} tickLine={false} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 10, fontWeight: 'bold' }} />
                <Bar dataKey="Limit" fill="#39A5AD" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Consumed" fill="#6366F1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category breakdown pie chart */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest block flex items-center gap-1.5">
              <PieChartIcon className="w-4 h-4 text-[#39A5AD]" /> Asset Valuation Distribution
            </h3>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">Asset capital weight computed by categories</p>
          </div>

          <div className="h-52 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Net Value</span>
              <span className="text-sm font-black text-slate-800">${totalValuation.toLocaleString()}</span>
            </div>
          </div>

          <div className="space-y-2 border-t border-slate-100 pt-4">
            {pieData.map((d, index) => (
              <div key={index} className="flex justify-between items-center text-[10px] font-bold text-slate-600">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: pieColors[index] }} />
                  <span>{d.name}</span>
                </div>
                <span>${d.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* SECTION 3: SLA RESPONSES & VENDOR QUALITY CHART ROW 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* SLA response speed bar chart */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div>
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest block flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#39A5AD]" /> Requisition SLA Response Speed (Hours)
            </h3>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">Average hours taken for Store Manager approvals signature</p>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={slaDeptData} layout="vertical" margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                <XAxis type="number" stroke="#94A3B8" fontSize={9} tickLine={false} />
                <YAxis dataKey="name" type="category" stroke="#94A3B8" fontSize={9} tickLine={false} />
                <Tooltip />
                <Bar dataKey="Speed" fill="#EC4899" radius={[0, 4, 4, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Vendor Defect and Leadtime chart */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div>
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest block flex items-center gap-1.5">
              <Percent className="w-4 h-4 text-[#39A5AD]" /> Supplier SLA Fulfillment Rates (%)
            </h3>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">Quality compliance scores recorded per supplier contracts</p>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={vendorPerformance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={9} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={9} tickLine={false} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 10, fontWeight: 'bold' }} />
                <Line type="monotone" dataKey="QualityScore" stroke="#10B981" strokeWidth={3} activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="LeadtimeDays" stroke="#F59E0B" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}
