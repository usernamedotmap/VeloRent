

import Footer from '@/components/common/Footer';
import Navbar from '@/components/common/Navbar';
import React from 'react'
import { Outlet } from 'react-router-dom'

const PublicLayout = () => {
    return (
        <div className='min-h-screen flex flex-col'>
            <Navbar />
            <main className='flex-1'>
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}

export default PublicLayout
