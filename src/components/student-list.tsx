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
import { useLocale } from '@/contexts/locale-provider';
import { getServerSession } from '@/lib/auth';


export async function StudentList() {
  const session = await getServerSession();
  const { t } = useLocale();

  if (!session) {
    return null;
  }
  
  const students = await getStudents(session.user.role as any);
  const users = await getUsers();


  const fromServiceDepartment = session.user.role !== 'super_admin' ? session.user.serviceDepartment : undefined;

  return (
    <Card>
      <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex-grow">
          <CardTitle>{t('students.title')}</CardTitle>
          <CardDescription>
            {session.user.role === 'super_admin'
              ? t('students.descriptionSuperAdmin')
              : t('students.descriptionAdmin').replace('{department}', fromServiceDepartment || '')}
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
                <TableHead className="w-[80px]">{t('students.table.photo')}</TableHead>
                <TableHead>{t('students.table.regNumber')}</TableHead>
                <TableHead>{t('students.table.fullName')}</TableHead>
                <TableHead>{t('students.table.department')}</TableHead>
                <TableHead>{t('students.table.phone')}</TableHead>
                <TableHead className="text-right">{t('students.table.actions')}</TableHead>
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
                    {t('students.noStudents')}
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
              {t('students.noStudents')}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
