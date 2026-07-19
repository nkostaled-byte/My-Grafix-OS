import React, { useState } from 'react';
import { 
  Plus, Search, Filter, Edit2, Trash2, SlidersHorizontal, 
  AlertTriangle, Check, RefreshCw, Layers, DollarSign, Barcode
} from 'lucide-react';
import { db, supabase, isSupabaseConfigured, workerBaseUrl } from '../lib/supabase';
import { Client, Product } from '../types';

interface ProductsViewProps {
  client: Client;
  onRefreshMetrics?: () => void;
}

export default function ProductsView({ client, onRefreshMetrics }: ProductsViewProps) {
  const [products, setProducts] = useState<Product[]>(() => db.getProducts(client.id));
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStockFilter, setSelectedStockFilter] = useState<string>('All');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // New product form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Styling');
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [price, setPrice] = useState(10.00);
  const [costPrice, setCostPrice] = useState(4.00);
  const [stockQty, setStockQty] = useState(25);
  const [lowStockWarning, setLowStockWarning] = useState(5);
  const [variantsText, setVariantsText] = useState('');

  // Image Upload Form States
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');

  // Extract unique categories for filters
  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  // Calculated values
  const profitMargin = price > 0 ? Math.round(((price - costPrice) / price) * 100) : 0;

  // Search & Filter items
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          p.sku.toLowerCase().includes(search.toLowerCase()) || 
                          (p.barcode && p.barcode.includes(search));
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    
    let matchesStock = true;
    if (selectedStockFilter === 'low') {
      matchesStock = p.stock_qty <= p.low_stock_warning && p.stock_qty > 0;
    } else if (selectedStockFilter === 'out') {
      matchesStock = p.stock_qty === 0;
    } else if (selectedStockFilter === 'normal') {
      matchesStock = p.stock_qty > p.low_stock_warning;
    }

    return matchesSearch && matchesCategory && matchesStock;
  });

  const handleFileUpload = async (file: File) => {
    // 1. Client-side validation: Max 5MB, allowed types: PNG, JPEG, WEBP, GIF
    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Invalid file format. Please upload a PNG, JPEG, WEBP or GIF.');
      return;
    }
    const maxBytes = 5 * 1024 * 1024; // 5MB
    if (file.size > maxBytes) {
      setUploadError('File size is too large. Maximum size allowed is 5MB.');
      return;
    }

    setUploading(true);
    setUploadError('');
    setUploadProgress(10);

    try {
      // Fetch current session access token if Supabase is active
      let token = '';
      if (isSupabaseConfigured && supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        token = session?.access_token || '';
      } else {
        // Simulation mode mock token
        const payload = { sub: 'user-mock-123', email: 'business.founder@google.com' };
        const base64Payload = btoa(JSON.stringify(payload));
        token = `mockHeader.${base64Payload}.mockSignature`;
      }

      setUploadProgress(30);

      const arrayBuffer = await file.arrayBuffer();
      setUploadProgress(55);

      const response = await fetch(`${workerBaseUrl}/api/upload?folder=products`, {
        method: 'POST',
        headers: {
          'Content-Type': file.type,
          'Authorization': `Bearer ${token}`
        },
        body: arrayBuffer
      });

      setUploadProgress(85);

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || 'Upload failed');
      }

      const result = await response.json();
      if (result.success && result.url) {
        setUploadedImageUrl(result.url);
        setPreviewUrl(result.url);
        setUploadProgress(100);
      } else {
        throw new Error(result.error || 'Invalid server response structure');
      }
    } catch (err: any) {
      console.error('Error uploading image:', err);
      setUploadError(err.message || 'Image upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !sku) return;

    const variants = variantsText.split(',').map(v => v.trim()).filter(Boolean);

    // If upload succeeds, insert the product row with returned image_url, otherwise null
    const finalImageUrl = uploadedImageUrl || null;

    const newProd = db.createProduct(client.id, {
      name,
      category,
      sku,
      barcode: barcode || undefined,
      price: Number(price),
      cost_price: Number(costPrice),
      stock_qty: Number(stockQty),
      low_stock_warning: Number(lowStockWarning),
      variants: variants.length > 0 ? variants : undefined,
      image_url: finalImageUrl
    });

    setProducts(db.getProducts(client.id));
    setIsAddOpen(false);
    resetForm();
    onRefreshMetrics?.();
  };

  const handleUpdateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const variants = variantsText.split(',').map(v => v.trim()).filter(Boolean);

    // Maintain existing or update with new
    const finalImageUrl = uploadedImageUrl || editingProduct.image_url || null;

    db.updateProduct(editingProduct.id, {
      name,
      category,
      sku,
      barcode: barcode || undefined,
      price: Number(price),
      cost_price: Number(costPrice),
      stock_qty: Number(stockQty),
      low_stock_warning: Number(lowStockWarning),
      variants: variants.length > 0 ? variants : undefined,
      image_url: finalImageUrl
    });

    setProducts(db.getProducts(client.id));
    setEditingProduct(null);
    resetForm();
    onRefreshMetrics?.();
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm('Are you sure you want to remove this product from the inventory catalogue?')) {
      db.deleteProduct(id);
      setProducts(db.getProducts(client.id));
      onRefreshMetrics?.();
    }
  };

  const resetForm = () => {
    setName('');
    setCategory('Styling');
    setSku('');
    setBarcode('');
    setPrice(10);
    setCostPrice(4);
    setStockQty(25);
    setLowStockWarning(5);
    setVariantsText('');
    setUploadedImageUrl('');
    setPreviewUrl('');
    setUploadProgress(0);
    setUploadError('');
  };

  const triggerEdit = (prod: Product) => {
    setEditingProduct(prod);
    setName(prod.name);
    setCategory(prod.category);
    setSku(prod.sku);
    setBarcode(prod.barcode || '');
    setPrice(prod.price);
    setCostPrice(prod.cost_price);
    setStockQty(prod.stock_qty);
    setLowStockWarning(prod.low_stock_warning);
    setVariantsText(prod.variants?.join(', ') || '');
    setUploadedImageUrl(prod.image_url || '');
    setPreviewUrl(prod.image_url || '');
    setUploadError('');
  };

  return (
    <div className="space-y-6 animate-fade-in" id="products-view-container">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-medium tracking-tight text-gray-900">Product Catalog & Inventory</h1>
          <p className="text-xs text-gray-500 mt-1">Manage unified products, stock capacities, barcodes, and profit margin analysis.</p>
        </div>
        <button 
          id="add-product-btn"
          onClick={() => { resetForm(); setIsAddOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-semibold transition-all shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by product name, SKU, barcode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-xs placeholder-gray-400 focus:outline-none focus:bg-white focus:border-gray-200 transition-all text-gray-800"
          />
        </div>
        <div className="flex flex-wrap gap-2.5">
          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
            <Layers className="w-3.5 h-3.5 text-gray-400" />
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent text-xs text-gray-600 focus:outline-none font-medium cursor-pointer"
            >
              <option value="All">All Categories</option>
              {categories.filter(c => c !== 'All').map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
            <SlidersHorizontal className="w-3.5 h-3.5 text-gray-400" />
            <select 
              value={selectedStockFilter} 
              onChange={(e) => setSelectedStockFilter(e.target.value)}
              className="bg-transparent text-xs text-gray-600 focus:outline-none font-medium cursor-pointer"
            >
              <option value="All">All Stock Levels</option>
              <option value="normal">Normal Stock</option>
              <option value="low">Low Stock Warning</option>
              <option value="out">Out of Stock</option>
            </select>
          </div>
        </div>
      </div>

      {/* Inventory Table Card */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-50 bg-gray-50/50">
                <th className="py-3 px-5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider font-mono">Product Item</th>
                <th className="py-3 px-4 text-[10px] font-semibold text-gray-400 uppercase tracking-wider font-mono">SKU / Barcode</th>
                <th className="py-3 px-4 text-[10px] font-semibold text-gray-400 uppercase tracking-wider font-mono">Category</th>
                <th className="py-3 px-4 text-[10px] font-semibold text-gray-400 uppercase tracking-wider font-mono text-right">Price</th>
                <th className="py-3 px-4 text-[10px] font-semibold text-gray-400 uppercase tracking-wider font-mono text-right">Cost</th>
                <th className="py-3 px-4 text-[10px] font-semibold text-gray-400 uppercase tracking-wider font-mono text-right">Margin</th>
                <th className="py-3 px-4 text-[10px] font-semibold text-gray-400 uppercase tracking-wider font-mono text-center">Stock Level</th>
                <th className="py-3 px-5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider font-mono text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center">
                    <AlertTriangle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-xs font-medium text-gray-500">No products match the selected criteria</p>
                    <p className="text-[10px] text-gray-400 mt-1">Try resetting the keyword search or categories filters.</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const margin = p.price > 0 ? Math.round(((p.price - p.cost_price) / p.price) * 100) : 0;
                  const isLow = p.stock_qty <= p.low_stock_warning && p.stock_qty > 0;
                  const isOut = p.stock_qty === 0;

                  return (
                    <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <img 
                            src={p.image_url} 
                            alt={p.name} 
                            className="w-10 h-10 rounded-lg object-cover border border-gray-100 bg-gray-50"
                          />
                          <div>
                            <span className="text-xs font-semibold text-gray-900 block">{p.name}</span>
                            {p.variants && p.variants.length > 0 && (
                              <div className="flex gap-1.5 mt-1">
                                {p.variants.map((v, idx) => (
                                  <span key={idx} className="bg-gray-100 text-[9px] text-gray-500 px-1 py-0.2 rounded font-sans">{v}</span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-mono text-xs text-gray-500">
                        <span className="block font-semibold text-gray-700">{p.sku}</span>
                        {p.barcode && <span className="text-[9px] text-gray-400 flex items-center gap-1 mt-0.5"><Barcode className="w-3 h-3" /> {p.barcode}</span>}
                      </td>
                      <td className="py-4 px-4">
                        <span className="bg-gray-50 text-[10px] text-gray-600 border border-gray-100 px-2 py-0.5 rounded-full font-medium">
                          {p.category}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right font-mono text-xs font-semibold text-gray-900">
                        R{p.price.toFixed(2)}
                      </td>
                      <td className="py-4 px-4 text-right font-mono text-xs text-gray-500">
                        R{p.cost_price.toFixed(2)}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className={`font-mono text-xs font-medium px-2 py-0.5 rounded-md ${margin >= 60 ? 'text-emerald-700 bg-emerald-50' : 'text-gray-700 bg-gray-50'}`}>
                          {margin}%
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className={`font-mono text-xs font-semibold px-2 py-0.5 rounded-full ${
                            isOut ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                            isLow ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                            'bg-emerald-50 text-emerald-600 border border-emerald-100'
                          }`}>
                            {p.stock_qty} available
                          </span>
                          {isOut && <span className="text-[9px] text-rose-500 font-sans font-medium mt-1">Out of Stock</span>}
                          {isLow && <span className="text-[9px] text-amber-500 font-sans font-medium mt-1">Low Stock Warning</span>}
                        </div>
                      </td>
                      <td className="py-4 px-5 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button 
                            onClick={() => triggerEdit(p)}
                            className="p-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg transition-colors border border-gray-100"
                            title="Edit Product"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors border border-rose-100"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drawer Dialog for Adding or Editing Product */}
      {(isAddOpen || editingProduct) && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-2xl w-full max-w-lg overflow-hidden animate-slide-up">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <h3 className="text-sm font-semibold text-gray-900">
                {editingProduct ? `Edit Catalog Details: ${editingProduct.name}` : 'Onboard New Product Asset'}
              </h3>
              <button 
                onClick={() => { setIsAddOpen(false); setEditingProduct(null); }}
                className="text-gray-400 hover:text-gray-600 text-xs font-semibold px-2 py-1 rounded-md"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-[10px] uppercase font-mono tracking-wider font-semibold text-gray-400 block mb-1">Product Title *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Classic Hair Clay Wax"
                    value={name} 
                    onChange={e => setName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg bg-gray-50/50 focus:outline-none focus:bg-white focus:border-gray-300"
                  />
                </div>

                {/* Drag-and-drop & Manual Click Image Upload Section */}
                <div className="col-span-2">
                  <label className="text-[10px] uppercase font-mono tracking-wider font-semibold text-gray-400 block mb-1.5">Product Asset Image (Max 5MB)</label>
                  <div 
                    className={`border border-dashed rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all ${
                      previewUrl ? 'border-gray-200 bg-gray-50/50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/30'
                    }`}
                    onDragOver={(e) => { e.preventDefault(); }}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        handleFileUpload(e.dataTransfer.files[0]);
                      }
                    }}
                    onClick={() => {
                      const fileInput = document.getElementById('product-image-file-input');
                      if (fileInput) fileInput.click();
                    }}
                  >
                    <input 
                      type="file" 
                      id="product-image-file-input" 
                      className="hidden" 
                      accept=".png,.jpg,.jpeg,.webp,.gif"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileUpload(e.target.files[0]);
                        }
                      }}
                    />

                    {previewUrl ? (
                      <div className="flex items-center gap-4 w-full">
                        <img 
                          src={previewUrl} 
                          alt="Product preview" 
                          className="w-16 h-16 rounded-lg object-cover border border-gray-100 bg-white"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-semibold text-gray-800 block truncate">Image uploaded successfully</span>
                          <span className="text-[10px] text-gray-400 block mt-0.5">Click or drag another image to replace</span>
                        </div>
                        <button 
                          type="button" 
                          onClick={(e) => {
                            e.stopPropagation();
                            setUploadedImageUrl('');
                            setPreviewUrl('');
                          }}
                          className="text-[10px] text-rose-500 font-semibold hover:text-rose-700 px-2 py-1 rounded bg-rose-50/50 hover:bg-rose-50 border border-rose-100/50 transition-all"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="text-center py-2">
                        {uploading ? (
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
                            <span className="text-[11px] font-semibold text-gray-600 block">Uploading asset... {uploadProgress}%</span>
                          </div>
                        ) : (
                          <>
                            <div className="mx-auto w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 mb-2">
                              <Plus className="w-4 h-4 text-gray-500" />
                            </div>
                            <span className="text-xs font-semibold text-gray-800 block">Drag & drop or click to upload</span>
                            <span className="text-[10px] text-gray-400 block mt-1">PNG, JPEG, WEBP, GIF (Max 5MB)</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  {uploadError && (
                    <span className="text-[10px] text-rose-600 font-semibold mt-1.5 block">{uploadError}</span>
                  )}
                </div>

                <div>
                  <label className="text-[10px] uppercase font-mono tracking-wider font-semibold text-gray-400 block mb-1">Category Group *</label>
                  <select 
                    value={category} 
                    onChange={e => setCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg bg-gray-50/50 focus:outline-none focus:bg-white focus:border-gray-300"
                  >
                    <option value="Styling">Styling</option>
                    <option value="Beard Care">Beard Care</option>
                    <option value="Shaving">Shaving</option>
                    <option value="Coffee Beans">Coffee Beans</option>
                    <option value="Materials">Materials</option>
                    <option value="Adhesives">Adhesives</option>
                    <option value="Grooming Tool">Grooming Tool</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-mono tracking-wider font-semibold text-gray-400 block mb-1">SKU identifier *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="POM-SL-01"
                    value={sku} 
                    onChange={e => setSku(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono border border-gray-200 rounded-lg bg-gray-50/50 focus:outline-none focus:bg-white focus:border-gray-300"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-mono tracking-wider font-semibold text-gray-400 block mb-1">EAN / Barcode (Optional)</label>
                  <input 
                    type="text" 
                    placeholder="501234567890"
                    value={barcode} 
                    onChange={e => setBarcode(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono border border-gray-200 rounded-lg bg-gray-50/50 focus:outline-none focus:bg-white focus:border-gray-300"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-mono tracking-wider font-semibold text-gray-400 block mb-1">Retail Price (R) *</label>
                  <input 
                    type="number" 
                    step="0.01"
                    required
                    value={price} 
                    onChange={e => setPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs font-mono border border-gray-200 rounded-lg bg-gray-50/50 focus:outline-none focus:bg-white focus:border-gray-300"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-mono tracking-wider font-semibold text-gray-400 block mb-1">Unit Cost Price (R)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={costPrice} 
                    onChange={e => setCostPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs font-mono border border-gray-200 rounded-lg bg-gray-50/50 focus:outline-none focus:bg-white focus:border-gray-300"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-mono tracking-wider font-semibold text-gray-400 block mb-1">Initial Stock Level *</label>
                  <input 
                    type="number" 
                    required
                    value={stockQty} 
                    onChange={e => setStockQty(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs font-mono border border-gray-200 rounded-lg bg-gray-50/50 focus:outline-none focus:bg-white focus:border-gray-300"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-mono tracking-wider font-semibold text-gray-400 block mb-1">Low Stock Threshold</label>
                  <input 
                    type="number" 
                    value={lowStockWarning} 
                    onChange={e => setLowStockWarning(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs font-mono border border-gray-200 rounded-lg bg-gray-50/50 focus:outline-none focus:bg-white focus:border-gray-300"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-[10px] uppercase font-mono tracking-wider font-semibold text-gray-400 block mb-1">Variants (Comma separated)</label>
                  <input 
                    type="text" 
                    placeholder="Small, Medium, Large, 100ml"
                    value={variantsText} 
                    onChange={e => setVariantsText(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg bg-gray-50/50 focus:outline-none focus:bg-white focus:border-gray-300"
                  />
                </div>
              </div>

              {/* Profit Margin Preview Card */}
              <div className="p-3 bg-gray-50 rounded-xl flex items-center justify-between border border-gray-100 text-xs">
                <span className="text-gray-500 font-medium">Automatic Gross Profit Margin:</span>
                <span className={`font-mono font-semibold px-2 py-0.5 rounded ${profitMargin >= 60 ? 'text-emerald-700 bg-emerald-100/50' : 'text-gray-700 bg-gray-200/50'}`}>
                  {profitMargin}% Gross Profit
                </span>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button 
                  type="button" 
                  onClick={() => { setIsAddOpen(false); setEditingProduct(null); }}
                  className="px-4 py-2 text-xs font-semibold text-gray-500 border border-gray-200 hover:bg-gray-50 rounded-lg"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 text-xs font-semibold bg-gray-900 hover:bg-gray-800 text-white rounded-lg shadow-xs"
                >
                  {editingProduct ? 'Save Changes' : 'Confirm & Register'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
