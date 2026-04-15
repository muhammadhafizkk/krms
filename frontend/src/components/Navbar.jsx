import React from 'react'
import { Link, useNavigate } from 'react-router'
import { PlusIcon, LogOutIcon, UsersRoundIcon } from "lucide-react"

const Navbar = () => {
    const navigate = useNavigate()

    const handleLogout = () => {
        localStorage.removeItem("token")
        navigate("/login")
    }

    return (
    <div className='navbar bg-base-200 shadow-sm justify-between'>
        <h1 className='text-3xl font-bold text-primary font-serif tracking-tighter'>
            Klinik Rabiah Management System
        </h1>
        <div className="flex-none">
            <ul className="menu menu-horizontal px-1">
            <li>
                <details>
                <summary>Parent</summary>
                <ul className="bg-base-100 rounded-t-none p-2">
                    <li><Link to={"/patients/create"} className='btn btn-ghost'>
                        <UsersRoundIcon className='size-5'/>
                        <span>Patients</span>
                    </Link></li>
                    <li><button onClick={handleLogout} className='btn btn-ghost'>
                        <LogOutIcon className='size-5'/>
                        <span>Logout</span>
                    </button></li>
                </ul>
                </details>
            </li>
            </ul>
        </div>
    </div>
    )
}

export default Navbar