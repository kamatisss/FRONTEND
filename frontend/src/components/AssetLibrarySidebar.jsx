import { useState, useEffect } from 'react';
import { useDesign } from '../context/DesignContext';
import { getInventoryItems } from '../services/api';
import AssetCard from './AssetCard';
import { Leaf, TreePine, Gem, Armchair, Search, MapPin, X } from 'lucide-react';

const TABS = [
  { key: 'all', label: 'All', icon: Leaf },
  { key: 'plant', label: 'Plants', icon: TreePine },
  { key: 'hardscape', label: 'Hardscape', icon: Gem },
  { key: 'furniture', label: 'Furniture', icon: Armchair },
];

export default function AssetLibrarySidebar({ category }) {
  const { state, dispatch } = useDesign();
  const [search, setSearch] = useState('');
  const [loadingProducts, setLoadingProducts] = useState(false);

  useEffect(() => {
    async function fetchProducts() {
      setLoadingProducts(true);
      try {
        const data = await getInventoryItems();
        dispatch({ type: 'SET_PRODUCTS', payload: data });
      } catch (err) {
        console.error('Failed to load inventory items:', err);
      } finally {
        setLoadingProducts(false);
      }
    }
    if (state.products.length === 0) fetchProducts();
  }, [state.products.length, dispatch]);

  const filtered = state.products.filter(p => {
    const matchTab = !category || category === 'all' || p.category === category;
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const isSelected = (p) => state.selectedProduct?.id === p.id;
  const isPlacing = state.placementMode !== 'idle';

  const handleSelectAsset = (product) => {
    if (isPlacing && state.selectedProduct?.id === product.id) {
      dispatch({ type: 'CANCEL_PLACEMENT' });
      return;
    }
    if (isPlacing) {
      dispatch({ type: 'CANCEL_PLACEMENT' });
    }
    dispatch({ type: 'START_PLACING', payload: product });
  };

  return (
    <div className="flex flex-col font-sans h-full overflow-hidden bg-white">
      {/* Search */}
      <div className="relative mb-6 shrink-0">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={16} className="text-gray-400" />
        </div>
        <input
          type="text"
          className="w-full bg-gray-50 text-gray-800 text-sm font-medium rounded-xl pl-10 pr-3 py-2.5 border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder-gray-400 shadow-sm"
          placeholder="Search assets..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Product grid */}
      <div className="flex-1 overflow-y-auto pr-1 no-scrollbar">
        <div className="grid grid-cols-2 gap-4 pb-4">
          {loadingProducts && <p className="text-gray-400 text-sm italic col-span-2 text-center py-8">Loading catalog...</p>}
          {filtered.map(product => (
            <AssetCard
              key={product.id}
              product={product}
              isSelected={isSelected(product)}
              onClick={handleSelectAsset}
            />
          ))}
          {!loadingProducts && filtered.length === 0 && (
            <div className="col-span-2 text-center py-12">
              <div className="bg-gray-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <Search size={20} className="text-gray-300" />
              </div>
              <p className="text-sm text-gray-500 font-medium">No matching assets found.</p>
            </div>
          )}
        </div>
      </div>

      {/* Selection hint */}
      {isPlacing && state.previewObject && (
        <div className="mt-4 p-4 bg-emerald-50 border border-emerald-100 rounded-xl animate-in fade-in slide-in-from-bottom-2 duration-300 shadow-sm">
          <p className="text-xs font-bold text-emerald-700 uppercase tracking-widest mb-2">Active Placement</p>
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-white rounded-lg border border-emerald-100 flex items-center justify-center shrink-0">
                <Leaf size={20} className="text-emerald-500" />
             </div>
             <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-800 truncate">{state.previewObject.name}</p>
                <p className="text-xs font-bold text-emerald-600">₱{Number(state.previewObject.unit_price || state.previewObject.price).toLocaleString()}</p>
             </div>
             <button
                className="p-1.5 bg-white text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all border border-gray-200"
                onClick={() => dispatch({ type: 'CANCEL_PLACEMENT' })}
                title="Cancel Placement"
              >
                <X size={16} />
              </button>
          </div>
        </div>
      )}
    </div>
  );
}
