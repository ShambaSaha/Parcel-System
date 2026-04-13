import React from 'react'

const RoutesForm = ({ allCheckpoints, setAllCheckpoints, handleSubmit, resetForm, routeName, setRouteName }) => {

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
        console.log(index)
        const list = [...allCheckpoints];
        const temp = list[index];
        list[index] = list[index - 1];
        list[index - 1] = temp;
        setAllCheckpoints(list);
    }

    // function to move the Point down in the index
    async function moveDown(index) {
        if (index === allCheckpoints.length - 1) return;
        console.log(index)
        const list = [...allCheckpoints];
        const temp = list[index];
        list[index] = list[index + 1];
        list[index + 1] = temp;
        setAllCheckpoints(list);
    }

    return (<form onSubmit={handleSubmit} onReset={resetForm}>
        {/* Route Name */}
        <div className="mb-3">
            <label className="form-label">Route Name <span className='text-danger'> *</span></label>
            <input type="text" value={routeName} onChange={(e) => setRouteName(e.target.value)} className="form-control" required />
        </div>

        {
            (allCheckpoints.map((item, index) => {
                return (<div key={index} className='mb-3'>
                    <p className='fs-5 fw-bold mb-0'>Check Point {index + 1}</p>

                    {/* Name */}
                    <div className="mb-3">
                        <label className="form-label">Name <span className='text-danger'> *</span></label>
                        <input type="text" value={allCheckpoints[index].name} onChange={(e) => handleChange(e, index)} name="name" className="form-control" required />
                    </div>

                    {/* Latitude */}
                    <div className="mb-3">
                        <label className="form-label">Latitude</label>
                        <input type="text" value={allCheckpoints[index].lat} onChange={(e) => handleChange(e, index)} name="lat" className="form-control" />
                    </div>

                    {/* Longitude */}
                    <div className="mb-3">
                        <label className="form-label">Longitude</label>
                        <input type="text" value={allCheckpoints[index].long} onChange={(e) => handleChange(e, index)} name="long" className="form-control" />
                    </div>

                    {/* Type */}
                    {/* Can be post-office or parcel-hub */}
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

                    <div className="d-flex gap-2">
                        <button onClick={(e) => deletePoint(index)} type='button'
                            className="btn btn-danger">Delete</button>
                        <button onClick={() => moveUp(index)} type='button' className="btn btn-primary"
                            disabled={index === 0}
                        >Move Up &uarr;</button>

                        <button onClick={() => moveDown(index)} type='button' className="btn btn-primary"
                            disabled={index === allCheckpoints.length - 1}
                        >Move Down &darr;</button>
                    </div>
                    <hr />
                </div>)
            }))
        }

        <div className="d-flex w-100 gap-2 my-3">
            <button type="submit" className="btn btn-success w-100">Submit</button>
            <button type='button' onClick={addCheckPoint} className='btn btn-dark w-100'>Add Point</button>
            <button type="reset" className="btn btn-danger w-100">Reset</button>
        </div>

    </form>)
}

export default RoutesForm