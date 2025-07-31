-- CreateSuperAdminUser
-- This is a migration to add a super_admin user to the database.

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "registrationNumber" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "serviceDepartment" TEXT NOT NULL,
    "baptismalName" TEXT,
    "mothersName" TEXT,
    "dateOfBirth" TEXT,
    "educationLevel" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "additionalPhoneNumber" TEXT,
    "fathersPhoneNumber" TEXT,
    "mothersPhoneNumber" TEXT,
    "subcity" TEXT,
    "kebele" TEXT,
    "houseNumber" TEXT,
    "specificAddress" TEXT,
    "dateOfJoining" TEXT,
    "photo" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Student_registrationNumber_key" ON "Student"("registrationNumber");

-- SeedSuperAdmin
INSERT INTO "User" ("id", "username", "password", "role", "displayName", "createdAt", "updatedAt") VALUES
('clx7e1s0o0000u9jshf183z7a', 'superadmin', 'Admin123!', 'super_admin', 'Super Admin', '2024-06-11 10:00:00', '2024-06-11 10:00:00'),
('clx7e1s0p0001u9js12345678', 'children_admin', 'password', 'children_admin', 'ቀዳማይ -1 ክፍል', '2024-06-11 10:00:00', '2024-06-11 10:00:00'),
('clx7e1s0p0002u9js87654321', 'children_2_admin', 'password', 'children_2_admin', 'ቀዳማይ -2 ክፍል', '2024-06-11 10:00:00', '2024-06-11 10:00:00'),
('clx7e1s0p0003u9jsabcdefgh', 'junior_admin', 'password', 'junior_admin', 'ካእላይ ክፍል', '2024-06-11 10:00:00', '2024-06-11 10:00:00'),
('clx7e1s0p0004u9jshgfedcba', 'senior_admin', 'password', 'senior_admin', 'ማእከላይ ክፍል', '2024-06-11 10:00:00', '2024-06-11 10:00:00'),
('clx7e1s0p0005u9jsxyz12345', 'youth_admin', 'password', 'youth_admin', 'የወጣት ክፍል', '2024-06-11 10:00:00', '2024-06-11 10:00:00');
