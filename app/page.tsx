// app/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

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
      <section className="relative bg-slate-900 text-white">
        <div className="absolute inset-0">
          {/* Hero background - Banner image */}
          <div 
            className="h-full w-full bg-cover bg-center bg-no-repeat" 
            style={{ backgroundImage: "url('/home_page/Banner.jpg')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/85 via-slate-900/70 to-slate-900/20" />
        </div>

        <div className="relative mx-auto flex max-w-6xl flex-col justify-center px-4 py-16 md:px-6 md:py-24">
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
      <section className="border-b border-slate-200 bg-white">
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
      <section className="bg-[#f3f4ff]">
        <div className="mx-auto grid max-w-6xl gap-4 px-4 py-10 md:grid-cols-3 md:px-6">
          <InfoCard
            title="Latest News"
            description={latestNews?.content?.substring(0, 100) || "Stay updated with our latest news and announcements"}
            buttonLabel="Read more"
            href="/news"
            imageUrl={latestNews?.featured_image_url}
          />
          <InfoCard
            title="Gallery"
            description="Memories from our past gatherings and reunions"
            buttonLabel="See more"
            href="/gallery"
          />
          <InfoCard
            title="Upcoming Events"
            description={latestEvent?.description?.substring(0, 100) || "Check out our upcoming alumni events"}
            buttonLabel="Read more"
            href="/news"
            imageUrl={latestEvent?.featured_image_url}
          />
        </div>
      </section>

      {/* Welcome section */}
      <section className="bg-gradient-to-r from-[#eef0ff] to-[#f7f7ff]">
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
            <p className="text-xs font-semibold tracking-[0.25em] text-purple-700 uppercase">
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
            <Button className="mt-4 rounded-full bg-purple-800 px-5 py-2 text-xs font-semibold text-white hover:bg-purple-900" asChild>
              <Link href="/about">Read our story</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Facts section */}
      <section className="bg-[#f3f4ff]">
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

      {/* App section */}
      <section className="bg-gradient-to-r from-[#e8eaff] to-[#f0f2ff] overflow-hidden">
        <div className="mx-auto flex max-w-6xl flex-col items-end gap-8 px-4 pt-12 md:flex-row md:items-end md:px-6 md:pt-16">
          {/* Phone mockup - positioned at bottom */}
          <div className="flex flex-1 justify-center items-end">
            <div className="relative h-80 w-48 md:h-96 md:w-56">
              <Image
                src="/home_page/Mobile app.png"
                alt="DUAAB'89 Mobile App"
                fill
                className="object-contain object-bottom drop-shadow-2xl"
              />
            </div>
          </div>

          {/* Text block */}
          <div className="flex-1 space-y-4 max-w-xl pb-8 md:pb-12">
            <h4 className="text-xs font-semibold uppercase tracking-[0.25em] text-purple-700">
              DUAAB&apos;89 SMART ALUMNI PLATFORM
            </h4>
            <h3 className="text-2xl font-bold leading-tight text-slate-900 md:text-3xl">
              Welcome to DUAAB Smart Alumni Platform
            </h3>
            <p className="text-sm leading-relaxed text-slate-700 md:text-base">
              Welcome to DUAAB Smart Alumni Platform – a digital haven designed exclusively for
              the brilliant minds and diverse talents that make up our esteemed alumni community.
              This platform is not just a virtual space; it&apos;s a dynamic hub where connections
              are forged, ideas are shared, and collaborations thrive.
            </p>
            <Button className="mt-6 rounded-full border-2 border-purple-800 bg-transparent px-6 py-2.5 text-sm font-semibold text-purple-800 hover:bg-purple-800 hover:text-white transition-all duration-300">
              Get our app
            </Button>
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
      <p className="text-xl font-bold text-purple-800">{value}</p>
      <p className="mt-1 text-[11px] font-medium text-slate-600">{label}</p>
    </div>
  )
}
