import {
  ActiveParking,
  AnalyticsOverview,
  AuditLogItem,
  AvailabilitySummary,
  Building,
  FloorSpace,
  ParkingArea,
  SimulationStatus,
  User,
  ValetContact,
} from '../types';

const BASE_URL = '/api';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const config: RequestInit = {
    ...options,
    credentials: 'include', // Ensures session cookie is sent
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...options.headers,
    },
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok || data.success === false) {
    const errorMsg = data.message || (data.details && data.details.join(', ')) || 'Request failed';
    throw new Error(errorMsg);
  }

  return data.data !== undefined ? data.data : data;
}

export const api = {
  auth: {
    register: (body: { email: string; password: string; fullName: string; phoneNumber: string; plateNumber: string }) =>
      request<User>('/auth/register', { method: 'POST', body: JSON.stringify(body) }),

    login: (body: { email: string; password: string }) =>
      request<User>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),

    getMe: () =>
      request<User | null>('/auth/me', { method: 'GET' }),

    logout: () =>
      request<void>('/auth/logout', { method: 'POST' }),
  },

  user: {
    updateProfile: (body: { fullName: string; phoneNumber: string; plateNumber?: string }) =>
      request<User>('/users/profile', { method: 'PUT', body: JSON.stringify(body) }),
  },

  occupancy: {
    getSummary: () =>
      request<AvailabilitySummary>('/occupancy/summary', { method: 'GET' }),

    getFloorSpaces: (areaId: string) =>
      request<FloorSpace[]>(`/occupancy/areas/${areaId}/spaces`, { method: 'GET' }),
  },

  buildings: {
    getActive: () =>
      request<Building[]>('/buildings', { method: 'GET' }),

    getAll: () =>
      request<Building[]>('/admin/buildings', { method: 'GET' }),

    create: (body: { name: string; code: string; address?: string; displayOrder: number }) =>
      request<Building>('/admin/buildings', { method: 'POST', body: JSON.stringify(body) }),

    update: (id: string, body: { name: string; code: string; address?: string; displayOrder: number }) =>
      request<Building>(`/admin/buildings/${id}`, { method: 'PUT', body: JSON.stringify(body) }),

    toggleStatus: (id: string, active: boolean) =>
      request<void>(`/admin/buildings/${id}/status?active=${active}`, { method: 'PATCH' }),

    delete: (id: string) =>
      request<void>(`/admin/buildings/${id}`, { method: 'DELETE' }),
  },

  areas: {
    getActive: (buildingId: string) =>
      request<ParkingArea[]>(`/buildings/${buildingId}/areas`, { method: 'GET' }),

    getAll: (buildingId: string) =>
      request<ParkingArea[]>(`/admin/buildings/${buildingId}/areas`, { method: 'GET' }),

    create: (buildingId: string, body: { name: string; levelCode: string; displayOrder: number }) =>
      request<ParkingArea>(`/admin/buildings/${buildingId}/areas`, { method: 'POST', body: JSON.stringify(body) }),

    update: (areaId: string, body: { name: string; levelCode: string; displayOrder: number }) =>
      request<ParkingArea>(`/admin/areas/${areaId}`, { method: 'PUT', body: JSON.stringify(body) }),

    toggleStatus: (areaId: string, active: boolean) =>
      request<void>(`/admin/areas/${areaId}/status?active=${active}`, { method: 'PATCH' }),
  },

  spaces: {
    create: (areaId: string, body: { spaceLabel: string; displayOrder: number }) =>
      request<FloorSpace>(`/admin/areas/${areaId}/spaces`, { method: 'POST', body: JSON.stringify(body) }),

    update: (spaceId: string, body: { spaceLabel: string; displayOrder: number }) =>
      request<FloorSpace>(`/admin/spaces/${spaceId}`, { method: 'PUT', body: JSON.stringify(body) }),

    updateStatus: (spaceId: string, status: string) =>
      request<void>(`/admin/spaces/${spaceId}/status?status=${status}`, { method: 'PATCH' }),

    delete: (spaceId: string) =>
      request<void>(`/admin/spaces/${spaceId}`, { method: 'DELETE' }),
  },

  valet: {
    assign: (body: { spaceId: string; plateNumber: string; employeeId?: string; isGuest: boolean; guestNote?: string }) =>
      request<ActiveParking>('/valet/assignments', { method: 'POST', body: JSON.stringify(body) }),

    release: (assignmentId: string) =>
      request<void>(`/valet/assignments/${assignmentId}/release`, { method: 'POST' }),

    getActive: () =>
      request<ActiveParking[]>('/valet/assignments/active', { method: 'GET' }),

    getContact: (assignmentId: string) =>
      request<ValetContact>(`/valet/assignments/${assignmentId}/contact`, { method: 'GET' }),

    getEligibleEmployees: () =>
      request<User[]>('/valet/eligible-employees', { method: 'GET' }),
  },

  employee: {
    getMyParking: () =>
      request<ActiveParking | null>('/employee/my-parking', { method: 'GET' }),
  },

  admin: {
    getUsers: (status?: string) =>
      request<User[]>(status ? `/admin/users?status=${status}` : '/admin/users', { method: 'GET' }),

    approveUser: (id: string) =>
      request<User>(`/admin/users/${id}/approve`, { method: 'POST' }),

    rejectUser: (id: string) =>
      request<User>(`/admin/users/${id}/reject`, { method: 'POST' }),

    createValet: (body: { email: string; password: string; fullName: string; phoneNumber: string }) =>
      request<User>('/admin/valets', { method: 'POST', body: JSON.stringify(body) }),

    listValets: () =>
      request<User[]>('/admin/valets', { method: 'GET' }),

    getAnalytics: (includeSimulation: boolean = false) =>
      request<AnalyticsOverview>(`/admin/analytics/overview?includeSimulation=${includeSimulation}`, { method: 'GET' }),

    getAuditLogs: () =>
      request<AuditLogItem[]>('/admin/audit-logs', { method: 'GET' }),
  },

  simulation: {
    getStatus: () =>
      request<SimulationStatus>('/admin/simulation/status', { method: 'GET' }),

    start: (intervalSeconds: number = 5) =>
      request<void>(`/admin/simulation/start?intervalSeconds=${intervalSeconds}`, { method: 'POST' }),

    stop: () =>
      request<void>('/admin/simulation/stop', { method: 'POST' }),

    triggerArrival: () =>
      request<string>('/admin/simulation/trigger-arrival', { method: 'POST' }),

    triggerDeparture: () =>
      request<void>('/admin/simulation/trigger-departure', { method: 'POST' }),

    reset: () =>
      request<void>('/admin/simulation/reset', { method: 'POST' }),
  },
};
