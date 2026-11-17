import React, { useState, useEffect } from 'react';
import {
  AnalyticsOverview,
  AuditLogItem,
  Building,
  FloorSpace,
  ParkingArea,
  User,
} from '../types';
import { api } from '../api/client';
import { SimulationControls } from '../components/SimulationControls';
import { LicensePlate } from '../components/LicensePlate';
import {
  Users,
  Building2,
  BarChart3,
  ShieldAlert,
  Activity,
  Check,
  X,
  Plus,
  Trash2,
  RefreshCw,
  Clock,
  Pencil,
  Layers,
  FolderPlus,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  GripVertical,
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface AdminPortalProps {
  onRefreshSummary: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ onRefreshSummary }) => {
  const [activeTab, setActiveTab] = useState<'users' | 'facility' | 'analytics' | 'audit' | 'sim'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>('');
  const [areas, setAreas] = useState<ParkingArea[]>([]);
  const [selectedAreaId, setSelectedAreaId] = useState<string>('');
  const [spaces, setSpaces] = useState<FloorSpace[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [includeSimAnalytics, setIncludeSimAnalytics] = useState(false);
  const toast = useToast();

  // New Valet form state
  const [valetEmail, setValetEmail] = useState('');
  const [valetPassword, setValetPassword] = useState('');
  const [valetName, setValetName] = useState('');
  const [valetPhone, setValetPhone] = useState('');
  const [valetMsg, setValetMsg] = useState<string | null>(null);

  // New Space form state
  const [newSpaceLabel, setNewSpaceLabel] = useState('');

  // Building Management States
  const [showAddBuilding, setShowAddBuilding] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState<Building | null>(null);
  const [buildingForm, setBuildingForm] = useState({
    name: '',
    code: '',
    address: '',
  });

  // Floor / Area Management States
  const [showAddArea, setShowAddArea] = useState(false);
  const [showEditArea, setShowEditArea] = useState(false);
  const [editingArea, setEditingArea] = useState<ParkingArea | null>(null);
  const [areaForm, setAreaForm] = useState({
    name: '',
    levelCode: '',
  });

  // Bay / Space Edit State
  const [editingSpace, setEditingSpace] = useState<FloorSpace | null>(null);
  const [spaceForm, setSpaceForm] = useState({
    spaceLabel: '',
    status: 'AVAILABLE' as 'AVAILABLE' | 'OUT_OF_SERVICE',
  });

  // Drag & Drop Reorder Modes
  const [isReorderingBuildings, setIsReorderingBuildings] = useState(false);
  const [isReorderingAreas, setIsReorderingAreas] = useState(false);
  const [isReorderingSpaces, setIsReorderingSpaces] = useState(false);
  const [draggedBuildingIndex, setDraggedBuildingIndex] = useState<number | null>(null);
  const [draggedAreaIndex, setDraggedAreaIndex] = useState<number | null>(null);
  const [draggedSpaceIndex, setDraggedSpaceIndex] = useState<number | null>(null);

  // 1. Initial Load
  useEffect(() => {
    fetchUsers();
    fetchBuildings();
    fetchAnalytics();
    fetchAuditLogs();
  }, []);

  const fetchUsers = () => {
    api.admin.getUsers().then(setUsers).catch(console.error);
  };

  const fetchBuildings = () => {
    api.buildings.getAll().then((res) => {
      setBuildings(res);
      if (res.length > 0 && !selectedBuildingId) {
        setSelectedBuildingId(res[0].id);
      }
    }).catch(console.error);
  };

  const fetchAnalytics = () => {
    api.admin.getAnalytics(includeSimAnalytics).then(setAnalytics).catch(console.error);
  };

  const fetchAuditLogs = () => {
    api.admin.getAuditLogs().then(setAuditLogs).catch(console.error);
  };

  // Fetch areas when building changes
  useEffect(() => {
    if (selectedBuildingId) {
      api.areas.getAll(selectedBuildingId).then((res) => {
        setAreas(res);
        if (res.length > 0) {
          setSelectedAreaId(res[0].id);
        } else {
          setSelectedAreaId('');
          setSpaces([]);
        }
      }).catch(console.error);
    }
  }, [selectedBuildingId]);

  // Fetch spaces when area changes
  const fetchSpaces = () => {
    if (selectedAreaId) {
      api.occupancy.getFloorSpaces(selectedAreaId).then(setSpaces).catch(console.error);
    }
  };

  useEffect(() => {
    fetchSpaces();
  }, [selectedAreaId]);

  // User Approval Handlers
  const handleApproveUser = async (id: string, name?: string) => {
    try {
      await api.admin.approveUser(id);
      toast.success(`Account for ${name || 'employee'} approved successfully!`);
      fetchUsers();
    } catch (e: any) {
      toast.error(e.message || 'Failed to approve account');
    }
  };

  const handleRejectUser = async (id: string, name?: string) => {
    if (!confirm(`Reject registration for ${name || 'this user'}?`)) return;
    try {
      await api.admin.rejectUser(id);
      toast.info('User registration rejected');
      fetchUsers();
    } catch (e: any) {
      toast.error(e.message || 'Failed to reject registration');
    }
  };

  const handleCreateValet = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.admin.createValet({
        email: valetEmail,
        password: valetPassword,
        fullName: valetName,
        phoneNumber: valetPhone,
      });
      toast.success(`Valet operator account for "${valetName}" created!`);
      setValetMsg('Valet account created successfully!');
      setValetEmail('');
      setValetPassword('');
      setValetName('');
      setValetPhone('');
      fetchUsers();
      setTimeout(() => setValetMsg(null), 3000);
    } catch (err: any) {
      toast.error(err.message || 'Failed to create valet account');
      setValetMsg(err.message);
    }
  };

  // Building Management Handlers
  const handleOpenAddBuilding = () => {
    setBuildingForm({
      name: '',
      code: '',
      address: '',
    });
    setShowAddBuilding(true);
  };

  const handleCreateBuilding = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await api.buildings.create({
        ...buildingForm,
        displayOrder: buildings.length + 1,
      });
      toast.success(`Building "${created.name}" [${created.code}] created successfully!`);
      setShowAddBuilding(false);
      await fetchBuildings();
      setSelectedBuildingId(created.id);
      onRefreshSummary();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create building');
    }
  };

  const handleOpenEditBuilding = (b: Building) => {
    setEditingBuilding(b);
    setBuildingForm({
      name: b.name,
      code: b.code,
      address: b.address || '',
    });
  };

  const handleUpdateBuilding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBuilding) return;
    try {
      const updated = await api.buildings.update(editingBuilding.id, {
        ...buildingForm,
        displayOrder: editingBuilding.displayOrder,
      });
      toast.success(`Building "${updated.name}" updated successfully!`);
      setEditingBuilding(null);
      await fetchBuildings();
      onRefreshSummary();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update building');
    }
  };

  const handleDeleteBuilding = async (b: Building) => {
    if (!confirm(`Are you sure you want to deactivate building "${b.name}" [${b.code}]?`)) return;
    try {
      await api.buildings.delete(b.id);
      toast.success(`Building "${b.name}" deactivated successfully`);
      const res = await api.buildings.getAll();
      setBuildings(res);
      if (res.length > 0) {
        setSelectedBuildingId(res[0].id);
      } else {
        setSelectedBuildingId('');
        setAreas([]);
        setSpaces([]);
      }
      onRefreshSummary();
    } catch (err: any) {
      toast.error(err.message || 'Failed to deactivate building');
    }
  };

  // Reorder Buildings
  const handleMoveBuilding = async (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= buildings.length || fromIdx === toIdx) return;
    const updated = [...buildings];
    const [moved] = updated.splice(fromIdx, 1);
    updated.splice(toIdx, 0, moved);
    setBuildings(updated);

    try {
      await Promise.all(
        updated.map((b, idx) =>
          api.buildings.update(b.id, {
            name: b.name,
            code: b.code,
            address: b.address,
            displayOrder: idx + 1,
          })
        )
      );
      toast.success('Building order updated!');
      onRefreshSummary();
    } catch (err: any) {
      toast.error('Failed to save building order');
      fetchBuildings();
    }
  };

  const handleBuildingDragStart = (idx: number) => {
    setDraggedBuildingIndex(idx);
  };
  const handleBuildingDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  const handleBuildingDrop = (dropIdx: number) => {
    if (draggedBuildingIndex !== null && draggedBuildingIndex !== dropIdx) {
      handleMoveBuilding(draggedBuildingIndex, dropIdx);
    }
    setDraggedBuildingIndex(null);
  };

  // Floor / Area Management Handlers
  const handleOpenAddArea = () => {
    setAreaForm({
      name: '',
      levelCode: '',
    });
    setShowAddArea(true);
  };

  const handleCreateArea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBuildingId) return;
    try {
      const created = await api.areas.create(selectedBuildingId, {
        name: areaForm.name,
        levelCode: areaForm.levelCode,
        displayOrder: areas.length + 1,
      });
      toast.success(`Floor "${created.name}" (${created.levelCode}) added successfully!`);
      setShowAddArea(false);
      const res = await api.areas.getAll(selectedBuildingId);
      setAreas(res);
      setSelectedAreaId(created.id);
      onRefreshSummary();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create floor level');
    }
  };

  const handleOpenEditArea = (area: ParkingArea) => {
    setEditingArea(area);
    setAreaForm({
      name: area.name,
      levelCode: area.levelCode,
    });
    setShowEditArea(true);
  };

  const handleUpdateArea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArea || !selectedBuildingId) return;
    try {
      const updated = await api.areas.update(editingArea.id, {
        name: areaForm.name,
        levelCode: areaForm.levelCode,
        displayOrder: editingArea.displayOrder,
      });
      toast.success(`Floor "${updated.name}" (${updated.levelCode}) updated successfully!`);
      setShowEditArea(false);
      setEditingArea(null);
      const res = await api.areas.getAll(selectedBuildingId);
      setAreas(res);
      onRefreshSummary();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update floor level');
    }
  };

  const handleDeleteArea = async (area: ParkingArea) => {
    if (!confirm(`Are you sure you want to deactivate floor "${area.name}" (${area.levelCode})?`)) return;
    try {
      await api.areas.delete(area.id);
      toast.success(`Floor "${area.name}" deactivated successfully`);
      const res = await api.areas.getAll(selectedBuildingId);
      setAreas(res);
      if (res.length > 0) {
        setSelectedAreaId(res[0].id);
      } else {
        setSelectedAreaId('');
        setSpaces([]);
      }
      onRefreshSummary();
    } catch (err: any) {
      toast.error(err.message || 'Failed to deactivate floor');
    }
  };

  // Reorder Areas (Floors)
  const handleMoveArea = async (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= areas.length || fromIdx === toIdx) return;
    const updated = [...areas];
    const [moved] = updated.splice(fromIdx, 1);
    updated.splice(toIdx, 0, moved);
    setAreas(updated);

    try {
      await Promise.all(
        updated.map((a, idx) =>
          api.areas.update(a.id, {
            name: a.name,
            levelCode: a.levelCode,
            displayOrder: idx + 1,
          })
        )
      );
      toast.success('Floor order updated!');
      onRefreshSummary();
    } catch (err: any) {
      toast.error('Failed to save floor order');
      if (selectedBuildingId) {
        api.areas.getAll(selectedBuildingId).then(setAreas).catch(console.error);
      }
    }
  };

  const handleAreaDragStart = (idx: number) => {
    setDraggedAreaIndex(idx);
  };
  const handleAreaDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  const handleAreaDrop = (dropIdx: number) => {
    if (draggedAreaIndex !== null && draggedAreaIndex !== dropIdx) {
      handleMoveArea(draggedAreaIndex, dropIdx);
    }
    setDraggedAreaIndex(null);
  };

  // Space Management Handlers
  const handleAddSpace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAreaId || !newSpaceLabel) return;
    try {
      await api.spaces.create(selectedAreaId, {
        spaceLabel: newSpaceLabel,
        displayOrder: spaces.length + 1,
      });
      toast.success(`Bay "${newSpaceLabel}" created successfully!`);
      setNewSpaceLabel('');
      fetchSpaces();
      onRefreshSummary();
    } catch (e: any) {
      toast.error(e.message || 'Failed to add bay');
    }
  };

  const handleOpenEditSpace = (space: FloorSpace) => {
    setEditingSpace(space);
    setSpaceForm({
      spaceLabel: space.spaceLabel,
      status: space.status === 'OUT_OF_SERVICE' ? 'OUT_OF_SERVICE' : 'AVAILABLE',
    });
  };

  const handleUpdateSpace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSpace) return;
    try {
      // 1. Update label
      await api.spaces.update(editingSpace.spaceId, {
        spaceLabel: spaceForm.spaceLabel,
        displayOrder: editingSpace.displayOrder || 1,
      });

      // 2. If status was changed and bay is not occupied, update status
      if (editingSpace.status !== 'OCCUPIED' && spaceForm.status !== editingSpace.status) {
        await api.spaces.updateStatus(editingSpace.spaceId, spaceForm.status);
      }

      toast.success(`Bay "${spaceForm.spaceLabel}" updated successfully!`);
      setEditingSpace(null);
      fetchSpaces();
      onRefreshSummary();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update bay');
    }
  };

  // Reorder Spaces (Bays)
  const handleMoveSpace = async (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= spaces.length || fromIdx === toIdx) return;
    const updated = [...spaces];
    const [moved] = updated.splice(fromIdx, 1);
    updated.splice(toIdx, 0, moved);
    setSpaces(updated);

    try {
      await Promise.all(
        updated.map((s, idx) =>
          api.spaces.update(s.spaceId, {
            spaceLabel: s.spaceLabel,
            displayOrder: idx + 1,
          })
        )
      );
      toast.success('Bay order updated!');
      onRefreshSummary();
    } catch (err: any) {
      toast.error('Failed to save bay order');
      fetchSpaces();
    }
  };

  const handleSpaceDragStart = (idx: number) => {
    setDraggedSpaceIndex(idx);
  };
  const handleSpaceDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  const handleSpaceDrop = (dropIdx: number) => {
    if (draggedSpaceIndex !== null && draggedSpaceIndex !== dropIdx) {
      handleMoveSpace(draggedSpaceIndex, dropIdx);
    }
    setDraggedSpaceIndex(null);
  };

  const handleToggleSpaceOos = async (space: FloorSpace) => {
    const newStatus = space.status === 'OUT_OF_SERVICE' ? 'AVAILABLE' : 'OUT_OF_SERVICE';
    try {
      await api.spaces.updateStatus(space.spaceId, newStatus);
      toast.success(`Bay "${space.spaceLabel}" marked as ${newStatus === 'AVAILABLE' ? 'Available' : 'Out of Service'}`);
      fetchSpaces();
      onRefreshSummary();
    } catch (e: any) {
      toast.error(e.message || 'Failed to update bay status');
    }
  };

  const handleDeleteSpace = async (spaceId: string) => {
    if (!confirm('Deactivate this parking bay?')) return;
    try {
      await api.spaces.delete(spaceId);
      toast.success('Parking bay deactivated successfully');
      fetchSpaces();
      onRefreshSummary();
    } catch (e: any) {
      toast.error(e.message || 'Failed to deactivate space');
    }
  };

  const pendingUsers = users.filter((u) => u.status === 'PENDING');
  const selectedBuilding = buildings.find((b) => b.id === selectedBuildingId);
  const selectedArea = areas.find((a) => a.id === selectedAreaId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* 1. Admin Header (Deep Navy #142D4E) */}
      <div className="bg-[#142D4E] text-white rounded-lg p-5 sm:p-6 shadow-tactile flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#0D9488] animate-pulse" />
            <span className="font-mono text-xs font-bold uppercase text-teal-300 tracking-wider">
              FACILITY ADMINISTRATION
            </span>
          </div>
          <h2 className="font-display font-extrabold text-2xl tracking-tight text-white">
            ParkPulse Control Center
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Manage employee approvals, parking hierarchy, historical duration analytics, and audit logs.
          </p>
        </div>

        {/* Tab Selector (Selected Tab = Teal #0D9488) */}
        <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs bg-[#0E1F36] p-1.5 rounded-lg border border-[#1B3B66]">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 py-1.5 rounded-md transition font-bold flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'users' ? 'bg-[#0D9488] text-white shadow-sm' : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Users & Approvals</span>
            {pendingUsers.length > 0 && (
              <span className="px-1.5 py-0.2 bg-[#DC2626] text-white text-[10px] rounded-full font-bold">
                {pendingUsers.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('facility')}
            className={`px-3 py-1.5 rounded-md transition font-bold flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'facility' ? 'bg-[#0D9488] text-white shadow-sm' : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Hierarchy (Bays)</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('analytics');
              fetchAnalytics();
            }}
            className={`px-3 py-1.5 rounded-md transition font-bold flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'analytics' ? 'bg-[#0D9488] text-white shadow-sm' : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Duration Analytics</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('audit');
              fetchAuditLogs();
            }}
            className={`px-3 py-1.5 rounded-md transition font-bold flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'audit' ? 'bg-[#0D9488] text-white shadow-sm' : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Audit Trail</span>
          </button>

          <button
            onClick={() => setActiveTab('sim')}
            className={`px-3 py-1.5 rounded-md transition font-bold flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'sim' ? 'bg-[#0D9488] text-white shadow-sm' : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Simulation</span>
          </button>
        </div>
      </div>

      {/* 2. TAB CONTENT */}

      {/* Tab 1: Users & Approvals */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* Pending Registrations Section */}
          <div className="bg-white border border-concrete-300 rounded-lg shadow-tactile overflow-hidden">
            <div className="p-4 bg-amber-50/60 border-b border-amber-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-700" />
                <h3 className="font-display font-bold text-sm text-amber-950">
                  Pending Employee Registrations ({pendingUsers.length})
                </h3>
              </div>
              <span className="text-xs font-mono text-amber-800">
                Action required before employee can log in
              </span>
            </div>

            {pendingUsers.length === 0 ? (
              <div className="p-8 text-center text-xs font-mono text-asphalt-500">
                No pending registrations. All accounts reviewed.
              </div>
            ) : (
              <div className="divide-y divide-concrete-200">
                {pendingUsers.map((u) => (
                  <div key={u.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-asphalt-900 text-sm">{u.fullName}</span>
                        <LicensePlate plate={u.plateRaw} size="sm" />
                      </div>
                      <div className="text-xs font-mono text-asphalt-500 flex flex-wrap gap-3">
                        <span>{u.email}</span>
                        <span>•</span>
                        <span>Phone: {u.phoneNumber}</span>
                        <span>•</span>
                        <span>Applied: {new Date(u.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 font-mono text-xs">
                      <button
                        onClick={() => handleApproveUser(u.id, u.fullName)}
                        className="px-3.5 py-1.5 bg-signal-emerald hover:bg-emerald-600 text-white rounded font-bold flex items-center gap-1.5 transition btn-tactile cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => handleRejectUser(u.id, u.fullName)}
                        className="px-3.5 py-1.5 bg-white border border-concrete-300 hover:bg-red-50 text-red-600 rounded font-medium flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Create Valet Account Form */}
          <div className="bg-white border border-concrete-300 rounded-lg p-5 shadow-tactile">
            <h3 className="font-display font-bold text-sm text-asphalt-900 mb-1">
              Provision Valet Operator Account
            </h3>
            <p className="text-xs text-asphalt-500 mb-4">
              Valet operators do not self-register; they are provisioned directly by facility administrators.
            </p>

            {valetMsg && (
              <div className="mb-4 p-2.5 bg-concrete-100 border border-concrete-200 rounded text-xs font-mono text-asphalt-800">
                {valetMsg}
              </div>
            )}

            <form onSubmit={handleCreateValet} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-mono uppercase text-asphalt-700 mb-1">Name</label>
                <input
                  type="text"
                  required
                  placeholder="John Valet"
                  value={valetName}
                  onChange={(e) => setValetName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-concrete-50 border border-concrete-300 rounded focus:ring-1 focus:ring-asphalt-900 outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono uppercase text-asphalt-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  placeholder="valet2@parkpulse.com"
                  value={valetEmail}
                  onChange={(e) => setValetEmail(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs font-mono bg-concrete-50 border border-concrete-300 rounded focus:ring-1 focus:ring-asphalt-900 outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono uppercase text-asphalt-700 mb-1">Phone</label>
                <input
                  type="text"
                  required
                  placeholder="+91 98765 43210"
                  value={valetPhone}
                  onChange={(e) => setValetPhone(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs font-mono bg-concrete-50 border border-concrete-300 rounded focus:ring-1 focus:ring-asphalt-900 outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono uppercase text-asphalt-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={valetPassword}
                  onChange={(e) => setValetPassword(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-concrete-50 border border-concrete-300 rounded focus:ring-1 focus:ring-asphalt-900 outline-none"
                />
              </div>
              <div className="sm:col-span-2 md:col-span-4 flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white font-mono text-xs font-bold rounded-md shadow-sm transition btn-tactile cursor-pointer"
                >
                  Create Valet Operator
                </button>
              </div>
            </form>
          </div>

          {/* Full User Registry */}
          <div className="bg-white border border-concrete-300 rounded-lg shadow-tactile overflow-hidden">
            <div className="p-4 bg-concrete-50 border-b border-concrete-200 flex items-center justify-between">
              <h3 className="font-display font-bold text-sm text-asphalt-900">
                Facility User Directory ({users.length})
              </h3>
              <button onClick={fetchUsers} className="text-xs font-mono text-asphalt-500 hover:text-asphalt-900">
                Refresh
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-concrete-100 text-asphalt-700 uppercase border-b border-concrete-200">
                  <tr>
                    <th className="p-3">User</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3">Plate</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-concrete-200">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-concrete-50">
                      <td className="p-3">
                        <div className="font-bold text-asphalt-900 font-sans">{u.fullName}</div>
                        <div className="text-[11px] text-asphalt-500">{u.email}</div>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-concrete-200 text-asphalt-800 text-[10px] font-bold">
                          {u.roles[0]?.replace('ROLE_', '')}
                        </span>
                      </td>
                      <td className="p-3">{u.phoneNumber || '—'}</td>
                      <td className="p-3">
                        <LicensePlate plate={u.plateRaw} size="sm" />
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          u.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                          u.status === 'PENDING' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {u.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Facility Hierarchy (Buildings, Areas, Spaces) */}
      {activeTab === 'facility' && (
        <div className="space-y-6">
          {/* Building Selector & Building Management Bar */}
          <div className="bg-white border border-concrete-300 rounded-lg p-5 shadow-tactile space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-concrete-200 pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#0D9488]" />
                <span className="font-mono text-xs font-bold text-asphalt-900 uppercase tracking-wider">
                  Facility Buildings ({buildings.length})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsReorderingBuildings(!isReorderingBuildings)}
                  disabled={buildings.length < 2}
                  className={`px-3 py-1.5 font-mono text-xs font-bold rounded-md flex items-center gap-1.5 transition border cursor-pointer disabled:opacity-40 ${
                    isReorderingBuildings
                      ? 'bg-[#0D9488] text-white border-[#0D9488] shadow-sm'
                      : 'bg-white hover:bg-[#F1F5F9] text-[#334155] border-[#E2E8F0]'
                  }`}
                  title="Drag and drop or tap buttons to reorder buildings"
                >
                  <ArrowUpDown className="w-3.5 h-3.5" />
                  <span>{isReorderingBuildings ? 'Done Arranging' : 'Arrange Order'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleOpenAddBuilding}
                  className="px-3 py-1.5 bg-[#0D9488] hover:bg-[#0F766E] text-white font-mono text-xs font-bold rounded-md flex items-center gap-1.5 transition btn-tactile cursor-pointer shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Building</span>
                </button>
              </div>
            </div>

            {/* Reorder Panel for Buildings */}
            {isReorderingBuildings ? (
              <div className="p-4 bg-concrete-50 border border-concrete-200 rounded-lg space-y-2">
                <div className="text-xs font-mono text-asphalt-600 mb-2 flex items-center justify-between">
                  <span>Drag items or use the ▲ / ▼ buttons on mobile to change display order:</span>
                  <button
                    onClick={() => setIsReorderingBuildings(false)}
                    className="text-[#0D9488] font-bold hover:underline cursor-pointer"
                  >
                    Close Arrange Mode
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {buildings.map((b, idx) => (
                    <div
                      key={b.id}
                      draggable
                      onDragStart={() => handleBuildingDragStart(idx)}
                      onDragOver={handleBuildingDragOver}
                      onDrop={() => handleBuildingDrop(idx)}
                      className={`p-3 bg-white border rounded-lg shadow-sm flex items-center justify-between gap-3 cursor-grab active:cursor-grabbing transition ${
                        draggedBuildingIndex === idx ? 'border-[#0D9488] ring-2 ring-teal-500/20 bg-teal-50/30' : 'border-[#E2E8F0]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <GripVertical className="w-4 h-4 text-asphalt-400 shrink-0" />
                        <span className="text-[10px] font-mono font-bold bg-concrete-200 text-asphalt-700 px-1.5 py-0.5 rounded shrink-0">
                          #{idx + 1}
                        </span>
                        <div className="truncate">
                          <div className="font-bold text-xs text-asphalt-900 truncate">{b.name}</div>
                          <div className="text-[10px] font-mono text-asphalt-500">{b.code}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleMoveBuilding(idx, idx - 1); }}
                          disabled={idx === 0}
                          className="p-1.5 min-w-[32px] min-h-[32px] rounded bg-concrete-100 hover:bg-concrete-200 border border-concrete-300 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center transition active:scale-95"
                          title="Move Up"
                        >
                          <ArrowUp className="w-3.5 h-3.5 text-asphalt-800" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleMoveBuilding(idx, idx + 1); }}
                          disabled={idx === buildings.length - 1}
                          className="p-1.5 min-w-[32px] min-h-[32px] rounded bg-concrete-100 hover:bg-concrete-200 border border-concrete-300 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center transition active:scale-95"
                          title="Move Down"
                        >
                          <ArrowDown className="w-3.5 h-3.5 text-asphalt-800" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Normal Building Selection Pills */
              <div className="flex flex-wrap items-center gap-2">
                {buildings.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => setSelectedBuildingId(b.id)}
                    className={`px-3.5 py-2 rounded-md font-mono text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                      selectedBuildingId === b.id
                        ? 'bg-[#142D4E] text-white shadow-tactile'
                        : 'bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#334155] border border-[#E2E8F0]'
                    }`}
                  >
                    <span>{b.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                      selectedBuildingId === b.id ? 'bg-[#0E1F36] text-teal-300' : 'bg-[#E2E8F0] text-[#475569]'
                    }`}>
                      {b.code}
                    </span>
                  </button>
                ))}
                {buildings.length === 0 && (
                  <span className="text-xs font-mono text-asphalt-500">No buildings registered yet.</span>
                )}
              </div>
            )}

            {/* Selected Building Details & Management Actions */}
            {selectedBuilding && !isReorderingBuildings && (
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-concrete-100 bg-concrete-50/70 p-3 rounded">
                <div className="flex items-center gap-3">
                  <div className="font-mono text-xs text-asphalt-700">
                    <span className="font-bold text-asphalt-900">{selectedBuilding.name}</span>
                    {selectedBuilding.address && (
                      <span className="text-asphalt-500 ml-2">({selectedBuilding.address})</span>
                    )}
                  </div>
                  <span className="text-[10px] font-mono bg-concrete-200 text-asphalt-700 px-2 py-0.5 rounded">
                    Position: #{selectedBuilding.displayOrder}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEditBuilding(selectedBuilding)}
                    className="px-2.5 py-1 text-xs font-mono font-medium border border-[#E2E8F0] bg-white hover:bg-[#F1F5F9] text-[#142D4E] rounded-md flex items-center gap-1 transition cursor-pointer"
                    title="Edit Building Details"
                  >
                    <Pencil className="w-3 h-3 text-[#0D9488]" />
                    <span>Edit Building</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteBuilding(selectedBuilding)}
                    className="px-2.5 py-1 text-xs font-mono font-medium border border-red-200 bg-white hover:bg-red-50 text-red-600 rounded flex items-center gap-1 transition cursor-pointer"
                    title="Deactivate Building"
                  >
                    <Trash2 className="w-3 h-3 text-red-600" />
                    <span>Deactivate</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Floor / Level Selector & Floor Management Bar */}
          <div className="bg-white border border-concrete-300 rounded-lg p-4 shadow-tactile space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#0D9488]" />
                <span className="font-mono text-xs text-asphalt-700 uppercase font-bold">
                  FLOOR DECKS ({areas.length}):
                </span>
                {!isReorderingAreas && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    {areas.map((a) => (
                      <button
                        key={a.id}
                        onClick={() => setSelectedAreaId(a.id)}
                        className={`px-3 py-1.5 rounded-md font-mono text-xs font-bold transition cursor-pointer ${
                          selectedAreaId === a.id
                            ? 'bg-[#0D9488] text-white shadow-sm'
                            : 'bg-white border border-[#E2E8F0] hover:bg-[#F1F5F9] text-[#334155]'
                        }`}
                      >
                        {a.name} ({a.levelCode})
                      </button>
                    ))}
                    {areas.length === 0 && (
                      <span className="text-xs font-mono text-asphalt-500">No floors added to this building yet.</span>
                    )}
                  </div>
                )}
              </div>

              {/* Actions for Floors */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsReorderingAreas(!isReorderingAreas)}
                  disabled={areas.length < 2}
                  className={`px-2.5 py-1.5 font-mono text-xs font-bold rounded-md flex items-center gap-1 transition border cursor-pointer disabled:opacity-40 ${
                    isReorderingAreas
                      ? 'bg-[#0D9488] text-white border-[#0D9488] shadow-sm'
                      : 'bg-white hover:bg-[#F1F5F9] text-[#334155] border-[#E2E8F0]'
                  }`}
                  title="Drag and drop or tap buttons to reorder floors"
                >
                  <ArrowUpDown className="w-3 h-3" />
                  <span>{isReorderingAreas ? 'Done Arranging' : 'Arrange Floors'}</span>
                </button>

                {selectedArea && !isReorderingAreas && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleOpenEditArea(selectedArea)}
                      className="px-2.5 py-1.5 text-xs font-mono font-medium border border-[#E2E8F0] bg-white hover:bg-[#F1F5F9] text-[#142D4E] rounded-md flex items-center gap-1 transition cursor-pointer"
                      title="Edit Selected Floor"
                    >
                      <Pencil className="w-3 h-3 text-[#0D9488]" />
                      <span>Edit Floor</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteArea(selectedArea)}
                      className="px-2.5 py-1.5 text-xs font-mono font-medium border border-red-200 bg-white hover:bg-red-50 text-red-600 rounded flex items-center gap-1 transition cursor-pointer"
                      title="Deactivate Selected Floor"
                    >
                      <Trash2 className="w-3 h-3 text-red-600" />
                      <span>Deactivate</span>
                    </button>
                  </>
                )}

                <button
                  type="button"
                  onClick={handleOpenAddArea}
                  disabled={!selectedBuildingId}
                  className="px-3 py-1.5 bg-[#0D9488] hover:bg-[#0F766E] text-white font-mono text-xs font-bold rounded-md flex items-center gap-1.5 transition cursor-pointer disabled:opacity-40 shadow-sm"
                >
                  <FolderPlus className="w-3.5 h-3.5 text-white" />
                  <span>Add Floor</span>
                </button>
              </div>
            </div>

            {/* Reorder Panel for Floors */}
            {isReorderingAreas && (
              <div className="p-3 bg-concrete-50 border border-concrete-200 rounded-lg space-y-2">
                <div className="text-xs font-mono text-asphalt-600 mb-1 flex items-center justify-between">
                  <span>Drag decks or tap ▲ / ▼ on mobile to set deck stack order:</span>
                  <button
                    onClick={() => setIsReorderingAreas(false)}
                    className="text-[#0D9488] font-bold hover:underline cursor-pointer"
                  >
                    Close Arrange Mode
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {areas.map((a, idx) => (
                    <div
                      key={a.id}
                      draggable
                      onDragStart={() => handleAreaDragStart(idx)}
                      onDragOver={handleAreaDragOver}
                      onDrop={() => handleAreaDrop(idx)}
                      className={`p-3 bg-white border rounded-lg shadow-sm flex items-center justify-between gap-3 cursor-grab active:cursor-grabbing transition ${
                        draggedAreaIndex === idx ? 'border-[#0D9488] ring-2 ring-teal-500/20 bg-teal-50/30' : 'border-[#E2E8F0]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <GripVertical className="w-4 h-4 text-asphalt-400 shrink-0" />
                        <span className="text-[10px] font-mono font-bold bg-concrete-200 text-asphalt-700 px-1.5 py-0.5 rounded shrink-0">
                          #{idx + 1}
                        </span>
                        <div className="truncate">
                          <div className="font-bold text-xs text-asphalt-900 truncate">{a.name}</div>
                          <div className="text-[10px] font-mono text-asphalt-500">{a.levelCode}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleMoveArea(idx, idx - 1); }}
                          disabled={idx === 0}
                          className="p-1.5 min-w-[32px] min-h-[32px] rounded bg-concrete-100 hover:bg-concrete-200 border border-concrete-300 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center transition active:scale-95"
                          title="Move Up"
                        >
                          <ArrowUp className="w-3.5 h-3.5 text-asphalt-800" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleMoveArea(idx, idx + 1); }}
                          disabled={idx === areas.length - 1}
                          className="p-1.5 min-w-[32px] min-h-[32px] rounded bg-concrete-100 hover:bg-concrete-200 border border-concrete-300 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center transition active:scale-95"
                          title="Move Down"
                        >
                          <ArrowDown className="w-3.5 h-3.5 text-asphalt-800" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Add Space Form */}
          <div className="bg-white border border-concrete-300 rounded-lg p-5 shadow-tactile">
            <h3 className="font-display font-bold text-sm text-asphalt-900 mb-1">
              Configure New Parking Bay on Selected Floor {selectedArea ? `(${selectedArea.name} [${selectedArea.levelCode}])` : ''}
            </h3>
            <p className="text-xs text-asphalt-500 mb-3">
              Add individual designated bays (e.g. GF-09, B1-15, Bay A-04). New bays automatically appear at the end and can be arranged via Arrange Bay Order.
            </p>
            <form onSubmit={handleAddSpace} className="flex flex-wrap items-center gap-3">
              <input
                type="text"
                required
                placeholder="Bay Label (e.g. GF-09)"
                value={newSpaceLabel}
                onChange={(e) => setNewSpaceLabel(e.target.value)}
                className="px-3 py-2 text-xs font-mono font-bold bg-white border border-[#E2E8F0] rounded-md focus:ring-2 focus:ring-[#0D9488] focus:border-[#0D9488] outline-none w-48 text-[#0F172A]"
              />
              <button
                type="submit"
                disabled={!selectedAreaId}
                className="px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white font-mono text-xs font-bold rounded-md flex items-center gap-1.5 transition btn-tactile cursor-pointer disabled:opacity-40 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Bay</span>
              </button>
            </form>
          </div>

          {/* Bays Table */}
          <div className="bg-white border border-concrete-300 rounded-lg shadow-tactile overflow-hidden">
            <div className="p-4 bg-concrete-50 border-b border-concrete-200 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-display font-bold text-sm text-asphalt-900">
                  Floor Deck Spaces ({spaces.length})
                </h3>
                <span className="text-xs font-mono text-asphalt-500">
                  {isReorderingSpaces
                    ? 'Drag rows or tap ▲ / ▼ to reorder bays. Changes save instantly.'
                    : 'Modify bay properties, toggle maintenance (OOS), or deactivate bays'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsReorderingSpaces(!isReorderingSpaces)}
                  disabled={spaces.length < 2}
                  className={`px-3 py-1.5 font-mono text-xs font-bold rounded-md flex items-center gap-1.5 transition border cursor-pointer disabled:opacity-40 ${
                    isReorderingSpaces
                      ? 'bg-[#0D9488] text-white border-[#0D9488] shadow-sm'
                      : 'bg-white hover:bg-[#F1F5F9] text-[#334155] border-[#E2E8F0]'
                  }`}
                  title="Drag and drop or tap buttons to reorder parking bays"
                >
                  <ArrowUpDown className="w-3.5 h-3.5" />
                  <span>{isReorderingSpaces ? 'Done Arranging' : 'Arrange Bay Order'}</span>
                </button>
                <button
                  type="button"
                  onClick={fetchSpaces}
                  className="text-xs font-mono text-asphalt-600 hover:text-asphalt-950 flex items-center gap-1 cursor-pointer px-2 py-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-concrete-100 text-asphalt-700 uppercase border-b border-concrete-200">
                  <tr>
                    {isReorderingSpaces && <th className="p-3 w-10">Drag</th>}
                    <th className="p-3">Bay Label</th>
                    <th className="p-3">Position</th>
                    <th className="p-3">Current Status</th>
                    <th className="p-3">Occupant Plate</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-concrete-200">
                  {spaces.map((s, idx) => (
                    <tr
                      key={s.spaceId}
                      draggable={isReorderingSpaces}
                      onDragStart={() => isReorderingSpaces && handleSpaceDragStart(idx)}
                      onDragOver={isReorderingSpaces ? handleSpaceDragOver : undefined}
                      onDrop={isReorderingSpaces ? () => handleSpaceDrop(idx) : undefined}
                      className={`hover:bg-concrete-50 transition ${
                        isReorderingSpaces && draggedSpaceIndex === idx
                          ? 'bg-teal-50/50 border-y-2 border-[#0D9488]'
                          : ''
                      }`}
                    >
                      {isReorderingSpaces && (
                        <td className="p-3 cursor-grab active:cursor-grabbing text-asphalt-400">
                          <GripVertical className="w-4 h-4" />
                        </td>
                      )}
                      <td className="p-3 font-bold text-asphalt-900 text-sm">
                        {s.spaceLabel}
                      </td>
                      <td className="p-3 text-asphalt-500">
                        #{idx + 1}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          s.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-800' :
                          s.status === 'OCCUPIED' ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <LicensePlate plate={s.plateNumber} size="sm" />
                      </td>
                      <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                        {isReorderingSpaces ? (
                          /* Tactile Reordering Buttons for Mobile & Desktop */
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleMoveSpace(idx, idx - 1)}
                              disabled={idx === 0}
                              className="px-2.5 py-1.5 min-w-[34px] min-h-[34px] text-xs font-mono font-bold border border-concrete-300 rounded bg-white hover:bg-concrete-100 text-asphalt-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer inline-flex items-center justify-center transition active:scale-95"
                              title="Move Bay Up"
                            >
                              <ArrowUp className="w-3.5 h-3.5 text-asphalt-900" />
                              <span className="hidden sm:inline ml-1">Up</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveSpace(idx, idx + 1)}
                              disabled={idx === spaces.length - 1}
                              className="px-2.5 py-1.5 min-w-[34px] min-h-[34px] text-xs font-mono font-bold border border-concrete-300 rounded bg-white hover:bg-concrete-100 text-asphalt-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer inline-flex items-center justify-center transition active:scale-95"
                              title="Move Bay Down"
                            >
                              <ArrowDown className="w-3.5 h-3.5 text-asphalt-900" />
                              <span className="hidden sm:inline ml-1">Down</span>
                            </button>
                          </div>
                        ) : (
                          <>
                            {/* Edit Bay Button */}
                            <button
                              type="button"
                              onClick={() => handleOpenEditSpace(s)}
                              className="px-2.5 py-1 text-[11px] border border-[#E2E8F0] rounded hover:bg-[#F1F5F9] text-[#142D4E] font-medium inline-flex items-center gap-1 cursor-pointer"
                              title="Edit Bay Properties"
                            >
                              <Pencil className="w-3 h-3 text-[#0D9488]" />
                              <span>Edit</span>
                            </button>

                            {/* OOS Toggle */}
                            {s.status !== 'OCCUPIED' && (
                              <button
                                type="button"
                                onClick={() => handleToggleSpaceOos(s)}
                                className="px-2.5 py-1 text-[11px] border border-concrete-300 rounded hover:bg-concrete-100 text-asphalt-700 font-medium cursor-pointer"
                              >
                                {s.status === 'OUT_OF_SERVICE' ? 'Set Available' : 'Mark OOS'}
                              </button>
                            )}

                            {/* Deactivate Button */}
                            <button
                              type="button"
                              onClick={() => handleDeleteSpace(s.spaceId)}
                              disabled={s.status === 'OCCUPIED'}
                              className="px-2 py-1 text-[11px] text-red-600 hover:bg-red-50 rounded border border-red-200 disabled:opacity-40 cursor-pointer"
                              title="Deactivate space"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                  {spaces.length === 0 && (
                    <tr>
                      <td colSpan={isReorderingSpaces ? 6 : 5} className="p-6 text-center text-asphalt-500 font-sans text-xs">
                        No parking bays configured on this floor level yet. Use the form above to add bays.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Historical Duration Analytics */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="includeSim"
                checked={includeSimAnalytics}
                onChange={(e) => {
                  setIncludeSimAnalytics(e.target.checked);
                  fetchAnalytics();
                }}
                className="rounded text-[#0D9488] focus:ring-[#0D9488]"
              />
              <label htmlFor="includeSim" className="text-xs font-mono text-asphalt-700 cursor-pointer">
                Include Synthetic Simulation Data in Charts
              </label>
            </div>

            <button
              onClick={fetchAnalytics}
              className="text-xs font-mono text-asphalt-500 hover:text-asphalt-900 flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Refresh Metrics</span>
            </button>
          </div>

          {analytics && (
            <>
              {/* Top Stats Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono">
                <div className="p-4 bg-white border border-[#E2E8F0] rounded-lg shadow-tactile">
                  <div className="text-[10px] text-asphalt-500 uppercase">Live Occupancy Rate</div>
                  <div className="text-2xl font-display font-extrabold text-[#0D9488] mt-1">
                    {analytics.currentOccupancyRate}%
                  </div>
                </div>
                <div className="p-4 bg-white border border-[#E2E8F0] rounded-lg shadow-tactile">
                  <div className="text-[10px] text-asphalt-500 uppercase">7-Day Daily Average</div>
                  <div className="text-2xl font-display font-extrabold text-[#142D4E] mt-1">
                    {analytics.averageDailyOccupancyRate}%
                  </div>
                </div>
                <div className="p-4 bg-white border border-[#E2E8F0] rounded-lg shadow-tactile">
                  <div className="text-[10px] text-asphalt-500 uppercase">Peak Occupancy Hour</div>
                  <div className="text-2xl font-display font-extrabold text-[#16A34A] mt-1">
                    {String(analytics.peakHour).padStart(2, '0')}:00
                  </div>
                  <div className="text-[10px] text-asphalt-500">Peak: {analytics.peakHourOccupancyRate}%</div>
                </div>
                <div className="p-4 bg-white border border-[#E2E8F0] rounded-lg shadow-tactile">
                  <div className="text-[10px] text-asphalt-500 uppercase">Weekly Valet Activity</div>
                  <div className="text-2xl font-display font-extrabold text-[#142D4E] mt-1">
                    {analytics.totalAssignmentsPastWeek}
                  </div>
                  <div className="text-[10px] text-asphalt-500">{analytics.totalReleasesPastWeek} departures</div>
                </div>
              </div>

              {/* Hourly Duration Chart */}
              <div className="bg-white border border-[#E2E8F0] rounded-lg p-5 shadow-tactile">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-display font-bold text-sm text-[#142D4E]">
                      Hourly Duration-Weighted Occupancy Distribution
                    </h3>
                    <p className="text-[11px] text-asphalt-500 font-mono">
                      Calculated from exact duration spent in occupied state (00:00 to 23:00)
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-12 sm:grid-cols-24 gap-1 items-end h-40 pt-4 border-b border-[#E2E8F0]">
                  {analytics.hourlyDistribution.map((h) => (
                    <div key={h.hour} className="flex flex-col items-center h-full justify-end group">
                      <div
                        style={{ height: `${Math.max(6, h.occupancyRate)}%` }}
                        className={`w-full rounded-t transition-all ${
                          h.hour === analytics.peakHour ? 'bg-[#0D9488]' : 'bg-[#142D4E] hover:bg-[#1B3B66]'
                        }`}
                        title={`${h.label} — ${h.occupancyRate}% occupancy (${h.activityCount} actions)`}
                      />
                      <span className="text-[8px] font-mono text-asphalt-400 mt-1 select-none">
                        {h.hour % 2 === 0 ? h.hour : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Daily & Weekday Trends */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 7-Day Trend */}
                <div className="bg-white border border-concrete-300 rounded-lg p-5 shadow-tactile">
                  <h3 className="font-display font-bold text-sm text-asphalt-900 mb-3">
                    Daily Occupancy Trend (Past 7 Days)
                  </h3>
                  <div className="space-y-2.5 font-mono text-xs">
                    {analytics.dailyTrend.map((d) => (
                      <div key={d.date} className="flex items-center justify-between gap-3">
                        <span className="w-12 text-asphalt-500 font-bold">{d.dayOfWeek}</span>
                        <div className="flex-1 bg-concrete-100 rounded-full h-3 overflow-hidden border border-concrete-200">
                          <div
                            style={{ width: `${d.occupancyRate}%` }}
                            className="bg-signal-emerald h-full rounded-full"
                          />
                        </div>
                        <span className="w-12 text-right font-bold text-asphalt-900">{d.occupancyRate}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Weekday Comparison */}
                <div className="bg-white border border-concrete-300 rounded-lg p-5 shadow-tactile">
                  <h3 className="font-display font-bold text-sm text-asphalt-900 mb-3">
                    Weekday Utilization Profile
                  </h3>
                  <div className="space-y-2.5 font-mono text-xs">
                    {analytics.weekdayComparison.map((w) => (
                      <div key={w.dayNumber} className="flex items-center justify-between gap-3">
                        <span className="w-20 text-asphalt-500 font-bold truncate">{w.dayName}</span>
                        <div className="flex-1 bg-concrete-100 rounded-full h-3 overflow-hidden border border-concrete-200">
                          <div
                            style={{ width: `${w.averageOccupancyRate}%` }}
                            className="bg-asphalt-800 h-full rounded-full"
                          />
                        </div>
                        <span className="w-12 text-right font-bold text-asphalt-900">{w.averageOccupancyRate}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Tab 4: Audit Trail */}
      {activeTab === 'audit' && (
        <div className="bg-white border border-concrete-300 rounded-lg shadow-tactile overflow-hidden">
          <div className="p-4 bg-concrete-50 border-b border-concrete-200 flex items-center justify-between">
            <h3 className="font-display font-bold text-sm text-asphalt-900">
              Security & Privacy Audit Log ({auditLogs.length})
            </h3>
            <span className="text-xs font-mono text-asphalt-500">
              Tracks sensitive phone number access, status overrides, and admin operations
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-concrete-100 text-asphalt-700 uppercase border-b border-concrete-200">
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Actor</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Target</th>
                  <th className="p-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-concrete-200">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-concrete-50">
                    <td className="p-3 text-asphalt-500 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="p-3 font-semibold text-asphalt-900">
                      {log.actorName} ({log.actorEmail})
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.action.includes('PHONE') ? 'bg-orange-100 text-orange-800' :
                        log.action.includes('ASSIGN') ? 'bg-emerald-100 text-emerald-800' : 'bg-concrete-200 text-asphalt-800'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3 text-asphalt-700">{log.targetType}</td>
                    <td className="p-3 text-asphalt-600 max-w-xs truncate" title={log.details}>
                      {log.details || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: Simulation Controls */}
      {activeTab === 'sim' && (
        <SimulationControls onDataChanged={onRefreshSummary} />
      )}

      {/* ======================================================== */}
      {/* MODAL 1: ADD BUILDING */}
      {/* ======================================================== */}
      {showAddBuilding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs select-none">
          <div className="bg-white border border-[#E2E8F0] rounded-lg shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#0D9488]" />
                <h3 className="font-display font-bold text-sm text-[#142D4E]">
                  Register New Facility Building
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddBuilding(false)}
                className="text-[#64748B] hover:text-[#142D4E] p-1 rounded hover:bg-[#E2E8F0] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateBuilding} className="p-5 space-y-4">
              <div>
                <label className="block text-[11px] font-mono uppercase text-[#334155] mb-1 font-semibold">
                  Building Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vismaya Tower B"
                  value={buildingForm.name}
                  onChange={(e) => setBuildingForm({ ...buildingForm, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-mono bg-white border border-[#E2E8F0] rounded-md focus:ring-2 focus:ring-[#0D9488] focus:border-[#0D9488] outline-none text-[#0F172A]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-[#334155] mb-1 font-semibold">
                  Building Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. VSM-02"
                  value={buildingForm.code}
                  onChange={(e) => setBuildingForm({ ...buildingForm, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 text-xs font-mono font-bold uppercase bg-white border border-[#E2E8F0] rounded-md focus:ring-2 focus:ring-[#0D9488] focus:border-[#0D9488] outline-none text-[#0F172A]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-[#334155] mb-1 font-semibold">
                  Campus / Street Address
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sector 5, Outer Ring Road"
                  value={buildingForm.address}
                  onChange={(e) => setBuildingForm({ ...buildingForm, address: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-mono bg-white border border-[#E2E8F0] rounded-md focus:ring-2 focus:ring-[#0D9488] focus:border-[#0D9488] outline-none text-[#0F172A]"
                />
              </div>

              <div className="p-2.5 bg-[#F8FAFC] rounded-md border border-[#E2E8F0] text-[11px] font-mono text-[#64748B]">
                Notice: New building will automatically be placed at the end of the list (Position #{buildings.length + 1}). You can reorder buildings visually via <strong>Arrange Order</strong>.
              </div>

              <div className="pt-3 border-t border-[#E2E8F0] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddBuilding(false)}
                  className="px-3.5 py-1.5 border border-[#142D4E] text-[#142D4E] hover:bg-[#F1F5F9] rounded-md text-xs font-mono cursor-pointer font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-md text-xs font-mono font-bold transition btn-tactile cursor-pointer shadow-sm"
                >
                  Create Building
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: EDIT BUILDING */}
      {/* ======================================================== */}
      {editingBuilding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs select-none">
          <div className="bg-white border border-[#E2E8F0] rounded-lg shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Pencil className="w-4 h-4 text-[#0D9488]" />
                <h3 className="font-display font-bold text-sm text-[#142D4E]">
                  Edit Building: {editingBuilding.code}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingBuilding(null)}
                className="text-[#64748B] hover:text-[#142D4E] p-1 rounded hover:bg-[#E2E8F0] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateBuilding} className="p-5 space-y-4">
              <div>
                <label className="block text-[11px] font-mono uppercase text-[#334155] mb-1 font-semibold">
                  Building Name *
                </label>
                <input
                  type="text"
                  required
                  value={buildingForm.name}
                  onChange={(e) => setBuildingForm({ ...buildingForm, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-mono bg-white border border-[#E2E8F0] rounded-md focus:ring-2 focus:ring-[#0D9488] focus:border-[#0D9488] outline-none text-[#0F172A]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-[#334155] mb-1 font-semibold">
                  Building Code *
                </label>
                <input
                  type="text"
                  required
                  value={buildingForm.code}
                  onChange={(e) => setBuildingForm({ ...buildingForm, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 text-xs font-mono font-bold uppercase bg-white border border-[#E2E8F0] rounded-md focus:ring-2 focus:ring-[#0D9488] focus:border-[#0D9488] outline-none text-[#0F172A]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-[#334155] mb-1 font-semibold">
                  Campus / Street Address
                </label>
                <input
                  type="text"
                  value={buildingForm.address}
                  onChange={(e) => setBuildingForm({ ...buildingForm, address: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-mono bg-white border border-[#E2E8F0] rounded-md focus:ring-2 focus:ring-[#0D9488] focus:border-[#0D9488] outline-none text-[#0F172A]"
                />
              </div>

              <div className="p-2.5 bg-[#F8FAFC] rounded-md border border-[#E2E8F0] text-[11px] font-mono text-[#64748B]">
                Current Position: #{editingBuilding.displayOrder}. Use the <strong>Arrange Order</strong> mode to change building display priority.
              </div>

              <div className="pt-3 border-t border-[#E2E8F0] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingBuilding(null)}
                  className="px-3.5 py-1.5 border border-[#142D4E] text-[#142D4E] hover:bg-[#F1F5F9] rounded-md text-xs font-mono cursor-pointer font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-md text-xs font-mono font-bold transition btn-tactile cursor-pointer shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: ADD FLOOR / AREA */}
      {/* ======================================================== */}
      {showAddArea && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs select-none">
          <div className="bg-white border border-[#E2E8F0] rounded-lg shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderPlus className="w-4 h-4 text-[#0D9488]" />
                <h3 className="font-display font-bold text-sm text-[#142D4E]">
                  Add Floor Deck to {selectedBuilding?.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddArea(false)}
                className="text-[#64748B] hover:text-[#142D4E] p-1 rounded hover:bg-[#E2E8F0] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateArea} className="p-5 space-y-4">
              <div>
                <label className="block text-[11px] font-mono uppercase text-[#334155] mb-1 font-semibold">
                  Floor Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ground Floor, Level 1, Basement 1"
                  value={areaForm.name}
                  onChange={(e) => setAreaForm({ ...areaForm, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-mono bg-white border border-[#E2E8F0] rounded-md focus:ring-2 focus:ring-[#0D9488] focus:border-[#0D9488] outline-none text-[#0F172A]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-[#334155] mb-1 font-semibold">
                  Level Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. GF, L1, B1"
                  value={areaForm.levelCode}
                  onChange={(e) => setAreaForm({ ...areaForm, levelCode: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 text-xs font-mono font-bold uppercase bg-white border border-[#E2E8F0] rounded-md focus:ring-2 focus:ring-[#0D9488] focus:border-[#0D9488] outline-none text-[#0F172A]"
                />
              </div>

              <div className="p-2.5 bg-[#F8FAFC] rounded-md border border-[#E2E8F0] text-[11px] font-mono text-[#64748B]">
                Notice: New floor will automatically append to the end of the stack (Level #{areas.length + 1}). You can reorder floors via <strong>Arrange Floors</strong>.
              </div>

              <div className="pt-3 border-t border-[#E2E8F0] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddArea(false)}
                  className="px-3.5 py-1.5 border border-[#142D4E] text-[#142D4E] hover:bg-[#F1F5F9] rounded-md text-xs font-mono cursor-pointer font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-md text-xs font-mono font-bold transition btn-tactile cursor-pointer shadow-sm"
                >
                  Create Floor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: EDIT FLOOR / AREA */}
      {/* ======================================================== */}
      {showEditArea && editingArea && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs select-none">
          <div className="bg-white border border-[#E2E8F0] rounded-lg shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Pencil className="w-4 h-4 text-[#0D9488]" />
                <h3 className="font-display font-bold text-sm text-[#142D4E]">
                  Edit Floor Deck: {editingArea.name} ({editingArea.levelCode})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => { setShowEditArea(false); setEditingArea(null); }}
                className="text-[#64748B] hover:text-[#142D4E] p-1 rounded hover:bg-[#E2E8F0] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateArea} className="p-5 space-y-4">
              <div>
                <label className="block text-[11px] font-mono uppercase text-[#334155] mb-1 font-semibold">
                  Floor Name *
                </label>
                <input
                  type="text"
                  required
                  value={areaForm.name}
                  onChange={(e) => setAreaForm({ ...areaForm, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-mono bg-white border border-[#E2E8F0] rounded-md focus:ring-2 focus:ring-[#0D9488] focus:border-[#0D9488] outline-none text-[#0F172A]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-[#334155] mb-1 font-semibold">
                  Level Code *
                </label>
                <input
                  type="text"
                  required
                  value={areaForm.levelCode}
                  onChange={(e) => setAreaForm({ ...areaForm, levelCode: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 text-xs font-mono font-bold uppercase bg-white border border-[#E2E8F0] rounded-md focus:ring-2 focus:ring-[#0D9488] focus:border-[#0D9488] outline-none text-[#0F172A]"
                />
              </div>

              <div className="p-2.5 bg-[#F8FAFC] rounded-md border border-[#E2E8F0] text-[11px] font-mono text-[#64748B]">
                Current Position: #{editingArea.displayOrder}. Reorder anytime via <strong>Arrange Floors</strong>.
              </div>

              <div className="pt-3 border-t border-[#E2E8F0] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => { setShowEditArea(false); setEditingArea(null); }}
                  className="px-3.5 py-1.5 border border-[#142D4E] text-[#142D4E] hover:bg-[#F1F5F9] rounded-md text-xs font-mono cursor-pointer font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-md text-xs font-mono font-bold transition btn-tactile cursor-pointer shadow-sm"
                >
                  Save Floor Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 5: EDIT BAY / SPACE */}
      {/* ======================================================== */}
      {editingSpace && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs select-none">
          <div className="bg-white border border-[#E2E8F0] rounded-lg shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Pencil className="w-4 h-4 text-[#0D9488]" />
                <h3 className="font-display font-bold text-sm text-[#142D4E]">
                  Update Parking Bay: {editingSpace.spaceLabel}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingSpace(null)}
                className="text-[#64748B] hover:text-[#142D4E] p-1 rounded hover:bg-[#E2E8F0] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateSpace} className="p-5 space-y-4">
              <div>
                <label className="block text-[11px] font-mono uppercase text-[#334155] mb-1 font-semibold">
                  Bay Label *
                </label>
                <input
                  type="text"
                  required
                  value={spaceForm.spaceLabel}
                  onChange={(e) => setSpaceForm({ ...spaceForm, spaceLabel: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 text-xs font-mono font-bold uppercase bg-white border border-[#E2E8F0] rounded-md focus:ring-2 focus:ring-[#0D9488] focus:border-[#0D9488] outline-none text-[#0F172A]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-[#334155] mb-1 font-semibold">
                  Bay Operational Status
                </label>
                {editingSpace.status === 'OCCUPIED' ? (
                  <div className="px-3 py-2 text-xs font-mono bg-[#FEE2E2] border border-[#DC2626]/30 rounded-md text-[#991B1B] font-bold">
                    OCCUPIED (Active)
                  </div>
                ) : (
                  <select
                    value={spaceForm.status}
                    onChange={(e) => setSpaceForm({ ...spaceForm, status: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs font-mono bg-white border border-[#E2E8F0] rounded-md focus:ring-2 focus:ring-[#0D9488] focus:border-[#0D9488] outline-none cursor-pointer text-[#0F172A]"
                  >
                    <option value="AVAILABLE">AVAILABLE</option>
                    <option value="OUT_OF_SERVICE">OUT_OF_SERVICE</option>
                  </select>
                )}
              </div>

              <div className="p-2.5 bg-[#F8FAFC] rounded-md border border-[#E2E8F0] text-[11px] font-mono text-[#64748B]">
                Notice: Display ordering for bays is handled visually. Use <strong>Arrange Bay Order</strong> to change bay sequence.
              </div>

              {editingSpace.status === 'OCCUPIED' && (
                <div className="p-2.5 bg-[#FEF3C7] rounded-md border border-[#D97706]/30 text-[11px] text-[#92400E] font-mono">
                  Notice: Status cannot be modified while an active vehicle is parked in this bay. Release vehicle via Valet operations first.
                </div>
              )}

              <div className="pt-3 border-t border-[#E2E8F0] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingSpace(null)}
                  className="px-3.5 py-1.5 border border-[#142D4E] text-[#142D4E] hover:bg-[#F1F5F9] rounded-md text-xs font-mono cursor-pointer font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-md text-xs font-mono font-bold transition btn-tactile cursor-pointer shadow-sm"
                >
                  Save Bay Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
