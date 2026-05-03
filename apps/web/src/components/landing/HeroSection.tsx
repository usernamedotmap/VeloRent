

import { ROUTES } from '@/constant/routes'
import { ArrowRight, Clock, Leaf, Shield } from 'lucide-react'
import React from 'react'
import { Link } from 'react-router-dom'

const HeroSection = () => {
    return (
        <section className='relative overflow-hidden bg-linear-to-br from-[hsl(var(--background))] via-[hsl(138, 60%, 94%)] to-[hsl(var(--background))] py-20 md:py-23'>


            {/* Background dco acirlses */}
            <div className='absolute top-0 right-0 w-96 h-96 bg-[hsl(var(--primary)/0.08)] rounded-full -translate-y-1/2 translate-x-1/3 blue-3xl ' />
            <div className='absolute bottom-0 left-0 w-72 h-72 bg-[hsl(var(--accent)/0.06)] rounded-full translate-y-1/2 -translate-x-1/3 blue-3xl' />

            <div className='container mx-auto px-4 max-w-6xl relative'>
                <div className='grid md:grid-cols-2 gap-12 items-center'>

                    {/* left -text */}
                    <div>
                        {/* eco badge */}
                        <div className="inline-flex items-center gap-2 bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] text-sm font-semibold px-4 py-1.5 rounded-full mb-6 border border-[hsl(var(--primary)/0.2)]">
                            <Leaf size={14} />
                            Eco-Friendly Bike Rentals
                        </div>

                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[hsl(var(--foreground))] leading-tight mb-6">
                            Ride Green,{' '}
                            <span className='text-[hsl(var(--primary))] relative'>
                                Live Clean
                                {/* underline decoration */}
                                <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 200 8" preserveAspectRatio="none">
                                    <path d="M0,5 Q50,0 100,5 Q150,10 200,5" stroke="hsl(142,76%,36%)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                                </svg>
                            </span>
                        </h1>

                        <p className='text-lg text-[hsl(var(--muted-foreground))] mb-8 leading-relaxed max-w-md'>
                            Explore the park on two wheels. Choose from solo bikes, family sets,
                            and adventure styles. Book online or walk in — we've got you bruh.
                        </p>

                        {/* cta buttons */}
                        <div className='flex flex-wrap gap-4 mb-10'>
                            <Link to={ROUTES.BIKES}
                                className="inline-flex items-center gap-2 bg-[hsl(var(--primary))] text-white font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition-all hover:shadow-lg hover:shadow-[hsl(var(--primary)/0.3)] hover:-translate-y-0.5">
                                Browse Bikes
                                <ArrowRight size={18} />
                            </Link>
                            <Link
                                to={ROUTES.REGISTER}
                                className="inline-flex items-center gap-2 bg-[hsl(var(--card))] text-[hsl(var(--foreground))] font-semibold px-6 py-3 rounded-xl border border-[hsl(var(--border))] hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))] transition-all">
                                Create Account
                            </Link>
                        </div>

                        {/* trust badges */}
                        <div className="flex flex-wrap gap-6 text-sm text-[hsl(var(--muted-foreground))]">
                            {[
                                { icon: Shield, text: 'Safe & insured' },
                                { icon: Clock, text: 'Flexible slots' },
                                { icon: Leaf, text: '100% eco-friendly' },
                            ].map(({ icon: Icon, text }) => (
                                <div key={text} className='flex items-center gap-2'>
                                    <Icon size={15} className='text-[hsl(var(--primary))]' />
                                    {text}
                                </div>
                            ))}
                        </div>


                    </div>

                    {/* right textviual */}
                    <div className='relative flex justify-center'>
                        {/* main card */}
                        <div className="relative bg-[hsl(var(--card))] rounded-3xl p-8 shadow-2xl border border-[hsl(var(--card))] w-full max-w-sm">
                            {/* bike emoji dito illu */}
                            <div className="text-center mb-6">
                                <div className='text-8xl mb-6'>🚲</div>
                                <div className='text-sm font-semibold text-[hsl(var(--primary))]'>Available now</div>
                            </div>

                            {/* sample bike inof */}
                            <div className='space-y-3'>
                                {[
                                    { label: 'Solo Standard', price: '₱150/hr', color: 'bg-green-100 text-green-700' },
                                    { label: 'Kid BMX', price: '₱150/hr', color: 'bg-emerald-100 text-emerald-700' },
                                    { label: 'Family Mountain', price: '₱150/hr', color: 'bg-teal-100 text-teal-700' }
                                ].map(({ label, price, color }) => (
                                    <div key={label} className='flex items-center justify-between p-3 bg-[hsl(var(--muted))] rounded-xl'>
                                        <div className='flex items-center gap-2'>
                                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${color}`}>
                                                {label}
                                            </span>
                                        </div>
                                        <span className='text-sm font-bold text-[hsl(var(--foreground))]'>{price}</span>
                                    </div>
                                ))}
                            </div>

                            {/* rate badges */}
                            <div className='mt-4 text-center text-xs text-[hsl(var(--muted-foreground))]'>
                                Flat rate ₱150/hr for all bike types 🌿
                            </div>
                        </div>
                        {/* floating badges */}
                        <div className="absolute -top-4 -right-4 bg-[hsl(var(--primary))] text-white text-xs font-bold px-3 py-2 rounded-xl shadow-lg">
                            🌿 Go Green
                        </div>
                        <div className="absolute -bottom-4 -left-4 bg-[hsl(var(--card))] border border-[hsl(var(--border))] text-xs font-semibold px-3 py-2 rounded-xl shadow-lg">
                            ⚡ Book in 60 seconds
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default HeroSection
