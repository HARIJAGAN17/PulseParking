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
    <div className="bg-white border border-[#E2E8F0] rounded-lg p-5 shadow-tactile space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E2E8F0]">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-[#0D9488]" />
          <div>
            <h3 className="font-display font-bold text-sm text-[#142D4E]">
              Autonomous Simulator Engine
            </h3>
            <p className="text-xs text-[#64748B]">
              Inject randomized parking activity for evaluation, demonstration, and load testing.
            </p>
          </div>
        </div>

        {/* State Badge */}
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold ${
            status.isRunning
              ? 'bg-[#DCFCE7] text-[#166534] border border-[#16A34A]/30'
              : 'bg-[#F1F5F9] text-[#64748B] border border-[#E2E8F0]'
          }`}>
            <span className={`w-2 h-2 rounded-full ${status.isRunning ? 'bg-[#16A34A] animate-pulse' : 'bg-slate-400'}`} />
            {status.isRunning ? 'SIM ENGINE ACTIVE' : 'SIM ENGINE STOPPED'}
          </span>
        </div>
      </div>

      {/* Metric Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center font-mono">
        <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg">
          <div className="text-xs text-[#64748B]">Active Simulated Vehicles</div>
          <div className="text-xl font-bold text-[#142D4E] mt-0.5">{status.activeSimulatedVehicles}</div>
        </div>
        <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg">
          <div className="text-xs text-[#64748B]">Simulation Tick Interval</div>
          <div className="text-xl font-bold text-[#0D9488] mt-0.5">{status.intervalSeconds}s</div>
        </div>
        <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg">
          <div className="text-xs text-[#64748B]">Total Simulated Events</div>
          <div className="text-xl font-bold text-[#334155] mt-0.5">{status.totalSimulatedEvents}</div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex flex-wrap items-center gap-2.5 pt-2">
        {/* Toggle Auto Simulation (Primary Teal #0D9488) */}
        <button
          type="button"
          onClick={handleToggle}
          disabled={loading}
          className={`flex-1 sm:flex-initial px-4 py-2 font-mono text-xs font-bold rounded-md transition flex items-center justify-center gap-2 cursor-pointer shadow-sm ${
            status.isRunning
              ? 'bg-[#FEF3C7] hover:bg-amber-100 text-[#92400E] border border-[#D97706]/30'
              : 'bg-[#0D9488] hover:bg-[#0F766E] text-white'
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
              <span>Start Autonomous Sim (5s)</span>
            </>
          )}
        </button>

        {/* Trigger Single Arrival */}
        <button
          type="button"
          onClick={handleTriggerArrival}
          disabled={loading}
          className="px-3.5 py-2 bg-white border border-[#142D4E] hover:bg-[#F1F5F9] text-[#142D4E] font-mono text-xs font-semibold rounded-md transition flex items-center gap-1.5 cursor-pointer"
        >
          <PlusCircle className="w-3.5 h-3.5 text-[#0D9488]" />
          <span>Simulate Arrival</span>
        </button>

        {/* Trigger Single Departure */}
        <button
          type="button"
          onClick={handleTriggerDeparture}
          disabled={loading}
          className="px-3.5 py-2 bg-white border border-[#142D4E] hover:bg-[#F1F5F9] text-[#142D4E] font-mono text-xs font-semibold rounded-md transition flex items-center gap-1.5 cursor-pointer"
        >
          <MinusCircle className="w-3.5 h-3.5 text-[#64748B]" />
          <span>Simulate Departure</span>
        </button>

        {/* Reset / Purge */}
        <button
          type="button"
          onClick={handleReset}
          disabled={loading}
          className="px-3.5 py-2 bg-white hover:bg-red-50 text-[#DC2626] border border-[#DC2626]/40 font-mono text-xs font-semibold rounded-md transition ml-auto flex items-center gap-1.5 cursor-pointer"
          title="Clear all generated simulation records"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Purge Sim Data</span>
        </button>
      </div>

      {/* Safety Notice */}
      <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#64748B] pt-1">
        <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A]" />
        <span>Safety isolation active: Simulated records are strictly tagged and never overwrite actual employee records.</span>
      </div>

      {msg && (
        <div className="p-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded text-xs font-mono text-[#334155]">
          Status: {msg}
        </div>
      )}
    </div>
  );
};
