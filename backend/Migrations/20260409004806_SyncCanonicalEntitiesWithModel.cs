using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations;

/// <inheritdoc />
public partial class SyncCanonicalEntitiesWithModel : Migration
{
    /// <inheritdoc />
    /// <remarks>
    /// Canonical tables may already exist on Azure (CSV / external load). Skip CREATE when present so
    /// this migration only aligns EF history with the model on both empty and pre-seeded databases.
    /// </remarks>
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
            IF OBJECT_ID(N'[safehouses]', N'U') IS NULL
            BEGIN
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
            END
            """);

        migrationBuilder.Sql("""
            IF OBJECT_ID(N'[social_media_posts]', N'U') IS NULL
            BEGIN
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
            END
            """);

        migrationBuilder.Sql("""
            IF OBJECT_ID(N'[supporters]', N'U') IS NULL
            BEGIN
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
            END
            """);

        migrationBuilder.Sql("""
            IF OBJECT_ID(N'[residents]', N'U') IS NULL
            BEGIN
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
            END
            """);

        migrationBuilder.Sql("""
            IF OBJECT_ID(N'[donations]', N'U') IS NULL
            BEGIN
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
            END
            """);

        migrationBuilder.Sql("""
            IF OBJECT_ID(N'[home_visitations]', N'U') IS NULL
            BEGIN
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
            END
            """);

        migrationBuilder.Sql("""
            IF OBJECT_ID(N'[intervention_plans]', N'U') IS NULL
            BEGIN
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
            END
            """);

        migrationBuilder.Sql("""
            IF OBJECT_ID(N'[process_recordings]', N'U') IS NULL
            BEGIN
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
            END
            """);

        migrationBuilder.Sql("""
            IF OBJECT_ID(N'[donation_allocations]', N'U') IS NULL
            BEGIN
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
            END
            """);

        migrationBuilder.Sql("""
            IF OBJECT_ID(N'[donation_allocations]', N'U') IS NOT NULL
              AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_donation_allocations_donation_id' AND object_id = OBJECT_ID(N'[donation_allocations]'))
                CREATE INDEX [IX_donation_allocations_donation_id] ON [donation_allocations] ([donation_id]);
            """);

        migrationBuilder.Sql("""
            IF OBJECT_ID(N'[donation_allocations]', N'U') IS NOT NULL
              AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_donation_allocations_safehouse_id' AND object_id = OBJECT_ID(N'[donation_allocations]'))
                CREATE INDEX [IX_donation_allocations_safehouse_id] ON [donation_allocations] ([safehouse_id]);
            """);

        migrationBuilder.Sql("""
            IF OBJECT_ID(N'[donations]', N'U') IS NOT NULL
              AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_donations_supporter_id' AND object_id = OBJECT_ID(N'[donations]'))
                CREATE INDEX [IX_donations_supporter_id] ON [donations] ([supporter_id]);
            """);

        migrationBuilder.Sql("""
            IF OBJECT_ID(N'[home_visitations]', N'U') IS NOT NULL
              AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_home_visitations_resident_id' AND object_id = OBJECT_ID(N'[home_visitations]'))
                CREATE INDEX [IX_home_visitations_resident_id] ON [home_visitations] ([resident_id]);
            """);

        migrationBuilder.Sql("""
            IF OBJECT_ID(N'[intervention_plans]', N'U') IS NOT NULL
              AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_intervention_plans_resident_id' AND object_id = OBJECT_ID(N'[intervention_plans]'))
                CREATE INDEX [IX_intervention_plans_resident_id] ON [intervention_plans] ([resident_id]);
            """);

        migrationBuilder.Sql("""
            IF OBJECT_ID(N'[process_recordings]', N'U') IS NOT NULL
              AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_process_recordings_resident_id' AND object_id = OBJECT_ID(N'[process_recordings]'))
                CREATE INDEX [IX_process_recordings_resident_id] ON [process_recordings] ([resident_id]);
            """);

        migrationBuilder.Sql("""
            IF OBJECT_ID(N'[residents]', N'U') IS NOT NULL
              AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_residents_internal_code' AND object_id = OBJECT_ID(N'[residents]'))
              AND EXISTS (
                  SELECT 1
                  FROM sys.columns c
                  INNER JOIN sys.types ty ON c.user_type_id = ty.user_type_id
                  WHERE c.object_id = OBJECT_ID(N'[residents]')
                    AND c.name = N'internal_code'
                    AND ty.name NOT IN (N'text', N'ntext', N'image', N'xml')
                    AND c.max_length <> -1)
                CREATE INDEX [IX_residents_internal_code] ON [residents] ([internal_code]);
            """);

        migrationBuilder.Sql("""
            IF OBJECT_ID(N'[residents]', N'U') IS NOT NULL
              AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_residents_safehouse_id' AND object_id = OBJECT_ID(N'[residents]'))
                CREATE INDEX [IX_residents_safehouse_id] ON [residents] ([safehouse_id]);
            """);

        migrationBuilder.Sql("""
            IF OBJECT_ID(N'[supporters]', N'U') IS NOT NULL
              AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_supporters_email' AND object_id = OBJECT_ID(N'[supporters]'))
              AND EXISTS (
                  SELECT 1
                  FROM sys.columns c
                  INNER JOIN sys.types ty ON c.user_type_id = ty.user_type_id
                  WHERE c.object_id = OBJECT_ID(N'[supporters]')
                    AND c.name = N'email'
                    AND ty.name NOT IN (N'text', N'ntext', N'image', N'xml')
                    AND c.max_length <> -1)
                CREATE INDEX [IX_supporters_email] ON [supporters] ([email]);
            """);
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(
            name: "donation_allocations");

        migrationBuilder.DropTable(
            name: "home_visitations");

        migrationBuilder.DropTable(
            name: "intervention_plans");

        migrationBuilder.DropTable(
            name: "process_recordings");

        migrationBuilder.DropTable(
            name: "social_media_posts");

        migrationBuilder.DropTable(
            name: "donations");

        migrationBuilder.DropTable(
            name: "residents");

        migrationBuilder.DropTable(
            name: "supporters");

        migrationBuilder.DropTable(
            name: "safehouses");
    }
}
