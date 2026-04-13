import { calculateVolume } from '@/lib/volumeCalculator';
import { useState } from 'react';
import { toast } from 'react-toastify';

const AddVehicleBody = () => {
    const [vehicle, setVehicle] = useState({ name: "", number: "", length: "", breadth: "", height: "", weight: "", fuelCapacity: "" })
    const [loading, setLoading] = useState(false);

    async function handleChange(e) {
        setVehicle({ ...vehicle, [e.target.name]: e.target.value })
    }

    async function handleSubmit(e) {
        e.preventDefault();
        console.log(vehicle);

        const totalVolume = calculateVolume(Number(vehicle.length) * 100, Number(vehicle.breadth), Number(vehicle.height) * 100);
        console.log(`totalVolume = ${totalVolume}`);
        // return;

        const body = {
            ...vehicle,
            length: Number(vehicle.length) * 100,
            breadth: Number(vehicle.breadth) * 100,
            height: Number(vehicle.height) * 100,
            totalVolume,
            status: "IDLE" // ✅ IMPORTANT
        };

        const API = `http://${process.env.NEXT_PUBLIC_BACKEND_URL}/vehicle/add-new`;
        const params = {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        }

        try {
            setLoading(true)
            const response = await fetch(API, params);
            const data = await response.json();
            console.log(data);

            if (data.status === "success") {
                toast.success("Vehicle Added Successfully")
                clearForm();
            } else {
                toast.error(data.message)
            }
        } catch (err) {
            console.log(err);
            toast.error("Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    async function clearForm() {
        setVehicle({ name: "", number: "", length: "", breadth: "", height: "", weight: "", fuelCapacity: "" })
    }

    return (
        <main className="container my-2">
            <h1>Add New Vehicle</h1>

            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor='vehicleName' className="form-label">Vehicle Name</label>
                    <input value={vehicle.name} onChange={handleChange} name="name" type="text" className="form-control" id="vehicleName" placeholder="Enter Vehicle Name" required />
                </div>


                <div className="mb-3">
                    <label htmlFor='vehicleNumber' className="form-label">Vehicle Number</label>
                    <input value={vehicle.number} onChange={handleChange} name="number" type="text" className="form-control" id="vehicleNumber" placeholder="Enter Vehicle Name" required />
                </div>

                <div className="d-flex flex-row gap-2">
                    <div className="mb-3 w-100">
                        <label className="form-label">Truck Length (in meter)</label>
                        <input value={vehicle.length} onChange={handleChange} name="length" type="number" className="form-control" id="vehicleName" placeholder="Enter Vehicle Length" required />
                    </div>
                    <div className="mb-3 w-100">
                        <label className="form-label">Truck Breadth (in meter)</label>
                        <input value={vehicle.breadth} onChange={handleChange} name="breadth" type="number" className="form-control" id="vehicleName" placeholder="Enter Vehicle Breadth" required />
                    </div>
                    <div className="mb-3 w-100">
                        <label className="form-label">Truck Height (in meter)</label>
                        <input value={vehicle.height} onChange={handleChange} name="height" type="number" className="form-control" id="vehicleName" placeholder="Enter Vehicle Height" required />
                    </div>

                </div>
                <div className="mb-3">
                    <label className="form-label">Maximum Weight (in KG)</label>
                    <input value={vehicle.weight} onChange={handleChange} name="weight" type="number" className="form-control" id="vehicleName" placeholder="Enter Vehicle Name" required />
                </div>
                <div className="mb-3">
                    <label className="form-label">Fuel Capacity</label>
                    <input value={vehicle.fuelCapacity} onChange={handleChange} name="fuelCapacity" type="number" className="form-control" id="vehicleName" placeholder="Enter Vehicle Name" required />
                </div>

                <button className='btn btn-success'>Add New Vehicle</button>
                <button className='btn btn-danger ms-2'>Cancel</button>
            </form>

        </main>
    )
}

export default AddVehicleBody


