import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Signup from "../View/Signup";
import ErrorPageContainer from "../View/ErrorPageContainer";
import Siem from "../View/Siem";
import Iaas from "../View/Iaas";
import DesignatedNode from "../View/DesignatedNode";
import NewCloud from "../View/NewCloud";
import Dashboard from "../View/Dashboard";
import AddNodes from "../View/AddNodes";
import RemoveNodes from "../View/RemoveNodes";
import AiWorkbench from "../View/AiWorkbench";
import Noc from "../View/Noc";
import Lifecyclemgmt from "../View/Lifecyclemgmt";
import Migration from "../View/Migration";
import Compliance from "../View/Compliance";
import Setting from "../View/Setting";
import Administration from "../View/Administration";
import Validation from "../View/Validation";
import Vdi from "../View/Vdi";
import Hpc from "../View/Hpc";
import Marketplace from "../View/Marketplace";
import Inventory from "../View/Inventory";

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
        path: "/iaas",
        element: <Iaas />,
      },
      {
        path: "/inventory",
        element: <Inventory />,
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
        path: "/validation",
        element: <Validation />,
      },
      {
        path: "/siem",
        element: <Siem />,
      },
      {
        path: "/vdi",
        element: <Vdi />,
      },
      {
        path: "/hpc",
        element: <Hpc />,
      },
      {
        path: "/noc",
        element: <Noc />,
      },
      {
        path: "/marketplace",
        element: <Marketplace />,
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
