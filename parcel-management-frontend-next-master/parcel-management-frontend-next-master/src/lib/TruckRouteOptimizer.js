class Location {
    constructor(name, latitude, longitude, capacity = Infinity) {
        this.id = crypto.randomUUID();
        this.name = name;
        this.latitude = latitude;
        this.longitude = longitude;
        this.capacity = capacity;
        this.currentLoad = 0;
    }
}

class Parcel {
    constructor(origin, destination, volume, weight, id = null) {
        this.id = id ?? crypto.randomUUID();
        this.origin = origin;
        this.destination = destination;
        this.volume = volume;
        this.weight = weight;
        this.timestamp = new Date();
        this.trackingStatus = 'PENDING';
    }
}

class Truck {
    constructor(currentLocation, maxCapacity = 1000) {
        this.id = crypto.randomUUID();
        this.currentLocation = currentLocation;
        this.maxCapacity = maxCapacity;
        this.currentLoad = 0;
        this.currentVolume = 0;
        this.parcels = [];
        this.routeHistory = [currentLocation];
        this.status = 'AVAILABLE';
    }
}

class RoutingOptimizer {
    constructor() {
        this.locations = new Map();
        this.trucks = new Map();
        this.parcels = new Map();
        this.routeMatrix = new Map();
    }

    addLocation(name, latitude, longitude, capacity = Infinity) {
        const location = new Location(name, latitude, longitude, capacity);
        this.locations.set(name, location);
        return location.id;
    }

    addTruck(currentLocation, maxCapacity = 1000) {
        const truck = new Truck(currentLocation, maxCapacity);
        this.trucks.set(truck.id, truck);
        return truck.id;
    }

    addParcel(origin, destination, volume, weight, id = null) {
        const parcel = new Parcel(origin, destination, volume, weight, id);
        this.parcels.set(parcel.id, parcel);
        return parcel.id;
    }

    defineRoute(start, end, waypoints) {
        this.routeMatrix.set(`${start}-${end}`, waypoints);
    }

    findOptimalTruck(parcel) {
        for (const [truckId, truck] of this.trucks) {
            if (
                truck.currentLoad + parcel.weight <= truck.maxCapacity &&
                truck.currentLocation === parcel.origin
            ) {
                return truckId;
            }
        }
        return null;
    }

    calculateOptimalRoute(start, end) {
        const routeKey = `${start}-${end}`;

        // Check predefined routes
        if (this.routeMatrix.has(routeKey)) {
            return this.routeMatrix.get(routeKey);
        }

        // Simple direct routing
        return [start, end];
    }

    dynamicReroute(truckId) {
        const truck = this.trucks.get(truckId);

        // Analyze parcel volumes at current location
        const parcelVolumes = new Map();
        for (const parcel of this.parcels.values()) {
            if (parcel.origin === truck.currentLocation) {
                const currentVolume = parcelVolumes.get(parcel.destination) || 0;
                parcelVolumes.set(
                    parcel.destination,
                    currentVolume + parcel.volume
                );
            }
        }

        // Find destination with highest parcel volume
        if (parcelVolumes.size > 0) {
            const highestVolumeDestination = Array.from(parcelVolumes.entries())
                .reduce((a, b) => b[1] > a[1] ? b : a)[0];

            // Calculate and update route
            const optimalRoute = this.calculateOptimalRoute(
                truck.currentLocation,
                highestVolumeDestination
            );

            truck.routeHistory.push(...optimalRoute);
            truck.currentLocation = highestVolumeDestination;
        }
    }

    processParcels() {
        const unassignedParcels = Array.from(this.parcels.values());

        for (const parcel of unassignedParcels) {
            const truckId = this.findOptimalTruck(parcel);

            if (truckId) {
                const truck = this.trucks.get(truckId);

                // Assign parcel to truck
                truck.parcels.push(parcel);
                truck.currentLoad += parcel.weight;

                // Update tracking
                parcel.trackingStatus = 'IN_TRANSIT';
                truck.status = 'LOADED';

                // Remove from unassigned parcels
                this.parcels.delete(parcel.id);
            }
        }
    }

    generateRoutingReport() {
        return {
            totalTrucks: this.trucks.size,
            totalParcels: this.parcels.size,
            truckStatus: Object.fromEntries(
                Array.from(this.trucks.entries()).map(([truckId, truck]) => [
                    truckId,
                    {
                        currentLocation: truck.currentLocation,
                        load: truck.currentLoad,
                        status: truck.status
                    }
                ])
            ),
            parcelDistribution: Object.fromEntries(
                Array.from(this.parcels.entries()).map(([parcelId, parcel]) => [
                    parcelId,
                    {
                        origin: parcel.origin,
                        destination: parcel.destination,
                        status: parcel.trackingStatus
                    }
                ])
            )
        };
    }
}


// Export for potential module usage
export {
    RoutingOptimizer,
    Location,
    Truck,
    Parcel
};