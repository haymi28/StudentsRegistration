export type UserRole = 'super_admin' | 'children_admin' | 'children_2_admin' | 'junior_admin' | 'senior_admin' | 'youth_admin';
export type ServiceDepartment = 'ቀዳማይ -1 ክፍል' | 'ቀዳማይ -2 ክፍል' | 'ካእላይ ክፍል' | 'ማእከላይ ክፍል' | 'የወጣት ክፍል';

export const roleToServiceDepartmentMap: Record<Exclude<UserRole, 'super_admin'>, ServiceDepartment> = {
  children_admin: 'ቀዳማይ -1 ክፍል',
  children_2_admin: 'ቀዳማይ -2 ክፍል',
  junior_admin: 'ካእላይ ክፍል',
  senior_admin: 'ማእከላይ ክፍል',
  youth_admin: 'የወጣት ክፍል'
};

export const serviceDepartmentTransferMap: Partial<Record<ServiceDepartment, ServiceDepartment>> = {
  'ቀዳማይ -1 ክፍል': 'ቀዳማይ -2 ክፍል',
  'ቀዳማይ -2 ክፍል': 'ካእላይ ክፍል',
  'ካእላይ ክፍል': 'ማእከላይ ክፍል',
  'ማእከላይ ክፍል': 'የወጣት ክፍል',
};
