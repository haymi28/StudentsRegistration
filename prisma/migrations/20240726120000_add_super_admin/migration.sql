-- Add Super Admin User
INSERT INTO "User" ("id", "username", "password", "displayName", "role", "createdAt", "updatedAt")
VALUES ('clxsuperadmin0000000000000', 'superadmin', 'Admin123!', 'Super Admin', 'super_admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
