'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { CITIES } from './cities';

const STORAGE_KEY = 'aweather:prefs';
const PreferencesContext = createContext(null);

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function save(prefs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // Storage can be unavailable (private mode); preferences then last for the session only.
  }
}

// Holds the selected city (shared by Dashboard, Forecast, Map...) and display preferences.
export function PreferencesProvider({ children }) {
  const [unit, setUnitState] = useState('C');
  const [defaultCity, setDefaultCityState] = useState(CITIES[0]);
  const [city, setCity] = useState(CITIES[0]);
  const [ready, setReady] = useState(false);

  // Read saved preferences after mount so server and client markup match.
  useEffect(() => {
    const saved = load();
    if (saved.unit === 'C' || saved.unit === 'F') setUnitState(saved.unit);
    if (CITIES.includes(saved.defaultCity)) {
      setDefaultCityState(saved.defaultCity);
      setCity(saved.defaultCity);
    }
    setReady(true);
  }, []);

  const setUnit = (next) => {
    setUnitState(next);
    save({ unit: next, defaultCity });
  };

  const setDefaultCity = (next) => {
    setDefaultCityState(next);
    save({ unit, defaultCity: next });
  };

  return (
    <PreferencesContext.Provider value={{ unit, setUnit, defaultCity, setDefaultCity, city, setCity, ready }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export const usePreferences = () => useContext(PreferencesContext);

// Temperatures arrive from the API in Celsius; convert for display only.
export function useTemp() {
  const { unit } = usePreferences();
  const convert = (celsius) => (unit === 'F' ? Math.round((celsius * 9) / 5 + 32) : celsius);
  return { convert, unit };
}