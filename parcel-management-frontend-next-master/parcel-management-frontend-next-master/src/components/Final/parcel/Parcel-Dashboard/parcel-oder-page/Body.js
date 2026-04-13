import React from 'react'
import PinChooseBox from './PinChooseBox'

const ParcelOrderBody = () => {
    return (
        <main className="container my-2">
            <h1>Parcel Order Page</h1>

            <form>
                <div className="mb-3">
                    <label className='form-label'>Parcel Name</label>
                    <input className='form-control' type="text" />
                </div>


                <PinChooseBox />
            </form>
        </main>
    )
}

export default ParcelOrderBody