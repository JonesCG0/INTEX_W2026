CREATE TABLE [AspNetRoles] (
    [Id] int NOT NULL IDENTITY,
    [Name] nvarchar(256) NULL,
    [NormalizedName] nvarchar(256) NULL,
    [ConcurrencyStamp] nvarchar(max) NULL,
    CONSTRAINT [PK_AspNetRoles] PRIMARY KEY ([Id])
);
GO


CREATE TABLE [AspNetUsers] (
    [Id] int NOT NULL IDENTITY,
    [DisplayName] nvarchar(256) NOT NULL,
    [UserName] nvarchar(256) NULL,
    [NormalizedUserName] nvarchar(256) NULL,
    [Email] nvarchar(256) NULL,
    [NormalizedEmail] nvarchar(256) NULL,
    [EmailConfirmed] bit NOT NULL,
    [PasswordHash] nvarchar(max) NULL,
    [SecurityStamp] nvarchar(max) NULL,
    [ConcurrencyStamp] nvarchar(max) NULL,
    [PhoneNumber] nvarchar(max) NULL,
    [PhoneNumberConfirmed] bit NOT NULL,
    [TwoFactorEnabled] bit NOT NULL,
    [LockoutEnd] datetimeoffset NULL,
    [LockoutEnabled] bit NOT NULL,
    [AccessFailedCount] int NOT NULL,
    CONSTRAINT [PK_AspNetUsers] PRIMARY KEY ([Id])
);
GO


CREATE TABLE [portal_donors] (
    [Id] int NOT NULL IDENTITY,
    [DisplayName] nvarchar(256) NOT NULL,
    [LinkedEmail] nvarchar(256) NULL,
    [DonorType] nvarchar(100) NOT NULL,
    [Status] nvarchar(50) NOT NULL,
    [TotalGivenPhp] decimal(18,2) NOT NULL,
    [LastDonationAt] datetime2 NULL,
    [PreferredChannel] nvarchar(100) NOT NULL,
    [StewardshipLead] nvarchar(100) NOT NULL,
    CONSTRAINT [PK_portal_donors] PRIMARY KEY ([Id])
);
GO


CREATE TABLE [portal_residents] (
    [Id] int NOT NULL IDENTITY,
    [CodeName] nvarchar(100) NOT NULL,
    [Safehouse] nvarchar(120) NOT NULL,
    [CaseCategory] nvarchar(120) NOT NULL,
    [RiskLevel] nvarchar(50) NOT NULL,
    [Status] nvarchar(50) NOT NULL,
    [AssignedStaff] nvarchar(120) NOT NULL,
    [ProgressPercent] int NOT NULL,
    [LastSessionAt] datetime2 NULL,
    [NextReviewAt] datetime2 NULL,
    CONSTRAINT [PK_portal_residents] PRIMARY KEY ([Id])
);
GO


CREATE TABLE [safehouses] (
    [safehouse_id] int NOT NULL IDENTITY,
    [safehouse_code] nvarchar(50) NULL,
    [name] nvarchar(200) NOT NULL,
    [region] nvarchar(100) NULL,
    [city] nvarchar(120) NULL,
    [province] nvarchar(120) NULL,
    [country] nvarchar(120) NULL,
    [open_date] datetime2 NULL,
    [status] nvarchar(40) NULL,
    [capacity_girls] int NULL,
    [capacity_staff] int NULL,
    [current_occupancy] int NULL,
    [notes] nvarchar(max) NULL,
    CONSTRAINT [PK_safehouses] PRIMARY KEY ([safehouse_id])
);
GO


CREATE TABLE [social_media_posts] (
    [post_id] int NOT NULL IDENTITY,
    [platform] nvarchar(40) NOT NULL,
    [platform_post_id] nvarchar(120) NULL,
    [post_url] nvarchar(500) NULL,
    [created_at] datetime2 NULL,
    [post_type] nvarchar(80) NULL,
    [content_topic] nvarchar(80) NULL,
    [sentiment_tone] nvarchar(80) NULL,
    [has_call_to_action] bit NULL,
    [campaign_name] nvarchar(160) NULL,
    [impressions] int NULL,
    [reach] int NULL,
    [likes] int NULL,
    [comments] int NULL,
    [shares] int NULL,
    [click_throughs] int NULL,
    [engagement_rate] decimal(18,4) NULL,
    [donation_referrals] int NULL,
    [estimated_donation_value_php] decimal(18,2) NULL,
    CONSTRAINT [PK_social_media_posts] PRIMARY KEY ([post_id])
);
GO


