'use client';

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockStudents } from '@/lib/mock-data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function StudentList() {
  const students = mockStudents; // In a real app, this would be fetched from an API

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registered Students</CardTitle>
        <CardDescription>A list of all students currently in the system.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Photo</TableHead>
                <TableHead className="w-[150px]">Reg. Number</TableHead>
                <TableHead>Full Name</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Phone Number</TableHead>
                <TableHead className="text-right">Education Level</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.registrationNumber}>
                  <TableCell>
                    <Avatar>
                      <AvatarImage src={student.photo} alt={student.fullName} data-ai-hint="student portrait" />
                      <AvatarFallback>{student.fullName.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">{student.registrationNumber}</TableCell>
                  <TableCell>{student.fullName}</TableCell>
                  <TableCell>{student.gender}</TableCell>
                  <TableCell>{student.phoneNumber}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant="outline">{student.educationLevel}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
