import React, { useState, useEffect } from 'react';
import { SimulationStatus } from '../types';
import { api } from '../api/client';
import { Play, Pause, RotateCcw, PlusCircle, MinusCircle, Activity, ShieldCheck } from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface SimulationControlsProps {
  onDataChanged: () => void;
}

export const SimulationControls: React.FC<SimulationControlsProps> = ({ onDataChanged }) => {
  const toast = useToast();
  const [status, setStatus] = useState<SimulationStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const fetchStatus = () => {
    api.simulation.getStatus()
      .then(setStatus)
      .catch(console.error);
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleToggle = async () => {
    if (!status) return;
    setLoading(true);
    try {
      if (status.isRunning) {
        await api.simulation.stop();
        setMsg('Simulation paused');
        toast.info('Autonomous simulation paused');
      } else {
        await api.simulation.start(5);
        setMsg('Simulation running (5s ticks)');
        toast.success('Simulation started (5-second ticks)');
      }
      fetchStatus();
      onDataChanged();
    } catch (e: any) {
      setMsg(e.message);
      toast.error(e.message || 'Simulation toggle failed');
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerArrival = async () => {
    setLoading(true);
    try {
      const res = await api.simulation.triggerArrival();
      setMsg(`Simulated arrival: ${res}`);
      toast.success(`Simulated vehicle arrived: ${res}`);
      fetchStatus();
      onDataChanged();
    } catch (e: any) {
      setMsg(e.message);
      toast.error(e.message || 'Arrival generation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerDeparture = async () => {
    setLoading(true);
    try {
      await api.simulation.triggerDeparture();
      setMsg('Simulated departure triggered');
      toast.info('Simulated vehicle departure processed');
      fetchStatus();
      onDataChanged();
    } catch (e: any) {
      setMsg(e.message);
      toast.error(e.message || 'Departure generation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Purge all simulated vehicles and events? Real employee assignments will NOT be touched.')) return;
    setLoading(true);
    try {
      await api.simulation.reset();
      setMsg('Simulation data purged. Real data preserved.');
      toast.success('Simulation data purged cleanly. Real records preserved.');
      fetchStatus();
      onDataChanged();
    } catch (e: any) {
      setMsg(e.message);
      toast.error(e.message || 'Failed to purge simulation data');
    } finally {
      setLoading(false);
    }
  };

  if (!status) return null;

  return (
    <div className="bg-white border border-concrete-300 rounded-lg p-5 shadow-tactile">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-concrete-200">
        <div className="flex items-center gap-2.5">
          <Activity className="w-5 h-5 text-signal-orange" />
          <div>
            <h3 className="font-display font-bold text-asphalt-900 text-sm">
              Non-Production Simulation Engine
            </h3>
            <p className="text-xs text-asphalt-500">
              Generates realistic test arrivals & departures without altering real employee records.
            </p>
          </div>
        </div>

        {/* Live Pill */}
        <div className="flex items-center gap-2">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              status.isRunning ? 'bg-signal-emerald animate-pulse' : 'bg-slate-400'
            }`}
          />
          <span className="font-mono text-xs font-semibold uppercase text-asphalt-700">
            {status.isRunning ? 'Engine Running' : 'Engine Idle'}
          </span>
        </div>
      </div>

      {msg && (
        <div className="mb-4 p-2.5 bg-concrete-100 border border-concrete-200 rounded text-xs font-mono text-asphalt-800 flex items-center justify-between">
          <span>{msg}</span>
          <button onClick={() => setMsg(null)} className="text-asphalt-500 hover:text-asphalt-900 text-xs">✕</button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5 font-mono">
        <div className="p-3 bg-concrete-50 border border-concrete-200 rounded">
          <div className="text-[10px] text-asphalt-500 uppercase">Simulated Parked</div>
          <div className="text-xl font-bold text-asphalt-900">{status.activeSimulatedVehicles}</div>
        </div>
        <div className="p-3 bg-concrete-50 border border-concrete-200 rounded">
          <div className="text-[10px] text-asphalt-500 uppercase">Tick Interval</div>
          <div className="text-xl font-bold text-asphalt-900">{status.intervalSeconds}s</div>
        </div>
        <div className="p-3 bg-concrete-50 border border-concrete-200 rounded">
          <div className="text-[10px] text-asphalt-500 uppercase">Sim Events Logged</div>
          <div className="text-xl font-bold text-asphalt-900">{status.totalSimulatedEvents}</div>
        </div>
        <div className="p-3 bg-concrete-50 border border-concrete-200 rounded flex flex-col justify-center">
          <div className="text-[10px] text-asphalt-500 uppercase">Origin Tag</div>
          <div className="text-xs font-bold text-emerald-700 flex items-center gap-1 mt-0.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            ISOLATED
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          onClick={handleToggle}
          disabled={loading}
          className={`px-4 py-2 font-mono text-xs font-bold rounded flex items-center gap-1.5 transition btn-tactile cursor-pointer ${
            status.isRunning
              ? 'bg-amber-600 hover:bg-amber-700 text-white'
              : 'bg-signal-emerald hover:bg-emerald-600 text-white'
          }`}
        >
          {status.isRunning ? (
            <>
              <Pause className="w-3.5 h-3.5" />
              <span>Pause Auto Sim</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5" />
              <span>Start Auto Sim</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleTriggerArrival}
          disabled={loading}
          className="px-3.5 py-2 font-mono text-xs font-medium bg-concrete-100 hover:bg-concrete-200 border border-concrete-300 text-asphalt-900 rounded flex items-center gap-1.5 transition btn-tactile cursor-pointer"
        >
          <PlusCircle className="w-3.5 h-3.5 text-signal-emerald" />
          <span>+1 Arrival</span>
        </button>

        <button
          type="button"
          onClick={handleTriggerDeparture}
          disabled={loading || status.activeSimulatedVehicles === 0}
          className="px-3.5 py-2 font-mono text-xs font-medium bg-concrete-100 hover:bg-concrete-200 border border-concrete-300 text-asphalt-900 rounded flex items-center gap-1.5 transition btn-tactile cursor-pointer disabled:opacity-50"
        >
          <MinusCircle className="w-3.5 h-3.5 text-amber-600" />
          <span>-1 Departure</span>
        </button>

        <button
          type="button"
          onClick={handleReset}
          disabled={loading}
          className="px-3.5 py-2 font-mono text-xs font-bold bg-white hover:bg-red-50 border border-red-300 text-red-700 rounded flex items-center gap-1.5 transition btn-tactile cursor-pointer ml-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Purge Sim Data</span>
        </button>
      </div>
    </div>
  );
};
