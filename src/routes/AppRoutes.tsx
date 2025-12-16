import { Route, Routes } from "react-router-dom";
import Home from "../pages/Home";
import AreaHome from "../pages/AreaHome";
import AreaDashboard from "../pages/AreaDashboard";
import AdminDashboard from "../pages/AdminDashboard";

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/area" element={<AreaHome />} />
            <Route path="/dashboard/:id" element={<AreaDashboard />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
        </Routes>
    );
};
export default AppRoutes;