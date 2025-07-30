'use server';

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
import { getStudents, getUsers } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StudentActions } from './student-actions';
import { getServerSession } from '@/lib/auth';
import { useLocale } from '@/contexts/locale-provider';


export async function StudentList() {
  const session = await getServerSession();
  // We cannot use the hook here, so we will pass down the t function or specific translations
  // For simplicity, we will assume a default or pass specific strings.
  // A better solution might involve a server-side translation helper.
  // For now, let's restructure to avoid the hook call.
  const { t } = useLocale();

  if (!session) {
    return null;
  }
  
  const students = await getStudents(session.user.role as any);
  const users = await getUsers();


  const fromServiceDepartment = session.user.role !== 'super_admin' ? session.user.serviceDepartment : undefined;

  const translations = {
      title: t('students.title'),
      descriptionSuperAdmin: t('students.descriptionSuperAdmin'),
      descriptionAdmin: t('students.descriptionAdmin'),
      table: {
          photo: t('students.table.photo'),
          regNumber: t('students.table.regNumber'),
          fullName: t('students.table.fullName'),
          department: t('students.table.department'),
          phone: t('students.table.phone'),
          actions: t('students.table.actions'),
      },
      searchPlaceholder: t('students.searchPlaceholder'),
      noStudents: t('students.noStudents'),
  };

  return (
    <Card>
      <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex-grow">
          <CardTitle>{translations.title}</CardTitle>
          <CardDescription>
            {session.user.role === 'super_admin'
              ? translations.descriptionSuperAdmin
              : translations.descriptionAdmin.replace('{department}', fromServiceDepartment || '')}
          </CardDescription>
        </div>
        <StudentActions students={students} users={users} session={session}/>
      </CardHeader>
      <CardContent>
        {/* Desktop Table View */}
        <div className="border rounded-lg overflow-x-auto hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  {/* Placeholder for potential future checkbox */}
                </TableHead>
                <TableHead className="w-[80px]">{translations.table.photo}</TableHead>
                <TableHead>{translations.table.regNumber}</TableHead>
                <TableHead>{translations.table.fullName}</TableHead>
                <TableHead>{translations.table.department}</TableHead>
                <TableHead>{translations.table.phone}</TableHead>
                <TableHead className="text-right">{translations.table.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.length > 0 ? (
                students.map((student) => (
                  <TableRow key={student.registrationNumber}>
                    <TableCell>
                      {/* Placeholder for checkbox */}
                    </TableCell>
                    <TableCell>
                      <Avatar>
                        <AvatarImage src={student.photo || undefined} alt={student.fullName} data-ai-hint="student portrait" />
                        <AvatarFallback>{student.fullName.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium whitespace-nowrap">{student.registrationNumber}</TableCell>
                    <TableCell className="whitespace-nowrap">{student.fullName}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="whitespace-nowrap">{student.serviceDepartment}</Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{student.phoneNumber}</TableCell>
                    <TableCell className="text-right">
                       <StudentActions.RowActions student={student} session={session} />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    {translations.noStudents}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          {students.length > 0 ? (
            students.map((student) => (
              <Card key={student.registrationNumber}>
                  <div className="flex items-start p-4 gap-4">
                      <div className="flex-shrink-0 pt-1">
                          {/* Placeholder for checkbox */}
                      </div>
                      <Avatar className="w-12 h-12 flex-shrink-0">
                          <AvatarImage src={student.photo || undefined} alt={student.fullName} data-ai-hint="student portrait" />
                          <AvatarFallback>{student.fullName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-grow space-y-1">
                          <p className="font-semibold leading-tight">{student.fullName}</p>
                          <p className="text-sm text-muted-foreground">{student.registrationNumber}</p>
                          <div className="pt-1">
                              <Badge variant="secondary">{student.serviceDepartment}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground pt-1">{student.phoneNumber}</p>
                      </div>
                      <div className="flex-shrink-0 -mr-2">
                        <StudentActions.RowActions student={student} session={session} />
                      </div>
                  </div>
              </Card>
            ))
          ) : (
            <div className="text-center text-muted-foreground py-12">
              {translations.noStudents}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
