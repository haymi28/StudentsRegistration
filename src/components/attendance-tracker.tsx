'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar as CalendarIcon, User, Clock, Loader2 } from "lucide-react";
import { useToast } from '@/hooks/use-toast';

// Mock student data
const students = [
  { id: '1', name: 'Abebe Bikila' },
  { id: '2', name: 'Tirunesh Dibaba' },
  { id: '3', name: 'Haile Gebrselassie' },
  { id: '4', name: 'Kenenisa Bekele' },
  { id: '5', name: 'Derartu Tulu' },
];

export function AttendanceTracker() {
  const [studentId, setStudentId] = useState<string | undefined>();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [status, setStatus] = useState<'present' | 'absent'>('present');
  const [timeIn, setTimeIn] = useState('');
  const [timeOut, setTimeOut] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!studentId || !date) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Please select a student and a date.",
        });
        setIsLoading(false);
        return;
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log({
        studentId,
        date: format(date, "yyyy-MM-dd"),
        status,
        timeIn: status === 'present' ? timeIn : null,
        timeOut: status === 'present' ? timeOut : null,
    });

    toast({
        title: "Success",
        description: `Attendance for ${students.find(s => s.id === studentId)?.name} has been recorded.`,
    });
    setIsLoading(false);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline">Record Attendance</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="student">Student</Label>
              <Select onValueChange={setStudentId} value={studentId}>
                <SelectTrigger id="student" className="w-full">
                  <User className="mr-2 h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Select a student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map(student => (
                    <SelectItem key={student.id} value={student.id}>{student.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Status</Label>
            <RadioGroup defaultValue="present" value={status} onValueChange={(value: 'present' | 'absent') => setStatus(value)} className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="present" id="present" />
                <Label htmlFor="present" className="font-normal">Present</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="absent" id="absent" />
                <Label htmlFor="absent" className="font-normal">Absent</Label>
              </div>
            </RadioGroup>
          </div>
          
          {status === 'present' && (
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="time-in">Time In</Label>
                 <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="time-in" type="time" value={timeIn} onChange={e => setTimeIn(e.target.value)} className="pl-10" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="time-out">Time Out</Label>
                <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="time-out" type="time" value={timeOut} onChange={e => setTimeOut(e.target.value)} className="pl-10"/>
                </div>
              </div>
            </div>
          )}

        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full md:w-auto" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Attendance
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