CREATE TABLE [supporters] (
    [supporter_id] int NOT NULL IDENTITY,
    [supporter_type] nvarchar(80) NOT NULL,
    [display_name] nvarchar(256) NOT NULL,
    [organization_name] nvarchar(256) NULL,
    [first_name] nvarchar(120) NULL,
    [last_name] nvarchar(120) NULL,
    [relationship_type] nvarchar(80) NULL,
    [region] nvarchar(100) NULL,
    [country] nvarchar(120) NULL,
    [email] nvarchar(256) NULL,
    [phone] nvarchar(80) NULL,
    [status] nvarchar(60) NOT NULL,
    [created_at] datetime2 NULL,
    [first_donation_date] datetime2 NULL,
    [acquisition_channel] nvarchar(100) NULL,
    CONSTRAINT [PK_supporters] PRIMARY KEY ([supporter_id])
);
GO


CREATE TABLE [AspNetRoleClaims] (
    [Id] int NOT NULL IDENTITY,
    [RoleId] int NOT NULL,
    [ClaimType] nvarchar(max) NULL,
    [ClaimValue] nvarchar(max) NULL,
    CONSTRAINT [PK_AspNetRoleClaims] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_AspNetRoleClaims_AspNetRoles_RoleId] FOREIGN KEY ([RoleId]) REFERENCES [AspNetRoles] ([Id]) ON DELETE CASCADE
);
GO


CREATE TABLE [AspNetUserClaims] (
    [Id] int NOT NULL IDENTITY,
    [UserId] int NOT NULL,
    [ClaimType] nvarchar(max) NULL,
    [ClaimValue] nvarchar(max) NULL,
    CONSTRAINT [PK_AspNetUserClaims] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_AspNetUserClaims_AspNetUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE CASCADE
);
GO


CREATE TABLE [AspNetUserLogins] (
    [LoginProvider] nvarchar(450) NOT NULL,
    [ProviderKey] nvarchar(450) NOT NULL,
    [ProviderDisplayName] nvarchar(max) NULL,
    [UserId] int NOT NULL,
    CONSTRAINT [PK_AspNetUserLogins] PRIMARY KEY ([LoginProvider], [ProviderKey]),
    CONSTRAINT [FK_AspNetUserLogins_AspNetUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE CASCADE
);
GO


CREATE TABLE [AspNetUserRoles] (
    [UserId] int NOT NULL,
    [RoleId] int NOT NULL,
    CONSTRAINT [PK_AspNetUserRoles] PRIMARY KEY ([UserId], [RoleId]),
    CONSTRAINT [FK_AspNetUserRoles_AspNetRoles_RoleId] FOREIGN KEY ([RoleId]) REFERENCES [AspNetRoles] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_AspNetUserRoles_AspNetUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE CASCADE
);
GO


CREATE TABLE [AspNetUserTokens] (
    [UserId] int NOT NULL,
    [LoginProvider] nvarchar(450) NOT NULL,
    [Name] nvarchar(450) NOT NULL,
    [Value] nvarchar(max) NULL,
    CONSTRAINT [PK_AspNetUserTokens] PRIMARY KEY ([UserId], [LoginProvider], [Name]),
    CONSTRAINT [FK_AspNetUserTokens_AspNetUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE CASCADE
);
GO


CREATE TABLE [portal_contributions] (
    [Id] int NOT NULL IDENTITY,
    [DonorId] int NOT NULL,
    [ContributionType] nvarchar(100) NOT NULL,
    [AmountPhp] decimal(18,2) NULL,
    [EstimatedValuePhp] decimal(18,2) NULL,
    [ProgramArea] nvarchar(100) NOT NULL,
    [Description] nvarchar(1000) NOT NULL,
    [ContributionAt] datetime2 NOT NULL,
    CONSTRAINT [PK_portal_contributions] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_portal_contributions_portal_donors_DonorId] FOREIGN KEY ([DonorId]) REFERENCES [portal_donors] ([Id]) ON DELETE CASCADE
);
GO


CREATE TABLE [portal_recordings] (
    [Id] int NOT NULL IDENTITY,
    [ResidentId] int NOT NULL,
    [SessionAt] datetime2 NOT NULL,
    [StaffName] nvarchar(120) NOT NULL,
    [SessionType] nvarchar(80) NOT NULL,
    [EmotionalState] nvarchar(120) NOT NULL,
    [Summary] nvarchar(1500) NOT NULL,
    [Interventions] nvarchar(1500) NOT NULL,
    [FollowUp] nvarchar(1500) NOT NULL,
    CONSTRAINT [PK_portal_recordings] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_portal_recordings_portal_residents_ResidentId] FOREIGN KEY ([ResidentId]) REFERENCES [portal_residents] ([Id]) ON DELETE CASCADE
);
GO


