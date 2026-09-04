import { useEffect, useRef, useState } from 'react';
import {
  CandlestickSeries,
  HistogramSeries,
  LineSeries,
  LineStyle,
  createChart,
  type IChartApi,
  type IPriceLine,
  type ISeriesApi,
} from 'lightweight-charts';
import { SimulatedMarketDataProvider } from '../../data-providers';
import type { Candle, SourceType, Timeframe } from '../../normalized';

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
 * renders unlabeled. Pass `candles` (with optional `sourceType`) to render static data
 * instead of fetching from the provider.
 */
export function CandlestickChart({
  symbol,
  timeframe,
  candles,
  sourceType,
  showVolume,
  priceLines,
  overlayLines,
}: {
  symbol: string;
  timeframe: Timeframe;
  candles?: Candle[];
  sourceType?: SourceType;
  showVolume?: boolean;
  priceLines?: { price: number; label: string; color?: string }[];
  /** Line series overlaid on the candles, e.g. an SMA/EMA — plotted at their own timestamps. */
  overlayLines?: {
    label: string;
    color: string;
    points: { timestamp: number; value: number }[];
  }[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const [resolvedSourceType, setResolvedSourceType] = useState<SourceType | null>(null);
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

    const volumeSeries = showVolume
      ? chart.addSeries(
          HistogramSeries,
          {
            priceFormat: { type: 'volume' },
            priceScaleId: 'volume',
          },
          1
        )
      : null;
    if (volumeSeries) {
      chart.panes()[1]?.setStretchFactor(0.25);
    }

    const setVolumeData = (source: Candle[]) => {
      if (!volumeSeries) return;
      volumeSeries.setData(
        source.map((c) => ({
          time: Math.floor(c.timestamp / 1000) as import('lightweight-charts').UTCTimestamp,
          value: c.volume,
          color: c.close >= c.open ? '#16a34a' : '#dc2626',
        }))
      );
    };

    let priceLineHandles: IPriceLine[] = [];
    const setPriceLines = () => {
      priceLineHandles.forEach((handle) => series.removePriceLine(handle));
      priceLineHandles = (priceLines ?? []).map((pl) =>
        series.createPriceLine({
          price: pl.price,
          title: pl.label,
          color: pl.color ?? '#6b7280',
          lineStyle: LineStyle.Dashed,
          lineWidth: 2,
        })
      );
    };
    setPriceLines();

    const overlaySeriesHandles: ISeriesApi<'Line'>[] = (overlayLines ?? []).map((overlay) => {
      const overlaySeries = chart.addSeries(LineSeries, {
        color: overlay.color,
        lineWidth: 2,
        title: overlay.label,
      });
      overlaySeries.setData(
        overlay.points.map((p) => ({
          time: Math.floor(p.timestamp / 1000) as import('lightweight-charts').UTCTimestamp,
          value: p.value,
        }))
      );
      return overlaySeries;
    });

    const handleResize = () => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth });
      }
    };
    window.addEventListener('resize', handleResize);

    setResolvedSourceType(null);
    setError(null);

    if (candles) {
      series.setData(
        candles.map((c) => ({
          time: Math.floor(c.timestamp / 1000) as import('lightweight-charts').UTCTimestamp,
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close,
        }))
      );
      setVolumeData(candles);
      chart.timeScale().fitContent();
      setResolvedSourceType(sourceType ?? 'simulated');

      return () => {
        window.removeEventListener('resize', handleResize);
        priceLineHandles.forEach((handle) => series.removePriceLine(handle));
        overlaySeriesHandles.forEach((handle) => chart.removeSeries(handle));
        chart.remove();
        chartRef.current = null;
      };
    }

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
        setVolumeData(result.candles);
        chart.timeScale().fitContent();
        setResolvedSourceType(result.sourceType);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err));
      });

    return () => {
      cancelled = true;
      window.removeEventListener('resize', handleResize);
      priceLineHandles.forEach((handle) => series.removePriceLine(handle));
      overlaySeriesHandles.forEach((handle) => chart.removeSeries(handle));
      chart.remove();
      chartRef.current = null;
    };
  }, [symbol, timeframe, candles, sourceType, showVolume, priceLines, overlayLines]);

  return (
    <div className="candlestick-chart">
      <div className="candlestick-chart-header">
        <span className="candlestick-chart-symbol">
          {symbol} · {timeframe}
        </span>
        {resolvedSourceType && (
          <span
            className={`candlestick-chart-source-badge candlestick-chart-source-badge--${resolvedSourceType}`}
          >
            {SOURCE_LABEL[resolvedSourceType]} data
          </span>
        )}
      </div>
      {error && <p className="candlestick-chart-error">Failed to load chart data: {error}</p>}
      <div ref={containerRef} className="candlestick-chart-canvas" />
    </div>
  );
}
