import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Target, Heart, Star } from 'lucide-react';

export default function About() {
  const committeMembers = [
    {
      name: "Dr. Mohammad Rahman",
      position: "President",
      bio: "Leading the organization with 20+ years of experience in community building",
      department: "Computer Science & Engineering"
    },
    {
      name: "Prof. Sharmin Sultana",
      position: "Vice President",
      bio: "Dedicated to maintaining alumni connections and fostering collaboration",
      department: "Business Administration"
    },
    {
      name: "Mr. Karim Ahmed",
      position: "General Secretary",
      bio: "Managing organizational affairs and communications",
      department: "Economics"
    },
    {
      name: "Ms. Ruma Begum",
      position: "Treasurer",
      bio: "Ensuring financial transparency and sustainability",
      department: "Accounting & Information Systems"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-accent py-16 text-primary-foreground">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">About DU Alumni '89</h1>
          <p className="text-xl opacity-90">
            A legacy of excellence, a community of achievers, and a network that spans the globe
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* History Section */}
        <section className="mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center">
                <Heart className="mr-3 h-6 w-6 text-primary" />
                Our History
              </CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p className="text-lg mb-4">
                The DU Alumni '89 association was founded by the graduating class of 1989 from the 
                University of Dhaka, one of Bangladesh's most prestigious institutions. What started 
                as a small group of friends staying in touch has evolved into a global network of 
                accomplished professionals, entrepreneurs, academics, and leaders.
              </p>
              <p className="mb-4">
                Over the past three decades, our alumni have made significant contributions across 
                various fields including technology, healthcare, education, business, and public 
                service. From Silicon Valley startups to Fortune 500 companies, from academic 
                institutions to government positions, our members continue to make their mark 
                on the world stage.
              </p>
              <p>
                Today, with members spanning over 50 countries, we remain committed to the values 
                of excellence, integrity, and service that were instilled in us during our time 
                at Dhaka University.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Mission & Vision */}
        <section className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <Target className="mr-3 h-5 w-5 text-primary" />
                  Our Mission
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  To foster lifelong connections among the graduates of 1989, support each other's 
                  personal and professional growth, and contribute to the betterment of society 
                  through collective action and individual excellence.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <Star className="mr-3 h-5 w-5 text-primary" />
                  Our Vision
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  To be the most connected and impactful alumni network, creating opportunities 
                  for collaboration, mentorship, and positive change while preserving the legacy 
                  of excellence established at Dhaka University.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Values Section */}
        <section className="mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-center mb-8">Our Core Values</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Unity</h3>
                  <p className="text-sm text-muted-foreground">
                    Stronger together, supporting each other through all of life's journeys
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Star className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Excellence</h3>
                  <p className="text-sm text-muted-foreground">
                    Pursuing the highest standards in everything we do
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Service</h3>
                  <p className="text-sm text-muted-foreground">
                    Giving back to our communities and making a positive impact
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Committee Section */}
        <section>
          <h2 className="text-3xl font-bold text-center mb-8">Our Leadership Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {committeMembers.map((member, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users className="h-8 w-8 text-primary" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{member.name}</CardTitle>
                      <p className="text-primary font-medium">{member.position}</p>
                      <p className="text-sm text-muted-foreground">{member.department}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}