CREATE TABLE [portal_visitations] (
    [Id] int NOT NULL IDENTITY,
    [ResidentId] int NOT NULL,
    [VisitAt] datetime2 NOT NULL,
    [VisitType] nvarchar(120) NOT NULL,
    [Observations] nvarchar(1500) NOT NULL,
    [FamilyCooperation] nvarchar(80) NOT NULL,
    [SafetyConcerns] nvarchar(1500) NOT NULL,
    [FollowUp] nvarchar(1500) NOT NULL,
    CONSTRAINT [PK_portal_visitations] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_portal_visitations_portal_residents_ResidentId] FOREIGN KEY ([ResidentId]) REFERENCES [portal_residents] ([Id]) ON DELETE CASCADE
);
GO


CREATE TABLE [residents] (
    [resident_id] int NOT NULL IDENTITY,
    [case_control_no] nvarchar(50) NULL,
    [internal_code] nvarchar(100) NOT NULL,
    [safehouse_id] int NOT NULL,
    [case_status] nvarchar(40) NOT NULL,
    [sex] nvarchar(10) NULL,
    [date_of_birth] datetime2 NULL,
    [birth_status] nvarchar(40) NULL,
    [place_of_birth] nvarchar(200) NULL,
    [religion] nvarchar(120) NULL,
    [case_category] nvarchar(80) NOT NULL,
    [sub_cat_orphaned] bit NULL,
    [sub_cat_trafficked] bit NULL,
    [sub_cat_child_labor] bit NULL,
    [sub_cat_physical_abuse] bit NULL,
    [sub_cat_sexual_abuse] bit NULL,
    [sub_cat_osaec] bit NULL,
    [sub_cat_cicl] bit NULL,
    [sub_cat_at_risk] bit NULL,
    [sub_cat_street_child] bit NULL,
    [sub_cat_child_with_hiv] bit NULL,
    [is_pwd] bit NULL,
    [pwd_type] nvarchar(120) NULL,
    [has_special_needs] bit NULL,
    [special_needs_diagnosis] nvarchar(200) NULL,
    [family_is_4ps] bit NULL,
    [family_solo_parent] bit NULL,
    [family_indigenous] bit NULL,
    [family_parent_pwd] bit NULL,
    [family_informal_settler] bit NULL,
    [date_of_admission] datetime2 NULL,
    [age_upon_admission] nvarchar(80) NULL,
    [present_age] nvarchar(80) NULL,
    [length_of_stay] nvarchar(80) NULL,
    [referral_source] nvarchar(120) NULL,
    [referring_agency_person] nvarchar(200) NULL,
    [date_colb_registered] datetime2 NULL,
    [date_colb_obtained] datetime2 NULL,
    [assigned_social_worker] nvarchar(160) NULL,
    [initial_case_assessment] nvarchar(max) NULL,
    [date_case_study_prepared] datetime2 NULL,
    [reintegration_type] nvarchar(120) NULL,
    [reintegration_status] nvarchar(80) NULL,
    [initial_risk_level] nvarchar(40) NULL,
    [current_risk_level] nvarchar(40) NULL,
    [date_enrolled] datetime2 NULL,
    [date_closed] datetime2 NULL,
    [created_at] datetime2 NULL,
    [notes_restricted] nvarchar(max) NULL,
    CONSTRAINT [PK_residents] PRIMARY KEY ([resident_id]),
    CONSTRAINT [FK_residents_safehouses_safehouse_id] FOREIGN KEY ([safehouse_id]) REFERENCES [safehouses] ([safehouse_id])
);
GO


