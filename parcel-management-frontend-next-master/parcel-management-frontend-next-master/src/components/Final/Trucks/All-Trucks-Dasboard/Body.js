import React from 'react'
import SidePannel from './SidePannel'
import BottomPannel from './BottomPannel'
import TruckOnMap from './OlaMaps'

const AllTrucksDashboardBody = () => {
    return (
        <div className="container my-3 rounded rounded-2">
            <div className="d-flex flex-column bg-danger h-50 gap-2">

                <div className="d-flex flex-row bg-warning h-50 gap-2" style={{ "minHeight": "60vh" }}>
                    <div className='bg-warning' style={{ width: "60%" }}><TruckOnMap /></div>
                    <div className='bg-success' style={{ width: "40%" }}><SidePannel /></div>
                </div>

                <div className="bg-primary">
                    <BottomPannel />
                </div>
            </div>
        </div>
    )
}

export default AllTrucksDashboardBody