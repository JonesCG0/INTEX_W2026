CREATE TABLE IF NOT EXISTS "__EFMigrationsHistory" (
    "MigrationId" TEXT NOT NULL CONSTRAINT "PK___EFMigrationsHistory" PRIMARY KEY,
    "ProductVersion" TEXT NOT NULL
);

BEGIN TRANSACTION;
CREATE TABLE "AspNetRoles" (
    "Id" int NOT NULL CONSTRAINT "PK_AspNetRoles" PRIMARY KEY,
    "Name" nvarchar(256) NULL,
    "NormalizedName" nvarchar(256) NULL,
    "ConcurrencyStamp" nvarchar(max) NULL
);

CREATE TABLE "AspNetUsers" (
    "Id" int NOT NULL CONSTRAINT "PK_AspNetUsers" PRIMARY KEY,
    "DisplayName" nvarchar(256) NOT NULL,
    "UserName" nvarchar(256) NULL,
    "NormalizedUserName" nvarchar(256) NULL,
    "Email" nvarchar(256) NULL,
    "NormalizedEmail" nvarchar(256) NULL,
    "EmailConfirmed" bit NOT NULL,
    "PasswordHash" nvarchar(max) NULL,
    "SecurityStamp" nvarchar(max) NULL,
    "ConcurrencyStamp" nvarchar(max) NULL,
    "PhoneNumber" nvarchar(max) NULL,
    "PhoneNumberConfirmed" bit NOT NULL,
    "TwoFactorEnabled" bit NOT NULL,
    "LockoutEnd" datetimeoffset NULL,
    "LockoutEnabled" bit NOT NULL,
    "AccessFailedCount" int NOT NULL
);

CREATE TABLE "AspNetRoleClaims" (
    "Id" int NOT NULL CONSTRAINT "PK_AspNetRoleClaims" PRIMARY KEY,
    "RoleId" int NOT NULL,
    "ClaimType" nvarchar(max) NULL,
    "ClaimValue" nvarchar(max) NULL,
    CONSTRAINT "FK_AspNetRoleClaims_AspNetRoles_RoleId" FOREIGN KEY ("RoleId") REFERENCES "AspNetRoles" ("Id") ON DELETE CASCADE
);

CREATE TABLE "AspNetUserClaims" (
    "Id" int NOT NULL CONSTRAINT "PK_AspNetUserClaims" PRIMARY KEY,
    "UserId" int NOT NULL,
    "ClaimType" nvarchar(max) NULL,
    "ClaimValue" nvarchar(max) NULL,
    CONSTRAINT "FK_AspNetUserClaims_AspNetUsers_UserId" FOREIGN KEY ("UserId") REFERENCES "AspNetUsers" ("Id") ON DELETE CASCADE
);

CREATE TABLE "AspNetUserLogins" (
    "LoginProvider" nvarchar(450) NOT NULL,
    "ProviderKey" nvarchar(450) NOT NULL,
    "ProviderDisplayName" nvarchar(max) NULL,
    "UserId" int NOT NULL,
    CONSTRAINT "PK_AspNetUserLogins" PRIMARY KEY ("LoginProvider", "ProviderKey"),
    CONSTRAINT "FK_AspNetUserLogins_AspNetUsers_UserId" FOREIGN KEY ("UserId") REFERENCES "AspNetUsers" ("Id") ON DELETE CASCADE
);

CREATE TABLE "AspNetUserRoles" (
    "UserId" int NOT NULL,
    "RoleId" int NOT NULL,
    CONSTRAINT "PK_AspNetUserRoles" PRIMARY KEY ("UserId", "RoleId"),
    CONSTRAINT "FK_AspNetUserRoles_AspNetRoles_RoleId" FOREIGN KEY ("RoleId") REFERENCES "AspNetRoles" ("Id") ON DELETE CASCADE,
    CONSTRAINT "FK_AspNetUserRoles_AspNetUsers_UserId" FOREIGN KEY ("UserId") REFERENCES "AspNetUsers" ("Id") ON DELETE CASCADE
);

CREATE TABLE "AspNetUserTokens" (
    "UserId" int NOT NULL,
    "LoginProvider" nvarchar(450) NOT NULL,
    "Name" nvarchar(450) NOT NULL,
    "Value" nvarchar(max) NULL,
    CONSTRAINT "PK_AspNetUserTokens" PRIMARY KEY ("UserId", "LoginProvider", "Name"),
    CONSTRAINT "FK_AspNetUserTokens_AspNetUsers_UserId" FOREIGN KEY ("UserId") REFERENCES "AspNetUsers" ("Id") ON DELETE CASCADE
);

CREATE INDEX "IX_AspNetRoleClaims_RoleId" ON "AspNetRoleClaims" ("RoleId");

CREATE UNIQUE INDEX "RoleNameIndex" ON "AspNetRoles" ("NormalizedName") WHERE [NormalizedName] IS NOT NULL;

