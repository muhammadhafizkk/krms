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
                <li>
                    <button onClick={handleLogout} className='btn btn-ghost'>
                        <LogOutIcon className='size-5'/>
                        <span>Logout</span>
                    </button>
                </li>
                </ul>
                ) : (
                    <></>
                )}
            </div>
        </div>
    </div>
    )
}

export default Navbar