import { Route, Routes } from "react-router-dom";
import Home from "../pages/Home";
import AreaHome from "../pages/AreaHome";

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/area" element={<AreaHome />} />

        </Routes>
    );
};
export default AppRoutes;