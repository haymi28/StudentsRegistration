
export type UserRole = 'super_admin' | 'admin' | 'teacher';
export type ServiceDepartment = 'ቀዳማይ -1 ክፍል' | 'ቀዳማይ -2 ክፍል' | 'ካእላይ ክፍል' | 'ማእከላይ ክፍል' | 'የወጣት ክፍል';

export const serviceDepartments: ServiceDepartment[] = [
  'ቀዳማይ -1 ክፍል',
  'ቀዳማይ -2 ክፍል',
  'ካእላይ ክፍል',
  'ማእከላይ ክፍል',
  'የወጣት ክፍል',
];

export const serviceDepartmentTransferMap: Partial<Record<ServiceDepartment, ServiceDepartment>> = {
  'ቀዳማይ -1 ክፍል': 'ቀዳማይ -2 ክፍል',
  'ቀዳማይ -2 ክፍል': 'ካእላይ ክፍል',
  'ካእላይ ክፍል': 'ማእከላይ ክፍል',
  'ማእከላይ ክፍል': 'የወጣት ክፍል',
};
