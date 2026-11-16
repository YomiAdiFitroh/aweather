'use client';

import { useEffect, useState } from 'react';
import CityTabs from '@/components/CityTabs';
import CurrentWeather from '@/components/CurrentWeather';
import Highlights from '@/components/Highlights';
import IndoorConditions from '@/components/IndoorConditions';
import PopularCities from '@/components/PopularCities';
import SunCard from '@/components/SunCard';
import TemperatureChart from '@/components/TemperatureChart';
import WeekForecast from '@/components/WeekForecast';
import { api } from '@/lib/api';
import { usePreferences } from '@/lib/preferences';

export default function DashboardPage() {
  const { city, setCity, ready } = usePreferences();
  const [data, setData] = useState(null);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    api('/weather/cities')
      .then((d) => active && setCities(d.cities))
      .catch((e) => active && setError(e.message));
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!ready) return undefined;

    let active = true;
    setLoading(true);
    api(`/weather/dashboard?city=${encodeURIComponent(city)}`)
      .then((d) => {
        if (!active) return;
        setData(d);
        setError('');
      })
      .catch((e) => active && setError(e.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [city, ready]);

  return (
    <>
      <CityTabs selected={city} onSelect={setCity} />

      {error && (
        <p role="alert" className="mb-4 rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600">
          Could not load weather: {error}
        </p>
      )}

      {!data && !error && (
        <div className="grid animate-pulse gap-6 xl:grid-cols-[1fr_320px]">
          <div className="card h-[28rem]" />
          <div className="card h-[28rem]" />
        </div>
      )}

      {data && (
        <div className={`transition-opacity ${loading ? 'opacity-60' : ''}`}>
          {data.demo && (
            <p className="mb-4 rounded-xl bg-amber-50 px-4 py-2 text-sm text-amber-700">
              Showing demo data. Add WEATHER_API_KEY to the backend .env for live weather.
            </p>
          )}

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="min-w-0 space-y-6">
              <div className="grid gap-6 lg:grid-cols-5">
                <CurrentWeather data={data} className="lg:col-span-2" />
                <TemperatureChart hourly={data.hourly} className="lg:col-span-3" />
              </div>
              <Highlights data={data.highlights} />
              <PopularCities cities={cities} selected={city} onSelect={setCity} />
              <IndoorConditions data={data.indoor} />
            </div>

            <aside className="space-y-6">
              <WeekForecast daily={data.daily} />
              <SunCard sun={data.sun} />
            </aside>
          </div>
        </div>
      )}
    </>
  );
}
