"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, Clock, Users, ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
    fields?: string[];
  };
}

interface RegistrationData {
  name: string;
  email: string;
  phone: string;
  batch?: string;
  department?: string;
  additionalInfo?: string;
}

export default function EventDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const eventId = params.id as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [memberData, setMemberData] = useState<any>(null);
  const [registrationData, setRegistrationData] = useState<RegistrationData>({
    name: "",
    email: "",
    phone: "",
    batch: "",
    department: "",
    additionalInfo: "",
  });

  useEffect(() => {
    fetchEvent();
    if (user) {
      checkRegistrationStatus();
      fetchMemberData();
    }
  }, [eventId, user]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const eventDoc = await getDoc(doc(db, "events", eventId));
      
      if (eventDoc.exists()) {
        setEvent({
          id: eventDoc.id,
          ...eventDoc.data(),
        } as Event);
      } else {
        toast({
          title: "Event not found",
          description: "The event you're looking for doesn't exist.",
          variant: "destructive",
        });
        router.push("/news");
      }
    } catch (error) {
      console.error("Error fetching event:", error);
      toast({
        title: "Error",
        description: "Failed to load event details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMemberData = async () => {
    if (!user) return;

    try {
      // Try to get member data from members collection
      const memberDoc = await getDoc(doc(db, "members", user.uid));
      let data: any = {};
      
      if (memberDoc.exists()) {
        data = memberDoc.data();
      }
      
      // Also try to get profile data for additional info like phone
      const profileDoc = await getDoc(doc(db, "profiles", user.uid));
      if (profileDoc.exists()) {
        const profileData = profileDoc.data();
        // Merge profile data with member data
        data = {
          ...data,
          contactNo: profileData.contactNo || profileData.phone,
          ...profileData
        };
      }
      
      if (memberDoc.exists() || profileDoc.exists()) {
        setMemberData(data);
        
        console.log("Member data fetched:", data); // Debug log
        
        // Auto-fill registration form with member data
        setRegistrationData({
          name: data.full_name || data.name || "",
          email: data.email || user.email || "",
          phone: data.contactNo || data.phone || data.mobile || data.contact_number || "",
          batch: data.batch || data.graduation_year || "",
          department: data.department || "",
          additionalInfo: "",
        });
      } else {
        console.log("No member or profile data found for user:", user.uid);
        // Fallback to user email
        setRegistrationData((prev) => ({
          ...prev,
          email: user.email || "",
        }));
      }
    } catch (error) {
      console.error("Error fetching member data:", error);
    }
  };

  const checkRegistrationStatus = async () => {
    if (!user) return;

    try {
      const registrationsRef = collection(db, "event_registrations");
      const q = query(
        registrationsRef,
        where("event_id", "==", eventId),
        where("user_id", "==", user.uid)
      );
      const snapshot = await getDocs(q);
      setIsRegistered(!snapshot.empty);
    } catch (error) {
      console.error("Error checking registration:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setRegistrationData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleQuickRegister = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to register for this event.",
        variant: "destructive",
      });
      router.push("/auth");
      return;
    }

    if (!memberData) {
      toast({
        title: "Member data not found",
        description: "Please complete your profile first.",
        variant: "destructive",
      });
      return;
    }

    // Validate required fields
    const name = memberData.full_name || memberData.name;
    const email = memberData.email || user.email;
    const phone = memberData.contactNo || memberData.phone || memberData.mobile || memberData.contact_number;

    if (!name || !email) {
      toast({
        title: "Missing information",
        description: "Please update your profile with your name and email.",
        variant: "destructive",
      });
      return;
    }

    try {
      setRegistering(true);

      await addDoc(collection(db, "event_registrations"), {
        event_id: eventId,
        event_title: event?.title,
        user_id: user.uid,
        user_email: user.email,
        name: name,
        email: email,
        phone: phone || "Not provided",
        batch: memberData.batch || memberData.graduation_year || "Not specified",
        department: memberData.department || "Not specified",
        registered_at: new Date().toISOString(),
        status: "confirmed",
      });

      setIsRegistered(true);
      toast({
        title: "Registration successful!",
        description: "You've been registered for this event.",
      });
    } catch (error) {
      console.error("Error registering for event:", error);
      toast({
        title: "Registration failed",
        description: "There was an error registering for this event. Please try again.",
        variant: "destructive",
      });
    } finally {
      setRegistering(false);
    }
  };

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to register for this event.",
        variant: "destructive",
      });
      router.push("/auth");
      return;
    }

    if (!registrationData.name || !registrationData.email || !registrationData.phone) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      setRegistering(true);

      await addDoc(collection(db, "event_registrations"), {
        event_id: eventId,
        event_title: event?.title,
        user_id: user.uid,
        user_email: user.email,
        ...registrationData,
        registered_at: new Date().toISOString(),
        status: "confirmed",
      });

      setIsRegistered(true);
      toast({
        title: "Registration successful!",
        description: "You've been registered for this event.",
      });

      // Reset form
      setRegistrationData({
        name: "",
        email: "",
        phone: "",
        batch: "",
        department: "",
        additionalInfo: "",
      });
    } catch (error) {
      console.error("Error registering for event:", error);
      toast({
        title: "Registration failed",
        description: "There was an error registering for this event. Please try again.",
        variant: "destructive",
      });
    } finally {
      setRegistering(false);
    }
  };

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      day: date.getDate().toString(),
      month: date.toLocaleString("en-US", { month: "long" }),
      year: date.getFullYear(),
      dayOfWeek: date.toLocaleString("en-US", { weekday: "long" }),
      time: date.toLocaleString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
      full: date.toLocaleString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-700" />
      </div>
    );
  }

  if (!event) {
    return null;
  }

  const dateInfo = formatEventDate(event.event_date);
  const registrationDeadlinePassed = event.registration_form?.deadline
    ? new Date(event.registration_form.deadline) < new Date()
    : false;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div
        className="relative h-[400px] bg-cover bg-center"
        style={{
          backgroundImage: event.featured_image_url
            ? `url(${event.featured_image_url})`
            : "url('/home_page/Banner.jpg')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/90 to-indigo-800/80"></div>
        <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-center">
          <Button
            variant="ghost"
            className="text-white hover:bg-white/20 w-fit mb-4"
            onClick={() => router.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Events
          </Button>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{event.title}</h1>
          <div className="flex flex-wrap gap-4 text-white/90">
            <div className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              <span>{dateInfo.full}</span>
            </div>
            {event.location && (
              <div className="flex items-center">
                <MapPin className="mr-2 h-5 w-5" />
                <span>{event.location}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Event Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Description</h3>
                  <p className="text-gray-700 whitespace-pre-line">{event.description}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <div className="flex items-center text-gray-700 mb-2">
                      <Calendar className="h-5 w-5 mr-2 text-indigo-600" />
                      <span className="font-semibold">Date & Time</span>
                    </div>
                    <p className="text-gray-600 ml-7">{dateInfo.full}</p>
                    {event.event_end_date && (
                      <p className="text-gray-600 ml-7 text-sm">
                        Ends: {formatEventDate(event.event_end_date).full}
                      </p>
                    )}
                  </div>

                  {event.location && (
                    <div>
                      <div className="flex items-center text-gray-700 mb-2">
                        <MapPin className="h-5 w-5 mr-2 text-indigo-600" />
                        <span className="font-semibold">Location</span>
                      </div>
                      {event.location_url ? (
                        <a
                          href={event.location_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:underline ml-7"
                        >
                          {event.location}
                        </a>
                      ) : (
                        <p className="text-gray-600 ml-7">{event.location}</p>
                      )}
                    </div>
                  )}
                </div>

                {event.registration_form?.max_attendees && (
                  <div className="flex items-center text-gray-700 pt-4 border-t">
                    <Users className="h-5 w-5 mr-2 text-indigo-600" />
                    <span>Max Attendees: {event.registration_form.max_attendees}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Registration Sidebar */}
          <div className="md:col-span-1">
            {event.registration_form?.enabled ? (
              <Card>
                <CardHeader>
                  <CardTitle>
                    {isRegistered ? "You're Registered!" : "Event Registration"}
                  </CardTitle>
                  <CardDescription>
                    {isRegistered
                      ? "You have successfully registered for this event."
                      : "Fill in the form below to register for this event."}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isRegistered ? (
                    <div className="text-center py-8">
                      <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                      <p className="text-gray-600">
                        We look forward to seeing you at the event!
                      </p>
                    </div>
                  ) : registrationDeadlinePassed ? (
                    <div className="text-center py-8">
                      <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 font-semibold">Registration Closed</p>
                      <p className="text-sm text-gray-500 mt-2">
                        The registration deadline has passed.
                      </p>
                    </div>
                  ) : memberData ? (
                    <div className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                        <p className="text-sm font-medium text-gray-700">Registration Details:</p>
                        <div className="text-sm text-gray-600">
                          <p><strong>Name:</strong> {memberData.full_name || memberData.name || "Not provided"}</p>
                          <p><strong>Email:</strong> {memberData.email || user?.email}</p>
                          <p><strong>Phone:</strong> {memberData.contactNo || memberData.phone || memberData.mobile || memberData.contact_number || "Not provided"}</p>
                          {memberData.batch && <p><strong>Batch:</strong> {memberData.batch}</p>}
                          {memberData.department && <p><strong>Department:</strong> {memberData.department}</p>}
                        </div>
                      </div>

                      <Button
                        onClick={handleQuickRegister}
                        className="w-full bg-indigo-700 hover:bg-indigo-800"
                        disabled={registering}
                      >
                        {registering ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Registering...
                          </>
                        ) : (
                          "Register for Event"
                        )}
                      </Button>

                      <p className="text-xs text-gray-500 text-center">
                        Click to confirm your registration
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleRegistration} className="space-y-4">
                      <div>
                        <Label htmlFor="name">
                          Full Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="name"
                          name="name"
                          value={registrationData.name}
                          onChange={handleInputChange}
                          placeholder="Enter your full name"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="email">
                          Email <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={registrationData.email}
                          onChange={handleInputChange}
                          placeholder="your.email@example.com"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="phone">
                          Phone Number <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={registrationData.phone}
                          onChange={handleInputChange}
                          placeholder="+880 1XXX-XXXXXX"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="batch">Batch</Label>
                        <Input
                          id="batch"
                          name="batch"
                          value={registrationData.batch}
                          onChange={handleInputChange}
                          placeholder="e.g., 1989"
                        />
                      </div>

                      <div>
                        <Label htmlFor="department">Department</Label>
                        <Input
                          id="department"
                          name="department"
                          value={registrationData.department}
                          onChange={handleInputChange}
                          placeholder="e.g., Economics"
                        />
                      </div>

                      <div>
                        <Label htmlFor="additionalInfo">Additional Information</Label>
                        <textarea
                          id="additionalInfo"
                          name="additionalInfo"
                          value={registrationData.additionalInfo}
                          onChange={handleInputChange}
                          placeholder="Any special requirements or notes?"
                          className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      {event.registration_form?.deadline && (
                        <p className="text-sm text-gray-500">
                          Registration deadline:{" "}
                          {new Date(event.registration_form.deadline).toLocaleDateString()}
                        </p>
                      )}

                      <Button
                        type="submit"
                        className="w-full bg-indigo-700 hover:bg-indigo-800"
                        disabled={registering}
                      >
                        {registering ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Registering...
                          </>
                        ) : (
                          "Register Now"
                        )}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Event Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    No registration required for this event. Simply show up and enjoy!
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
