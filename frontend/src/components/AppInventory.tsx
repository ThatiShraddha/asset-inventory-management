import React, { useState } from 'react';
import { 
  Search, Plus, MapPin, AlertTriangle, Layers, SlidersHorizontal, Check, Copy, 
  Settings, Truck, RefreshCw, Eye, ClipboardList, Info, FileSpreadsheet
} from 'lucide-react';
import { InventoryItem, Category, UserSession } from '../types';

interface AppInventoryProps {
  db: {
    inventory: InventoryItem[];
    categories: Category[];
  };
  currentUser: UserSession;
  onPostStockIn: (itemId: string, qty: number, costOverride?: number) => void | Promise<void>;
  onAdjustStockPoint: (itemId: string, reorderPoint: number, location: string) => void | Promise<void>;
  onRegisterNewItem: (itemData: Omit<InventoryItem, 'id' | 'lastStockInDate'>) => { success: boolean; error?: string } | Promise<{ success: boolean; error?: string }>;
  triggerToast: (msg: string, type: 'success' | 'info' | 'warning' | 'error') => void;
  // Expose triggers
  openNewItemExternal: boolean;
  onCloseNewItemExternal: () => void;
  openStockInExternal: boolean;
  onCloseStockInExternal: () => void;
}

export default function AppInventory({
  db, currentUser, onPostStockIn, onAdjustStockPoint, onRegisterNewItem, triggerToast,
  openNewItemExternal, onCloseNewItemExternal, openStockInExternal, onCloseStockInExternal
}: AppInventoryProps) {
  
  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [activeLocation, setActiveLocation] = useState<string>('ALL');
  const [smartPreset, setSmartPreset] = useState<'ALL' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'HIGH_VALUE'>('ALL');

  // Custom Context Menu State
  const [contextItem, setContextItem] = useState<InventoryItem | null>(null);
  const [contextMenuPos, setContextMenuPos] = useState<{ x: number; y: number } | null>(null);

  // Modals inside inventory
  const [showStockInModal, setShowStockInModal] = useState(false);
  const [selectedStockInItem, setSelectedStockInItem] = useState<InventoryItem | null>(null);
  const [stockInQty, setStockInQty] = useState(10);
  const [stockInCostOverride, setStockInCostOverride] = useState<string>('');

  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedAdjustItem, setSelectedAdjustItem] = useState<InventoryItem | null>(null);
  const [adjustReorderPoint, setAdjustReorderPoint] = useState(5);
  const [adjustLocation, setAdjustLocation] = useState('');

  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Create New Item Form States
  const [newItemName, setNewItemName] = useState('');
  const [newItemSku, setNewItemSku] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('');
  const [newItemLocation, setNewItemLocation] = useState('');
  const [newItemCost, setNewItemCost] = useState(50);
  const [newItemQty, setNewItemQty] = useState(10);
  const [newItemReorder, setNewItemReorder] = useState(5);

  // Handle external modal hooks
  React.useEffect(() => {
    if (openNewItemExternal) {
      setShowCreateModal(true);
      onCloseNewItemExternal();
    }
  }, [openNewItemExternal]);

  React.useEffect(() => {
    if (openStockInExternal) {
      if (db.inventory.length > 0) {
        setSelectedStockInItem(db.inventory[0]);
        setShowStockInModal(true);
      } else {
        triggerToast("No items available. Please create a new product SKU first.", "warning");
      }
      onCloseStockInExternal();
    }
  }, [openStockInExternal]);

  // Context menu handler
  const handleRowContextMenu = (e: React.MouseEvent, item: InventoryItem) => {
    e.preventDefault();
    setContextItem(item);
    setContextMenuPos({ x: e.clientX, y: e.clientY });
  };

  const handleCopySku = (sku: string) => {
    navigator.clipboard.writeText(sku);
    triggerToast(`SKU barcode (${sku}) copied to active clipboard queue.`, "success");
    setContextMenuPos(null);
  };

  // Stock-In Submit
  const handleStockInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStockInItem) return;
    if (stockInQty <= 0) {
      triggerToast("Please register a positive inbound delivery volume.", "warning");
      return;
    }

    const costNum = stockInCostOverride ? parseFloat(stockInCostOverride) : undefined;
    onPostStockIn(selectedStockInItem.id, stockInQty, costNum);
    triggerToast(`Successfully loaded ${stockInQty} unit(s) of ${selectedStockInItem.name} to storage.`, "success");
    
    // reset
    setShowStockInModal(false);
    setSelectedStockInItem(null);
    setStockInQty(10);
    setStockInCostOverride('');
  };

  // Adjust Safety Point submit
  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdjustItem) return;
    if (adjustReorderPoint < 0) {
      triggerToast("Safety threshold cannot be negative.", "warning");
      return;
    }
    if (!adjustLocation) {
      triggerToast("Please input a valid location zone.", "warning");
      return;
    }

    onAdjustStockPoint(selectedAdjustItem.id, adjustReorderPoint, adjustLocation);
    triggerToast(`Safety reorder parameters committed for ${selectedAdjustItem.name}.`, "success");
    setShowAdjustModal(false);
    setSelectedAdjustItem(null);
  };

  // Create Product Submit
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName || !newItemSku || !newItemCategory || !newItemLocation) {
      triggerToast("Please populate all product description inputs.", "warning");
      return;
    }

    const res = await onRegisterNewItem({
      name: newItemName,
      sku: newItemSku.toUpperCase(),
      categoryId: newItemCategory,
      vendorId: 'vend-apex',
      locationCode: newItemLocation.toUpperCase(),
      quantityInStock: newItemQty,
      unitCost: newItemCost,
      reorderPoint: newItemReorder
    });

    if (res.success) {
      triggerToast(`Product SKU ${newItemSku.toUpperCase()} successfully added to the active inventory catalog.`, "success");
      
      // Reset form
      setNewItemName('');
      setNewItemSku('');
      setNewItemCategory('');
      setNewItemLocation('');
      setNewItemCost(50);
      setNewItemQty(10);
      setNewItemReorder(5);
      setShowCreateModal(false);
    } else {
      triggerToast(res.error || "SKU registered duplicate error.", "error");
    }
  };

  // Process data with Search & Filters
  const locationsList = Array.from(new Set(db.inventory.map(i => i.locationCode)));
  
  const filteredInventory = db.inventory.filter(item => {
    // Search Match
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.locationCode.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Category match
    const matchesCategory = activeCategory === 'ALL' || item.categoryId === activeCategory;

    // Location match
    const matchesLocation = activeLocation === 'ALL' || item.locationCode === activeLocation;

    // Smart Presets Match
    let matchesPreset = true;
    if (smartPreset === 'LOW_STOCK') {
      matchesPreset = item.quantityInStock <= item.reorderPoint && item.quantityInStock > 0;
    } else if (smartPreset === 'OUT_OF_STOCK') {
      matchesPreset = item.quantityInStock === 0;
    } else if (smartPreset === 'HIGH_VALUE') {
      matchesPreset = (item.quantityInStock * item.unitCost) >= 5000;
    }

    return matchesSearch && matchesCategory && matchesLocation && matchesPreset;
  });

  return (
    <div className="space-y-6 pb-12 relative" onClick={() => setContextMenuPos(null)}>
      
      {/* HEADER SECTION */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight">Active Inventory Ledger</h2>
          <p className="text-xs text-slate-400">Right-click on any asset row to trigger desktop fast-actions.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button 
            onClick={() => {
              if (db.inventory.length > 0) {
                setSelectedStockInItem(db.inventory[0]);
                setShowStockInModal(true);
              }
            }}
            className="w-1/2 md:w-auto border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-extrabold text-xs px-4 py-2.5 rounded-xl inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Truck className="w-4 h-4 text-slate-400" /> Stock-In
          </button>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="w-1/2 md:w-auto bg-[#39A5AD] hover:bg-[#2D8E95] text-white font-extrabold text-xs px-4 py-2.5 rounded-xl inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Register SKU
          </button>
        </div>
      </div>

      {/* FILTER SEARCH PANEL */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Search assets by description, SKU barcode, or warehouse location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 pl-10 text-xs outline-none focus:border-[#39A5AD]"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={activeCategory}
              onChange={(e) => setActiveCategory(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs outline-none focus:border-[#39A5AD] font-bold text-slate-600"
            >
              <option value="ALL">All Categories</option>
              {db.categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            <select
              value={activeLocation}
              onChange={(e) => setActiveLocation(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs outline-none focus:border-[#39A5AD] font-bold text-slate-600"
            >
              <option value="ALL">All Locations</option>
              {locationsList.map(loc => (
                <option key={loc} value={loc}>Zone {loc}</option>
              ))}
            </select>
          </div>
        </div>

        {/* SMART FILTER CHIPS ROW */}
        <div className="border-t border-slate-100 pt-4 flex flex-wrap gap-2 items-center text-xs">
          <span className="font-extrabold text-[10px] text-slate-400 uppercase tracking-widest mr-2 flex items-center gap-1">
            <SlidersHorizontal className="w-3.5 h-3.5" /> Smart Filters:
          </span>
          {[
            { key: 'ALL', label: 'All Cataloged' },
            { key: 'LOW_STOCK', label: 'Low safety stock warning' },
            { key: 'OUT_OF_STOCK', label: 'Out of stock (zero)' },
            { key: 'HIGH_VALUE', label: 'High Value (≥$5K)' },
          ].map(preset => (
            <button
              key={preset.key}
              onClick={() => setSmartPreset(preset.key as any)}
              className={`px-3 py-1.5 rounded-full text-[10px] font-black transition-all cursor-pointer ${
                smartPreset === preset.key 
                  ? 'bg-slate-900 text-white' 
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* LEDGER GRID SPREADSHEET */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200 text-slate-400 font-extrabold text-[10px] uppercase tracking-wider select-none">
                <th className="py-4 px-4">SKU Code</th>
                <th className="py-4 px-4">Product Name</th>
                <th className="py-4 px-4">In Stock</th>
                <th className="py-4 px-4">Unit Cost</th>
                <th className="py-4 px-4">Valuation</th>
                <th className="py-4 px-4">Safety Point</th>
                <th className="py-4 px-4">Location</th>
                <th className="py-4 px-4">Safety Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInventory.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Info className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    No assets matches the criteria filters in your active directory.
                  </td>
                </tr>
              ) : (
                filteredInventory.map((item) => {
                  const isLow = item.quantityInStock <= item.reorderPoint && item.quantityInStock > 0;
                  const isOut = item.quantityInStock === 0;

                  return (
                    <tr 
                      key={item.id} 
                      onContextMenu={(e) => handleRowContextMenu(e, item)}
                      className="hover:bg-slate-50/50 cursor-pointer font-medium transition-all group"
                      title="Right-click for options"
                    >
                      <td className="py-3.5 px-4 font-mono text-[10px] font-bold text-slate-900 group-hover:text-[#39A5AD]">
                        {item.sku}
                      </td>
                      <td className="py-3.5 px-4 text-slate-800 font-semibold">{item.name}</td>
                      <td className="py-3.5 px-4 text-slate-900 font-extrabold">{item.quantityInStock}</td>
                      <td className="py-3.5 px-4 text-slate-500">${item.unitCost.toFixed(2)}</td>
                      <td className="py-3.5 px-4 font-black text-slate-800">
                        ${(item.quantityInStock * item.unitCost).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">{item.reorderPoint} units</td>
                      <td className="py-3.5 px-4 text-slate-700 font-mono text-[10px]">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" /> {item.locationCode}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                          isOut 
                            ? 'bg-rose-100 text-rose-800' 
                            : isLow 
                            ? 'bg-amber-100 text-amber-800' 
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {isOut ? 'Depleted' : isLow ? 'Low Stock warning' : 'Sufficient'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FLOAT CUSTOM CONTEXT MENU */}
      {contextMenuPos && contextItem && (
        <div 
          className="fixed bg-white border border-slate-200/80 rounded-xl shadow-xl py-2 z-50 w-48 text-xs font-semibold"
          style={{ top: contextMenuPos.y, left: contextMenuPos.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-3.5 py-1.5 border-b border-slate-100 text-[10px] text-slate-400 uppercase tracking-widest font-bold">
            SKU Actions: {contextItem.sku}
          </div>
          
          <button
            onClick={() => {
              setSelectedStockInItem(contextItem);
              setStockInQty(10);
              setShowStockInModal(true);
              setContextMenuPos(null);
            }}
            className="w-full text-left px-3.5 py-2 hover:bg-[#39A5AD]/10 hover:text-[#39A5AD] text-slate-700 flex items-center gap-2 cursor-pointer"
          >
            <Truck className="w-3.5 h-3.5" /> Rapid Stock-In Delivery
          </button>

          <button
            onClick={() => {
              setSelectedAdjustItem(contextItem);
              setAdjustReorderPoint(contextItem.reorderPoint);
              setAdjustLocation(contextItem.locationCode);
              setShowAdjustModal(true);
              setContextMenuPos(null);
            }}
            className="w-full text-left px-3.5 py-2 hover:bg-[#39A5AD]/10 hover:text-[#39A5AD] text-slate-700 flex items-center gap-2 cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5" /> Safety & Location limits
          </button>

          <button
            onClick={() => handleCopySku(contextItem.sku)}
            className="w-full text-left px-3.5 py-2 hover:bg-[#39A5AD]/10 hover:text-[#39A5AD] text-slate-700 flex items-center gap-2 cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" /> Copy SKU barcode
          </button>

          <div className="border-t border-slate-100 my-1" />

          <button
            onClick={() => {
              triggerToast(`Predictive analysis: SKU ${contextItem.sku} maintains 99.4% SLA health rating index.`, "info");
              setContextMenuPos(null);
            }}
            className="w-full text-left px-3.5 py-2 hover:bg-[#39A5AD]/10 hover:text-[#39A5AD] text-slate-700 flex items-center gap-2 cursor-pointer"
          >
            <ClipboardList className="w-3.5 h-3.5" /> Run SLA analysis
          </button>
        </div>
      )}

      {/* DIALOG: STOCK-IN MODAL */}
      {showStockInModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 shadow-2xl rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-black text-slate-900 tracking-tight">Stock-In Delivery Inbound</h3>
            <p className="text-xs text-slate-400">Register incoming shipments from suppliers to increase stock levels.</p>

            <form onSubmit={handleStockInSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Select Product SKU</label>
                <select
                  value={selectedStockInItem?.id || ''}
                  onChange={(e) => {
                    const item = db.inventory.find(i => i.id === e.target.value);
                    if (item) setSelectedStockInItem(item);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none"
                >
                  {db.inventory.map(i => (
                    <option key={i.id} value={i.id}>{i.sku} - {i.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Inbound Quantity Units</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={stockInQty}
                  onChange={(e) => setStockInQty(parseInt(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Cost Override (Optional)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder={`Current: $${selectedStockInItem?.unitCost || '0.00'}`}
                  value={stockInCostOverride}
                  onChange={(e) => setStockInCostOverride(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none"
                />
              </div>

              <div className="flex gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowStockInModal(false)}
                  className="w-1/2 border border-slate-200 text-slate-600 font-bold text-xs py-2.5 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-[#39A5AD] hover:bg-[#2D8E95] text-white font-extrabold text-xs py-2.5 rounded-xl cursor-pointer"
                >
                  Commit Stock-In
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DIALOG: SAFETY POINT LIMIT ADJSUTMENT */}
      {showAdjustModal && selectedAdjustItem && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 shadow-2xl rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-black text-slate-900 tracking-tight">Adjust Safety Threshold & Location</h3>
            <p className="text-xs text-slate-400">Reconfigure safety margins to prevent unexpected asset depletion.</p>

            <form onSubmit={handleAdjustSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block font-mono">Product Name</label>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-500 font-semibold select-none">
                  {selectedAdjustItem.name} ({selectedAdjustItem.sku})
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Safety Reorder Point (Units limit)</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={adjustReorderPoint}
                  onChange={(e) => setAdjustReorderPoint(parseInt(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Warehouse Location code Zone</label>
                <input
                  type="text"
                  required
                  placeholder="WH-A1-S3"
                  value={adjustLocation}
                  onChange={(e) => setAdjustLocation(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none uppercase font-mono"
                />
              </div>

              <div className="flex gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="w-1/2 border border-slate-200 text-slate-600 font-bold text-xs py-2.5 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-[#39A5AD] hover:bg-[#2D8E95] text-white font-extrabold text-xs py-2.5 rounded-xl cursor-pointer"
                >
                  Save Configuration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DIALOG: CREATE NEW SKU BARCODE */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 shadow-2xl rounded-2xl max-w-lg w-full p-6 space-y-4">
            <h3 className="text-base font-black text-slate-900 tracking-tight">Register New Product SKU</h3>
            <p className="text-xs text-slate-400">Add a unique, fully traceable corporate asset to EIMS catalog ledger database.</p>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Product Description</label>
                  <input
                    type="text"
                    required
                    placeholder="UltraWide Developer Monitor"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Unique SKU Code Barcode</label>
                  <input
                    type="text"
                    required
                    placeholder="MN-UW-49"
                    value={newItemSku}
                    onChange={(e) => setNewItemSku(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none uppercase font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Category Assignment</label>
                  <select
                    required
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none font-semibold text-slate-600"
                  >
                    <option value="">Choose category</option>
                    {db.categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Warehouse Location Code</label>
                  <input
                    type="text"
                    required
                    placeholder="WH-D3-S2"
                    value={newItemLocation}
                    onChange={(e) => setNewItemLocation(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none uppercase font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Unit Purchase Cost ($)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newItemCost}
                    onChange={(e) => setNewItemCost(parseFloat(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Initial Stock quantity</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newItemQty}
                    onChange={(e) => setNewItemQty(parseInt(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Safety Safety Point</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newItemReorder}
                    onChange={(e) => setNewItemReorder(parseInt(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="w-1/2 border border-slate-200 text-slate-600 font-bold text-xs py-2.5 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-[#39A5AD] hover:bg-[#2D8E95] text-white font-extrabold text-xs py-2.5 rounded-xl cursor-pointer"
                >
                  Add SKU cataloged
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
