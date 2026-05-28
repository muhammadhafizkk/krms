import { NavLink, useNavigate } from 'react-router' // 1. Change Link to NavLink
import { LogOutIcon, UsersRoundIcon, CrossIcon, LayoutDashboardIcon, PillIcon, FileTextIcon, MenuIcon } from "lucide-react"

const Navbar = ({ user, setUser }) => {
    const navigate = useNavigate()

    const handleLogout = () => {
        localStorage.removeItem("token")
        setUser(null)
        navigate("/login")
    }

    // 2. Helper function to dynamically set classes based on active state
    const getLinkClass = ({ isActive }) => {
        return isActive 
            ? 'btn btn-sm sm:btn-md bg-primary text-secondary-content border-none hover:bg-secondary-focus' // Active Styling
            : 'btn btn-sm sm:btn-md btn-ghost text-base-100 lg:text-current hover:bg-primary-focus';      // Inactive Styling
    }

    // 3. Swap <Link> with <NavLink> and apply the dynamic className function
    const navLinks = (
        <>
            <li>
                <NavLink to="/" className={getLinkClass}>
                    <LayoutDashboardIcon className='size-5'/>
                    <span>Dashboard</span>
                </NavLink>
            </li>
            <li>
                <NavLink to="/patients" className={getLinkClass}>
                    <UsersRoundIcon className='size-5'/>
                    <span>Patients</span>
                </NavLink>
            </li>
            <li>
                <NavLink to="/medications" className={getLinkClass}>
                    <PillIcon className='size-5'/>
                    <span>Medications</span>
                </NavLink>
            </li>
            <li>
                <NavLink to="/documents" className={getLinkClass}>
                    <FileTextIcon className='size-5'/>
                    <span>Documents</span>
                </NavLink>
            </li>
        </>
    )

    return (
        <div className='navbar bg-primary shadow-sm justify-between sticky top-0 z-50 px-4'>
            <div className='flex items-center gap-2'>
                {user && (
                    <div className="dropdown lg:hidden">
                        <div tabIndex={0} role="button" className="btn btn-ghost text-base-100 px-2">
                            <MenuIcon className="size-6" />
                        </div>
                        {/* Added dynamic theme shift so the dropdown options look good too */}
                        <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-1 p-2 shadow bg-base-200 text-base-100 rounded-box w-52 gap-2">
                            {navLinks}
                        </ul>
                    </div>
                )}

                <div className="flex items-center gap-2 pl-1">
                    <CrossIcon className='size-6 text-base-100'/>
                    <span className='text-2xl font-bold text-base-100 font-sans tracking-tighter'>
                        KRMS
                    </span>
                </div>

                {user && (
                    <div className="hidden lg:flex ml-4">
                        <ul className="menu menu-horizontal px-1 gap-2">
                            {navLinks}
                        </ul>
                    </div>
                )}
            </div>

            {user && (
                <div className='flex items-center gap-4'>
                    <div className='flex flex-col items-end sm:flex'>
                        <span className='text-sm font-semibold text-base-100'>
                            {user.fullName}
                        </span>
                        <span className='text-xs opacity-80 text-base-100 uppercase tracking-wide'>
                            {user.role}
                        </span>
                    </div>
                    <div className='avatar placeholder'>
                        <div className='bg-secondary text-secondary-content rounded-full w-10 flex items-center justify-center'>
                            <span className='text-lg font-bold'>
                                {user.fullName?.charAt(0).toUpperCase()}
                            </span>
                        </div>
                    </div>
                    <button 
                        onClick={handleLogout} 
                        className='btn btn-sm btn-ghost text-base-100 hover:bg-primary-focus'
                    >
                        <LogOutIcon className='size-5'/>
                    </button>
                </div>
            )}
        </div>
    )
}

export default Navbar