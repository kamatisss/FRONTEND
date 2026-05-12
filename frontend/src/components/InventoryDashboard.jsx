import React, { useState, useEffect } from 'react';
import { getInventoryItems, createInventoryItem, updateInventoryItem, deleteInventoryItem } from '../services/api';
import { Package, Plus, Edit, Trash2, AlertTriangle, X } from 'lucide-react';

export default function InventoryDashboard() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    category: 'plant',
    description: '',
    stock_quantity: 0,
    unit_price: '',
    model_path: '',
    image_url: ''
  });

  const fetchItems = async () => {
    setLoading(true);
    try {
      const data = await getInventoryItems();
      setItems(data);
    } catch (err) {
      console.error('Failed to fetch inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const openModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        category: item.category,
        description: item.description,
        stock_quantity: item.stock_quantity,
        unit_price: item.unit_price,
        model_path: item.model_path,
        image_url: item.image_url
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        category: 'plant',
        description: '',
        stock_quantity: 0,
        unit_price: '',
        model_path: '',
        image_url: ''
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await updateInventoryItem(editingItem.id, formData);
      } else {
        await createInventoryItem(formData);
      }
      closeModal();
      fetchItems();
    } catch (err) {
      console.error('Failed to save item:', err);
      alert('Failed to save item. Check console for details.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteInventoryItem(id);
        fetchItems();
      } catch (err) {
        console.error('Failed to delete item:', err);
      }
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto font-sans">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <Package className="text-emerald-500" size={28} />
          Inventory Management
        </h2>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-all duration-300 shadow-sm"
        >
          <Plus size={18} /> Add New Item
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <p className="text-slate-500 font-medium animate-pulse">Loading inventory...</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Price (₱)</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors duration-150">
                    <td className="px-6 py-4 font-medium text-slate-900">{item.name}</td>
                    <td className="px-6 py-4 text-slate-600 capitalize">{item.category}</td>
                    <td className="px-6 py-4">
                      {item.stock_quantity < 10 ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                          <AlertTriangle size={12} />
                          {item.stock_quantity} Low Stock
                        </span>
                      ) : (
                        <span className="text-slate-900 font-medium">{item.stock_quantity}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-900 font-medium">{Number(item.unit_price).toLocaleString()}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openModal(item)}
                        className="text-slate-400 hover:text-blue-600 transition-colors p-2"
                        title="Edit"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-slate-400 hover:text-red-600 transition-colors p-2 ml-2"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                      No inventory items found. Add some to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal for Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg relative overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold text-slate-900">{editingItem ? 'Edit Item' : 'Add New Item'}</h3>
              <button
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-700 transition-colors p-1"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-white"
                  >
                    <option value="plant">Plant</option>
                    <option value="hardscape">Hardscape</option>
                    <option value="furniture">Furniture</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Unit Price (₱)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="unit_price"
                    value={formData.unit_price}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Stock</label>
                  <input
                    type="number"
                    name="stock_quantity"
                    value={formData.stock_quantity}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Model Path</label>
                <input
                  type="text"
                  name="model_path"
                  value={formData.model_path}
                  onChange={handleInputChange}
                  placeholder="e.g., coconut_palm"
                  className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2.5 rounded-xl font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-all"
                >
                  {editingItem ? 'Save Changes' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
