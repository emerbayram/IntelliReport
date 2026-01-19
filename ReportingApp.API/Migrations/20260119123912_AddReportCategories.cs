using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ReportingApp.API.Migrations
{
    /// <inheritdoc />
    public partial class AddReportCategories : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CategoryId",
                table: "ReportDefinitions",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "ReportCategories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ReportCategories", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ReportDefinitions_CategoryId",
                table: "ReportDefinitions",
                column: "CategoryId");

            migrationBuilder.AddForeignKey(
                name: "FK_ReportDefinitions_ReportCategories_CategoryId",
                table: "ReportDefinitions",
                column: "CategoryId",
                principalTable: "ReportCategories",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ReportDefinitions_ReportCategories_CategoryId",
                table: "ReportDefinitions");

            migrationBuilder.DropTable(
                name: "ReportCategories");

            migrationBuilder.DropIndex(
                name: "IX_ReportDefinitions_CategoryId",
                table: "ReportDefinitions");

            migrationBuilder.DropColumn(
                name: "CategoryId",
                table: "ReportDefinitions");
        }
    }
}
