import { createBrowserRouter, Navigate } from "react-router-dom"
import LoginPage from "../pages/Login"
import NotFound from "../pages/NotFound"

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "*", // Catch-all 404 route
    element: <NotFound />,
  },
])

export default router
