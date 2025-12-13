import { Outlet, useLocation, Link } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import MobileHeader from '../components/MobileHeader'

function DashboardLayout() {
  const location = useLocation()

  return (
    <div className="flex h-screen w-full bg-background-light dark:bg-background-dark transition-colors duration-500">
      <Sidebar currentPath={location.pathname} />
      <main className="flex-1 flex flex-col h-full relative overflow-x-hidden">
        <MobileHeader />
        <Outlet />
      </main>
    </div>
  )
}

export default DashboardLayout

