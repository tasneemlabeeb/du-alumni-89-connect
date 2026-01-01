"use client";

import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

interface Memorial {
  name: string;
  department: string;
  hall?: string;
  year: string;
  imagePath?: string;
}

const memorials: Memorial[] = [
  {
    name: "Abu Ahmed",
    department: "Management",
    year: "2020",
    imagePath: "/in-memoriam/Abu-Ahmed,-Management,-2020.png"
  },
  {
    name: "Md. Nasir Uddin",
    department: "Mathematics",
    hall: "Fazlul Haquq Hall",
    year: "2024",
    imagePath: "/in-memoriam/Md. Nasir Uddin, Mathematics, 2025.png"
  },
  {
    name: "Md. Rofiqul Islam",
    department: "Statistics",
    year: "2021",
    imagePath: "/in-memoriam/Md.-Rofiqul-Islam,-Statistics,-2021.png"
  },
  {
    name: "Shamsun Naher Rekha",
    department: "Political Science",
    year: "February 2025",
    imagePath: "/in-memoriam/Shamsun Naher Rekha, Political Science, February 2025.png"
  },
  {
    name: "Zahidul Hasan Bhuiyan",
    department: "Statistics",
    year: "2025",
    imagePath: "/in-memoriam/Zahidul Hasan Bhuiyan, Statictics, 2025.png"
  },
  {
    name: "Md Mokaddes Ali (Mukul)",
    department: "Mathematics",
    hall: "Muktijoddha Ziaur Rahman Hall",
    year: "2014"
  },
  {
    name: "Md Sayed Ali",
    department: "Mathematics",
    hall: "Muktijoddha Ziaur Rahman Hall",
    year: "2018"
  },
  {
    name: "Naznin Akhter Lina",
    department: "Bangla",
    hall: "Ruqayyah Hall",
    year: "2011"
  },
  {
    name: "Rowshan Ara Begum Smriti",
    department: "Bangla",
    hall: "Ruqayyah Hall",
    year: "15 February 2017"
  },
  {
    name: "Mokhlesur Rahman Sagar",
    department: "Bangla",
    hall: "S. M. Hall",
    year: "16 June 2021"
  },
  {
    name: "Afifa Sultana",
    department: "Bangla",
    hall: "Ruqayyah Hall",
    year: "2025"
  },
  {
    name: "Ishrat Jahan Kalpona",
    department: "Bangla",
    year: "21 October 2025"
  },
  {
    name: "Sajjat Hossain",
    department: "Bangla",
    hall: "Surya Sen Hall",
    year: "2021"
  }
];

export default function InMemoriamPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900 to-indigo-800 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">In Memoriam</h1>
          <p className="text-xl text-center text-indigo-100 max-w-3xl mx-auto">
            Remembering our beloved members of DU Alumni 89 Connect who are no longer with us. 
            May their souls rest in eternal peace.
          </p>
        </div>
      </div>

      {/* Memorial Cards */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {memorials.map((memorial, index) => (
            <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-0">
                {memorial.imagePath ? (
                  <div className="relative aspect-[3/4] bg-slate-100">
                    <Image
                      src={memorial.imagePath}
                      alt={memorial.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                ) : (
                  <div className="aspect-[3/4] bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                    <div className="text-center p-8">
                      <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-indigo-900/10 flex items-center justify-center">
                        <span className="text-4xl font-serif text-indigo-900">
                          {memorial.name.charAt(0)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                <div className="p-6 bg-white">
                  <h3 className="text-xl font-bold text-slate-800 mb-2">{memorial.name}</h3>
                  <div className="space-y-1 text-slate-600">
                    <p className="text-sm font-medium">{memorial.department}</p>
                    {memorial.hall && (
                      <p className="text-sm">{memorial.hall}</p>
                    )}
                    <p className="text-sm text-slate-500 mt-2">{memorial.year}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Footer Message */}
      <div className="bg-slate-50 py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-slate-600 italic">
            "Those we love don't go away, they walk beside us every day. Unseen, unheard, but always near, still loved, still missed, and very dear."
          </p>
        </div>
      </div>
    </div>
  );
}
