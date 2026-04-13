import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify';

const SetRouteBox = ({ id, routeId, AllRoutes }) => {

    const [selectedRoute, setSelectedRoute] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleChange(e) {
        e.preventDefault();
        let routeId = e.target.value;
        routeId = routeId.trim();

        console.log(`id: ${id}, routeId: ${routeId}`);
        const API = `http://${process.env.NEXT_PUBLIC_BACKEND_URL}/vehicle/set-route`
        const params = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                id: id,
                routeId: routeId
            })
        };

        try {
            setLoading(true);
            setSelectedRoute(routeId);
            const response = await fetch(API, params).then((res) => res.json());
            console.log(response);
            toast.success("Route set successfully");
        } catch (error) {
            console.log(error);
            toast.error("Failed to set route");
            setSelectedRoute('');
        } finally {
            setLoading(false);
        }

    }

    useEffect(() => {
        if (routeId && routeId.length > 0) {
            setSelectedRoute(routeId);
        }
        return () => {
            setSelectedRoute('');
        }
    }, [routeId])

    useEffect(() => {
        if (AllRoutes.length <= 0) {
            setSelectedRoute('');
        }
    }, [AllRoutes])


    return (
        <select className="form-select" value={selectedRoute} onChange={handleChange} disabled={loading}>
            {AllRoutes.length <= 0 &&
                <option value={''} disabled>-- No Route Found --</option>
            }
            {AllRoutes.length > 0 &&
                <option value={''} disabled>-- None Selected --</option>
            }

            {AllRoutes.length > 0 && AllRoutes.map((item, index) => (
                <option key={index} value={item._id}>
                    {item.routeName}{" "}
                    ({item.startLocation.name} to {item.endLocation.name})
                </option>
            ))}
        </select>
    )
}

export default SetRouteBox