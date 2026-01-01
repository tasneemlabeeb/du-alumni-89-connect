"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, MapPin, Search, Newspaper, CalendarDays, ChevronRight, Loader2, Cake, Phone, Mail } from "lucide-react";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

interface NewsItem {
  id: string;
  title: string;
  content: string;
  summary?: string;
  published: boolean;
  featured_image_url?: string;
  category?: string;
  created_at: string;
}

interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  event_end_date?: string;
  location?: string;
  location_url?: string;
  featured_image_url?: string;
  published: boolean;
  registration_form?: {
    enabled: boolean;
    max_attendees?: number;
    deadline?: string;
  };
}

interface Member {
  id: string;
  name: string;
  department: string;
  email?: string;
  phone?: string;
  birthday?: string; // Format: MM-DD or YYYY-MM-DD
}

function NewsContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<"news" | "events">("events");
  const [eventFilter, setEventFilter] = useState<"upcoming" | "past">("upcoming");
  const categoryFromUrl = searchParams.get('category') || 'all';
  const [newsCategory, setNewsCategory] = useState<string>(categoryFromUrl);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedBirthdayDate, setSelectedBirthdayDate] = useState<string>("");
  const [birthdayMembers, setBirthdayMembers] = useState<Member[]>([]);
  const [upcomingBirthdays, setUpcomingBirthdays] = useState<Member[]>([]);

  useEffect(() => {
    const category = searchParams.get('category') || 'all';
    setNewsCategory(category);
  }, [searchParams]);

  useEffect(() => {
    fetchData();
    fetchBirthdayData();
    // Set default selected date to today
    const today = new Date().toISOString().split('T')[0];
    setSelectedBirthdayDate(today);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log("🔄 Starting to fetch data...");

      // Check if db is initialized
      if (!db) {
        console.error("❌ Firebase db is not initialized!");
        return;
      }

      // Fetch news
      console.log("📰 Fetching news...");
      const newsQuery = query(
        collection(db, "news"),
        where("published", "==", true)
      );
      const newsSnapshot = await getDocs(newsQuery);
      let newsData = newsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as NewsItem[];
      
      // Sort by created_at on client side
      newsData = newsData.sort((a, b) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      
      console.log(`✅ Fetched ${newsData.length} news items:`, newsData);
      setNews(newsData);

      // Fetch events
      console.log("📅 Fetching events...");
      const eventsQuery = query(
        collection(db, "events"),
        where("published", "==", true)
      );
      const eventsSnapshot = await getDocs(eventsQuery);
      let eventsData = eventsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Event[];
      
      // Sort by event_date on client side
      eventsData = eventsData.sort((a, b) => {
        return new Date(b.event_date).getTime() - new Date(a.event_date).getTime();
      });
      
      console.log(`✅ Fetched ${eventsData.length} events:`, eventsData);
      setEvents(eventsData);

    } catch (error) {
      console.error("❌ Error fetching data:", error);
      if (error instanceof Error) {
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchBirthdayData = async () => {
    try {
      console.log("🎂 Fetching birthday data...");
      
      if (!db) {
        console.error("❌ Firebase db is not initialized!");
        return;
      }

      // Fetch approved members with birthdays
      const membersQuery = query(
        collection(db, "members"),
        where("status", "==", "approved")
      );
      const membersSnapshot = await getDocs(membersQuery);
      const membersData = membersSnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Member))
        .filter(member => member.birthday); // Only members with birthdays

      console.log(`✅ Fetched ${membersData.length} members with birthdays`);
      
      // Calculate upcoming birthdays for this month
      const today = new Date();
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();
      
      const upcoming = membersData
        .map(member => {
          if (!member.birthday) return null;
          
          // Parse birthday (format: MM-DD or YYYY-MM-DD)
          const parts = member.birthday.split('-');
          const month = parseInt(parts.length === 3 ? parts[1] : parts[0]) - 1;
          const day = parseInt(parts.length === 3 ? parts[2] : parts[1]);
          
          const birthdayThisYear = new Date(currentYear, month, day);
          
          return {
            ...member,
            birthdayDate: birthdayThisYear,
            month,
            day
          };
        })
        .filter(m => m !== null && m.month === currentMonth && m.birthdayDate >= today)
        .sort((a, b) => a!.birthdayDate.getTime() - b!.birthdayDate.getTime())
        .slice(0, 6) as (Member & { birthdayDate: Date; month: number; day: number })[];

      setUpcomingBirthdays(upcoming);
      
    } catch (error) {
      console.error("❌ Error fetching birthday data:", error);
    }
  };

  // Update birthdays when selected date changes
  useEffect(() => {
    if (!selectedBirthdayDate || birthdayMembers.length === 0) {
      fetchMembersForDate(selectedBirthdayDate);
    }
  }, [selectedBirthdayDate]);

  const fetchMembersForDate = async (dateString: string) => {
    if (!dateString || !db) return;

    try {
      const date = new Date(dateString);
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const targetDate = `${month}-${day}`;

      console.log(`🔍 Searching for birthdays on ${targetDate}`);

      const membersQuery = query(
        collection(db, "members"),
        where("status", "==", "approved")
      );
      const membersSnapshot = await getDocs(membersQuery);
      
      const membersOnDate = membersSnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Member))
        .filter(member => {
          if (!member.birthday) return false;
          
          // Handle both MM-DD and YYYY-MM-DD formats
          const parts = member.birthday.split('-');
          const memberDate = parts.length === 3 
            ? `${parts[1]}-${parts[2]}` 
            : member.birthday;
          
          return memberDate === targetDate;
        });

      console.log(`✅ Found ${membersOnDate.length} birthdays on ${targetDate}`);
      setBirthdayMembers(membersOnDate);
      
    } catch (error) {
      console.error("❌ Error fetching members for date:", error);
      setBirthdayMembers([]);
    }
  };

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      day: date.getDate().toString(),
      month: date.toLocaleString("en-US", { month: "long" }),
      dayOfWeek: date.toLocaleString("en-US", { weekday: "long" }),
      time: date.toLocaleString("en-US", { 
        hour: "numeric", 
        minute: "2-digit",
        hour12: true 
      })
    };
  };

  const filteredEvents = events
    .filter((event) => {
      const eventDate = new Date(event.event_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const isUpcoming = eventDate >= today;
      
      if (eventFilter === "upcoming") {
        return isUpcoming;
      } else {
        return !isUpcoming;
      }
    })
    .filter((event) => {
      if (!searchTerm) return true;
      const search = searchTerm.toLowerCase();
      return (
        event.title.toLowerCase().includes(search) ||
        event.description.toLowerCase().includes(search) ||
        event.location?.toLowerCase().includes(search)
      );
    });

  // Debug logging
  useEffect(() => {
    console.log("📊 Filter Debug:");
    console.log(`  Total events: ${events.length}`);
    console.log(`  Event filter: ${eventFilter}`);
    console.log(`  Search term: "${searchTerm}"`);
    console.log(`  Filtered events: ${filteredEvents.length}`);
    if (events.length > 0) {
      console.log("  All events with dates:");
      events.forEach(e => {
        const eventDate = new Date(e.event_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const isUpcoming = eventDate >= today;
        console.log(`    - ${e.title}: ${e.event_date} (${isUpcoming ? 'UPCOMING' : 'PAST'})`);
      });
    }
  }, [events, eventFilter, searchTerm, filteredEvents.length]);

  const filteredNews = news.filter((item) => {
    // Filter by category
    if (newsCategory !== "all" && item.category !== newsCategory) {
      return false;
    }
    // Filter by search term
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      item.title.toLowerCase().includes(search) ||
      item.content.toLowerCase().includes(search)
    );
  });

  return (
    <div className="min-h-screen">
      <div 
        className="relative h-[300px] md:h-[400px] bg-cover bg-center flex items-center justify-center"
        style={{ 
          backgroundImage: "url('/News & Events/Banner.jpg')",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/80 to-indigo-800/70"></div>
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            News & Events
          </h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto">
            {activeTab === "events" 
              ? "From nostalgic reunions to meaningful initiatives, our events bring DUAAB 89 together - celebrating memories, friendships, and shared journeys."
              : "Stay connected with the latest updates from DUAAB'89 —from achievements and announcements to stories that celebrate our batch spirit"
            }
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex gap-4 mb-6">
          <Button
            variant={activeTab === "news" ? "secondary" : "outline"}
            className={`flex-1 h-14 text-base ${
              activeTab === "news" 
                ? "bg-gray-100 text-gray-900 hover:bg-gray-200" 
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
            onClick={() => setActiveTab("news")}
          >
            <Newspaper className="mr-2 h-5 w-5" />
            News
          </Button>
          <Button
            variant={activeTab === "events" ? "default" : "outline"}
            className={`flex-1 h-14 text-base ${
              activeTab === "events"
                ? "bg-indigo-700 text-white hover:bg-indigo-800"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
            onClick={() => setActiveTab("events")}
          >
            <CalendarDays className="mr-2 h-5 w-5" />
            Events
          </Button>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            type="text"
            placeholder={`Search by ${activeTab === "events" ? "event type, year..." : "title, year, author"}`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12 bg-gray-50 border-gray-300"
          />
        </div>

        {activeTab === "news" && (
          <div className="flex gap-3 mb-6">
            <Button
              variant={newsCategory === "all" ? "default" : "outline"}
              className={`flex-1 h-12 ${
                newsCategory === "all"
                  ? "bg-indigo-700 text-white hover:bg-indigo-800"
                  : "bg-white text-gray-700 border-indigo-700 text-indigo-700 hover:bg-indigo-50"
              }`}
              onClick={() => setNewsCategory("all")}
            >
              All News
            </Button>
            <Button
              variant={newsCategory === "achievements" ? "default" : "outline"}
              className={`flex-1 h-12 ${
                newsCategory === "achievements"
                  ? "bg-indigo-700 text-white hover:bg-indigo-800"
                  : "bg-white text-gray-700 border-indigo-700 text-indigo-700 hover:bg-indigo-50"
              }`}
              onClick={() => setNewsCategory("achievements")}
            >
              Achievements
            </Button>
            <Button
              variant={newsCategory === "announcements" ? "default" : "outline"}
              className={`flex-1 h-12 ${
                newsCategory === "announcements"
                  ? "bg-indigo-700 text-white hover:bg-indigo-800"
                  : "bg-white text-gray-700 border-indigo-700 text-indigo-700 hover:bg-indigo-50"
              }`}
              onClick={() => setNewsCategory("announcements")}
            >
              Announcements
            </Button>
            <Button
              variant={newsCategory === "media_press" ? "default" : "outline"}
              className={`flex-1 h-12 ${
                newsCategory === "media_press"
                  ? "bg-indigo-700 text-white hover:bg-indigo-800"
                  : "bg-white text-gray-700 border-indigo-700 text-indigo-700 hover:bg-indigo-50"
              }`}
              onClick={() => setNewsCategory("media_press")}
            >
              Media/ Press
            </Button>
            <Button
              variant={newsCategory === "alumni_stories" ? "default" : "outline"}
              className={`flex-1 h-12 ${
                newsCategory === "alumni_stories"
                  ? "bg-indigo-700 text-white hover:bg-indigo-800"
                  : "bg-white text-gray-700 border-indigo-700 text-indigo-700 hover:bg-indigo-50"
              }`}
              onClick={() => setNewsCategory("alumni_stories")}
            >
              Alumni Stories
            </Button>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-700" />
          </div>
        )}

        {!loading && activeTab === "events" && (
          <div className="space-y-6">
            <div className="flex gap-4">
              <Button
                variant={eventFilter === "upcoming" ? "default" : "outline"}
                className={`flex-1 h-12 ${
                  eventFilter === "upcoming"
                    ? "bg-indigo-700 text-white hover:bg-indigo-800"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
                onClick={() => setEventFilter("upcoming")}
              >
                Upcoming events
              </Button>
              <Button
                variant={eventFilter === "past" ? "default" : "outline"}
                className={`flex-1 h-12 ${
                  eventFilter === "past"
                    ? "bg-indigo-700 text-white hover:bg-indigo-800"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
                onClick={() => setEventFilter("past")}
              >
                Past events
              </Button>
            </div>

            <div className="space-y-4">
              {filteredEvents.length === 0 && (
                <div className="text-center py-12">
                  <CalendarDays className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No {eventFilter} events found
                  </h3>
                  <p className="text-gray-600">
                    {searchTerm ? "Try adjusting your search" : "Check back later for updates"}
                  </p>
                </div>
              )}

              {filteredEvents.map((event) => {
                const dateInfo = formatEventDate(event.event_date);
                return (
                  <div
                    key={event.id}
                    className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex-shrink-0">
                        <div className="bg-indigo-50 text-indigo-700 rounded-lg p-4 text-center w-24">
                          <div className="text-sm font-medium">{dateInfo.month}</div>
                          <div className="text-4xl font-bold my-1">{dateInfo.day}</div>
                          <div className="text-sm">{dateInfo.dayOfWeek}</div>
                        </div>
                      </div>

                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {event.title}
                        </h3>
                        <p className="text-gray-600 mb-4">{event.description}</p>
                        <div className="space-y-2">
                          {event.location && (
                            <div className="flex items-center text-gray-700">
                              <MapPin className="h-4 w-4 mr-2" />
                              <span className="text-sm">{event.location}</span>
                            </div>
                          )}
                          <div className="flex items-center text-gray-700">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span className="text-sm">{dateInfo.time}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 justify-center min-w-[200px]">
                        {event.registration_form?.enabled && (
                          <Button 
                            className="bg-indigo-700 hover:bg-indigo-800 text-white"
                            onClick={() => window.location.href = `/events/${event.id}`}
                          >
                            Quick Register
                            <ChevronRight className="ml-2 h-4 w-4" />
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          className="border-indigo-700 text-indigo-700 hover:bg-indigo-50"
                          onClick={() => window.location.href = `/events/${event.id}`}
                        >
                          View Details
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredEvents.length > 0 && (
              <div className="flex justify-end mt-6">
                <Button className="bg-indigo-700 hover:bg-indigo-800 text-white">
                  Event calendar
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Birthday Calendar Section - Only in Events Tab */}
            <div className="mt-12 pt-12 border-t border-gray-200">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Birthday Calendar</h2>
                <p className="text-gray-600">
                  Celebrate with your DU Alumni 89 batch mates on their special day
                </p>
              </div>

              {/* Date Picker */}
              <div className="relative mb-6">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="date"
                  value={selectedBirthdayDate}
                  onChange={(e) => setSelectedBirthdayDate(e.target.value)}
                  className="pl-10 h-12 bg-gray-50 border-gray-300"
                />
              </div>

              {/* Birthdays on Selected Date */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Cake className="h-5 w-5 text-indigo-700" />
                  Birthdays on {selectedBirthdayDate ? new Date(selectedBirthdayDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric' }) : 'Selected Date'}
                </h3>

                {birthdayMembers.length === 0 ? (
                  <div className="text-center py-12">
                    <Cake className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No birthdays on this date
                    </h3>
                    <p className="text-gray-600">
                      Try selecting a different date
                    </p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {birthdayMembers.map((member) => (
                      <div
                        key={member.id}
                        className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0">
                            <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-lg">
                              {member.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                            </div>
                          </div>
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-gray-900 mb-1">{member.name}</h4>
                            <p className="text-sm text-gray-600 mb-3">
                              <span className="font-medium">Department:</span> {member.department || 'CSE'}
                            </p>
                            {member.email && (
                              <div className="flex items-center text-gray-700 mb-2">
                                <Mail className="h-4 w-4 mr-2" />
                                <span className="text-sm">{member.email}</span>
                              </div>
                            )}
                            {member.phone && (
                              <div className="flex items-center text-gray-700">
                                <Phone className="h-4 w-4 mr-2" />
                                <span className="text-sm">{member.phone}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Upcoming Birthdays of This Month */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Cake className="h-5 w-5 text-indigo-700" />
                  Upcoming Birthdays of This Month
                </h3>

                {upcomingBirthdays.length === 0 ? (
                  <div className="text-center py-12">
                    <Cake className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No upcoming birthdays this month
                    </h3>
                    <p className="text-gray-600">
                      Check back later for updates
                    </p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-3 gap-4">
                    {upcomingBirthdays.map((member: any) => (
                      <div
                        key={member.id}
                        className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold">
                            {member.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 text-sm">{member.name}</h4>
                            <p className="text-xs text-gray-600">
                              {member.birthdayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">
                          {member.department || 'CSE'}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {!loading && activeTab === "news" && (
          <div className="space-y-4">
            {filteredNews.length === 0 && (
              <div className="text-center py-12">
                <Newspaper className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No news found</h3>
                <p className="text-gray-600">
                  {searchTerm ? "Try adjusting your search" : "Check back later for updates"}
                </p>
              </div>
            )}

            {filteredNews.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                {item.featured_image_url && (
                  <div className="w-full h-48 mb-4 rounded-lg overflow-hidden">
                    <img
                      src={item.featured_image_url}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {item.title}
                </h3>
                {item.summary && (
                  <p className="text-gray-600 mb-4 line-clamp-3">{item.summary}</p>
                )}
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center text-gray-700">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span className="text-sm">
                      {new Date(item.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <Button asChild className="bg-indigo-700 hover:bg-indigo-800">
                    <Link href={`/news/${item.id}`}>
                      Read More
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function NewsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <NewsContent />
    </Suspense>
  );
}
