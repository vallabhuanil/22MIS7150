export interface Depot {
  ID: string;
  MechanicHours: number;
}

export interface VehicleTask {
  TaskID: string;
  Duration: number;
  Impact: number;
}

export interface DepotSchedule {
  depotID: string;
  selectedTasks: string[];
  totalImpact: number;
}
