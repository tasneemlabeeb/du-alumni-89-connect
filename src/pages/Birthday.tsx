import React, { useState, useEffect } from 'react';
import { Calendar, Gift, Users, Cake } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Member {
  id: string;
  name: string;
  batch: string;
  department: string;
  birthday: string; // Format: MM-DD
  profileImage?: string;
  email?: string;
}

// Sample data - replace with your actual data source
const membersData: Member[] = [
  {
    id: '1',
    name: 'Ahmed Rahman',
    batch: '1989',
    department: 'CSE',
    birthday: '10-02', // October 2nd
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    email: 'ahmed.rahman@email.com'
  },
  {
    id: '2',
    name: 'Fatima Khan',
    batch: '1989',
    department: 'EEE',
    birthday: '10-02', // October 2nd
    profileImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
    email: 'fatima.khan@email.com'
  },
  {
    id: '3',
    name: 'Mohammad Ali',
    batch: '1989',
    department: 'Mechanical',
    birthday: '10-03', // October 3rd
    profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    email: 'mohammad.ali@email.com'
  },
  {
    id: '4',
    name: 'Rashida Begum',
    batch: '1989',
    department: 'Physics',
    birthday: '10-15', // October 15th
    profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    email: 'rashida.begum@email.com'
  },
  {
    id: '5',
    name: 'Karim Uddin',
    batch: '1989',
    department: 'Chemistry',
    birthday: '10-22', // October 22nd
    profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    email: 'karim.uddin@email.com'
  },
  {
    id: '6',
    name: 'Nasreen Akter',
    batch: '1989',
    department: 'Mathematics',
    birthday: '10-28', // October 28th
    profileImage: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150',
    email: 'nasreen.akter@email.com'
  }
];

const Birthday: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [birthdayMembers, setBirthdayMembers] = useState<Member[]>([]);

  useEffect(() => {
    // Set today's date by default
    const today = new Date();
    const todayString = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    setSelectedDate(todayString);
  }, []);

  useEffect(() => {
    if (selectedDate) {
      const members = membersData.filter(member => member.birthday === selectedDate);
      setBirthdayMembers(members);
    }
  }, [selectedDate]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(e.target.value);
    const dateString = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    setSelectedDate(dateString);
  };

  const getTodayString = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const formatDisplayDate = (dateString: string) => {
    const [month, day] = dateString.split('-');
    const date = new Date(2024, parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  };

  const getUpcomingBirthdays = () => {
    const today = new Date();
    const currentMonth = String(today.getMonth() + 1).padStart(2, '0');
    
    return membersData
      .filter(member => member.birthday.startsWith(currentMonth))
      .sort((a, b) => {
        const dayA = parseInt(a.birthday.split('-')[1]);
        const dayB = parseInt(b.birthday.split('-')[1]);
        return dayA - dayB;
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Cake className="h-8 w-8 text-pink-600 mr-2" />
            <h1 className="text-4xl font-bold text-gray-800">Birthday Calendar</h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Celebrate with your DU Alumni 89 batch mates on their special day
          </p>
        </div>

        {/* Date Selector */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-blue-600 mr-2" />
                <label htmlFor="date" className="text-lg font-semibold text-gray-700">
                  Select Date:
                </label>
              </div>
              <input
                type="date"
                id="date"
                defaultValue={getTodayString()}
                onChange={handleDateChange}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* Birthday Display */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Gift className="h-6 w-6 text-pink-600 mr-2" />
              {selectedDate ? `Birthdays on ${formatDisplayDate(selectedDate)}` : 'Select a date to view birthdays'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {birthdayMembers.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {birthdayMembers.map((member) => (
                  <Card
                    key={member.id}
                    className="bg-gradient-to-r from-pink-100 to-purple-100 border-2 border-pink-200 hover:shadow-lg transition-shadow"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center mb-4">
                        {member.profileImage ? (
                          <img
                            src={member.profileImage}
                            alt={member.name}
                            className="w-16 h-16 rounded-full object-cover mr-4 border-3 border-pink-300"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-pink-300 rounded-full flex items-center justify-center mr-4">
                            <Users className="h-8 w-8 text-pink-600" />
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-800">{member.name}</h3>
                          <Badge variant="secondary">Batch {member.batch}</Badge>
                        </div>
                        <Cake className="h-8 w-8 text-pink-600" />
                      </div>

                      <div className="space-y-2 mb-4">
                        <p className="text-gray-700">
                          <span className="font-semibold">Department:</span> {member.department}
                        </p>
                        {member.email && (
                          <p className="text-gray-700 text-sm">
                            <span className="font-semibold">Email:</span> {member.email}
                          </p>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button className="flex-1 bg-pink-500 hover:bg-pink-600">
                          Send Wishes 🎉
                        </Button>
                        <Button variant="outline" size="icon">
                          📞
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Cake className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-500 mb-2">No Birthdays Today</h3>
                <p className="text-gray-400">
                  {selectedDate ? 
                    `No alumni birthdays on ${formatDisplayDate(selectedDate)}` : 
                    'Select a date to check for birthdays'
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Birthdays Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 text-blue-600 mr-2" />
              Upcoming Birthdays This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {getUpcomingBirthdays().map((member) => (
                <div key={member.id} className="flex items-center p-3 bg-blue-50 rounded-lg">
                  <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center mr-3">
                    <Cake className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{member.name}</p>
                    <p className="text-sm text-gray-600">{formatDisplayDate(member.birthday)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Birthday;