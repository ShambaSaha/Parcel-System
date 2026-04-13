import React, { useEffect, useState } from 'react'

const PostOfficeCard = ({ allParcels }) => {
    const [postDetails, setPostDetails] = useState(null);

    async function parcelStatistic() {
        const object = { sender: allParcels[0].sender, reciver: allParcels[0].reciver };

        let weight = 0, volume = 0;
        allParcels.map((item) => {
            weight += Number(item.weight);
            volume += Number(item.dimensions.length) * Number(item.dimensions.breadth) * Number(item.dimensions.height);
        })

        object.weight = weight;
        object.volume = volume;


        setPostDetails(object);
    }

    useEffect(() => {
        if (!allParcels || allParcels.length <= 0) return;

        parcelStatistic();

    }, [allParcels])

    return (
        <div class="col">
            {postDetails != null &&
                <div class="card">
                    <div class="card-header">
                        <h4>{postDetails?.sender?.city} ({postDetails?.sender?.pincode})</h4>
                    </div>
                    <div class="card-body fs-5">
                        <p class="card-title mb-1">Total Weight: {postDetails.weight / 1000}kg </p>
                        <p class="card-text mb-1">Total Volume: {postDetails.volume / 1000} cm<sup>3</sup></p>
                        <p class="card-text mb-1">Total Parcels: {allParcels.length}</p>
                        
                        <a href="#" class="btn btn-primary">Button</a>
                    </div>
                </div>
            }
        </div>
    )
}

export default PostOfficeCard