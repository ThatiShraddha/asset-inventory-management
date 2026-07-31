import React, { useState } from 'react';
import { 
  ArrowRight, Check, CheckCircle2, HelpCircle, Layers, Shield, Zap, Users, 
  BarChart3, Database, Cpu, Mail, DollarSign, Sparkles, MessageSquare, PhoneCall
} from 'lucide-react';
import { motion } from 'motion/react';

interface MarketingPageProps {
  onLaunchConsole: () => void;
  triggerToast: (msg: string, type: 'success' | 'info' | 'warning' | 'error') => void;
}

export default function MarketingPage({ onLaunchConsole, triggerToast }: MarketingPageProps) {
  const [isAnnual, setIsAnnual] = useState(true);
  const [seatCount, setSeatCount] = useState(25);
  const [activeSolution, setActiveSolution] = useState<'hardware' | 'cloud' | 'biomed' | 'logistics'>('hardware');
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  // Contact form state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMessage) {
      triggerToast("Please populate all fields in the request routing card.", "warning");
      return;
    }
    triggerToast("Inbound contact record registered. A solutions architect will contact you within 2 hours.", "success");
    setContactName('');
    setContactEmail('');
    setContactMessage('');
  };

  const solutions = {
    hardware: {
      title: "Hardware Operations",
      desc: "Track workstations, mobile testing configurations, server blades, and high-performance developer accessories.",
      features: ["Dynamic location codes (WH-A1-S3)", "QR-Code labeling & print queues", "Automated stock-in verification ledgers"],
      metric: "99.8% Tracking Accuracy"
    },
    cloud: {
      title: "Cloud Infrastructure",
      desc: "Manage logical and physical assets, server racks, backup switches, and power distribution hardware.",
      features: ["SLA contract expiry alerts", "Warranty tracking integration", "Vendor OTD performance ranking"],
      metric: "zero downtime allocations"
    },
    biomed: {
      title: "Biomedical & High-Value Assets",
      desc: "Trace expensive equipment, specialized research tablets, and sensor arrays under strict budget restrictions.",
      features: ["Double-signature request queues", "Department budget caps", "Mandatory replacement cycles"],
      metric: "-24% procurement leak"
    },
    logistics: {
      title: "Enterprise Logistics & Storage",
      desc: "Scale storage zones, bulk item cataloging, dynamic floor maps, and multi-facility synchronization.",
      features: ["Reorder point alerts", "Bulk category assignments", "Lead-time variance estimation"],
      metric: "1.4d average dispatch"
    }
  };

  const faqs = [
    {
      q: "Does AssetFlow integrate with existing Active Directory or Okta?",
      a: "Yes. AssetFlow is built for enterprise operations, featuring optional OIDC, SAML, and standard OAuth-compatible role mapping directly into your tenant space."
    },
    {
      q: "Can I customize the approval workflow for high-value items?",
      a: "Yes. In the application, threshold-based budget validations and role-based permissions (Employee vs. Store Manager vs. Admin) enforce double-signing before any asset leaves warehouse floor space."
    },
    {
      q: "How does the SRE Predictive Demand module compute stock runout?",
      a: "The engine runs real-time consumption velocity models based on previous requisition logs, monthly burn rates, and lead-time deviation tolerances."
    },
    {
      q: "What database does AssetFlow use to ensure absolute audit preservation?",
      a: "Our core platform utilizes high-integrity transactional ledger tables. No deletion actually occurs; a complete timeline log traces every stock adjustment, procurement, and return return-loop."
    }
  ];

  return (
    <div className="bg-white text-slate-800 font-sans selection:bg-[#39A5AD]/20 selection:text-slate-900 overflow-x-hidden">
      
      {/* Dynamic Sub-Header Info Banner */}
      <div className="bg-slate-50 border-b border-slate-100 py-2.5 px-4 text-center">
        <p className="text-[11px] font-bold tracking-tight text-slate-600 flex items-center justify-center gap-2">
          <span className="bg-[#39A5AD] text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase">NEW RELEASE</span>
          <span>EIMS 2.0: Dynamic budget controls & SRE predictive runouts are now live.</span>
          <button 
            onClick={onLaunchConsole}
            className="text-[#39A5AD] hover:underline font-extrabold inline-flex items-center gap-1 cursor-pointer"
          >
            Launch app <ArrowRight className="w-3 h-3" />
          </button>
        </p>
      </div>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 bg-white">
        {/* Background mesh glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-[#39A5AD]/10 to-teal-500/5 blur-[120px]" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-indigo-500/10 to-violet-500/5 blur-[120px]" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-200/80 rounded-full mb-6"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#39A5AD]" />
            <span className="text-[10px] font-extrabold text-slate-600 tracking-wider uppercase font-mono">Enterprise Asset Intelligence</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.05] max-w-4xl mx-auto"
          >
            The Operating System for <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-[#39A5AD] to-slate-900">
              Enterprise Asset Operations
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-base md:text-lg text-slate-500 max-w-2xl mx-auto font-medium"
          >
            Consolidate inventory ledgers, procurement requests, automated budgets, and lifecycle analytics in a single, high-fidelity pane of glass. Crafted for compliance-heavy teams.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button 
              onClick={onLaunchConsole}
              className="w-full sm:w-auto bg-[#39A5AD] hover:bg-[#2D8E95] text-white font-extrabold px-8 py-3.5 rounded-xl shadow-lg shadow-[#39A5AD]/15 transition-all text-sm inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              Launch Console <ArrowRight className="w-4 h-4" />
            </button>
            <a 
              href="#pricing"
              className="w-full sm:w-auto bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-extrabold px-8 py-3.5 rounded-xl transition-all text-sm inline-flex items-center justify-center cursor-pointer"
            >
              Explore Tiers & Pricing
            </a>
          </motion.div>

          {/* Interactive mockup preview container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-16 border border-slate-200/80 bg-white rounded-2xl shadow-2xl p-2 max-w-5xl mx-auto relative group overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent pointer-events-none z-10" />
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 md:p-6 text-left space-y-4">
              {/* Fake top navigation rail */}
              <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-400" />
                  <span className="w-3 h-3 rounded-full bg-amber-400" />
                  <span className="w-3 h-3 rounded-full bg-emerald-400" />
                  <span className="ml-4 text-xs font-bold text-slate-400 font-mono">https://assets.enterprise.com</span>
                </div>
                <div className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-[10px] font-mono text-[#39A5AD] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  LIVE CONNECTIVITY
                </div>
              </div>

              {/* Grid content mock */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="bg-white border border-slate-200/60 rounded-xl p-4 space-y-2">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Global Asset Valuation</span>
                  <div className="text-2xl font-black text-slate-800">$184,240.00</div>
                  <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">↑ 14% this quarter</span>
                </div>
                <div className="bg-white border border-slate-200/60 rounded-xl p-4 space-y-2">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Approval SLA Buffer</span>
                  <div className="text-2xl font-black text-[#39A5AD]">1.8 Hours</div>
                  <span className="text-[10px] text-slate-400">99.2% requests resolved within term limits</span>
                </div>
                <div className="bg-white border border-slate-200/60 rounded-xl p-4 space-y-2">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">SRE Runout Threshold</span>
                  <div className="text-2xl font-black text-rose-500">2 Warnings</div>
                  <span className="text-[10px] text-rose-600 font-bold">Requires procurement signing</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust and Logo Cloud */}
      <section className="py-12 bg-slate-50/50 border-y border-slate-100 text-center">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-xs font-bold tracking-widest text-slate-400 uppercase">
            Trusted by asset managers at market leaders
          </p>
          <div className="mt-8 flex flex-wrap justify-center items-center gap-x-12 gap-y-6 opacity-40 grayscale hover:opacity-70 transition-all">
            <span className="font-extrabold text-slate-600 tracking-tighter text-xl">STRIPE //</span>
            <span className="font-bold text-slate-600 tracking-tight text-xl">V E R C E L</span>
            <span className="font-black text-slate-600 tracking-normal text-xl">L I N E A R</span>
            <span className="font-black text-slate-600 tracking-tight text-lg">ATLASSIAN</span>
            <span className="font-semibold text-slate-600 tracking-wide text-xl">N o t i o n</span>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-black text-[#39A5AD] uppercase tracking-wider block mb-2 font-mono">OPERATIONAL COMPLIANCE</span>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              Engineered for precision. Crafted for speed.
            </h2>
            <p className="mt-4 text-slate-500 text-sm md:text-base">
              Say goodbye to un-tracked inventory leaks, over-spending on dormant software/hardware, and broken manual spreadsheet workflows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-2xl border border-slate-200/80 bg-white shadow-sm hover:shadow-md transition-all space-y-4">
              <div className="w-10 h-10 rounded-xl bg-[#39A5AD]/10 flex items-center justify-center text-[#39A5AD]">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">Inbound Ledger Logs</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Every single adjustment is logged permanently. Adjust location codes, inbound quantities, unit costs, and track exactly who modified what.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-2xl border border-slate-200/80 bg-white shadow-sm hover:shadow-md transition-all space-y-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">Role-Based Approvals</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Control the flow with dynamic user personas (Admins, Store Managers, Employees). Keep your critical asset distributions safe.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-2xl border border-slate-200/80 bg-white shadow-sm hover:shadow-md transition-all space-y-4">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">Budget Protection</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Assign budget limits to individual departments. The checkout workflow automatically rejects requests if the department's budget cap is exceeded.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-8 rounded-2xl border border-slate-200/80 bg-white shadow-sm hover:shadow-md transition-all space-y-4">
              <div className="w-10 h-10 rounded-xl bg-[#39A5AD]/10 flex items-center justify-center text-[#39A5AD]">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">SRE Runout Prediction</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Real-time safety stock computations flag critical SKU runout dates based on current velocity and average supplier shipment delays.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-8 rounded-2xl border border-slate-200/80 bg-white shadow-sm hover:shadow-md transition-all space-y-4">
              <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center text-violet-500">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">Saved Views & Filters</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Filter inventory by low stock, out of stock, category, or location code. Create and save custom views for daily monitoring.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-8 rounded-2xl border border-slate-200/80 bg-white shadow-sm hover:shadow-md transition-all space-y-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">Corporate BI Analytics</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Inspect department consumption, vendor rating statistics, inventory valuation metrics, and SLA times with interactive bar and pie diagrams.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solutions Tab section */}
      <section id="solutions" className="py-20 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-12 items-start">
            <div className="w-full lg:w-2/5 space-y-6">
              <span className="text-xs font-black text-[#39A5AD] uppercase tracking-wider block font-mono">INDUSTRY BLUEPRINTS</span>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none">
                Tailored Solutions for Your Department
              </h2>
              <p className="text-slate-500 text-sm">
                Each corporate silo demands distinct compliance boundaries. Choose your blueprint to explore.
              </p>

              {/* Sidebar tabs */}
              <div className="space-y-2 pt-4">
                {(Object.keys(solutions) as Array<keyof typeof solutions>).map((key) => (
                  <button
                    key={key}
                    onClick={() => setActiveSolution(key)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all text-xs font-bold flex items-center justify-between cursor-pointer ${
                      activeSolution === key 
                        ? 'border-[#39A5AD] bg-white text-[#39A5AD] shadow-sm' 
                        : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-200/45'
                    }`}
                  >
                    <span>{solutions[key].title}</span>
                    <ArrowRight className={`w-4 h-4 transition-transform ${activeSolution === key ? 'translate-x-1' : 'opacity-40'}`} />
                  </button>
                ))}
              </div>
            </div>

            <div className="w-full lg:w-3/5 bg-white border border-slate-200/80 rounded-2xl p-8 shadow-sm space-y-6">
              <div>
                <span className="text-[10px] font-extrabold text-[#39A5AD] bg-[#39A5AD]/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  {solutions[activeSolution].metric}
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-4 tracking-tight">
                  {solutions[activeSolution].title} Blueprint
                </h3>
                <p className="text-slate-500 text-xs mt-2 leading-relaxed">
                  {solutions[activeSolution].desc}
                </p>
              </div>

              <div className="border-t border-slate-100 pt-6 space-y-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Out-Of-The-Box Capabilities:</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {solutions[activeSolution].features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-600 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex justify-end">
                <button 
                  onClick={onLaunchConsole}
                  className="bg-[#39A5AD] hover:bg-[#2D8E95] text-white font-extrabold text-xs px-5 py-2.5 rounded-lg flex items-center gap-1.5 cursor-pointer"
                >
                  Deploy blueprint <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section with Seat Calculator */}
      <section id="pricing" className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-black text-indigo-500 uppercase tracking-wider block mb-2 font-mono">HONEST PLAN STRUCTURES</span>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              Predictable Pricing, Enterprise Scale
            </h2>
            <p className="mt-4 text-slate-500 text-xs md:text-sm">
              Deploy in our cloud or self-host under strict air-gapped security configurations.
            </p>

            {/* Monthly/Annual Switch */}
            <div className="mt-8 inline-flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-full p-1">
              <button
                onClick={() => setIsAnnual(false)}
                className={`px-4 py-1.5 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
                  !isAnnual ? 'bg-[#39A5AD] text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Monthly billing
              </button>
              <button
                onClick={() => setIsAnnual(true)}
                className={`px-4 py-1.5 rounded-full text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isAnnual ? 'bg-[#39A5AD] text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Annual billing
                <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-1.5 py-0.5 rounded uppercase">Save 20%</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start max-w-5xl mx-auto">
            {/* Standard Tier */}
            <div className="bg-white border border-slate-200 rounded-2xl p-8 space-y-6">
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">OPERATIONAL SEED</span>
                <h3 className="text-lg font-black text-slate-900 mt-1">Growth Standard</h3>
                <p className="text-slate-400 text-xs mt-1">Perfect for fast-growing departments tracking IT inventory.</p>
              </div>

              <div className="flex items-baseline gap-1 text-slate-900">
                <span className="text-3xl font-black">$</span>
                <span className="text-5xl font-black tracking-tight">{isAnnual ? '79' : '99'}</span>
                <span className="text-slate-400 text-xs font-bold">/ month</span>
              </div>

              <button 
                onClick={onLaunchConsole}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs py-3 rounded-xl transition-all cursor-pointer"
              >
                Get Started Standard
              </button>

              <div className="space-y-3.5 border-t border-slate-100 pt-6">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Included Essentials:</span>
                {[
                  "Up to 500 Active Assets",
                  "Standard Requisition Requests",
                  "Audit Logging Tracker",
                  "Standard CSV Export",
                  "2 Departments Limit",
                ].map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-600 font-medium">
                    <Check className="w-4 h-4 text-[#39A5AD] shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Interactive Slider Tier */}
            <div className="bg-white border-2 border-[#39A5AD] rounded-2xl p-8 space-y-6 relative shadow-lg shadow-[#39A5AD]/5">
              <span className="absolute top-0 right-8 -translate-y-1/2 bg-[#39A5AD] text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                RECOMMENDED ENTERPRISE
              </span>

              <div>
                <span className="text-[10px] font-black text-[#39A5AD] uppercase tracking-widest block">SCALE CAPACITY</span>
                <h3 className="text-lg font-black text-slate-900 mt-1">AssetFlow Business</h3>
                <p className="text-slate-400 text-xs mt-1">Complete control with dynamic seat allocation limits.</p>
              </div>

              {/* Dynamic Seat Count Display */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-3">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Authorized Seat Capacity:</span>
                  <span className="text-[#39A5AD]">{seatCount} Seats</span>
                </div>
                <input 
                  type="range"
                  min="10"
                  max="150"
                  value={seatCount}
                  onChange={(e) => setSeatCount(parseInt(e.target.value))}
                  className="w-full accent-[#39A5AD] cursor-pointer"
                />
                <div className="flex justify-between text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">
                  <span>10 Seats</span>
                  <span>150 Seats</span>
                </div>
              </div>

              <div className="flex items-baseline gap-1 text-slate-900">
                <span className="text-3xl font-black">$</span>
                <span className="text-5xl font-black tracking-tight">
                  {Math.round(seatCount * (isAnnual ? 4.8 : 6))}
                </span>
                <span className="text-slate-400 text-xs font-bold">/ month</span>
              </div>

              <button 
                onClick={onLaunchConsole}
                className="w-full bg-[#39A5AD] hover:bg-[#2D8E95] text-white font-extrabold text-xs py-3 rounded-xl shadow-md shadow-[#39A5AD]/10 transition-all cursor-pointer"
              >
                Provision Business Instance
              </button>

              <div className="space-y-3.5 border-t border-slate-100 pt-6">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Everything in Standard plus:</span>
                {[
                  "Unlimited Assets & Categories",
                  "Flexible Role Switcher (Admin/Manager/Staff)",
                  "Custom Department Budget Restrictions",
                  "SRE Runout Estimation Engine",
                  "Advanced BI Reports center (PDF/Excel)",
                  "API endpoints integration capability"
                ].map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-600 font-medium">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Private Cloud Tier */}
            <div className="bg-white border border-slate-200 rounded-2xl p-8 space-y-6">
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">MAX SECURITY</span>
                <h3 className="text-lg font-black text-slate-900 mt-1">Air-Gapped Private</h3>
                <p className="text-slate-400 text-xs mt-1">Full compliance deployment with dedicated SLA support.</p>
              </div>

              <div className="text-3xl font-black tracking-tight text-slate-900">Custom Agreement</div>

              <button 
                onClick={() => {
                  const pricingContact = document.getElementById('contact');
                  if (pricingContact) pricingContact.scrollIntoView({ behavior: 'smooth' });
                  triggerToast("Contact router highlighted. Let us know your air-gapped specs.", "info");
                }}
                className="w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-extrabold text-xs py-3 rounded-xl transition-all cursor-pointer"
              >
                Speak with Enterprise Lead
              </button>

              <div className="space-y-3.5 border-t border-slate-100 pt-6">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Unrestricted Security:</span>
                {[
                  "Self-hosted Docker configurations",
                  "Air-gapped database deployment",
                  "Custom SAML/SRE alerts webhook",
                  "Unlimited departments & seats",
                  "Dedicated solution engineer (4h SLA)",
                ].map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-600 font-medium">
                    <Check className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quote/Testimonial Marquee */}
      <section className="py-20 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-xs font-black text-[#39A5AD] uppercase tracking-wider block font-mono">VERIFIED AUDITS</span>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              Praised by technical operations leads
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed italic">
                "We consolidated our global network labs under AssetFlow. Integrating our department budgets directly prevented a 14% over-spending leakage in the first month."
              </p>
              <div className="border-t border-slate-100 pt-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-[#39A5AD]">TB</div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Thomas Vance</h4>
                  <p className="text-[10px] text-slate-400">Head of IT Operations, Global Connect</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed italic">
                "SRE Predictive Runout changed our warehouse habits. Our critical test arrays are now reordered exactly 18 days in advance of runout, zeroing out project roadblocks."
              </p>
              <div className="border-t border-slate-100 pt-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-indigo-500">EK</div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Elena Kovic</h4>
                  <p className="text-[10px] text-slate-400">SRE Director, SpaceTech Laboratories</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed italic">
                "Simple, beautiful, responsive. Our warehouse team scans location codes on iPads while our directors sign approvals on laptops. An exceptional UX milestone."
              </p>
              <div className="border-t border-slate-100 pt-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-emerald-500">MA</div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Marcus Aoki</h4>
                  <p className="text-[10px] text-slate-400">VP Supply Chain, Silicon Dynamics</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section id="faq" className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-xs font-black text-slate-400 uppercase tracking-wider block font-mono">HAVE QUESTIONS?</span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                <button
                  onClick={() => setFaqOpen(faqOpen === idx ? null : idx)}
                  className="w-full text-left p-5 font-bold text-xs md:text-sm text-slate-800 hover:bg-slate-50 flex items-center justify-between cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <HelpCircle className={`w-4 h-4 text-slate-400 transition-transform ${faqOpen === idx ? 'rotate-180 text-[#39A5AD]' : ''}`} />
                </button>
                {faqOpen === idx && (
                  <div className="p-5 border-t border-slate-100 bg-slate-50 text-xs text-slate-500 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section id="contact" className="py-20 bg-slate-50 border-t border-slate-100">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-6">
              <span className="text-xs font-black text-[#39A5AD] uppercase tracking-wider block font-mono">OPERATIONAL INQUIRY</span>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Ready to integrate AssetFlow?</h2>
              <p className="text-slate-500 text-xs md:text-sm leading-relaxed">
                Send our technical integration squad a note. We configure custom Docker environments, map active directories, and set up air-gapped secure templates.
              </p>

              <div className="space-y-4 pt-4 text-xs font-medium text-slate-600">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-[#39A5AD]">
                    <Mail className="w-4 h-4" />
                  </div>
                  <span>integrations@assetflow.enterprise.com</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-[#39A5AD]">
                    <PhoneCall className="w-4 h-4" />
                  </div>
                  <span>+1 (800) 555-FLOW</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 md:p-8 shadow-sm">
              <h3 className="text-base font-extrabold text-slate-800 mb-6">Dispatch Router Inquiry</h3>
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Your Full Name</label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Marcus Thorne"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-[#39A5AD] focus:ring-1 focus:ring-[#39A5AD] transition-all text-slate-800 placeholder-slate-400"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Corporate Email Address</label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="m.thorne@enterprise.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-[#39A5AD] focus:ring-1 focus:ring-[#39A5AD] transition-all text-slate-800 placeholder-slate-400"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">operational requirements</label>
                  <textarea
                    rows={4}
                    required
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="We require custom Azure AD SSO integration and 250 seat capacity tracking..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-[#39A5AD] focus:ring-1 focus:ring-[#39A5AD] transition-all text-slate-800 placeholder-slate-400"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#39A5AD] hover:bg-[#2D8E95] text-white font-extrabold text-xs py-3 rounded-xl shadow-md shadow-[#39A5AD]/10 transition-all cursor-pointer"
                >
                  Dispatch Security Ticket
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#39A5AD] flex items-center justify-center text-white">
                <Layers className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-sm text-slate-900 tracking-tight">AssetFlow Enterprise</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-400">
              High-fidelity enterprise inventory, asset lifecycle ledgers, and automated budget verification systems.
            </p>
          </div>

          <div>
            <h4 className="font-extrabold text-slate-900 mb-3.5 uppercase tracking-wider text-[10px]">Product Matrix</h4>
            <ul className="space-y-2">
              <li><button onClick={onLaunchConsole} className="hover:text-[#39A5AD] cursor-pointer text-left">Central Analytics Console</button></li>
              <li><button onClick={onLaunchConsole} className="hover:text-[#39A5AD] cursor-pointer text-left">Real-Time Database Ledger</button></li>
              <li><button onClick={onLaunchConsole} className="hover:text-[#39A5AD] cursor-pointer text-left">Budget Limitation Signoff</button></li>
              <li><button onClick={onLaunchConsole} className="hover:text-[#39A5AD] cursor-pointer text-left">SRE Runout Forecasting</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-extrabold text-slate-900 mb-3.5 uppercase tracking-wider text-[10px]">Trust & Compliance</h4>
            <ul className="space-y-2">
              <li><a href="#faq" className="hover:text-[#39A5AD]">SOC2 Compliance Cert</a></li>
              <li><a href="#faq" className="hover:text-[#39A5AD]">GDPR Data Sovereignty</a></li>
              <li><a href="#faq" className="hover:text-[#39A5AD]">Multi-tenant isolation rules</a></li>
              <li><a href="#faq" className="hover:text-[#39A5AD]">EIMS API Developer SLA</a></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[10px]">Inbound Ledger Alerts</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">Subscribe to quarterly security updates and ledger blueprints.</p>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="ops@company.com" 
                className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-[11px] outline-none w-full focus:border-[#39A5AD]"
              />
              <button 
                onClick={() => triggerToast("Registered in subscription channel.", "success")}
                className="bg-slate-900 text-white font-extrabold px-3 py-1.5 rounded-lg text-[10px] cursor-pointer"
              >
                Join
              </button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 pt-8 mt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-400 text-[11px]">
          <span>© 2026 AssetFlow Enterprise Solutions. All rights reserved globally.</span>
          <div className="flex gap-4">
            <a href="#faq" className="hover:underline">Privacy Charter</a>
            <a href="#faq" className="hover:underline">System Terms</a>
            <a href="#faq" className="hover:underline">Contact SRE</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
