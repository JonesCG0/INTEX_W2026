using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    public partial class AddDonorLinkedEmail : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "LinkedEmail",
                table: "portal_donors",
                type: "nvarchar(256)",
                maxLength: 256,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_portal_donors_LinkedEmail",
                table: "portal_donors",
                column: "LinkedEmail",
                unique: true,
                filter: "[LinkedEmail] IS NOT NULL");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_portal_donors_LinkedEmail",
                table: "portal_donors");

            migrationBuilder.DropColumn(
                name: "LinkedEmail",
                table: "portal_donors");
        }
    }
}
