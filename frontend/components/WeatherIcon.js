import { WiCloudy, WiDayCloudy, WiDaySunny, WiFog, WiRain, WiSnow, WiThunderstorm } from 'react-icons/wi';

const ICONS = {
  Sunny: [WiDaySunny, 'text-amber-400', 'text-amber-300'],
  'Partly Cloudy': [WiDayCloudy, 'text-amber-400', 'text-white'],
  Cloudy: [WiCloudy, 'text-slate-400', 'text-white'],
  Rainy: [WiRain, 'text-blue-500', 'text-white'],
  Stormy: [WiThunderstorm, 'text-indigo-500', 'text-white'],
  Snowy: [WiSnow, 'text-sky-300', 'text-white'],
  Foggy: [WiFog, 'text-slate-400', 'text-white'],
};

// light = for use on dark/blue backgrounds
export default function WeatherIcon({ condition, size = 32, light = false, className = '' }) {
  const [Icon, color, lightColor] = ICONS[condition] || ICONS.Cloudy;
  return <Icon size={size} className={`${light ? lightColor : color} ${className}`} aria-label={condition} />;
}
