import React, { useState } from 'react'

const ViewTruckRoutesBody = () => {
    const [allRoutes, setAllRoutes] = useState([]);
    const [hasFetched, setHasFetched] = useState(false);
    const [loading, setLoading] = useState(false)

    async function fetchAllRoutes() {
        const API = `http://${process.env.NEXT_PUBLIC_BACKEND_URL}/truck-routes/get-all-routes`

        const params = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        }

        try {
            const res = await fetch(API, params).then(res => res.json())
            console.log(res)

            setAllRoutes(res.data)
            setHasFetched(true)
        } catch (error) {
            console.log(error)
        }

    }


    return (
        <main className="container my-3">
            <h1>View Truck Routes</h1>
            <button onClick={fetchAllRoutes} className="btn btn-warning">Refresh</button>

            {
                (hasFetched === true && allRoutes.length <= 0) &&
                <div className="alert alert-danger my-3" role="alert">
                    <p className='text-danger'>No Routes Found</p>
                </div>
            }

            {
                (hasFetched === true && allRoutes.length > 0) &&
                <div className="table-responsive my-2">
                    <table className="table table-striped" >
                        <thead className="table-dark">
                            <tr>
                                <th scope="col">#</th>
                                <th scope="col">Route Name</th>
                                <th scope="col">Start Location</th>
                                <th scope="col">End Location</th>
                                <th scope="col">Waypoints</th>
                                <th scope="col">Distance</th>
                                <th scope="col">Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                allRoutes.map((item, index) => {
                                    return (
                                        <tr key={index}>
                                            <td>{index + 1}</td>
                                            <td>{item.routeName}</td>
                                            <td>{item.startLocation.name}</td>
                                            <td>{item.endLocation.name}</td>
                                            <td>{item.waypoints.map((point, i) => {
                                                return (<span title={`${point?.lat}, ${point?.long}`} key={i}>
                                                    <a href={`https://www.google.com/maps?q=${point?.lat},${point?.long}`}
                                                        className="link-primary" target='_blank' > {point.name}</a>
                                                    {(i !== item.waypoints.length - 1) &&
                                                        <span>&rarr;</span>}
                                                </span>)
                                            })}</td>
                                            <td>{item.distance}</td>
                                            <td>{item.estimatedTime}</td>
                                        </tr>
                                    )
                                })
                            }
                        </tbody>
                    </table>
                </div >
            }



        </main >
    )
}

export default ViewTruckRoutesBody