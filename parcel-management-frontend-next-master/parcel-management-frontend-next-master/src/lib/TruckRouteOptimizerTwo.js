function aStarWithWaypoints(hubs, sourceId, destinationId, truckCapacity, maxWaypoints = 2) {
    // Helper function to calculate distance between two nodes
    function calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Radius of Earth in km
        const toRad = (deg) => (deg * Math.PI) / 180;

        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) *
            Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // Distance in km
    }

    // Heuristic cost function with parcel consideration
    function heuristicCost(current, neighbor, remainingCapacity) {
        const distance = calculateDistance(
            current.latitude,
            current.longitude,
            neighbor.latitude,
            neighbor.longitude
        );
        const parcelFactor = neighbor.numberOfParcels / (remainingCapacity || 1);
        return distance - parcelFactor; // Favor hubs with more parcels
    }

    // Find the next waypoint dynamically
    function findOptimalWaypoint(currentNode, remainingHubs, remainingCapacity) {
        return remainingHubs.reduce((bestHub, hub) => {
            const distance = calculateDistance(
                currentNode.latitude,
                currentNode.longitude,
                hub.latitude,
                hub.longitude
            );
            const score = hub.numberOfParcels / distance;
            return score > bestHub.score ? { hub, score } : bestHub;
        }, { hub: null, score: -Infinity }).hub;
    }

    // A* Routing with Waypoints
    const sourceNode = hubs.find((hub) => hub.id === sourceId);
    const destinationNode = hubs.find((hub) => hub.id === destinationId);
    let route = [sourceNode.id]; // Start route with source
    let currentNode = sourceNode;

    let remainingCapacity = truckCapacity;
    let remainingHubs = hubs.filter(
        (hub) => hub.id !== sourceId && hub.id !== destinationId
    );

    // Add waypoints dynamically
    let waypoints = [];
    while (waypoints.length < maxWaypoints && remainingHubs.length > 0) {
        const waypoint = findOptimalWaypoint(
            currentNode,
            remainingHubs,
            remainingCapacity
        );
        if (waypoint) {
            waypoints.push(waypoint.id);
            route.push(waypoint.id);

            // Update truck capacity and current node
            remainingCapacity -= Math.min(waypoint.numberOfParcels, remainingCapacity);
            currentNode = waypoint;

            // Remove waypoint from remaining hubs
            remainingHubs = remainingHubs.filter((hub) => hub.id !== waypoint.id);
        } else {
            break; // No viable waypoint found
        }
    }

    // Final leg to destination
    route.push(destinationNode.id);

    return route;
}




export {
    aStarWithWaypoints,
}