CREATE TABLE [donations] (
    [donation_id] int NOT NULL IDENTITY,
    [supporter_id] int NOT NULL,
    [donation_type] nvarchar(80) NOT NULL,
    [donation_date] datetime2 NOT NULL,
    [is_recurring] bit NULL,
    [campaign_name] nvarchar(160) NULL,
    [channel_source] nvarchar(100) NULL,
    [currency_code] nvarchar(10) NULL,
    [amount] decimal(18,2) NULL,
    [estimated_value] decimal(18,2) NULL,
    [impact_unit] nvarchar(50) NULL,
    [notes] nvarchar(max) NULL,
    [referral_post_id] int NULL,
    CONSTRAINT [PK_donations] PRIMARY KEY ([donation_id]),
    CONSTRAINT [FK_donations_supporters_supporter_id] FOREIGN KEY ([supporter_id]) REFERENCES [supporters] ([supporter_id]) ON DELETE CASCADE
);
GO


CREATE TABLE [home_visitations] (
    [visitation_id] int NOT NULL IDENTITY,
    [resident_id] int NOT NULL,
    [visit_date] datetime2 NOT NULL,
    [social_worker] nvarchar(160) NOT NULL,
    [visit_type] nvarchar(80) NOT NULL,
    [location_visited] nvarchar(240) NOT NULL,
    [family_members_present] nvarchar(max) NULL,
    [purpose] nvarchar(max) NOT NULL,
    [observations] nvarchar(max) NOT NULL,
    [family_cooperation_level] nvarchar(80) NOT NULL,
    [safety_concerns_noted] bit NOT NULL,
    [follow_up_needed] bit NOT NULL,
    [follow_up_notes] nvarchar(max) NULL,
    [visit_outcome] nvarchar(80) NOT NULL,
    CONSTRAINT [PK_home_visitations] PRIMARY KEY ([visitation_id]),
    CONSTRAINT [FK_home_visitations_residents_resident_id] FOREIGN KEY ([resident_id]) REFERENCES [residents] ([resident_id]) ON DELETE CASCADE
);
GO


CREATE TABLE [intervention_plans] (
    [plan_id] int NOT NULL IDENTITY,
    [resident_id] int NOT NULL,
    [plan_category] nvarchar(80) NOT NULL,
    [plan_description] nvarchar(max) NOT NULL,
    [services_provided] nvarchar(max) NULL,
    [target_value] decimal(18,2) NULL,
    [target_date] datetime2 NULL,
    [status] nvarchar(60) NOT NULL,
    [case_conference_date] datetime2 NULL,
    [created_at] datetime2 NULL,
    [updated_at] datetime2 NULL,
    CONSTRAINT [PK_intervention_plans] PRIMARY KEY ([plan_id]),
    CONSTRAINT [FK_intervention_plans_residents_resident_id] FOREIGN KEY ([resident_id]) REFERENCES [residents] ([resident_id]) ON DELETE CASCADE
);
GO


