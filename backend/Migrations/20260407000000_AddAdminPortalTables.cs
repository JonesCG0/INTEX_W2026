using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    public partial class AddAdminPortalTables : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "portal_donors",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DisplayName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    DonorType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    TotalGivenPhp = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    LastDonationAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    PreferredChannel = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    StewardshipLead = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_portal_donors", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "portal_residents",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CodeName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Safehouse = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    CaseCategory = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    RiskLevel = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    AssignedStaff = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    ProgressPercent = table.Column<int>(type: "int", nullable: false),
                    LastSessionAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    NextReviewAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_portal_residents", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "portal_contributions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DonorId = table.Column<int>(type: "int", nullable: false),
                    ContributionType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    AmountPhp = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    EstimatedValuePhp = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    ProgramArea = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    ContributionAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_portal_contributions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_portal_contributions_portal_donors_DonorId",
                        column: x => x.DonorId,
                        principalTable: "portal_donors",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "portal_recordings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ResidentId = table.Column<int>(type: "int", nullable: false),
                    SessionAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    StaffName = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    SessionType = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    EmotionalState = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    Summary = table.Column<string>(type: "nvarchar(1500)", maxLength: 1500, nullable: false),
                    Interventions = table.Column<string>(type: "nvarchar(1500)", maxLength: 1500, nullable: false),
                    FollowUp = table.Column<string>(type: "nvarchar(1500)", maxLength: 1500, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_portal_recordings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_portal_recordings_portal_residents_ResidentId",
                        column: x => x.ResidentId,
                        principalTable: "portal_residents",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "portal_visitations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ResidentId = table.Column<int>(type: "int", nullable: false),
                    VisitAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    VisitType = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    Observations = table.Column<string>(type: "nvarchar(1500)", maxLength: 1500, nullable: false),
                    FamilyCooperation = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    SafetyConcerns = table.Column<string>(type: "nvarchar(1500)", maxLength: 1500, nullable: false),
                    FollowUp = table.Column<string>(type: "nvarchar(1500)", maxLength: 1500, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_portal_visitations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_portal_visitations_portal_residents_ResidentId",
                        column: x => x.ResidentId,
                        principalTable: "portal_residents",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_portal_contributions_DonorId",
                table: "portal_contributions",
                column: "DonorId");

            migrationBuilder.CreateIndex(
                name: "IX_portal_recordings_ResidentId",
                table: "portal_recordings",
                column: "ResidentId");

            migrationBuilder.CreateIndex(
                name: "IX_portal_visitations_ResidentId",
                table: "portal_visitations",
                column: "ResidentId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "portal_contributions");
            migrationBuilder.DropTable(name: "portal_recordings");
            migrationBuilder.DropTable(name: "portal_visitations");
            migrationBuilder.DropTable(name: "portal_donors");
            migrationBuilder.DropTable(name: "portal_residents");
        }
    }
}
