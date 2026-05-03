import CTASection from '@/components/landing/CTASection'
import HeroSection from '@/components/landing/HeroSection'
import HowItWorksSection from '@/components/landing/HowItWorksSection'
import StatsSection from '@/components/landing/StatsSection'
import WhyUsSection from '@/components/landing/WhyUsSection'
import React from 'react'

const LandingPage = () => {
  return (
    <div>
     <HeroSection />
     <StatsSection />
     <HowItWorksSection />
     <WhyUsSection />
     <CTASection />
    </div>
  )
}

export default LandingPage
