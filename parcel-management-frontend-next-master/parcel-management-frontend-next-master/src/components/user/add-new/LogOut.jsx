import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useGlobalContext } from "../../../context/GlobalContext";

export const LogOut = () => {
    const { LogoutUser } = useGlobalContext();

    useEffect(() => {
        LogoutUser();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <Navigate to="/" replace />;
};
