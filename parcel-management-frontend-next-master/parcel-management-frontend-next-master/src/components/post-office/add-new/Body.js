import React, { useState } from 'react'
import { toast } from 'react-toastify';

const AddPostOfficeBody = () => {
    const [parcelId, setParcelId] = useState('');
    const [postOffice, setPostOffice] = useState({ name: '', lat: '', long: '', district: '', state: '', pin: '' });
    const [loading, setLoading] = useState(false);


    async function handleSubmit(e) {
        e.preventDefault();

        const API = `http://${process.env.NEXT_PUBLIC_BACKEND_URL}/post-office/add-new`;
        console.log("BACKEND URL");
        console.log(API);

        const data = {
            "name": postOffice.name.trim(),
            "lat": postOffice.lat.trim(),
            "long": postOffice.long.trim(),
            "district": postOffice.district.trim(),
            "state": postOffice.state.trim(),
            "pin": postOffice.pin.trim()
        };

        const params = {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        }

        try {
            setLoading(true);

            const response = await fetch(API, params).then(res => res.json());
            console.log(response);

            if (response.status === 'success') {
                toast.success('Post Office added successfully');
                setParcelId(response.id);
            } else {
                toast.error('An error occurred');
            }

            resetForm();
        } catch (error) {
            console.error(error);
            alert('An error occurred');
        } finally {
            setLoading(false)
        }
    }

    async function handleChange(e) {
        const { name, value } = e.target;
        setPostOffice({ ...postOffice, [name]: value });
    }

    async function resetForm() {
        setPostOffice({ name: '', lat: '', long: '', district: '', state: '', pin: '' });
    }

    return (
        <main className='container my-3'>
            <h1>Add Post Office</h1>

            <form onSubmit={handleSubmit}>
                <div className='mb-3'>
                    <label htmlFor='parcelId' className='form-label'>Post Office Name</label>
                    <input type='text' value={postOffice.name} onChange={handleChange} name='name' className='form-control' id='parcelId' />
                </div>

                <div className="d-flex flex-row gap-2 align-items-center">
                    {/* lattitude */}
                    <div className='mb-3'>
                        <label htmlFor='lat' className='form-label'>Lattitude</label>
                        <input value={postOffice.lat} onChange={handleChange} name='lat' type='text' className='form-control' id='lat' />
                    </div>

                    {/* Longitude */}
                    <div className='mb-3'>
                        <label htmlFor='long' className='form-label'>Longitude</label>
                        <input value={postOffice.long} onChange={handleChange} name='long' type='text' className='form-control' id='long' />
                    </div>
                </div>

                <div className="d-flex flex-row gap-2 align-items-center">

                    {/* PIN */}
                    <div className='mb-3'>
                        <label htmlFor='pin' className='form-label'>PIN Code</label>
                        <input value={postOffice.pin} onChange={handleChange} name='pin' type='text' className='form-control' id='pin' />
                    </div>

                    {/* District */}
                    <div className='mb-3'>
                        <label htmlFor='district' className='form-label'>District</label>
                        <input value={postOffice.district} onChange={handleChange} name='district' type='text' className='form-control' id='district' />
                    </div>

                    {/* State */}
                    <div className='mb-3'>
                        <label htmlFor='state' className='form-label'>State</label>
                        <input value={postOffice.state} onChange={handleChange} name='state' type='text' className='form-control' id='state' />
                    </div>
                </div>

                <button type='submit' className='btn btn-primary'>Add Post Office</button>
            </form>

            {
                loading && <p>Loading...</p>
            }

        </main>
    )
}

export default AddPostOfficeBody