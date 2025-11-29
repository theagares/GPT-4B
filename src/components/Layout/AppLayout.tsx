import { Outlet, useLocation } from "react-router-dom";
import BottomNavigation from "./BottomNavigation";

const AppLayout = () => {
  const location = useLocation();
  const isOCRPage = location.pathname === "/ocr";

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-[#f3f4ff] to-[#e7e9ff]">
      {!isOCRPage && (
        <div className="mx-auto flex min-h-screen max-w-md flex-col px-5 pt-8 pb-28">
          <header className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Digital Cardbook</p>
              <h1 className="text-2xl font-semibold text-slate-900">
                안녕하세요!
              </h1>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-glass">
              <span className="text-sm font-medium text-primary">
                {location.pathname === "/cards" ? "All" : "New"}
              </span>
            </div>
          </header>
          <main className="flex-1">
            <Outlet />
          </main>
        </div>
      )}
      {isOCRPage && (
        <main className="w-full h-full">
          <Outlet />
        </main>
      )}
      {!isOCRPage && <BottomNavigation />}
    </div>
  );
};

export default AppLayout;

