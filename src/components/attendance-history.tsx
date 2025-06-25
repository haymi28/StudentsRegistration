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
import { mockStudents, type AttendanceRecord } from '@/lib/mock-data';
import { format } from 'date-fns';

interface AttendanceHistoryProps {
  records: AttendanceRecord[];
}

export function AttendanceHistory({ records }: AttendanceHistoryProps) {
  const studentsMap = new Map(mockStudents.map(s => [s.registrationNumber, s.fullName]));

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Attendance History</CardTitle>
        <CardDescription>A log of recent student attendance records.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Time In</TableHead>
                <TableHead className="text-right">Time Out</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...records].sort((a, b) => b.date.getTime() - a.date.getTime()).map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{studentsMap.get(record.studentId) || 'Unknown Student'}</TableCell>
                  <TableCell>{format(record.date, 'PPP')}</TableCell>
                  <TableCell>
                    <Badge variant={record.status === 'present' ? 'secondary' : 'destructive'}>
                      {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>{record.timeIn || 'N/A'}</TableCell>
                  <TableCell className="text-right">{record.timeOut || 'N/A'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
