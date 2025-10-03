'use client';

import { useEffect, useRef, useState, ChangeEvent } from 'react';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import 'chartjs-adapter-date-fns';

Chart.register(...registerables);

// --- TYPE DEFINITIONS ---
interface DiaryEntry {
  date: string;
  weight: number;
}
type TimePeriod = 'all' | '1m' | '3m' | '1y';

// --- HELPER FUNCTIONS ---
const parseYYYYMMDD = (dateString: string): Date => {
  const year = parseInt(dateString.substring(0, 4), 10);
  const month = parseInt(dateString.substring(4, 6), 10) - 1;
  const day = parseInt(dateString.substring(6, 8), 10);
  return new Date(year, month, day);
};

// --- MOBILE CHART COMPONENT ---
const MobileChartCard = ({ 
  chartRef, 
  filteredData 
}: { 
  chartRef: React.RefObject<HTMLCanvasElement | null>; 
  filteredData: DiaryEntry[];
}) => (
  <div className="bg-white border border-zinc-200 rounded-xl shadow-sm">
    <div className="h-[21rem] w-full p-3">
      {filteredData.length > 0 ? (
        <canvas ref={chartRef}></canvas>
      ) : (
        <div className="flex items-center justify-center h-full text-zinc-500">
          <p className="text-sm">No data for this period.</p>
        </div>
      )}
    </div>
  </div>
);

// --- DESKTOP CHART COMPONENT ---
const DesktopChartCard = ({ 
  chartRef, 
  filteredData 
}: { 
  chartRef: React.RefObject<HTMLCanvasElement | null>; 
  filteredData: DiaryEntry[];
}) => (
  <div className="lg:col-span-2 bg-white border border-zinc-200 rounded-xl shadow-sm">
    <div className="h-[30rem] w-full p-4">
      {filteredData.length > 0 ? (
        <canvas ref={chartRef}></canvas>
      ) : (
        <div className="flex items-center justify-center h-full text-zinc-500">
          <p>No data for this period.</p>
        </div>
      )}
    </div>
  </div>
);

