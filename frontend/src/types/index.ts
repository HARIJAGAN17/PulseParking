export type UserStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'DISABLED';

export interface User {
  id: string;
  email: string;
  fullName: string;
  phoneNumber?: string | null;
  plateRaw?: string | null;
  plateNormalized?: string | null;
  status: UserStatus;
  roles: string[];
  createdAt: string;
}

export type SpaceStatus = 'AVAILABLE' | 'OCCUPIED' | 'OUT_OF_SERVICE';

export interface Building {
  id: string;
  name: string;
  code: string;
  address?: string;
  displayOrder: number;
  isActive: boolean;
}

export interface ParkingArea {
  id: string;
  buildingId: string;
  buildingName: string;
  name: string;
  levelCode: string;
  displayOrder: number;
  isActive: boolean;
}

export interface FloorSpace {
  spaceId: string;
  areaId: string;
  spaceLabel: string;
  status: SpaceStatus;
  displayOrder: number;
  isOwnVehicle: boolean;
  plateNumber?: string | null;
  assignmentId?: string | null;
  employeeName?: string | null;
  isGuest: boolean;
  assignedAt?: string | null;
}

export interface AreaAvailability {
  areaId: string;
  name: string;
  levelCode: string;
  displayOrder: number;
  totalSpaces: number;
  usableCapacity: number;
  availableSpaces: number;
  occupiedSpaces: number;
  outOfServiceSpaces: number;
  availabilityPercentage: number;
}

export interface BuildingAvailability {
  buildingId: string;
  name: string;
  code: string;
  address?: string;
  totalSpaces: number;
  usableCapacity: number;
  availableSpaces: number;
  occupiedSpaces: number;
  outOfServiceSpaces: number;
  availabilityPercentage: number;
  areas: AreaAvailability[];
}

export interface AvailabilitySummary {
  totalConfiguredSpaces: number;
  usableCapacity: number;
  availableSpaces: number;
  occupiedSpaces: number;
  outOfServiceSpaces: number;
  availabilityPercentage: number;
  buildings: BuildingAvailability[];
  timestamp: string;
}

export interface ActiveParking {
  assignmentId: string;
  spaceId: string;
  spaceLabel: string;
  areaId: string;
  areaName: string;
  levelCode: string;
  buildingId: string;
  buildingName: string;
  buildingCode: string;
  plateNumber: string;
  assignedAt: string;
}

export interface ValetContact {
  assignmentId: string;
  employeeName: string;
  phoneNumber: string;
  email: string;
  plateNumber: string;
  spaceLabel: string;
  assignedAt: string;
}

export interface SimulationStatus {
  isRunning: boolean;
  intervalSeconds: number;
  activeSimulatedVehicles: number;
  totalSimulatedEvents: number;
}

export interface AnalyticsOverview {
  currentOccupancyRate: number;
  averageDailyOccupancyRate: number;
  peakHour: number;
  peakHourOccupancyRate: number;
  totalAssignmentsPastWeek: number;
  totalReleasesPastWeek: number;
  hourlyDistribution: { hour: number; label: string; occupancyRate: number; activityCount: number }[];
  dailyTrend: { date: string; dayOfWeek: string; occupancyRate: number; assignmentsCount: number }[];
  weekdayComparison: { dayNumber: number; dayName: string; averageOccupancyRate: number }[];
}

export interface AuditLogItem {
  id: string;
  actorEmail: string;
  actorName: string;
  action: string;
  targetType: string;
  targetId: string;
  details: string;
  ipAddress: string;
  createdAt: string;
}