CREATE TABLE [process_recordings] (
    [recording_id] int NOT NULL IDENTITY,
    [resident_id] int NOT NULL,
    [session_date] datetime2 NOT NULL,
    [social_worker] nvarchar(160) NOT NULL,
    [session_type] nvarchar(40) NOT NULL,
    [session_duration_minutes] int NOT NULL,
    [emotional_state_observed] nvarchar(80) NOT NULL,
    [emotional_state_end] nvarchar(80) NOT NULL,
    [session_narrative] nvarchar(max) NOT NULL,
    [interventions_applied] nvarchar(max) NOT NULL,
    [follow_up_actions] nvarchar(max) NOT NULL,
    [progress_noted] bit NOT NULL,
    [concerns_flagged] bit NOT NULL,
    [referral_made] bit NOT NULL,
    [notes_restricted] nvarchar(max) NULL,
    CONSTRAINT [PK_process_recordings] PRIMARY KEY ([recording_id]),
    CONSTRAINT [FK_process_recordings_residents_resident_id] FOREIGN KEY ([resident_id]) REFERENCES [residents] ([resident_id]) ON DELETE CASCADE
);
GO


CREATE TABLE [donation_allocations] (
    [allocation_id] int NOT NULL IDENTITY,
    [donation_id] int NOT NULL,
    [safehouse_id] int NULL,
    [program_area] nvarchar(120) NOT NULL,
    [amount_allocated] decimal(18,2) NOT NULL,
    [allocation_date] datetime2 NOT NULL,
    [allocation_notes] nvarchar(max) NULL,
    CONSTRAINT [PK_donation_allocations] PRIMARY KEY ([allocation_id]),
    CONSTRAINT [FK_donation_allocations_donations_donation_id] FOREIGN KEY ([donation_id]) REFERENCES [donations] ([donation_id]) ON DELETE CASCADE,
    CONSTRAINT [FK_donation_allocations_safehouses_safehouse_id] FOREIGN KEY ([safehouse_id]) REFERENCES [safehouses] ([safehouse_id])
);
GO


CREATE INDEX [IX_AspNetRoleClaims_RoleId] ON [AspNetRoleClaims] ([RoleId]);
GO


CREATE UNIQUE INDEX [RoleNameIndex] ON [AspNetRoles] ([NormalizedName]) WHERE [NormalizedName] IS NOT NULL;
GO


CREATE INDEX [IX_AspNetUserClaims_UserId] ON [AspNetUserClaims] ([UserId]);
GO


CREATE INDEX [IX_AspNetUserLogins_UserId] ON [AspNetUserLogins] ([UserId]);
GO


CREATE INDEX [IX_AspNetUserRoles_RoleId] ON [AspNetUserRoles] ([RoleId]);
GO


CREATE INDEX [EmailIndex] ON [AspNetUsers] ([NormalizedEmail]);
GO


CREATE UNIQUE INDEX [UserNameIndex] ON [AspNetUsers] ([NormalizedUserName]) WHERE [NormalizedUserName] IS NOT NULL;
GO


CREATE INDEX [IX_donation_allocations_donation_id] ON [donation_allocations] ([donation_id]);
GO


CREATE INDEX [IX_donation_allocations_safehouse_id] ON [donation_allocations] ([safehouse_id]);
GO


CREATE INDEX [IX_donations_supporter_id] ON [donations] ([supporter_id]);
GO


CREATE INDEX [IX_home_visitations_resident_id] ON [home_visitations] ([resident_id]);
GO


CREATE INDEX [IX_intervention_plans_resident_id] ON [intervention_plans] ([resident_id]);
GO


CREATE INDEX [IX_portal_contributions_DonorId] ON [portal_contributions] ([DonorId]);
GO


CREATE UNIQUE INDEX [IX_portal_donors_LinkedEmail] ON [portal_donors] ([LinkedEmail]) WHERE [LinkedEmail] IS NOT NULL;
GO


CREATE INDEX [IX_portal_recordings_ResidentId] ON [portal_recordings] ([ResidentId]);
GO


CREATE INDEX [IX_portal_visitations_ResidentId] ON [portal_visitations] ([ResidentId]);
GO


CREATE INDEX [IX_process_recordings_resident_id] ON [process_recordings] ([resident_id]);
GO


CREATE INDEX [IX_residents_internal_code] ON [residents] ([internal_code]);
GO


CREATE INDEX [IX_residents_safehouse_id] ON [residents] ([safehouse_id]);
GO


CREATE INDEX [IX_supporters_email] ON [supporters] ([email]);
GO


