import { Log } from '../../src/index.js'; // Adjusting to the actual path in the workspace
import { fetchDepots, fetchVehicles } from './api.js';
import { solveKnapsack } from './knapsack.js';
import { DepotSchedule } from './types.js';

async function main() {
  try {
    await Log('backend', 'info', 'service', 'Starting Vehicle Maintenance Scheduler');

    const depots = await fetchDepots();
    await Log('backend', 'info', 'service', `Fetched ${depots.length} depots`);

    const vehicles = await fetchVehicles();
    await Log('backend', 'info', 'service', `Fetched ${vehicles.length} vehicle tasks`);

    const schedules: DepotSchedule[] = [];

    for (const depot of depots) {
      await Log('backend', 'info', 'service', `Processing Depot ${depot.ID} (Capacity: ${depot.MechanicHours} hours)`);
      
      const { selectedTasks, totalImpact } = solveKnapsack(depot.MechanicHours, vehicles);
      
      schedules.push({
        depotID: depot.ID,
        selectedTasks,
        totalImpact
      });

      await Log('backend', 'info', 'service', `Finished Depot ${depot.ID}: Total Impact = ${totalImpact}`);
    }

    console.log('--- Maintenance Schedule Summary ---');
    schedules.forEach(s => {
      console.log(`Depot: ${s.depotID}`);
      console.log(`Tasks: ${s.selectedTasks.join(', ')}`);
      console.log(`Total Impact: ${s.totalImpact}`);
      console.log('-----------------------------------');
    });

    await Log('backend', 'info', 'service', 'Scheduler execution completed successfully');
  } catch (error: any) {
    console.error('Error in Scheduler:', error.message);
    await Log('backend', 'error', 'service', `Scheduler failed: ${error.message}`);
  }
}

main();
