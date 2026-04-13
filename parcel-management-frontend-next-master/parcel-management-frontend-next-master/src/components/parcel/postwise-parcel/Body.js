import React, { useLayoutEffect, useState } from 'react';
import { toast } from 'react-toastify';
import PostOfficeCard from "./PostOfficeCard";

const PostWiseParcelBody = () => {
    const [allParcel, setAllParcel] = useState([]);
    const [hasFetched, setHasFetched] = useState(false);
    const [loading, setLoading] = useState(false);
    const [postWiseParcel, setPostWiseParcel] = useState(null);

    async function getAllParcel() {
        const API = `http://${process.env.NEXT_PUBLIC_BACKEND_URL}/parcel/all-parcel`;
        const params = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        };

        try {
            setLoading(true);
            const response = await fetch(API, params).then((res) => res.json());
            console.log(response.data); // Check the structure of data here
            if (response.status === 'success') {
                setAllParcel(response.data);
                setHasFetched(true);
                toast.success('Parcels fetched successfully!');
                postWiseSotring(response.data);
            } else {
                toast.error(response.message || 'Failed to fetch parcels.');
            }
        } catch (err) {
            console.error(err);
            toast.error('Failed to fetch parcel data. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    async function postWiseSotring(allParcels) {
        const postWiseParcel = {};
        for (let i = 0; i < allParcels.length; i++) {
            const parcel = allParcels[i];
            if (!postWiseParcel[parcel.sender.pincode])
                postWiseParcel[parcel.sender.pincode] = [];
            postWiseParcel[parcel.sender.pincode].push(parcel);
        }

        console.log(postWiseParcel);
        setPostWiseParcel(postWiseParcel);
    }

    useLayoutEffect(() => {
        if (!hasFetched) getAllParcel();
    }, [hasFetched]);



    return (
        <main className="container my-3">
            <h1>Post Wise Parcels Details</h1>
            <button onClick={getAllParcel} className="btn btn-warning">Refresh</button>
            {postWiseParcel &&
                <div class="row row-cols-1 row-cols-md-2 g-4 my-2">
                    {Object.keys(postWiseParcel || {}).map((postOffice) => (
                        < PostOfficeCard key={postOffice} postOffice={postOffice} allParcels={postWiseParcel[postOffice]} />
                    ))}
                </div>
            }


        </main >
    )
}

export default PostWiseParcelBody