import { Outlet } from "react-router-dom";
import AppSidebar from "../components/AppSidebar";
import MobileNavigation from "../components/MobileNavigation";

export default function AppLayout() {
  return <div className="application-layout"><AppSidebar /><main className="application-content"><Outlet /></main><MobileNavigation /></div>;
}
