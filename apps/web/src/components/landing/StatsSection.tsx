import React from 'react'

const stats = [
    { value: '50+', label: 'Bikes Available', emoji: '🚲' },
    { value: '1,200+', label: 'Happy Riders', emoji: '😊' },
    { value: '₱150', label: 'Flat Rate / Hour', emoji: '💚' },
    { value: '3', label: 'Slot Options', emoji: '⏱️' },
];


const StatsSection = () => {
    return (
        <section className="bg-[hsl(var(--primary))] py-14">
            <div className='container mx-auto px-4 max-w-6xl'>
                <div className='grid grid-cols-2 md:grid-cols-4 gap-6'>
                    {stats.map(({ value, label, emoji }) => (
                        <div key={label} className='text-center text-white'>
                            <div className='text-3xl mb-1'>{emoji}</div>
                            <div className="text-3xl font-extrabold font-['Plus_Jakarta_Sans'] mb-1">
                                {value}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default StatsSection
