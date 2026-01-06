import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }) {
  const [primaryColor, setPrimaryColor] = useState(() => {
    return localStorage.getItem("primaryColor") || "#23bfff";
  });

  const [currency, setCurrency] = useState(() => {
    return localStorage.getItem("currency") || "$";
  });

  // Handlers management
  const [handlers, setHandlers] = useState(() => {
    try {
      const saved = localStorage.getItem("handlers");
      const parsed = saved ? JSON.parse(saved) : ["Default Handler"];
      // Ensure we only have strings to prevent "Objects are not valid as a React child" errors
      return Array.isArray(parsed) 
        ? parsed.map(h => (typeof h === 'object' && h !== null ? (h.name || h._id || "Unknown") : String(h)))
        : ["Default Handler"];
    } catch (e) {
      void e;
      return ["Default Handler"];
    }
  });

  // Custom Currencies management
  const [customCurrencies, setCustomCurrencies] = useState(() => {
    try {
      const saved = localStorage.getItem("customCurrencies");
      // Default list
      const defaults = [
        { label: "US Dollar", symbol: "$" },
        { label: "British Pound", symbol: "£" },
        { label: "Euro", symbol: "€" },
        { label: "Indian Rupee", symbol: "₹" },
        { label: "Japanese Yen", symbol: "¥" },
      ];
      return saved ? JSON.parse(saved) : defaults;
    } catch (e) {
      void e;
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("primaryColor", primaryColor);
    document.documentElement.style.setProperty("--primary", primaryColor);
  }, [primaryColor]);

  useEffect(() => {
    localStorage.setItem("currency", currency);
  }, [currency]);

  useEffect(() => {
    localStorage.setItem("handlers", JSON.stringify(handlers));
  }, [handlers]);

  useEffect(() => {
    localStorage.setItem("customCurrencies", JSON.stringify(customCurrencies));
  }, [customCurrencies]);

  const addHandler = (name) => {
    if (name && !handlers.includes(name)) {
      setHandlers([...handlers, name]);
    }
  };

  const removeHandler = (name) => {
    setHandlers(handlers.filter(h => h !== name));
  };

  const addCurrencyOption = (newCurr) => {
    if (!customCurrencies.find(c => c.symbol === newCurr.symbol)) {
      setCustomCurrencies([...customCurrencies, newCurr]);
    }
  };

  const removeCurrencyOption = (symbol) => {
    setCustomCurrencies(customCurrencies.filter(c => c.symbol !== symbol));
    if (currency === symbol) {
      setCurrency("$"); // Reset if current is deleted
    }
  };

  const value = {
    primaryColor,
    setPrimaryColor,
    currency,
    setCurrency,
    handlers,
    addHandler,
    removeHandler,
    customCurrencies,
    addCurrencyOption,
    removeCurrencyOption
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}
