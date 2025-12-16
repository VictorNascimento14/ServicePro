import { Outlet, useLocation, Link } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import MobileHeader from '../components/MobileHeader'

function DashboardLayout() {
  const location = useLocation()

  return (
    <div className="flex h-screen w-full bg-[#0F172A] dark:bg-[#353A40] duration-500">
      <Sidebar currentPath={location.pathname} />
      <main className="flex-1 flex flex-col h-full relative overflow-x-hidden">
        <div className="h-full bg-white dark:bg-gray-900 rounded-l-[2rem] shadow-2xl overflow-hidden">
          <MobileHeader />
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default DashboardLayout


