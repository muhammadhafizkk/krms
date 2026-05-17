import React from 'react'
import { Link, useNavigate } from 'react-router'
import { PlusIcon, LogOutIcon, UsersRoundIcon, CrossIcon, LayoutDashboardIcon, PillIcon } from "lucide-react"

const Navbar = ({ user, setUser }) => {
    const navigate = useNavigate()

    const handleLogout = () => {
        localStorage.removeItem("token")
        setUser(null)
        navigate("/login")
    }

    return (
    <div className='navbar bg-primary shadow-sm justify-between'>
        <div className='flex items-center gap-6 pl-1'>
            <div className="flex items-center gap-2">
            <CrossIcon className='size-6 text-base-100'/>
            <span className='text-2xl font-bold text-base-100 font-sans tracking-tighter'>
            KRMS
            </span>
            </div>
            <div className="flex-none">
                {user ? (
                    <ul className="menu menu-horizontal px-1">
                <li>
                    <Link to={"/"} className='btn btn-ghost'>
                        <LayoutDashboardIcon className='size-5'/>
                        <span>Dashboard</span>
                    </Link>
                </li>
                <li>
                    <Link to={"/patients"} className='btn btn-ghost'>
                        <UsersRoundIcon className='size-5'/>
                        <span>Patients</span>
                    </Link>
                </li>
                <li>
                    <Link to={"/medications"} className='btn btn-ghost'>
                        <PillIcon className='size-5'/>
                        <span>Medications</span>
                    </Link>
                </li>
                </ul>
                ) : (
                    <></>
                )}
            </div>
        </div>

        {/* Right side — user profile + logout */}
        {user && (
            <div className='flex items-center gap-4 pr-4'>
                <div className='flex flex-col items-end'>
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