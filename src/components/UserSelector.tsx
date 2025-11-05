import { useState } from "react";
import { ChevronDown, LogOut, UserCircle, Shield, Settings } from "lucide-react";
import { useUser } from "../context/UserContext";
import { useDashboard } from "../context/DashboardContext";
import { getRolePermissions } from "../data/roles";

export default function UserSelector() {
  const { currentUser, logout } = useUser();
  const { setActiveTab } = useDashboard();
  const [open, setOpen] = useState(false);

  if (!currentUser) return null;

  const roleData = getRolePermissions(currentUser.role);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      >
        <UserCircle size={14} className="text-gray-600 dark:text-gray-400" />
        <div className="text-left">
          <div className="text-xs font-medium text-gray-900 dark:text-gray-100">
            {currentUser.firstName} {currentUser.lastName}
          </div>
          <div className="text-[10px] text-gray-600 dark:text-gray-400">
            {roleData?.name || currentUser.role}
          </div>
        </div>
        <ChevronDown size={12} className="text-gray-600 dark:text-gray-400" />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 z-50">
            <div className="p-2.5 border-b dark:border-gray-700">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <UserCircle size={16} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-xs text-gray-900 dark:text-gray-100">
                    {currentUser.firstName} {currentUser.lastName}
                  </div>
                  <div className="text-[10px] text-gray-600 dark:text-gray-400 truncate">
                    {currentUser.email}
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Shield size={10} className="text-gray-500" />
                    <span className="text-[10px] text-gray-500 dark:text-gray-400">
                      {roleData?.name}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-2 space-y-0.5 border-t dark:border-gray-700">
              <button
                onClick={() => {
                  setActiveTab("profile");
                  setOpen(false);
                }}
                className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <UserCircle size={14} />
                <span className="text-xs font-medium">Profile</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab("settings");
                  setOpen(false);
                }}
                className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Settings size={14} />
                <span className="text-xs font-medium">Settings</span>
              </button>
              <button
                onClick={() => {
                  logout();
                  setOpen(false);
                }}
                className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors"
              >
                <LogOut size={14} />
                <span className="text-xs font-medium">Logout</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