// --- MOBILE ANALYSIS CARD ---
const MobileAnalysisCard = ({ 
  selectedIndices, 
  filteredData 
}: { 
  selectedIndices: number[]; 
  filteredData: DiaryEntry[];
}) => {
  if (selectedIndices.length < 2) {
    return (
      <div className="bg-white border border-zinc-200 rounded-xl shadow-sm p-3 min-h-[280px]">
        <h2 className="text-lg font-bold text-zinc-900 mb-3">Analysis</h2>
        <div className="text-center py-6">
          <div className="mb-2">
            <svg className="w-12 h-12 mx-auto text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-zinc-700">
            {selectedIndices.length === 0 ? 'Tap two points' : 'Tap one more point'}
          </p>
          <p className="text-xs text-zinc-500 mt-1">Select two data points to see your progress</p>
        </div>
      </div>
    );
  }

  const [idx1, idx2] = selectedIndices;
  const entry1 = filteredData[idx1];
  const entry2 = filteredData[idx2];
  
  const date1 = parseYYYYMMDD(entry1.date);
  const date2 = parseYYYYMMDD(entry2.date);
  const daysDiff = Math.abs(date2.getTime() - date1.getTime()) / (1000 * 3600 * 24);
  const weightDiff = entry2.weight - entry1.weight;
  const ratePerWeek = (weightDiff / daysDiff) * 7;
  const isLoss = ratePerWeek < 0;

  const formatDate = (date: Date) => date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });

  return (
    <div className="bg-white border border-zinc-200 rounded-xl shadow-sm p-5 min-h-[280px]">
      <h2 className="text-lg font-bold text-zinc-900 mb-4">Analysis</h2>
      
      <div className="mb-4">
        <p className="text-sm font-semibold text-zinc-800">
          {formatDate(date1)} - {formatDate(date2)}
        </p>
      </div>
      
      {/* Primary Metric - Rate */}
      <div className={`p-4 rounded-lg mb-4 ${isLoss ? 'bg-green-50' : 'bg-red-50'}`}>
        <p className={`text-xs uppercase font-semibold tracking-wider mb-1 ${isLoss ? 'text-green-700' : 'text-red-700'}`}>
          Weekly Rate
        </p>
        <div className="flex items-baseline gap-2">
          <p className={`text-3xl font-bold ${isLoss ? 'text-green-900' : 'text-red-900'}`}>
            {Math.abs(ratePerWeek).toFixed(2)}
          </p>
          <span className={`text-sm font-medium ${isLoss ? 'text-green-700' : 'text-red-700'}`}>
            kg/week {isLoss ? '↓' : '↑'}
          </span>
        </div>
      </div>

      {/* Compact Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-zinc-50 p-3 rounded-lg">
          <p className="text-xs text-zinc-500 mb-1">Duration</p>
          <p className="text-xl font-bold text-zinc-900">{daysDiff.toFixed(0)}</p>
          <p className="text-xs text-zinc-600">days</p>
        </div>
        
        <div className="bg-zinc-50 p-3 rounded-lg">
          <p className="text-xs text-zinc-500 mb-1">Weight Change</p>
          <p className="text-xl font-bold text-zinc-900">
            {weightDiff > 0 ? '+' : ''}{weightDiff.toFixed(1)}
          </p>
          <p className="text-xs text-zinc-600">kg</p>
        </div>
      </div>
    </div>
  );
};

// --- DESKTOP ANALYSIS CARD ---
const DesktopAnalysisCard = ({ 
  selectedIndices, 
  filteredData 
}: { 
  selectedIndices: number[]; 
  filteredData: DiaryEntry[];
}) => {
  if (selectedIndices.length < 2) {
    return (
      <div className="lg:col-span-1 bg-white border border-zinc-200 rounded-xl shadow-sm h-[30rem] flex flex-col">
        <div className="p-6 border-b border-zinc-200">
          <h2 className="text-lg font-semibold text-zinc-900">Analysis</h2>
        </div>
        <div className="p-6 flex-1 flex flex-col justify-center">
          <div className="text-center py-10">
            <p className="font-medium text-zinc-700">
              {selectedIndices.length === 0 ? 'Select two points on the chart' : 'Select a second point'}
            </p>
            <p className="text-sm text-zinc-500 mt-1">Click any two data points to calculate the change.</p>
          </div>
        </div>
      </div>
    );
  }

  const [idx1, idx2] = selectedIndices;
  const entry1 = filteredData[idx1];
  const entry2 = filteredData[idx2];
  
  const date1 = parseYYYYMMDD(entry1.date);
  const date2 = parseYYYYMMDD(entry2.date);
  const daysDiff = Math.abs(date2.getTime() - date1.getTime()) / (1000 * 3600 * 24);
  const weightDiff = entry2.weight - entry1.weight;
  const ratePerWeek = (weightDiff / daysDiff) * 7;
  const isLoss = ratePerWeek < 0;

  const formatDate = (date: Date) => date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });

  const StatDisplay = ({ label, value, unit }: { label: string; value: string; unit: string }) => (
    <div>
      <p className="text-sm text-zinc-500 mb-1">{label}</p>
      <p className="text-3xl font-bold tracking-tight text-zinc-900">
        {value} <span className="text-lg font-medium text-zinc-600">{unit}</span>
      </p>
    </div>
  );

  return (
    <div className="lg:col-span-1 bg-white border border-zinc-200 rounded-xl shadow-sm h-[30rem] flex flex-col">
      <div className="p-6 border-b border-zinc-200">
        <h2 className="text-lg font-semibold text-zinc-900">Analysis</h2>
      </div>
      <div className="p-6 flex-1 flex flex-col overflow-y-auto">
        <div className="space-y-6">
          <div className={`p-4 rounded-lg ${isLoss ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            <p className="text-sm uppercase font-semibold tracking-wider mb-1">Average Weekly Rate</p>
            <p className="text-2xl font-bold">
              {Math.abs(ratePerWeek).toFixed(2)} kg / week
              <span className="ml-2 font-medium">({isLoss ? 'loss' : 'gain'})</span>
            </p>
          </div>
          
          <div className="p-2 rounded-lg bg-zinc-100">
            <p className="text-sm text-zinc-500">Time Period</p>
            <p className="text-lg font-semibold text-zinc-800">
              {formatDate(date1)} → {formatDate(date2)}
            </p>
          </div>
          
          <StatDisplay label="Time Duration" value={daysDiff.toFixed(0)} unit="days" />
          <StatDisplay label="Weight Change" value={`${weightDiff > 0 ? '+' : ''}${weightDiff.toFixed(1)}`} unit="kg" />
        </div>
      </div>
    </div>
  );
};

// --- MOBILE TDEE CARD ---
const MobileTDEECard = ({ 
  selectedIndices, 
  filteredData,
  caloriesConsumed,
  setCaloriesConsumed
}: { 
  selectedIndices: number[]; 
  filteredData: DiaryEntry[];
  caloriesConsumed: string;
  setCaloriesConsumed: (value: string) => void;
}) => {
  if (selectedIndices.length < 2) {
    return (
      <div className="bg-white border border-zinc-200 rounded-xl shadow-sm p-5">
        <h2 className="text-lg font-bold text-zinc-900 mb-3">TDEE Calculator</h2>
        <div className="text-center py-6">
          <div className="mb-2">
            <svg className="w-12 h-12 mx-auto text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-zinc-700">Select two points first</p>
          <p className="text-xs text-zinc-500 mt-1">Calculate your energy expenditure</p>
        </div>
      </div>
    );
  }

  const [idx1, idx2] = selectedIndices;
  const entry1 = filteredData[idx1];
  const entry2 = filteredData[idx2];
  
  const date1 = parseYYYYMMDD(entry1.date);
  const date2 = parseYYYYMMDD(entry2.date);
  const daysDiff = Math.abs(date2.getTime() - date1.getTime()) / (1000 * 3600 * 24);
  const weightDiff = entry2.weight - entry1.weight;

  const calculateTDEE = () => {
    const dailyConsumed = parseFloat(caloriesConsumed);
    if (!dailyConsumed || dailyConsumed <= 0) return null;

    const totalConsumed = dailyConsumed * daysDiff;
    const totalBurned = totalConsumed - (weightDiff * 7700);
    const dailyTDEE = totalBurned / daysDiff;

    return {
      totalBurned: totalBurned.toFixed(0),
      dailyTDEE: dailyTDEE.toFixed(0)
    };
  };

  const result = calculateTDEE();

  return (
    <div className="bg-white border border-zinc-200 rounded-xl shadow-sm p-5">
      <h2 className="text-lg font-bold text-zinc-900 mb-3">TDEE Calculator</h2>
      
      <div className="space-y-4">
        {/* Info Text */}
        <div className="bg-zinc-50 p-3 rounded-lg">
          <p className="text-xs text-zinc-600 leading-relaxed">
            Energy balance: ~7,700 cal deficit = 1 kg fat loss. Calculate your daily expenditure based on intake and weight change.
          </p>
        </div>

        {/* Input */}
        <div>
          <label className="block text-sm font-semibold text-zinc-900 mb-2">
            Daily Calories Consumed
          </label>
          <input
            type="number"
            value={caloriesConsumed}
            onChange={(e) => setCaloriesConsumed(e.target.value)}
            placeholder="e.g., 2500"
            className="w-full px-4 py-3 text-base border-2 border-zinc-300 rounded-lg focus:ring-2 focus:ring-zinc-800 focus:border-transparent outline-none"
          />
        </div>

        {/* Result */}
        {result ? (
          <div className="bg-zinc-900 text-white rounded-xl p-5 text-center">
            <p className="text-xs uppercase font-semibold tracking-wider mb-2 text-zinc-400">
              Your Daily TDEE
            </p>
            <p className="text-4xl font-bold mb-1">{result.dailyTDEE}</p>
            <p className="text-sm text-zinc-400">calories per day</p>
            
            <div className="mt-4 pt-4 border-t border-zinc-700">
              <p className="text-xs text-zinc-400">Total Burned</p>
              <p className="text-lg font-semibold">{result.totalBurned} cal</p>
            </div>
          </div>
        ) : (
          <div className="border-2 border-dashed border-zinc-200 rounded-xl p-6 text-center">
            <p className="text-sm text-zinc-500">Enter your daily calories to see results</p>
          </div>
        )}
      </div>
    </div>
  );
};

