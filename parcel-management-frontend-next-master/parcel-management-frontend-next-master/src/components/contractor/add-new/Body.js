import React, { useState } from 'react';

const AddContractorBody = () => {
    const [contractorId, setContractorId] = useState('');
    const [loading, setLoading] = useState(false);
    const [contractorData, setContractorData] = useState({
        name: '',
        number: '',
       pincode: '',
    });

    async function handleSubmit(e) {
        e.preventDefault();

        const API = `http://${process.env.NEXT_PUBLIC_BACKEND_URL}/contractor/add-new`;

        const data = {
            name: contractorData.name.trim(),
            number: contractorData.number.trim(),
            pincode: contractorData.pincode.trim(),
        };

        if (Object.values(data).some((field) => !field)) {
            alert('All fields are required');
            return;
        }

        const params = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        };

        try {
            setLoading(true);

            const response = await fetch(API, params).then((res) => res.json());
            if (response.status === 'success') {
                alert('Contractor added successfully');
                setContractorId(response.id);
                resetForm();
            } else {
                alert('An error occurred');
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred');
        } finally {
            setLoading(false);
        }
    }

    function handleChange(e) {
        const { name, value } = e.target;
        setContractorData({ ...contractorData, [name]: value });
    }

    function resetForm() {
        setContractorData({
            name: '',
            number: '',
            pincode: '',
        });
    }

    return (
        <main className="container my-4">
            <div className="p-4 bg-light rounded shadow">
                <h1 className="text-center mb-4 text-dark">Add Contractor</h1>
                <form onSubmit={handleSubmit} className="row g-3">
                    {/* Contractor Name */}
                    <div className="col-12">
                        <label htmlFor="contractorName" className="form-label">
                            Contractor Name
                        </label>
                        <input
                            type="text"
                            id="contractorName"
                            name="name"
                            value={contractorData.name}
                            onChange={handleChange}
                            className="form-control"
                            placeholder="Enter contractor name"
                            required
                        />
                    </div>

                    {/* Phone Number */}
                    <div className="col-12">
                        <label htmlFor="number" className="form-label">
                            Phone Number
                        </label>
                        <input
                            type="tel"
                            id="number"
                            name="number"
                            value={contractorData.number}
                            onChange={handleChange}
                            className="form-control"
                            placeholder="Enter phone number"
                            pattern="[0-9]{10}"
                            required
                        />
                    </div>

                    {/* Region */}
                    <div className="col-12">
                        <label htmlFor="pincode" className="form-label">
                            Accessible Post Office PinCode
                        </label>
                        <input
                            type="text"
                            id="pincode"
                            name="pincode"
                            value={contractorData.pincode}
                            onChange={handleChange}
                            className="form-control"
                            placeholder="Enter post-office pincode"
                            required
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="col-12 text-center mt-4">
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Adding...' : 'Add Contractor'}
                        </button>
                    </div>
                </form>

                {/* Loading and Contractor ID */}
                {loading && <p className="text-center mt-3">Processing...</p>}
                {contractorId && (
                    <div className="mt-4 text-center">
                        <h5>Contractor Added Successfully</h5>
                        <p>Contractor ID: {contractorId}</p>
                    </div>
                )}
            </div>
        </main>
    );
};

export default AddContractorBody;
