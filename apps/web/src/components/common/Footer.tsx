

import { ROUTES } from '@/constant/routes'
import { Bike } from 'lucide-react'
import React from 'react'
import { Link } from 'react-router-dom'

const Footer = () => {
    return (
        <footer className="bg-[hsl(var(--card))] border-t border-[hsl(var(--border))] py-10">
            <div className='container mx-auto px-4 max-w-6xl'>
                <div className='flex flex-col md:flex-row justify-between items-start gap-8'>

                    {/* brand */}
                    <div>
                        <div className="flex items-center gap-2 font-bold text-lg text-[hsl(var(--primary))] font-['Plus_Jakarta_Sans'] mb-2">
                            <Bike size={20} />
                            VeloRent
                        </div>
                        <p className='text-sm text-[hsl(var(--muted-foreground))] max-w-xs'>
                            Eco-friendly bike rentals for a greener tomorrow. Ride clean, live green.
                        </p>
                    </div>

                    {/* links */}
                    <div className='flex gap-12'>
                        <div>
                            <h4 className='text-sm font-semibold mb-3'>Explore</h4>
                            <ul className='space-y-2 text-[hsl(var(--muted-foreground))]'>
                                <li>
                                    <Link to={ROUTES.BIKES} className="hover:text-[hsl(var(--primary))] transition-colors">Browse Bikes</Link>
                                </li>
                                <li>
                                    <Link to={ROUTES.REGISTER} className="hover:text-[hsl(var(--primary))] transition-colors">Sign Up</Link>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h4 className='text-sm font-semibold mb-3'>Account</h4>
                            <ul className='space-y-2 text-[hsl(var(--muted-foreground))]'>
                                <li><Link to={ROUTES.LOGIN} className="hover:text-[hsl(var(--primary))] transition-colors">Sign In</Link></li>
                                <li><Link to={ROUTES.DASHBOARD} className="hover:text-[hsl(var(--primary))] transition-colors">Dashboard</Link></li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className=' border-t border-[hsl(var(--border))] mt-8 pt-6 text-center text-xs text-[hsl(var(--muted-foreground))]'>
                    © {new Date().getFullYear()} VeloRent. Ride green, live clean. 🌿
                </div>
            </div>

        </footer>
    )
}

export default Footer
