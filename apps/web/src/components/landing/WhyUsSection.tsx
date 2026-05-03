

import { Clock, CreditCard, Leaf, Shield, Smile, Zap } from 'lucide-react'
import React from 'react'

const features = [
    {
        icon: Leaf,
        title: 'Eco-Friendly',
        description: 'Zero emissions, zero guilt. Every ride reduces your carbon footprint.',
        color: 'text-green-600 bg-green-50',
    },
    {
        icon: Zap,
        title: 'Instant Booking',
        description: 'Book online in under a minute. Pay via GCash, Maya, or card.',
        color: 'text-yellow-600 bg-yellow-50',
    },
    {
        icon: Shield,
        title: 'Safe & Maintained',
        description: 'All bikes are regularly inspected and maintained for your safety.',
        color: 'text-blue-600 bg-blue-50',
    },
    {
        icon: Smile,
        title: 'Family Friendly',
        description: 'Bikes for everyone - solo riders, kids, and family groups.',
        color: 'text-pink-600 bg-pink-50'
    },
    {
        icon: Clock,
        title: 'Flexible Slots',
        description: 'Choose 1, 2, or 3 hour slots. Walk-in or book ahead.',
        color: 'text-purple-600 bg-purple-50',
    },
    {
        icon: CreditCard,
        title: 'Flat Rate Pricing',
        description: '₱150/hr for every bike type. No hidden fees, no surprises.',
        color: 'text-emerald-600 bg-emerald-50',
    },
];

const WhyUsSection = () => {
    return (
        <section className='py-20 bg-[hsl(var(--muted))]'>
            <div className='container mx-auto px-4 max-w-6xl'>

                <div className='text-center mb-14'>
                    <div className='inline-flex items-center gap-2 bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] text-sm font-semibold px-4 py-1.5 rounded-full mb-4'>
                        Why Choose Us
                    </div>
                    <h2 className='text-3xl md:text-4xl font-extrabold text-[hsl(var(--foreground))] mb-4'>
                        Everything You Need for a{' '}
                        <span className='text-[hsl(var(--primary))]'>Perfect Ride</span>
                    </h2>
                    <p className='text-[hsl(var(--muted-foreground))] max-w-md mx-auto'>
                        We've thought of everything so you can focus on enjoying the journey.
                    </p>
                </div>

                <div className='grid sm:grid-cols-2 md:grid-cols-3 gap-6'>
                    {features.map(({ icon: Icon, title, description, color }) => (
                        <div key={title} className='bg-[hsl(var(--card))] rounded-2xl p-6 border border-[hsl(var(--border))] hover:shadow-md hover:-translate-y-1 transition-all group'>
                            <div className={`inline-flex p-3 rounded-xl mb-4 ${color}`}>
                                <Icon size={22} />
                            </div>
                            <h3 className="font-bold text-[hsl(var(--foreground))] mb-2 group-hover:text-[hsl(var(--primary))] transition-colors">
                                {title}
                            </h3>
                            <p className='text-sm text-[hsl(var(--muted-foreground))] leading-relaxed'>
                                {description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default WhyUsSection
