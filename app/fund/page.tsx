'use client';

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

export default function FundPage() {
  const textAnimation = useScrollAnimation();
  const paymentAnimation = useScrollAnimation();

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Group Photo */}
      <section className="relative h-[400px] md:h-[500px] w-full overflow-hidden">
        <Image
          src="/home_page/Banner.jpg"
          alt="DUAAB'89 Group Photo"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white text-center px-4 drop-shadow-lg">
            DUAAB'89 Fund
          </h1>
        </div>
      </section>

      {/* Content Section */}
      <section className="container mx-auto px-4 py-12 md:py-20 max-w-4xl">
        <div 
          className={`space-y-6 text-slate-700 text-lg leading-relaxed transition-all duration-1000 ${
            textAnimation.isVisible 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-10'
          }`}
          ref={textAnimation.ref}
        >
          <p>
            DUAAB&apos;89 is not just an association - it is a shared memory, a lifelong bond, and a collective responsibility we carry with pride. 
            Over the years, our unity and goodwill have allowed us to stand beside one another in moments of joy, challenge, and growth.
          </p>
          
          <p>
            To continue our ongoing activities, strengthen member support, and plan meaningful initiatives for the future, we are initiating 
            a fund collection for DUAAB&apos;89. Your contribution, big or small, will directly support our programs and help sustain the 
            spirit of togetherness that defines our batch.
          </p>
          
          <p>
            This is a humble call to participate in building something enduring - an organization that reflects our values, our friendships, 
            and our commitment to one another.
          </p>
          
          <p>
            We sincerely appreciate your generosity, trust, and continued involvement. Together, we move forward - stronger and united.
          </p>
        </div>

        {/* Donation Section */}
        <div 
          className={`mt-16 transition-all duration-1000 delay-300 ${
            paymentAnimation.isVisible 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-10'
          }`}
          ref={paymentAnimation.ref}
        >
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-8">
            Donate your fund here:
          </h2>

          <div className="grid gap-6">
            {/* bKash Option */}
            <Card className="border-2 border-slate-200 hover:border-primary/50 transition-colors overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row items-center">
                  <div className="w-full md:w-1/3 p-6 flex justify-center items-center bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200">
                    <div className="relative w-32 h-16">
                      <Image
                        src="/home_page/bkash.jpg"
                        alt="bKash"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                  <div className="w-full md:w-2/3 p-6 text-center md:text-left">
                    <span className="text-3xl md:text-5xl font-bold text-[#D12053] tracking-tight">
                      +880 1317-644888
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* City Bank Option */}
            <Card className="border-2 border-slate-200 hover:border-primary/50 transition-colors overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row items-stretch">
                  <div className="w-full md:w-1/3 p-6 flex justify-center items-center bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200">
                    <div className="relative w-32 h-16">
                      <Image
                        src="/home_page/city-bank.jpg"
                        alt="City Bank PLC"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                  <div className="w-full md:w-2/3 p-6 flex flex-col md:flex-row items-center gap-6">
                    <div className="flex-shrink-0 text-center md:text-left">
                      <h3 className="text-2xl md:text-3xl font-bold text-[#ED1C24] uppercase tracking-tight">
                        CITY BANK PLC
                      </h3>
                    </div>
                    <div className="flex-grow text-slate-700 space-y-1 text-sm md:text-base border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6">
                      <p><span className="font-medium text-slate-500">Account name :</span> <span className="font-semibold">DUAAB&apos;89 Account</span></p>
                      <p><span className="font-medium text-slate-500">Number :</span> <span className="font-semibold">1222789867001</span></p>
                      <p><span className="font-medium text-slate-500">Branch :</span> <span className="font-semibold">Gulshan Avenue Branch</span></p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
