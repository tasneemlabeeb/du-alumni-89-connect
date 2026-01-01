// app/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

interface NewsItem {
  id: string;
  title: string;
  content: string;
  published: boolean;
  created_at: string;
  featured_image_url?: string;
}

interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  published: boolean;
  featured_image_url?: string;
}

export default function HomePage() {
  const [latestNews, setLatestNews] = useState<NewsItem | null>(null);
  const [latestEvent, setLatestEvent] = useState<Event | null>(null);

  // Scroll animations for each section
  const announcementAnimation = useScrollAnimation();
  const cardsAnimation = useScrollAnimation();
  const welcomeAnimation = useScrollAnimation();
  const factsAnimation = useScrollAnimation();
  const appAnimation = useScrollAnimation();

  useEffect(() => {
    fetchLatestContent();
  }, []);

  const fetchLatestContent = async () => {
    try {
      if (!db) return;

      // Fetch latest news
      const newsQuery = query(
        collection(db, "news"),
        where("published", "==", true),
        limit(1)
      );
      const newsSnapshot = await getDocs(newsQuery);
      if (!newsSnapshot.empty) {
        const newsData = newsSnapshot.docs[0];
        const newsItem = {
          id: newsData.id,
          ...newsData.data(),
        } as NewsItem;
        console.log('📰 Latest News:', newsItem);
        console.log('📸 News Image URL:', newsItem.featured_image_url);
        setLatestNews(newsItem);
      }

      // Fetch latest event
      const eventsQuery = query(
        collection(db, "events"),
        where("published", "==", true),
        limit(1)
      );
      const eventsSnapshot = await getDocs(eventsQuery);
      if (!eventsSnapshot.empty) {
        const eventData = eventsSnapshot.docs[0];
        const eventItem = {
          id: eventData.id,
          ...eventData.data(),
        } as Event;
        console.log('🎉 Latest Event:', eventItem);
        console.log('📸 Event Image URL:', eventItem.featured_image_url);
        setLatestEvent(eventItem);
      }
    } catch (error) {
      console.error("Error fetching latest content:", error);
    }
  };
  return (
    <div className="min-h-screen bg-[#f3f4ff] text-slate-900">
      {/* Hero */}
      <section className="relative bg-slate-900 text-white overflow-visible">
        <div className="absolute inset-0">
          {/* Hero background - Banner image */}
          <div 
            className="h-full w-full bg-cover bg-center bg-no-repeat" 
            style={{ backgroundImage: "url('/home_page/Banner.jpg')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/85 via-slate-900/70 to-slate-900/20" />
        </div>

        <div className="relative mx-auto flex max-w-6xl flex-col justify-center px-4 py-16 md:px-6 md:py-24 lg:py-32">
          <div className="max-w-xl space-y-4">
            <p className="text-sm font-semibold tracking-[0.2em] text-amber-300">
              DUAAB&apos;89
            </p>
            <h1 className="text-3xl font-bold leading-tight md:text-4xl lg:text-5xl">
              Where Memories
              <br />
              Meet Tomorrow
            </h1>
            <p className="mt-2 text-sm md:text-base text-slate-100">
              Connection. Contribution. Collaboration.
            </p>
            <Button className="mt-6 w-fit rounded-full bg-amber-400 px-6 py-2 text-xs font-semibold text-slate-900 hover:bg-amber-300" asChild>
              <Link href="/auth">Join the network</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Announcement Bar */}
      <section 
        ref={announcementAnimation.ref}
        className={`border-b border-slate-200 bg-white transition-all duration-700 ${
          announcementAnimation.isVisible 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 text-xs md:flex-row md:items-center md:px-6">
          <div className="flex flex-1 items-center gap-2 rounded border border-slate-300 bg-slate-100 px-3 py-2">
            <span className="rounded bg-slate-900 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
              Announcement
            </span>
            <p className="truncate text-[11px] md:text-xs">
              {latestNews?.title || "Stay tuned for the latest news and updates"}
            </p>
          </div>

          <div className="flex flex-1 items-center gap-2 rounded border border-amber-400 bg-amber-50 px-3 py-2">
            <span className="rounded bg-amber-400 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-900">
              Upcoming Events
            </span>
            <p className="truncate text-[11px] md:text-xs">
              {latestEvent?.title || "No upcoming events at the moment"}
            </p>
          </div>
        </div>
      </section>

      {/* News, Gallery, Events cards */}
      <section 
        ref={cardsAnimation.ref}
        className={`bg-[#f3f4ff] relative z-10 transition-all duration-700 delay-150 ${
          cardsAnimation.isVisible 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="mx-auto grid max-w-6xl gap-4 px-4 py-10 md:grid-cols-2 lg:grid-cols-3 md:px-6 md:py-12">
          <InfoCard
            title="Latest News"
            description={latestNews?.content?.substring(0, 100) || "Stay updated with our latest news and announcements"}
            buttonLabel="Read more"
            href="/news"
            imageUrl={latestNews?.featured_image_url || "/home_page/Latest News.jpg"}
          />
          <InfoCard
            title="Gallery"
            description="Memories from our past gatherings and reunions"
            buttonLabel="See more"
            href="/gallery"
            imageUrl="/home_page/Gallery.jpg"
          />
          <InfoCard
            title="Upcoming Events"
            description={latestEvent?.description?.substring(0, 100) || "Check out our upcoming alumni events"}
            buttonLabel="Read more"
            href="/events"
            imageUrl={latestEvent?.featured_image_url || "/home_page/Banner.jpg"}
          />
        </div>
      </section>

      {/* Welcome section */}
      <section 
        ref={welcomeAnimation.ref}
        className={`bg-gradient-to-r from-[#eef0ff] to-[#f7f7ff] transition-all duration-700 delay-300 ${
          welcomeAnimation.isVisible 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-[1.1fr,1fr] md:px-6">
          <div className="relative h-64 w-full overflow-hidden rounded-xl md:h-72">
            <Image
              src="/home_page/Welcome-to-Duaa.jpg"
              alt="Welcome to DU Alumni 89 Connect Community"
              fill
              className="object-cover"
              priority
            />
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold tracking-[0.25em] text-[#2e2c6d] uppercase">
              Welcome to
            </p>
            <h2 className="text-2xl font-bold leading-tight text-slate-900 md:text-3xl">
              our community
            </h2>
            <p className="text-xs leading-relaxed text-slate-700 md:text-sm">
              DUAAB Batch &apos;89 is a platform where our batchmates stay connected,
              share memories, support one another, and strengthen the bond as we
              move forward together into the future.
            </p>
            <Button className="mt-4 rounded-full bg-[#2e2c6d] px-5 py-2 text-xs font-semibold text-white hover:bg-[#252357]" asChild>
              <Link href="/about">Read our story</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Facts section */}
      <section 
        ref={factsAnimation.ref}
        className={`bg-[#f3f4ff] overflow-visible transition-all duration-700 delay-[450ms] ${
          factsAnimation.isVisible 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
          <h3 className="mb-6 text-lg font-bold text-slate-900">
            Few facts about our Alumni
          </h3>

          <div className="grid gap-6 md:grid-cols-[1.2fr,1fr]">
            <div className="grid grid-cols-2 gap-4">
              <StatCard label="Active Members" value="1150" />
              <StatCard label="Years of Excellence" value="35+" />
              <StatCard label="Countries Worldwide" value="50+" />
              <StatCard label="Alumni Industry" value="112" />
            </div>

            <div className="relative h-52 w-full overflow-hidden rounded-xl md:h-56">
              <Image
                src="/home_page/Few-Facts.jpg"
                alt="Alumni Dinner"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mobile App Section */}
      <section 
        ref={appAnimation.ref}
        className={`bg-[#e8f1ff] relative overflow-visible transition-all duration-700 delay-[600ms] ${
          appAnimation.isVisible 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="mx-auto max-w-6xl px-4 py-16 lg:py-24">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            {/* Left side - Phone mockup */}
            <div className="flex-shrink-0">
              <img
                src="/home_page/New UI.png"
                alt="DUAAB'89 App Screenshot"
                className="w-full h-auto object-contain max-w-[280px] lg:max-w-[380px] mx-auto"
              />
            </div>

            {/* Right side - Text content (vertically centered) */}
            <div className="flex-1 space-y-4 flex flex-col justify-center">
              <p className="text-xs font-semibold tracking-[0.25em] text-[#2e2c6d] uppercase">
                DUAAB&apos;89 Smart Alumni Platform
              </p>
              <h2 className="text-3xl lg:text-4xl font-bold leading-tight text-[#2e2c6d]">
                Welcome to DUAAB&apos;89 App
              </h2>
              <div className="space-y-3 text-sm lg:text-base leading-relaxed text-slate-700">
                <p>
                  Welcome to DUAAB Smart Alumni Platform – a digital haven designed exclusively 
                  for the brilliant minds and diverse talents that make up our esteemed alumni community. 
                  This platform is not just a virtual space; it is a dynamic hub where connections are forged, 
                  ideas are shared, and collaborations thrive.
                </p>
                <p>
                  Stay connected with your batchmates, discover exciting opportunities, and be part of a 
                  community that celebrates your achievements and supports your journey forward.
                </p>
              </div>
              <div className="pt-2">
                <Button 
                  className="inline-flex items-center gap-2 rounded-full px-6 py-3 font-medium bg-[#222a5a] text-white hover:shadow-lg hover:scale-105 transition"
                  asChild
                >
                  <Link href="/auth">
                    Get our app
                    <svg 
                      width="20" 
                      height="20" 
                      viewBox="0 0 20 20" 
                      fill="none" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path 
                        d="M7.5 15L12.5 10L7.5 5" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* White space before footer */}
      <div className="bg-white h-16 md:h-24"></div>
    </div>
  )
}

type InfoCardProps = {
  title: string
  description: string
  buttonLabel: string
  href: string
  imageUrl?: string
}

function InfoCard({ title, description, buttonLabel, href, imageUrl }: InfoCardProps) {
  return (
    <Card className="overflow-hidden rounded-xl border-0 bg-white shadow-[0_10px_25px_rgba(15,23,42,0.12)]">
      <CardContent className="p-0">
        <div className="border-b border-slate-200 px-4 pb-2 pt-4 text-sm font-semibold text-slate-900">
          {title}
        </div>
        <div className="relative h-40 w-full bg-slate-200">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-slate-400">
              {title}
            </div>
          )}
        </div>
        <div className="space-y-3 px-4 py-4">
          <p className="text-[11px] leading-relaxed text-slate-700">
            {description}
          </p>
          <Button
            variant="outline"
            className="h-8 rounded-full border-slate-300 px-4 text-[11px]"
            asChild
          >
            <Link href={href}>{buttonLabel}</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

type StatCardProps = {
  value: string
  label: string
}

function StatCard({ value, label }: StatCardProps) {
  return (
    <div className="flex h-24 flex-col justify-center rounded-lg bg-white px-4 shadow-sm">
      <p className="text-xl font-bold text-[#2e2c6d]">{value}</p>
      <p className="mt-1 text-[11px] font-medium text-slate-600">{label}</p>
    </div>
  )
}
