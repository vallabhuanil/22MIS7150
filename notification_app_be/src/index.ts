import { fetchNotifications } from './api.js';
import { Notification, TYPE_WEIGHTS } from './types.js';

/**
 * Ranks notifications based on Weight (Placement > Result > Event)
 * and then by Recency (Timestamp).
 * 
 * @param notifications - List of notifications to rank
 * @param topN - Number of top notifications to return
 */
export function rankNotifications(notifications: Notification[], topN: number = 5): Notification[] {
  return [...notifications].sort((a, b) => {
    // 1. Compare weights
    const weightA = TYPE_WEIGHTS[a.Type];
    const weightB = TYPE_WEIGHTS[b.Type];

    if (weightA !== weightB) {
      return weightB - weightA; // Higher weight first
    }

    // 2. Compare timestamps (Recency)
    const timeA = new Date(a.Timestamp).getTime();
    const timeB = new Date(b.Timestamp).getTime();

    return timeB - timeA; // More recent first
  }).slice(0, topN);
}

async function main() {
  try {
    console.log('Fetching notifications for Priority Inbox...');
    const allNotifications = await fetchNotifications();
    console.log(`Fetched ${allNotifications.length} notifications.`);

    const topNotifications = rankNotifications(allNotifications, 5);

    console.log('\n--- Priority Inbox (Top 5) ---');
    topNotifications.forEach((n, index) => {
      console.log(`${index + 1}. [${n.Type}] ${n.Message}`);
      console.log(`   Time: ${n.Timestamp}`);
      console.log('---------------------------');
    });

  } catch (error: any) {
    console.error('Error in Priority Inbox:', error.message);
  }
}

main();
