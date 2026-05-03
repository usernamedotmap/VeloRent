import Footer from '@/components/common/Footer'
import Navbar from '@/components/common/Navbar'
import React from 'react'
import { Outlet } from 'react-router-dom'

const CustomerLayout = () => {
  return (
    <div className='min-h-screen flex flex-col bg-[hsl(var(--muted))]'> 
        <Navbar />
        <main className='flex-1 container mx-auto px-4 py-8 max-w-6xl'>
            <Outlet />
        </main>
        <Footer />
    </div>
  )
}

export default CustomerLayout
