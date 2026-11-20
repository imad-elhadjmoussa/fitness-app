const MAX_CITY_GAP_MS = 24 * 60 * 60 * 1000;

function findMultiCityPairs(workouts) {
    const workoutsByUser = new Map();

    for (const workout of workouts) {
        const city = typeof workout.city === "string" ? workout.city.trim() : "";
        const date = new Date(workout.date);
        if (!city || Number.isNaN(date.getTime())) continue;

        const userId = String(workout.userId);
        const userWorkouts = workoutsByUser.get(userId) || [];
        userWorkouts.push({ city, date });
        workoutsByUser.set(userId, userWorkouts);
    }

    const pairs = [];
    for (const [userId, userWorkouts] of workoutsByUser) {
        userWorkouts.sort((a, b) => a.date.getTime() - b.date.getTime());

        for (let i = 0; i < userWorkouts.length; i += 1) {
            for (let j = i + 1; j < userWorkouts.length; j += 1) {
                const workoutA = userWorkouts[i];
                const workoutB = userWorkouts[j];
                const gapMs = workoutB.date.getTime() - workoutA.date.getTime();
                if (gapMs > MAX_CITY_GAP_MS) break;

                if (workoutA.city.toLowerCase() === workoutB.city.toLowerCase()) {
                    continue;
                }

                pairs.push({
                    userId,
                    cityA: workoutA.city,
                    timeA: workoutA.date.toISOString(),
                    cityB: workoutB.city,
                    timeB: workoutB.date.toISOString(),
                    gapHours: Math.round((gapMs / 3600000) * 100) / 100
                });
            }
        }
    }

    return pairs.sort((a, b) => b.timeB.localeCompare(a.timeB));
}

module.exports = { findMultiCityPairs };
