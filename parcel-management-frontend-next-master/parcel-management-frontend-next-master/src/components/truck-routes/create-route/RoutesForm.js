import React from 'react'
import { toast } from 'react-toastify';

const RoutesForm = ({ 
    allCheckpoints, 
    setAllCheckpoints, 
    handleSubmit, 
    resetForm, 
    routeName, 
    setRouteName,
    handleUpdateDynamicCheckpoint // <-- Newly added prop
}) => {

    const checkPointSchema = { name: "", lat: "", long: "", type: "post-office" };

    async function addCheckPoint() {
        if (allCheckpoints.length >= 50) {
            toast.warn('Maximum number of checkpoints reached')
            return;
        }
        setAllCheckpoints([...allCheckpoints, checkPointSchema])
    }

    async function handleChange(e, index) {
        const { name, value } = e.target;
        const list = [...allCheckpoints];
        list[index][name] = value;
        setAllCheckpoints(list);
    }

    async function deletePoint(index) {
        if (allCheckpoints.length === 1) {
            toast.warn('Minimum number of checkpoints reached')
            return;
        }
        console.log(`Deleting Point : ${index}`)
        const list = [...allCheckpoints];
        list.splice(index, 1);
        setAllCheckpoints(list);
    }

    // function to move the Point up in index
    async function moveUp(index) {
        if (index === 0) return;
        const list = [...allCheckpoints];
        const temp = list[index];
        list[index] = list[index - 1];
        list[index - 1] = temp;
        setAllCheckpoints(list);
    }

    // function to move the Point down in the index
    async function moveDown(index) {
        if (index === allCheckpoints.length - 1) return;
        const list = [...allCheckpoints];
        const temp = list[index];
        list[index] = list[index + 1];
        list[index + 1] = temp;
        setAllCheckpoints(list);
    }

    return (
        <form onSubmit={handleSubmit} onReset={resetForm}>
            {/* Route Name */}
            <div className="mb-3">
                <label className="form-label">Route Name <span className='text-danger'> *</span></label>
                <input type="text" value={routeName} onChange={(e) => setRouteName(e.target.value)} className="form-control" required />
            </div>

            {
                (allCheckpoints.map((item, index) => {
                    return (
                        <div key={index} className='mb-3 p-3 border rounded bg-light'>
                            <p className='fs-5 fw-bold mb-3'>Check Point {index + 1}</p>

                            {/* Name & Geocode Trigger */}
                            <div className="mb-3">
                                <label className="form-label">Location Name <span className='text-danger'> *</span></label>
                                <div className="d-flex gap-2">
                                    <input 
                                        type="text" 
                                        value={allCheckpoints[index].name} 
                                        onChange={(e) => handleChange(e, index)} 
                                        name="name" 
                                        className="form-control" 
                                        placeholder="e.g., Howrah Station"
                                        required 
                                    />
                                    {/* NEW: Button to trigger coordinate fetching */}
                                    <button 
                                        type="button" 
                                        className="btn btn-outline-primary text-nowrap"
                                        onClick={() => handleUpdateDynamicCheckpoint(index, allCheckpoints[index].name, allCheckpoints[index].type)}
                                        disabled={!allCheckpoints[index].name}
                                    >
                                        Get Coordinates
                                    </button>
                                </div>
                                <small className="text-muted">Enter a place name and click "Get Coordinates" to locate it on the map.</small>
                            </div>

                            {/* Latitude */}
                            <div className="mb-3">
                                <label className="form-label">Latitude</label>
                                <input 
                                    type="text" 
                                    value={allCheckpoints[index].lat} 
                                    name="lat" 
                                    className="form-control" 
                                    placeholder="Auto-filled after getting coordinates"
                                    readOnly 
                                />
                            </div>

                            {/* Longitude */}
                            <div className="mb-3">
                                <label className="form-label">Longitude</label>
                                <input 
                                    type="text" 
                                    value={allCheckpoints[index].long} 
                                    name="long" 
                                    className="form-control" 
                                    placeholder="Auto-filled after getting coordinates"
                                    readOnly 
                                />
                            </div>

                            {/* Type */}
                            <div className="mb-3">
                                <label className="form-label">Type</label>
                                <select
                                    name="type"
                                    value={allCheckpoints[index].type}
                                    onChange={(e) => handleChange(e, index)}
                                    className="form-control"
                                >
                                    <option value="post-office">Post Office</option>
                                    <option value="parcel-hub">Parcel Hub</option>
                                </select>
                            </div>

                            {/* Action Buttons */}
                            <div className="d-flex gap-2">
                                <button onClick={() => deletePoint(index)} type='button' className="btn btn-danger">Delete</button>
                                <button onClick={() => moveUp(index)} type='button' className="btn btn-secondary" disabled={index === 0}>Move Up &uarr;</button>
                                <button onClick={() => moveDown(index)} type='button' className="btn btn-secondary" disabled={index === allCheckpoints.length - 1}>Move Down &darr;</button>
                            </div>
                        </div>
                    )
                }))
            }

            <div className="d-flex w-100 gap-2 my-4">
                <button type="submit" className="btn btn-success w-100 py-2 fw-bold">Submit Route</button>
                <button type='button' onClick={addCheckPoint} className='btn btn-dark w-100 py-2'>Add New Point</button>
                <button type="reset" className="btn btn-outline-danger w-100 py-2">Reset Form</button>
            </div>
        </form>
    )
}

export default RoutesForm