import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  MapPin,
  BarChart3,
  Layers,
  Upload,
  Activity,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const navItems = [
  { to: "/", icon: MapPin, label: "Dashboard" },
  { to: "/analytics", icon: BarChart3, label: "Analytics" },
  { to: "/insights", icon: Layers, label: "Insights" },
  { to: "/upload", icon: Upload, label: "Upload" },
];

export default function Sidebar() {
  const [isHovered, setIsHovered] = useState(false);
  const collapsed = !isHovered;

  return (
    <aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ width: collapsed ? "72px" : "250px" }}
      className={`fixed left-0 top-0 h-screen z-50 flex flex-col transition-all duration-300 ease-in-out
        bg-navy-900/90 backdrop-blur-xl border-r border-white/[0.04] shadow-2xl`}
    >
      {/* Logo */}
      <div className={`flex items-center gap-4 border-b border-white/[0.04] ${collapsed ? "px-4 py-7 justify-center" : "px-6 py-7"}`}>
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/15 flex-shrink-0">
          <Activity className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-[17px] font-bold text-white tracking-tight leading-tight">Outbreak AI</h1>
            <p className="text-[10px] text-navy-500 font-medium tracking-[0.12em] uppercase mt-0.5">Prediction</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 flex flex-col justify-center gap-6">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-5 rounded-2xl text-[17px] font-medium transition-all duration-200 group
              ${collapsed ? "px-0 py-4 justify-center" : "px-5 py-4"}
              ${isActive
                ? "bg-blue-500/10 text-white shadow-sm shadow-blue-500/5"
                : "text-navy-500 hover:text-navy-200 hover:bg-white/[0.03]"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  className={`w-[22px] h-[22px] flex-shrink-0 transition-all duration-200 ${
                    isActive ? "text-blue-400" : "text-navy-500 group-hover:text-navy-300"
                  }`}
                />
                {!collapsed && <span>{label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mb-5"></div>
    </aside>
  );
}
