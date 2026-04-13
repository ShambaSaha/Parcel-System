class Parcel {
    constructor(id, length, breadth, height) {
        this.id = id;
        this.length = length;
        this.breadth = breadth;
        this.height = height;
        this.volume = length * breadth * height;
    }
}

class TruckLoadOptimizer {
    constructor(truckLength, truckBreadth, truckHeight) {
        this.truckVolume = truckLength * truckBreadth * truckHeight;
        this.truckDimensions = { length: truckLength, breadth: truckBreadth, height: truckHeight };
    }

    // Greedy approach with volume-based selection and 3D space optimization
    optimizeLoading(parcels) {
        // Sort parcels by volume in descending order
        const sortedParcels = parcels.sort((a, b) => b.volume - a.volume);

        const loadedParcels = [];
        let remainingVolume = this.truckVolume;

        for (const parcel of sortedParcels) {
            // Check if parcel fits in remaining truck volume
            if (parcel.volume <= remainingVolume) {
                loadedParcels.push(parcel);
                remainingVolume -= parcel.volume;
            }
        }

        return {
            loadedParcels,
            totalVolume: this.truckVolume,
            utilizedVolume: this.truckVolume - remainingVolume,
            utilizationPercentage: ((this.truckVolume - remainingVolume) / this.truckVolume) * 100
        };
    }

    // Advanced 3D packing algorithm using bin packing approach
    advancedPacking(parcels) {
        // Clone parcels to avoid modifying original array
        const availableParcels = [...parcels];

        // Sort parcels by volume in descending order
        availableParcels.sort((a, b) => b.volume - a.volume);

        const loadedParcels = [];
        const packingSpace = [];
        let remainingVolume = this.truckVolume;

        for (const parcel of availableParcels) {
            // Check if parcel can be placed in existing spaces or as a new layer
            const canPlace = this.findOptimalPlacement(parcel, packingSpace, this.truckDimensions);

            if (canPlace) {
                loadedParcels.push(parcel);
                packingSpace.push({
                    parcel: parcel,
                    position: canPlace
                });
                remainingVolume -= parcel.volume;
            }
        }

        return {
            loadedParcels,
            packingSpace,
            totalVolume: this.truckVolume,
            utilizedVolume: this.truckVolume - remainingVolume,
            utilizationPercentage: ((this.truckVolume - remainingVolume) / this.truckVolume) * 100
        };
    }

    findOptimalPlacement(parcel, currentPacking, truckDimensions) {
        // Placeholder for complex 3D placement logic
        // In a real implementation, this would:
        // 1. Check existing packed parcels' positions
        // 2. Determine optimal placement considering:
        //    - Vertical stacking
        //    - Horizontal arrangement
        //    - Weight distribution
        //    - Parcel orientation

        // Simple space check example
        if (currentPacking.length === 0) {
            return { x: 0, y: 0, z: 0 };
        }

        // Basic placement logic (very simplistic)
        const lastPlacement = currentPacking[currentPacking.length - 1].position;
        return {
            x: lastPlacement.x + parcel.length,
            y: lastPlacement.y,
            z: lastPlacement.z
        };
    }

    // Improbved by ChatGPT
    findOptimalPlacement2nd(parcel, currentPacking, truckDimensions) {
        const { length: truckLength, width: truckWidth, height: truckHeight } = truckDimensions;

        // Check if the parcel fits within the truck dimensions without rotation
        const canFit = (parcel, x, y, z) =>
            x + parcel.length <= truckLength &&
            y + parcel.width <= truckWidth &&
            z + parcel.height <= truckHeight;

        // Check if a parcel overlaps with an already placed one
        const doesOverlap = (p1, p2) =>
            !(p1.x + p1.length <= p2.x || p1.x >= p2.x + p2.length ||
                p1.y + p1.width <= p2.y || p1.y >= p2.y + p2.width ||
                p1.z + p1.height <= p2.z || p1.z >= p2.z + p2.height);

        // Attempt to find a suitable position
        for (let z = 0; z <= truckHeight - parcel.height; z++) {
            for (let y = 0; y <= truckWidth - parcel.width; y++) {
                for (let x = 0; x <= truckLength - parcel.length; x++) {
                    const position = { x, y, z };

                    // Check if the current position is valid
                    if (canFit(parcel, x, y, z)) {
                        let validPlacement = true;

                        // Ensure no overlap with existing parcels
                        for (const packedParcel of currentPacking) {
                            if (doesOverlap(
                                { ...position, length: parcel.length, width: parcel.width, height: parcel.height },
                                { ...packedParcel.position, ...packedParcel.dimensions }
                            )) {
                                validPlacement = false;
                                break;
                            }
                        }

                        // Return the position if valid
                        if (validPlacement) {
                            return position;
                        }
                    }
                }
            }
        }

        // If no position is found, return null
        return null;
    }

}

export {
    Parcel, TruckLoadOptimizer
}