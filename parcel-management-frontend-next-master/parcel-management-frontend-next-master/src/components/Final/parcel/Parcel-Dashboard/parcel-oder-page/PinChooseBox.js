import React, { useEffect, useState } from 'react'

const PinChooseBox = () => {
    const [pin, setPin] = useState('');
    const [allPosts, setAllPosts] = useState([]);
    const [selectedPost, setSelectedPost] = useState({});
    const [city, setCity] = useState('');
    const [district, setDistrict] = useState('')


    async function fetchPostOffices() {
        const Pincode = pin.trim();
        if (Pincode.length < 5) return;

        const API = `https://`
        const body = { Pincode };
        const params = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        }

        document.getElementById('dropdownButton').click()
    }

    useEffect(() => {
        if (pin.length > 3)
            fetchPostOffices()
    }, [pin])


    return (
        <>
            <div className='mb-3'>
                <label className='form-label'>Pincode</label>
                <input value={pin} onChange={(e) => setPin(e.target.value)} className='form-control' type="text" />
                {
                    (allPosts.length == 0) &&
                    <div className="btn-group">
                        <button id="dropdownButton" className="btn btn-sm dropdown-toggle visually-hidden" type="button" data-bs-toggle="dropdown" data-bs-auto-close="true" aria-expanded="false" >Default dropdown</button>

                        <ul class="dropdown-menu">

                            <li><button className="dropdown-item" type="button">Menu item</button></li>
                        </ul>

                    </div>
                }
            </div>


            <div className='mb-3'>
                <label className='form-label'>City</label>
                <input value={city} onChange={(e) => setCity(e.target.value)} className='form-control' type="text" />
            </div>

            <div className='mb-3'>
                <label className='form-label'>District</label>
                <input value={district} onChange={(e) => setDistrict(e.target.value)} className='form-control' type="text" />
            </div>


        </>
    )
}

export default PinChooseBox