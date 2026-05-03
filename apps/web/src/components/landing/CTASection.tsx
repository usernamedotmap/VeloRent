

import { ROUTES } from '@/constant/routes'
import { ArrowRight } from 'lucide-react'
import React from 'react'
import { Link } from 'react-router-dom'

const CTASection = () => {
    return (
        <section className='py-20 bg-[hsl(var(--background))]'>
            <div className='container mx-auto px-4 max-w-4xl'>
                <div className='relative bg-linear-to-br from-[hsl(var(--primary))] to-[hsl(142, 76%, 28%)] rounded-3xl p-12 text-center overflow-hidden'>

                    {/* background deco */}
                    <div className='absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3' />
                    <div className='absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/3' />

                    <div className='relative'>
                        <div className='text-5xl mb-4'>🚲</div>
                        <h2 className='text-3xl md:text-4xl font-extrabold text-white mb-4'>
                            Ready to Ride?
                        </h2>
                        <p className='text-white/80 mb-8 max-w-md mx-auto text-lg'>
                            Join hundreds of happy riders. Book your bike today and experience
                            the joy of eco-friendly cycling.
                        </p>
                        <div className='flex flex-wrap gap-4 justify-center'>
                            <Link
                                to={ROUTES.BIKES}
                                className='inline-flex items-center gap-2 bg-white text-[hsl(var(--primary))] font-bold px-8 py-3.5 rounded-xl hover:opacity-90 transition-all hover:shadow-lg hover:-translate-y-0.5'>
                                Browse Bikes
                                <ArrowRight size={18} />
                            </Link>
                            <Link
                                to={ROUTES.REGISTER}
                                className='inline-flex items-center gap-2 bg-white/10 text-white font-semibold px-8 py-3.5 rounded-xl border border-white/30 hover:bg-white/20 transition-all'>
                                Create Free Account
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default CTASection
