// Warehouse Locations
const WAREHOUSES = [
    {
        name: 'Central Logistics Hub',
        code: 'CLH',
        location: {
            city: 'Chicago',
            state: 'IL',
            coordinates: { lat: 41.8781, lon: -87.6298 }
        }
    },
    {
        name: 'West Coast Distribution Center',
        code: 'WCD',
        location: {
            city: 'Los Angeles',
            state: 'CA',
            coordinates: { lat: 34.0522, lon: -118.2437 }
        }
    },
    {
        name: 'East Coast Shipping Facility',
        code: 'ECS',
        location: {
            city: 'New York',
            state: 'NY',
            coordinates: { lat: 40.7128, lon: -74.0060 }
        }
    },
    {
        name: 'Southern Logistics Base',
        code: 'SLB',
        location: {
            city: 'Atlanta',
            state: 'GA',
            coordinates: { lat: 33.7490, lon: -84.3880 }
        }
    },
    {
        name: 'Midwest Regional Warehouse',
        code: 'MRW',
        location: {
            city: 'Dallas',
            state: 'TX',
            coordinates: { lat: 32.7767, lon: -96.7970 }
        }
    }
];

// Destination Cities
const DESTINATION_CITIES = [
    'Seattle', 'San Francisco', 'Denver', 'Phoenix',
    'Houston', 'Miami', 'Boston', 'Philadelphia',
    'Washington DC', 'Las Vegas', 'Portland', 'Salt Lake City'
];

// Parcel Types
const PARCEL_TYPES = [
    'Electronics', 'Clothing', 'Machinery',
    'Furniture', 'Medical Supplies', 'Automotive Parts'
];

function generateParcels(count = 200) {
    const parcels = [];

    for (let i = 0; i < count; i++) {
        // Randomly select origin warehouse
        const originWarehouse = WAREHOUSES[Math.floor(Math.random() * WAREHOUSES.length)];

        // Randomly select destination (ensuring it's different from origin)
        let destinationCity;
        do {
            destinationCity = DESTINATION_CITIES[Math.floor(Math.random() * DESTINATION_CITIES.length)];
        } while (destinationCity === originWarehouse.location.city);

        // Generate parcel details
        const parcel = {
            id: `PRC-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
            origin: {
                warehouse: originWarehouse.name,
                warehouseCode: originWarehouse.code,
                city: originWarehouse.location.city,
                state: originWarehouse.location.state
            },
            destination: {
                city: destinationCity
            },
            details: {
                type: PARCEL_TYPES[Math.floor(Math.random() * PARCEL_TYPES.length)],
                weight: Number((Math.random() * 500 + 10).toFixed(2)), // 10-510 kg
                volume: Number((Math.random() * 10 + 0.5).toFixed(2)), // 0.5-10.5 cubic meters
                quantity: Math.floor(Math.random() * 10) + 1 // 1-10 items
            },
            shipping: {
                priority: ['Standard', 'Express', 'Priority'][Math.floor(Math.random() * 3)],
                estimatedDeliveryDays: Math.floor(Math.random() * 7) + 1 // 1-7 days
            },
            trackingInfo: {
                status: 'Pending',
                createdAt: new Date(),
                updatedAt: new Date()
            }
        };

        parcels.push(parcel);
    }

    return parcels;
}

// Generate report statistics
function generateParcelReport(parcels) {
    const statistics = {
        totalParcels: parcels.length,
        parcelsByWarehouse: {},
        parcelsByType: {},
        weightDistribution: {
            min: Infinity,
            max: -Infinity,
            average: 0
        },
        priorityBreakdown: {}
    };

    // Calculate statistics
    let totalWeight = 0;
    parcels.forEach(parcel => {
        // Warehouse count
        statistics.parcelsByWarehouse[parcel.origin.warehouse] =
            (statistics.parcelsByWarehouse[parcel.origin.warehouse] || 0) + 1;

        // Parcel type count
        statistics.parcelsByType[parcel.details.type] =
            (statistics.parcelsByType[parcel.details.type] || 0) + 1;

        // Weight calculations
        totalWeight += parcel.details.weight;
        statistics.weightDistribution.min = Math.min(
            statistics.weightDistribution.min,
            parcel.details.weight
        );
        statistics.weightDistribution.max = Math.max(
            statistics.weightDistribution.max,
            parcel.details.weight
        );

        // Priority breakdown
        statistics.priorityBreakdown[parcel.shipping.priority] =
            (statistics.priorityBreakdown[parcel.shipping.priority] || 0) + 1;
    });

    // Calculate average weight
    statistics.weightDistribution.average =
        Number((totalWeight / parcels.length).toFixed(2));

    return statistics;
}

// Demo function to run the generator and show results
function runParcelGenerator() {
    // Generate 100 parcels
    const parcels = generateParcels(100);

    // Generate report
    const report = generateParcelReport(parcels);

    console.log('Generated Parcels Sample (First 5):');
    console.log(JSON.stringify(parcels.slice(0, 5), null, 2));

    console.log('\nParcel Statistics:');
    console.log(JSON.stringify(report, null, 2));

    return { parcels, report };
}

// Run the generator
const { parcels, report } = runParcelGenerator();

// Export for potential module usage
export {
    generateParcels,
    generateParcelReport,
    WAREHOUSES,
    DESTINATION_CITIES
};