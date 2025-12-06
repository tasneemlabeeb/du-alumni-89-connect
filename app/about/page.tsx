import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <div 
        className="relative h-96 bg-cover bg-center"
        style={{ 
          backgroundImage: "url('/images/About Us/Main-Banner.jpg')",
          backgroundPosition: 'center 40%'
        }}
      >
        <div 
          className="absolute inset-0 flex items-center justify-center"
          style={{
            background: 'linear-gradient(80deg, rgba(45, 91, 176, 0.4) 0%, rgba(45, 91, 176, 0.4) 100%)'
          }}
        >
          <div className="text-center">
            <div className="mb-4 flex justify-center">
              <Image 
                src="/images/About Us/DUAAB logo WHite.png"
                alt="DUAAB'89 Logo"
                width={200}
                height={200}
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="prose prose-slate max-w-none">
          <p className="text-slate-700 leading-relaxed mb-4">
            Dhaka University Alumni Association, Batch 1989 (DUAAB'89) was founded in 2013. The birthplace of this initiative was the 
            Department of Geology, at the heart of the Science Faculty's iconic Curzon Hall, in the office of Professor Zillur Rahman, a few 
            visionary luminaries who dared to dream.
          </p>

          <p className="text-slate-700 leading-relaxed mb-4">
            Among those pioneers were Badal (Soil Science), Ujjal (Zoology), Mehedi Masud (Pharmacy), Tomal (Mathematics), Saif (Microbiology), 
            Nipon (Zoology), Jalal (History), Bashir (Chemistry), Shahid (Mathematics), Mintu (Applied Physics), Selim (Soil Science), Tupu 
            (Applied Chemistry), Neo Neel (Applied Chemistry), Rafsan (Microbiology), and Shariful (Soil Science).
          </p>

          <p className="text-slate-700 leading-relaxed mb-4">
            Soon after, on February 1, 2013, the first Family Day was organized at Curzon Hall — a vibrant beginning that brought together 
            alumni and their families. The Executive Committee was formed, with Abul Fazal Mir-Badel elected as President and Mehedi Masud as 
            General Secretary.
          </p>

          <p className="text-slate-700 leading-relaxed mb-6">
            But the journey of DUAAB '89 was far from over. In 2014, preparations for the second Family Day, a new chapter began. Based on a 
            proposal from Faruk (Political Science) and discussions among Badel, Ujjal, and Tomal, a significant decision was made — DUAAB '89 
            would expand its reach to include alumni from the Arts and Commerce faculties, becoming a broader and more inclusive alumni platform.
          </p>

          <p className="text-slate-700 leading-relaxed mb-6">
            From that vision, DUAAB '89 evolved into more than just a batch association — it became a symbol of shared memories, unity, and the 
            enduring legacy of excellence.
          </p>

          <div className="grid grid-cols-3 gap-4 my-8">
            <div className="aspect-video bg-slate-200 rounded-lg overflow-hidden">
              <Image 
                src="/images/About Us/Abou-Us-01.jpg"
                alt="DUAAB'89 Event Photo 1"
                width={400}
                height={300}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="aspect-video bg-slate-200 rounded-lg overflow-hidden">
              <Image 
                src="/images/About Us/Abou-Us-02.jpg"
                alt="DUAAB'89 Event Photo 2"
                width={400}
                height={300}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="aspect-video bg-slate-200 rounded-lg overflow-hidden">
              <Image 
                src="/images/About Us/Abou-Us-03.jpg"
                alt="DUAAB'89 Event Photo 3"
                width={400}
                height={300}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3 my-8">
            <Button variant="outline" className="rounded-full px-6">
              Journey of DUAAB'89
            </Button>
            <Button variant="outline" className="rounded-full px-6">
              Mission & Vision
            </Button>
            <Button variant="outline" className="rounded-full px-6">
              Constitution
            </Button>
            <Button variant="outline" className="rounded-full px-6">
              Messages
            </Button>
            <Button variant="outline" className="rounded-full px-6">
              Automation Journey
            </Button>
          </div>
        </div>

        <div 
          className="relative h-64 bg-cover bg-center rounded-lg overflow-hidden mt-8"
          style={{ 
            backgroundImage: "url('/home_page/Banner.jpg')",
            backgroundPosition: 'center 60%'
          }}
        >
          <div className="absolute inset-0 bg-blue-50/90 flex items-center">
            <div className="container mx-auto px-8">
              <div className="max-w-2xl">
                <h2 className="text-2xl font-bold text-slate-800 mb-6">Join the network</h2>
                <div className="flex gap-3">
                  <Input 
                    type="email" 
                    placeholder="Email address" 
                    className="bg-white h-12"
                  />
                  <Button className="px-8 h-12 bg-indigo-900 hover:bg-indigo-800">
                    Register →
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
