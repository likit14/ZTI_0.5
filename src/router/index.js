import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Signup from "../View/Signup";
import ErrorPageContainer from "../View/ErrorPageContainer";
import Siem from "../View/Siem";
import Iaas from "../View/Iaas";
import NetworkScanner from "../View/NetworkScanner";
import DesignatedNode from "../View/DesignatedNode";
import NewCloud from "../View/NewCloud";
import Dashboard from "../View/Dashboard";
import AddNodes from "../View/AddNodes";
import RemoveNodes from "../View/RemoveNodes";
import AiWorkbench from "../View/AiWorkbench";
import Daas from "../View/DaaS";
import Noc from "../View/Noc";
import Lifecyclemgmt from "../View/Lifecyclemgmt";
import Migration from "../View/Migration";
import Compliance from "../View/Compliance";
import Setting from "../View/Setting";
import Administration from "../View/Administration";

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
        element: <NewCloud />,
      },
      {
        path: "/networkscanner",
        element: <NetworkScanner />,
      },
      {
        path: "/iaas",
        element: <Iaas />,
      },
      {
        path: "/aiworkbench",
        element: <AiWorkbench />,
      },
      {
        path: "/siem",
        element: <Siem />,
      },
      {
        path: "/designatednode",
        element: <DesignatedNode />,
      },
      {
        path: "/siem",
        element: <Siem />,
      },
      {
        path: "/daas",
        element: <Daas />,
      },
      {
        path: "/noc",
        element: <Noc />,
      },
      {
        path: "/lifecyclemgmt",
        element: <Lifecyclemgmt />,
      },
      {
        path: "/migration",
        element: <Migration />,
      },
      {
        path: "/compliance",
        element: <Compliance />,
      },
      {
        path: "/setting",
        element: <Setting />,
      },
      {
        path: "/administration",
        element: <Administration />,
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
