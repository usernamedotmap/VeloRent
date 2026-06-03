import BookingStepper from '@/components/booking/BookingStepper'
import LiveCostBar from '@/components/booking/LiveCostBar'
import Step1SelectBikes from '@/components/booking/steps/Step1SelectBikes'
import Step2ChooseSlot from '@/components/booking/steps/Step2ChooseSlot'
import Step3Review from '@/components/booking/steps/Step3Review'
import Step4Payment from '@/components/booking/steps/Step4Payment'
import { useBookingStore } from '@/stores/booking.store'
import React, { useEffect, useState } from 'react'
import { useBlocker, useSearchParams } from 'react-router-dom'

const STEP_TITLE = [
    { title: 'Select your Bikes', description: 'Choose up to 5 bikes for your group' },
    { title: 'Choose your Slot', description: 'Pick a date, time, and duration for your ride' },
    { title: 'Review your Reservation', description: 'Confirm your details before payment' },
    { title: 'Payment', description: 'Securely pay for your reservation' },
]

const NewReservationPage = () => {
    const [isIntentionallyLeaving, setIsIntentionallyLeaving] = useState(false);

    const currentStep = useBookingStore((s) => s.currentStep);
    const paymentStatus = useBookingStore((s) => s.paymentStatus);
    const reset = useBookingStore((s) => s.reset);
    const [searchParams] = useSearchParams();



    const blocker = useBlocker(
        ({ currentLocation, nextLocation }) =>
            !isIntentionallyLeaving &&
            currentStep === 4 &&
            paymentStatus !== 'completed' &&
            currentLocation.pathname !== nextLocation.pathname
    );

    useEffect(() => {
        if (currentStep !== 4) return;

        const handleBeforeUndload = (e: BeforeUnloadEvent) => {
            e.preventDefault();
            e.returnValue = 'Payment in progress. Are you sure you want to leave?';
        };

        window.addEventListener('beforeunload', handleBeforeUndload);
        return () => window.removeEventListener('beforeunload', handleBeforeUndload);
    }, [currentStep]);

    useEffect(() => {
        const bikeId = searchParams.get('bikeId');
        if (!bikeId) {
            reset();
        }

        return () => {
            const currentStepSnapshot = useBookingStore.getState().currentStep;
            if (currentStepSnapshot < 4) {
                reset();
            }
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const { title, description } = STEP_TITLE[currentStep - 1];
    return (
        <div className='min-h-screen bg-[hsl(var(--background))]'>

            {blocker.state === 'blocked' && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[hsl(var(--card))] rounded-3xl border border-[hsl(var(--border))] shadow-2xl w-full max-w-sm p-6 text-center space-y-4">
                        <div className="text-4xl">⚠️</div>
                        <h3 className="font-extrabold text-[hsl(var(--foreground))] text-lg">
                            Payment in Progress
                        </h3>
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">
                            Leaving now may cause issues with your payment.
                            Are you sure you want to go back?
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => blocker.reset()}
                                className="flex-1 py-2.5 rounded-xl border border-[hsl(var(--border))] text-sm font-semibold hover:bg-[hsl(var(--muted))] transition-colors">
                                Stay
                            </button>
                            <button
                                onClick={() => {
                                    reset();
                                    blocker.proceed();
                                }}
                                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors">
                                Leave anyway
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* page hero */}
            <div className='bg-linear-to-br from-[hsl(var(--primary)/0.08)] to-transparent border border-b-[hsl(var(--border))] py-10'>
                <div className='container mx-auto px-4 max-w-4xl'>
                    <h1 className='text-2xl md:text-3xl font-extrabold text-[hsl(var(--foreground))] mb-1'>
                        🚲 Book a Bike
                    </h1>
                    <p className='text-[hsl(var(--muted-foreground))] text-sm'>
                        Complete the steps below to reserve your bike
                    </p>
                </div>
            </div>

            <div className='container mx-auto px-4 max-w-4xl py-8'>

                {/* stepper */}
                <div className='mb-10'>
                    <BookingStepper currentStep={currentStep} />
                </div>

                {/* step header */}
                <div className='mb-8'>
                    <h2 className='text-xl font-extrabold text-[hsl(var(--foreground))]'>
                        Step  {currentStep} - {title}
                    </h2>
                    <p className='text-sm text-[hsl(var(--muted-foreground))] mt-1'>
                        {description}
                    </p>
                </div>

                {/* step contetn */}
                <div className='bg-[hsl(var(--card))] rounded-3xl border border-[hsl(var(--border))] shadow-sm p-6 md:p-8'>
                    {currentStep === 1 && <Step1SelectBikes />}
                    {currentStep === 2 && <Step2ChooseSlot />}
                    {currentStep === 3 && <Step3Review />}
                    {currentStep === 4 && <Step4Payment setIsIntentionallyLeaving={setIsIntentionallyLeaving} />}
                </div>
            </div>

            {/* live cost bar - stick to bottom */}
            {currentStep < 4 && <LiveCostBar />}

        </div>
    )
}

export default NewReservationPage
