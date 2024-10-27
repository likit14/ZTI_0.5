import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Signup from "../View/Signup";
import ErrorPageContainer from "../View/ErrorPageContainer";
import Zti from "../Components/Z-mod/Zti";
import NetworkScanner from "../View/NetworkScanner";
import DesignatedNode from "../View/DesignatedNode";
import NewCloud from '../View/NewCloud'
import Dashboard from "../View/Dashboard";
import AddNodes from "../View/AddNodes";
import RemoveNodes from "../View/RemoveNodes";
export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPageContainer />,
    children: [
      {
        path: "/",
        element: <Dashboard />,
      },
      {
        path: "/newcloud",
        element: <NewCloud/>,
      },
      {
        path: "/networkscanner",
        element: <NetworkScanner />,
      },
      {
        path: "/designatednode",
        element: <DesignatedNode />,
      },
      {
        path: "/dashboard",
        element: <Dashboard />,
      },
      {
        path: "/addnodes",
        element: <AddNodes />,
      },
      {
        path: "/removenodes",
        element: <RemoveNodes />,
      },
    ],
  },
  {
    path: "/signup",
    element: <Signup />,
  },
  {
    path: "/*",
    element: <ErrorPageContainer />, // Fallback for any undefined routes
  },
]);
