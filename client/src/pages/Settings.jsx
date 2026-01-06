import { useTheme } from "../context/ThemeContext";
import { Shield, Check, Palette, DollarSign, Users, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

export default function Settings() {
  const { 
    primaryColor, setPrimaryColor, 
    currency, setCurrency, 
    handlers, addHandler, removeHandler,
    customCurrencies, addCurrencyOption, removeCurrencyOption
  } = useTheme();

  const [newHandler, setNewHandler] = useState("");
  const [newCurrency, setNewCurrency] = useState({ label: "", symbol: "" });

  const colors = [
    "#23bfff", // Default Blue
    "#3b82f6", // Royal Blue
    "#8b5cf6", // Violet
    "#ec4899", // Pink
    "#ef4444", // Red
    "#f59e0b", // Amber
    "#10b981", // Emerald
    "#06b6d4", // Cyan
    "#6366f1", // Indigo
    "#14b8a6", // Teal
  ];

  const handleAddHandler = (e) => {
    e.preventDefault();
    if (newHandler.trim()) {
      addHandler(newHandler.trim());
      setNewHandler("");
    }
  };

  const handleAddCurrency = (e) => {
    e.preventDefault();
    if (newCurrency.label && newCurrency.symbol) {
      addCurrencyOption(newCurrency);
      setNewCurrency({ label: "", symbol: "" });
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded shadow flex items-start gap-3">
        <Shield className="text-yellow-600 mt-1" size={20} />
        <div>
          <h3 className="font-bold text-yellow-800 mb-1">Admin Settings</h3>
          <p className="text-yellow-700 text-sm">
            Configure global application settings. These changes affect your local view.
          </p>
        </div>
      </div>

      {/* Appearance Section */}
      <div className="bg-white p-6 rounded shadow border border-gray-100">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-800">
          <Palette className="text-primary" /> Appearance
        </h2>

        <div className="mb-8">
          <label className="block font-semibold mb-3 text-gray-700">Primary Theme Color</label>
          <div className="flex flex-wrap gap-4">
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => setPrimaryColor(color)}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-transform hover:scale-110 border-2 ${
                  primaryColor === color ? "border-gray-900 scale-110" : "border-transparent"
                }`}
                style={{ backgroundColor: color }}
              >
                {primaryColor === color && <Check className="text-white" size={20} />}
              </button>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-2">
            <input 
              type="color" 
              value={primaryColor} 
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="h-10 w-20 rounded cursor-pointer border border-gray-200"
            />
            <span className="text-sm text-gray-500">Custom Color</span>
          </div>
        </div>
      </div>

      {/* Currency Section */}
      <div className="bg-white p-6 rounded shadow border border-gray-100">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-800">
          <DollarSign className="text-primary" /> Currency
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
          {customCurrencies.map((curr) => (
            <div key={curr.symbol} className="relative group">
              <button
                onClick={() => setCurrency(curr.symbol)}
                className={`w-full p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition hover:bg-gray-50 ${
                  currency === curr.symbol 
                    ? "border-primary bg-primary/5" 
                    : "border-gray-200"
                }`}
              >
                <span className="text-2xl font-bold text-gray-800">{curr.symbol}</span>
                <span className="text-sm text-gray-600">{curr.label}</span>
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); removeCurrencyOption(curr.symbol); }}
                className="absolute top-1 right-1 p-1 bg-red-100 text-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-200"
                title="Remove Currency"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>

        <form onSubmit={handleAddCurrency} className="flex flex-col md:flex-row gap-3 items-end border-t pt-4">
          <div className="flex-1 w-full">
             <label className="block text-sm font-medium text-gray-700 mb-1">Currency Name</label>
             <input 
               className="w-full p-2 border rounded focus:ring-2 focus:ring-primary focus:border-primary outline-none"
               placeholder="e.g. Australian Dollar"
               value={newCurrency.label}
               onChange={(e) => setNewCurrency({...newCurrency, label: e.target.value})}
               required
             />
          </div>
          <div className="w-full md:w-32">
             <label className="block text-sm font-medium text-gray-700 mb-1">Symbol</label>
             <input 
               className="w-full p-2 border rounded focus:ring-2 focus:ring-primary focus:border-primary outline-none"
               placeholder="e.g. A$"
               value={newCurrency.symbol}
               onChange={(e) => setNewCurrency({...newCurrency, symbol: e.target.value})}
               required
             />
          </div>
          <button type="submit" className="w-full md:w-auto px-4 py-2 bg-primary text-white rounded hover:brightness-90 flex items-center justify-center gap-2">
            <Plus size={16} /> Add Currency
          </button>
        </form>
      </div>

      {/* Handlers Section */}
      <div className="bg-white p-6 rounded shadow border border-gray-100">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-800">
          <Users className="text-primary" /> Manage Handlers
        </h2>
        <p className="text-sm text-gray-500 mb-4">Add or remove handlers that appear in Orders and Queries selection lists.</p>

        <div className="flex flex-wrap gap-2 mb-6">
          {handlers.map((handler) => (
            <div key={handler} className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full border border-gray-200">
              <span className="font-medium text-gray-700">{handler}</span>
              <button 
                onClick={() => removeHandler(handler)}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          {handlers.length === 0 && <span className="text-gray-400 italic">No handlers added yet.</span>}
        </div>

        <form onSubmit={handleAddHandler} className="flex gap-3">
          <input 
            className="flex-1 p-2 border rounded focus:ring-2 focus:ring-primary focus:border-primary outline-none"
            placeholder="Enter handler name..."
            value={newHandler}
            onChange={(e) => setNewHandler(e.target.value)}
            required
          />
          <button type="submit" className="px-4 py-2 bg-primary text-white rounded hover:brightness-90 flex items-center gap-2">
            <Plus size={16} /> Add Handler
          </button>
        </form>
      </div>
    </div>
  );
}
