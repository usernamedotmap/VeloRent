

import React from 'react'

const steps = [
    {
        step: '01',
        emoji: '🔍',
        title: 'Browse Bikes',
        description: 'Explore our fleet of solo, kid, and family bikes. Filter by style — standard, mountain, or BMX.',
    },
    {
        step: '02',
        emoji: '📅',
        title: 'Book Your Slot',
        description: 'Pick your bikes, choose a 1, 2, or 3 hour slot, and pay securely online via GCash, Maya, or card.',
    },
    {
        step: '03',
        emoji: '🚴',
        title: 'Ride & Enjoy',
        description: 'Show up at the counter, our operator scans your booking and hands you the bikes. Enjoy your ride!',
    },
];

const HowItWorksSection = () => {
    return (
        <section className='py-20 bg-[hsl(var(--background))]'>
            <div className='container mx-auto px-4 max-w-6xl'>

                {/* header */}
                <div className='text-center mb-14'>
                    <div className='inline-flex items-center gap-2 bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] text-sm font-semibold px-4 py-1.5 roudned-full mb-4'>
                        Simple Process
                    </div>
                    <h2 className='text-3xl md:text-4xl font-extrabold text-[hsl(var(--foreground))] mb-4'>
                        How It Works
                    </h2>
                    <p className='text-[hsl(var(--muted-foreground))] max-w-md mx-auto'>
                        From browsing to riding in just a few clicks.
                        No hassle, no waiting — just pure cycling fun.
                    </p>
                </div>

                {/* steps */}
                <div className="grid md:grid-cols-3 gap-8 relative">
                    {/* connector line maybe haha */}
                    <div className="hidden md:block absolute top-12 left-1/4 right-1/4 h-0.5 bg-linear-to-r from-[hsl(var(--primary)/0.3)] via-[hsl(var(--primary))] to-[hsl(var(--primary)/0.3)]" />

                    {steps.map(({ step, emoji, title, description }) => (
                        <div key={step} className='relative text-center group'>
                            {/* tstep number circle */}
                            <div className='relative inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-[hsl(var(--card))] border-2 border-[hsl(var(--border))] mb-6 group-hover:border-[hsl(var(--primary))] group-hover:shadow-lg transition-all'>
                                <span className='text-4xl'>{emoji}</span>
                                <div className='absolute -top-3 -right-3 w-7 h-7 bg-[hsl(var(--primary))] text-white text-xs font-bold rounded-full flex items-center justify-center'>
                                    {step}
                                </div>
                            </div>

                            <h3 className='text-lg font-bold text-[hsl(var(--foreground))] mb-3'>{title}</h3>
                            <p className='text-sm text-[hsl(var(--muted-foreground))] leading-relaxed'>{description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default HowItWorksSection