// --- DESKTOP TDEE CARD ---
const DesktopTDEECard = ({ 
  selectedIndices, 
  filteredData,
  caloriesConsumed,
  setCaloriesConsumed
}: { 
  selectedIndices: number[]; 
  filteredData: DiaryEntry[];
  caloriesConsumed: string;
  setCaloriesConsumed: (value: string) => void;
}) => {
  if (selectedIndices.length < 2) {
    return (
      <div className="lg:col-span-3 bg-white border border-zinc-200 rounded-xl shadow-sm p-4">
        <div className="px-4 py-3 border-b border-zinc-200">
          <h2 className="text-2xl font-semibold text-zinc-900">Energy Balance Calculator</h2>
        </div>
        <div className="px-4 py-3">
          <div className="text-center py-4">
            <p className="text-sm font-medium text-zinc-700">
              {selectedIndices.length === 0 ? 'Select two points on the chart' : 'Select a second point'}
            </p>
            <p className="text-xs text-zinc-500 mt-1">Click any two data points to calculate energy expenditure.</p>
          </div>
        </div>
      </div>
    );
  }

  const [idx1, idx2] = selectedIndices;
  const entry1 = filteredData[idx1];
  const entry2 = filteredData[idx2];
  
  const date1 = parseYYYYMMDD(entry1.date);
  const date2 = parseYYYYMMDD(entry2.date);
  const daysDiff = Math.abs(date2.getTime() - date1.getTime()) / (1000 * 3600 * 24);
  const weightDiff = entry2.weight - entry1.weight;

  const calculateTDEE = () => {
    const dailyConsumed = parseFloat(caloriesConsumed);
    if (!dailyConsumed || dailyConsumed <= 0) return null;

    const totalConsumed = dailyConsumed * daysDiff;
    const totalBurned = totalConsumed - (weightDiff * 7700);
    const dailyTDEE = totalBurned / daysDiff;

    return {
      totalBurned: totalBurned.toFixed(0),
      dailyTDEE: dailyTDEE.toFixed(0)
    };
  };

  const result = calculateTDEE();

  return (
    <div className="lg:col-span-3 bg-white border border-zinc-200 rounded-xl shadow-sm p-4">
      <div className="px-4 py-3 border-b border-zinc-200">
        <h2 className="text-2xl font-semibold text-zinc-900">Energy Balance Calculator</h2>
      </div>
      <div className="px-4 py-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 items-center">
          <div>
            <p className="text-xs text-zinc-600 mb-2">
              Weight management follows thermodynamic principles of energy in versus energy out. <br />A deficit of approximately 7,700 calories results in 1 kg of fat loss.
            </p>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-zinc-700">
                Daily Calories Consumed
              </label>
              <input
                type="number"
                value={caloriesConsumed}
                onChange={(e) => setCaloriesConsumed(e.target.value)}
                placeholder="Enter daily calories"
                className="w-full px-3 py-1.5 text-sm border border-zinc-300 rounded-lg focus:ring-2 focus:ring-zinc-800 focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-center">
            {result ? (
              <div className="text-center w-full">
                <div className="p-3 bg-zinc-900 text-white rounded-lg">
                  <p className="text-xs uppercase font-semibold tracking-wider mb-1">Daily Energy Expenditure</p>
                  <p className="text-2xl font-bold">{result.dailyTDEE}</p>
                  <p className="text-xs">calories/day</p>
                </div>
              </div>
            ) : (
              <div className="text-center text-zinc-500">
                <p className="text-xs">Enter calories to calculate</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---
export default function WeightTrackerPage() {
  const [data, setData] = useState<DiaryEntry[]>([]);
  const [filteredData, setFilteredData] = useState<DiaryEntry[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('all');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [yAxisRange, setYAxisRange] = useState<{ min: number; max: number } | null>(null);
  const [caloriesConsumed, setCaloriesConsumed] = useState<string>('');
  const [isMobile, setIsMobile] = useState<boolean>(false);
  
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const checkDevice = () => setIsMobile(window.innerWidth < 768);
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  useEffect(() => {
    try {
      const storedData = localStorage.getItem('weightData');
      if (storedData) {
        const parsedData: DiaryEntry[] = JSON.parse(storedData);
        setData(parsedData);
      }
    } catch (error) {
      console.error("Failed to parse data from localStorage:", error);
      localStorage.removeItem('weightData');
    }
  }, []);

  useEffect(() => {
    if (data.length === 0) {
      setYAxisRange(null);
      return;
    }
    const weights = data.map(entry => entry.weight);
    const minWeight = Math.min(...weights);
    const maxWeight = Math.max(...weights);
    const padding = (maxWeight - minWeight) * 0.1 || 5;
    setYAxisRange({
      min: Math.floor(minWeight - padding),
      max: Math.ceil(maxWeight + padding)
    });
  }, [data]);

  useEffect(() => {
    if (data.length === 0) {
      setFilteredData([]);
      return;
    }
    const now = new Date();
    let cutoffDate: Date | null = null;
    switch (timePeriod) {
      case '1m':
        cutoffDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case '3m':
        cutoffDate = new Date(now.setMonth(now.getMonth() - 3));
        break;
      case '1y':
        cutoffDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        break;
    }
    const filtered = cutoffDate
      ? data.filter(entry => parseYYYYMMDD(entry.date) >= cutoffDate!)
      : [...data];
    setFilteredData(filtered);
    setSelectedIndices([]);
    setCaloriesConsumed('');
  }, [timePeriod, data]);

  useEffect(() => {
    if (!chartRef.current || !yAxisRange) return;

    const ctx = chartRef.current.getContext('2d');
    if (!ctx || filteredData.length === 0) {
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
      return;
    }

    const chartData = filteredData.map(entry => ({ 
      x: parseYYYYMMDD(entry.date).getTime(), 
      y: entry.weight 
    }));
    
    const pointColors = filteredData.map((_, index) => 
      selectedIndices.includes(index) ? '#ef4444' : '#18181b'
    );
    const normalRadius = isMobile ? 3 : 5;
    const selectedRadius = isMobile ? 6 : 8;
    const pointRadii = filteredData.map((_, index) => 
      selectedIndices.includes(index) ? selectedRadius : normalRadius
    );

    const gradient = ctx.createLinearGradient(0, 0, 0, 500);
    gradient.addColorStop(0, 'rgba(24, 24, 27, 0.1)');
    gradient.addColorStop(1, 'rgba(24, 24, 27, 0)');

    if (chartInstance.current) {
      const dataset = chartInstance.current.data.datasets[0] as {
        data: typeof chartData;
        pointBackgroundColor: string | string[];
        pointRadius: number | number[];
      };
      
      dataset.data = chartData;
      dataset.pointBackgroundColor = pointColors;
      dataset.pointRadius = pointRadii;
      
      // Safe access to scales with type guards
      if (chartInstance.current.options.scales?.x?.ticks) {
        chartInstance.current.options.scales.x.ticks.callback = function(value) {
          const date = new Date(value as number);
          if (isMobile) {
            return [
              date.toLocaleDateString('en-US', { month: 'short' }),
              date.getFullYear().toString()
            ];
          }
          return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        };
      }
      
      chartInstance.current.update('none');
      return;
    }

    const config: ChartConfiguration<'line'> = {
      type: 'line',
      data: {
        datasets: [{
          label: 'Weight',
          data: chartData,
          borderColor: '#18181b',
          backgroundColor: gradient,
          fill: 'start',
          tension: 0.4,
          borderWidth: 2.5,
          pointBackgroundColor: pointColors,
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: pointRadii,
          pointHoverRadius: isMobile ? 7 : 8,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { intersect: false, mode: 'index' },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#18181b',
            titleAlign: 'center',
            bodyAlign: 'center',
            titleFont: { weight: 'bold', size: isMobile ? 14 : 16 },
            bodyFont: { size: isMobile ? 12 : 13 },
            padding: isMobile ? 10 : 12,
            cornerRadius: 8,
            displayColors: false,
            callbacks: {
              title: (items) => new Date(items[0].parsed.x).toLocaleDateString(undefined, { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              }),
              label: (item) => `Weight: ${item.parsed.y.toFixed(1)} kg`
            }
          }
        },
        scales: {
          x: {
            type: 'time',
            grid: { display: false },
            border: { color: '#e4e4e7' },
            ticks: { 
              color: '#71717a',
              font: { size: isMobile ? 10 : 12 },
              maxRotation: isMobile ? 0 : undefined,
              minRotation: isMobile ? 0 : undefined,
              callback: function(value) {
                const date = new Date(value as number);
                if (isMobile) {
                  return [
                    date.toLocaleDateString('en-US', { month: 'short' }),
                    date.getFullYear().toString()
                  ];
                }
                return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
              }
            },
          },
          y: {
            position: 'right',
            grid: { color: '#f4f4f5' },
            border: { display: false },
            min: yAxisRange.min,
            max: yAxisRange.max,
            ticks: { 
              color: '#71717a',
              padding: isMobile ? 5 : 10,
              font: { size: isMobile ? 10 : 12 },
              callback: (value) => `${value} kg`,
            },
          }
        },
        onClick: (_, elements) => {
          if (elements.length > 0) {
            handlePointClick(elements[0].index);
          }
        }
      }
    };

    chartInstance.current = new Chart(ctx, config);
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredData, yAxisRange, isMobile]);

  useEffect(() => {
    if (!chartInstance.current || filteredData.length === 0) return;
    
    const pointColors = filteredData.map((_, index) => 
      selectedIndices.includes(index) ? '#ef4444' : '#18181b'
    );
    const normalRadius = isMobile ? 3 : 5;
    const selectedRadius = isMobile ? 6 : 8;
    const pointRadii = filteredData.map((_, index) => 
      selectedIndices.includes(index) ? selectedRadius : normalRadius
    );
    
    const dataset = chartInstance.current.data.datasets[0] as {
      pointBackgroundColor: string | string[];
      pointRadius: number | number[];
    };
    
    dataset.pointBackgroundColor = pointColors;
    dataset.pointRadius = pointRadii;
    chartInstance.current.update('none');
  }, [selectedIndices, filteredData, isMobile]);

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const sqlite3InitModule = (await import('@sqlite.org/sqlite-wasm')).default;
      const sqlite3 = await sqlite3InitModule();

      const db = new sqlite3.oo1.DB();
      
      if (!db.pointer) {
        throw new Error('Failed to initialize the database instance.');
      }
      
      const p = sqlite3.wasm.allocFromTypedArray(new Uint8Array(arrayBuffer));
      
      sqlite3.capi.sqlite3_deserialize(
        db.pointer,
        'main', 
        p, 
        arrayBuffer.byteLength, 
        arrayBuffer.byteLength, 
        sqlite3.capi.SQLITE_DESERIALIZE_FREEONCLOSE
      );

      const results: DiaryEntry[] = [];
      db.exec({
        sql: 'SELECT date, weight FROM diary ORDER BY date ASC',
        rowMode: 'object',
        callback: (row) => {
          if (row && typeof row === 'object' && 'date' in row && 'weight' in row) {
            results.push({
              date: String(row.date),
              weight: parseFloat(String(row.weight)),
            });
          }
        },
      });
      db.close();

      if (results.length > 0) {
        setData(results);
        localStorage.setItem('weightData', JSON.stringify(results));
      } else {
        alert('No compatible data found in the database file.');
      }
    } catch (error) {
      console.error('Database processing error:', error);
      alert('Failed to process the database file. Please ensure it is a valid file from the Casual Diet App.');
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handlePointClick = (index: number) => {
    setSelectedIndices(prev => {
      if (prev.length === 1 && prev[0] === index) return [];
      if (prev.length >= 2) return [index];
      return [...prev, index].sort((a, b) => a - b);
    });
  };

  const resetData = () => {
    setData([]);
    localStorage.removeItem('weightData');
  };

  // --- RENDER FUNCTIONS ---
  const renderMobileView = () => {
    const hasData = data.length > 0;

    return (
      <div className="bg-zinc-50 font-sans text-zinc-800">
        {!hasData ? (
          <div className="h-screen flex items-center justify-center px-4">
            <div className="text-center max-w-lg mx-auto">
              <h1 className="text-4xl font-bold text-zinc-900 mb-3 tracking-tight">Diet Visualizer</h1>
              <p className="text-zinc-600 text-base mb-8">Turn your Casual Diet App File to Chart</p>
              <input ref={fileInputRef} type="file" accept=".db,.sqlite" onChange={handleFileUpload} className="hidden" />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="w-full px-6 py-3 text-base font-semibold text-white bg-zinc-800 rounded-lg shadow-sm hover:bg-zinc-700 transition-all duration-200 disabled:bg-zinc-400 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Processing...' : 'Upload Database File'}
              </button>
              <p className="mt-4 text-xs text-zinc-500">All processing is done in your browser<br />Your data is safe</p>
            </div>
          </div>
        ) : (
          <div className="h-screen flex flex-col overflow-hidden">
            {/* Header */}
            <header className="flex items-center justify-between p-4 border-b border-zinc-200 bg-zinc-50">
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Chart</h1>
              <div className="flex items-center gap-2">
                <button 
                  onClick={resetData} 
                  className="px-3 py-1.5 text-sm font-medium text-zinc-700 bg-white border border-zinc-300 rounded-md"
                >
                  Back
                </button>
                <button 
                  onClick={() => fileInputRef.current?.click()} 
                  className="px-3 py-1.5 text-sm font-medium text-white bg-zinc-800 rounded-md"
                >
                  Upload
                </button>
                <input ref={fileInputRef} type="file" accept=".db,.sqlite" onChange={handleFileUpload} className="hidden" />
              </div>
            </header>
            
            {/* Main content area is now scrollable */}
            <main className="flex-1 overflow-y-auto p-4">
              {/* Time Period Selector */}
              <div className="mb-4 flex justify-center">
                <div className="flex items-center gap-1 bg-zinc-200 p-1 rounded-lg">
                  {(['all', '1y', '3m', '1m'] as TimePeriod[]).map(period => (
                    <button
                      key={period}
                      onClick={() => setTimePeriod(period)}
                      className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-colors duration-200 ${
                        timePeriod === period ? 'bg-white text-zinc-800 shadow-sm' : 'text-zinc-600'
                      }`}
                    >
                      {period === 'all' ? 'All' : period.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Vertical Stack of Cards */}
              <div className="space-y-4">
                <MobileChartCard chartRef={chartRef} filteredData={filteredData} />
                <MobileAnalysisCard selectedIndices={selectedIndices} filteredData={filteredData} />
                <MobileTDEECard 
                  selectedIndices={selectedIndices} 
                  filteredData={filteredData}
                  caloriesConsumed={caloriesConsumed}
                  setCaloriesConsumed={setCaloriesConsumed}
                />
              </div>
            </main>
          </div>
        )}
      </div>
    );
  };

  const renderDesktopView = () => {
    const hasData = data.length > 0;

    return (
      <div className="min-h-screen bg-zinc-50 font-sans text-zinc-800">
        {!hasData ? (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center max-w-lg mx-auto p-8">
              <h1 className="text-5xl font-bold text-zinc-900 mb-4 tracking-tight">Diet Visualizer</h1>
              <p className="text-zinc-600 text-lg">Turn your Casual Diet App File to Chart</p>
              <input ref={fileInputRef} type="file" accept=".db,.sqlite" onChange={handleFileUpload} className="hidden" />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="mt-8 px-6 py-3 text-lg font-semibold text-white bg-zinc-800 rounded-lg shadow-sm hover:bg-zinc-700 transition-all duration-200 disabled:bg-zinc-400 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Processing...' : 'Upload Database File'}
              </button>
              <p className="mt-6 text-sm text-zinc-500">All processing is done in your browser <br /> Your data is safe</p>
            </div>
          </div>
        ) : (
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Chart</h1>
              <div className="flex items-center gap-2">
                <button onClick={resetData} className="px-4 py-2 text-sm font-medium text-zinc-700 bg-white border border-zinc-300 rounded-md hover:bg-zinc-100 transition-colors duration-200">Back</button>
                <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 text-sm font-medium text-white bg-zinc-800 border border-zinc-800 rounded-md hover:bg-zinc-700 transition-colors duration-200">Upload New</button>
                <input ref={fileInputRef} type="file" accept=".db,.sqlite" onChange={handleFileUpload} className="hidden" />
              </div>
            </header>

            <div className="mb-6">
              <div className="flex items-center gap-1 bg-zinc-200 p-1 rounded-lg w-fit">
                {(['all', '1y', '3m', '1m'] as TimePeriod[]).map(period => (
                  <button
                    key={period}
                    onClick={() => setTimePeriod(period)}
                    className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors duration-200 ${timePeriod === period ? 'bg-white text-zinc-800 shadow-sm' : 'text-zinc-600 hover:text-zinc-800'}`}
                  >
                    {period === 'all' ? 'All' : period.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <DesktopChartCard chartRef={chartRef} filteredData={filteredData} />
              <DesktopAnalysisCard selectedIndices={selectedIndices} filteredData={filteredData} />
              <DesktopTDEECard 
                selectedIndices={selectedIndices} 
                filteredData={filteredData}
                caloriesConsumed={caloriesConsumed}
                setCaloriesConsumed={setCaloriesConsumed}
              />
            </div>
          </main>
        )}
      </div>
    );
  };

  return isMobile ? renderMobileView() : renderDesktopView();
}
