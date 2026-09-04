import { useEffect, useRef, useState } from 'react';
import { CandlestickSeries, createChart, type IChartApi } from 'lightweight-charts';
import { SimulatedMarketDataProvider } from '../../data-providers';
import type { SourceType, Timeframe } from '../../normalized';

const provider = new SimulatedMarketDataProvider();

const SOURCE_LABEL: Record<SourceType, string> = {
  'real-time': 'Real-time',
  delayed: 'Delayed',
  historical: 'Historical',
  simulated: 'Simulated',
};

/**
 * Renders a symbol's intraday candles from `MarketDataProvider.getIntraday` using
 * lightweight-charts. Always shows a source-type label per CLAUDE.md — data never
 * renders unlabeled.
 */
export function CandlestickChart({ symbol, timeframe }: { symbol: string; timeframe: Timeframe }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const [sourceType, setSourceType] = useState<SourceType | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: 400,
      layout: { textColor: '#1f2937', background: { color: '#ffffff' } },
      grid: {
        vertLines: { color: '#f3f4f6' },
        horzLines: { color: '#f3f4f6' },
      },
      timeScale: { timeVisible: true, secondsVisible: false },
    });
    chartRef.current = chart;

    const series = chart.addSeries(CandlestickSeries, {
      upColor: '#16a34a',
      downColor: '#dc2626',
      borderVisible: false,
      wickUpColor: '#16a34a',
      wickDownColor: '#dc2626',
    });

    const handleResize = () => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth });
      }
    };
    window.addEventListener('resize', handleResize);

    setSourceType(null);
    setError(null);

    let cancelled = false;
    provider
      .getIntraday(symbol, timeframe)
      .then((result) => {
        if (cancelled) return;
        series.setData(
          result.candles.map((c) => ({
            time: Math.floor(c.timestamp / 1000) as import('lightweight-charts').UTCTimestamp,
            open: c.open,
            high: c.high,
            low: c.low,
            close: c.close,
          }))
        );
        chart.timeScale().fitContent();
        setSourceType(result.sourceType);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err));
      });

    return () => {
      cancelled = true;
      window.removeEventListener('resize', handleResize);
      chart.remove();
      chartRef.current = null;
    };
  }, [symbol, timeframe]);

  return (
    <div className="candlestick-chart">
      <div className="candlestick-chart-header">
        <span className="candlestick-chart-symbol">
          {symbol} · {timeframe}
        </span>
        {sourceType && (
          <span className={`candlestick-chart-source-badge candlestick-chart-source-badge--${sourceType}`}>
            {SOURCE_LABEL[sourceType]} data
          </span>
        )}
      </div>
      {error && <p className="candlestick-chart-error">Failed to load chart data: {error}</p>}
      <div ref={containerRef} className="candlestick-chart-canvas" />
    </div>
  );
}