CREATE INDEX "IX_AspNetUserClaims_UserId" ON "AspNetUserClaims" ("UserId");

CREATE INDEX "IX_AspNetUserLogins_UserId" ON "AspNetUserLogins" ("UserId");

CREATE INDEX "IX_AspNetUserRoles_RoleId" ON "AspNetUserRoles" ("RoleId");

CREATE INDEX "EmailIndex" ON "AspNetUsers" ("NormalizedEmail");

CREATE UNIQUE INDEX "UserNameIndex" ON "AspNetUsers" ("NormalizedUserName") WHERE [NormalizedUserName] IS NOT NULL;

INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES ('20260406221506_InitialIdentity', '10.0.5');

COMMIT;

BEGIN TRANSACTION;
CREATE TABLE "portal_donors" (
    "Id" int NOT NULL CONSTRAINT "PK_portal_donors" PRIMARY KEY,
    "DisplayName" nvarchar(256) NOT NULL,
    "DonorType" nvarchar(100) NOT NULL,
    "Status" nvarchar(50) NOT NULL,
    "TotalGivenPhp" decimal(18,2) NOT NULL,
    "LastDonationAt" datetime2 NULL,
    "PreferredChannel" nvarchar(100) NOT NULL,
    "StewardshipLead" nvarchar(100) NOT NULL
);

CREATE TABLE "portal_residents" (
    "Id" int NOT NULL CONSTRAINT "PK_portal_residents" PRIMARY KEY,
    "CodeName" nvarchar(100) NOT NULL,
    "Safehouse" nvarchar(120) NOT NULL,
    "CaseCategory" nvarchar(120) NOT NULL,
    "RiskLevel" nvarchar(50) NOT NULL,
    "Status" nvarchar(50) NOT NULL,
    "AssignedStaff" nvarchar(120) NOT NULL,
    "ProgressPercent" int NOT NULL,
    "LastSessionAt" datetime2 NULL,
    "NextReviewAt" datetime2 NULL
);

CREATE TABLE "portal_contributions" (
    "Id" int NOT NULL CONSTRAINT "PK_portal_contributions" PRIMARY KEY,
    "DonorId" int NOT NULL,
    "ContributionType" nvarchar(100) NOT NULL,
    "AmountPhp" decimal(18,2) NULL,
    "EstimatedValuePhp" decimal(18,2) NULL,
    "ProgramArea" nvarchar(100) NOT NULL,
    "Description" nvarchar(1000) NOT NULL,
    "ContributionAt" datetime2 NOT NULL,
    CONSTRAINT "FK_portal_contributions_portal_donors_DonorId" FOREIGN KEY ("DonorId") REFERENCES "portal_donors" ("Id") ON DELETE CASCADE
);

CREATE TABLE "portal_recordings" (
    "Id" int NOT NULL CONSTRAINT "PK_portal_recordings" PRIMARY KEY,
    "ResidentId" int NOT NULL,
    "SessionAt" datetime2 NOT NULL,
    "StaffName" nvarchar(120) NOT NULL,
    "SessionType" nvarchar(80) NOT NULL,
    "EmotionalState" nvarchar(120) NOT NULL,
    "Summary" nvarchar(1500) NOT NULL,
    "Interventions" nvarchar(1500) NOT NULL,
    "FollowUp" nvarchar(1500) NOT NULL,
    CONSTRAINT "FK_portal_recordings_portal_residents_ResidentId" FOREIGN KEY ("ResidentId") REFERENCES "portal_residents" ("Id") ON DELETE CASCADE
);

CREATE TABLE "portal_visitations" (
    "Id" int NOT NULL CONSTRAINT "PK_portal_visitations" PRIMARY KEY,
    "ResidentId" int NOT NULL,
    "VisitAt" datetime2 NOT NULL,
    "VisitType" nvarchar(120) NOT NULL,
    "Observations" nvarchar(1500) NOT NULL,
    "FamilyCooperation" nvarchar(80) NOT NULL,
    "SafetyConcerns" nvarchar(1500) NOT NULL,
    "FollowUp" nvarchar(1500) NOT NULL,
    CONSTRAINT "FK_portal_visitations_portal_residents_ResidentId" FOREIGN KEY ("ResidentId") REFERENCES "portal_residents" ("Id") ON DELETE CASCADE
);

CREATE INDEX "IX_portal_contributions_DonorId" ON "portal_contributions" ("DonorId");

CREATE INDEX "IX_portal_recordings_ResidentId" ON "portal_recordings" ("ResidentId");

CREATE INDEX "IX_portal_visitations_ResidentId" ON "portal_visitations" ("ResidentId");

INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES ('20260407165442_AddPortalSnapshot', '10.0.5');

COMMIT;

BEGIN TRANSACTION;
INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES ('20260408065137_InitialCreate', '10.0.5');

COMMIT;

