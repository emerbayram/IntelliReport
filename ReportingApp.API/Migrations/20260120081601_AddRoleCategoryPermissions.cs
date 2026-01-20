using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ReportingApp.API.Migrations
{
    /// <inheritdoc />
    public partial class AddRoleCategoryPermissions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "RoleCategoryPermissions",
                columns: table => new
                {
                    RoleId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    CategoryId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RoleCategoryPermissions", x => new { x.RoleId, x.CategoryId });
                    table.ForeignKey(
                        name: "FK_RoleCategoryPermissions_AspNetRoles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "AspNetRoles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RoleCategoryPermissions_ReportCategories_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "ReportCategories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_RoleCategoryPermissions_CategoryId",
                table: "RoleCategoryPermissions",
                column: "CategoryId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "RoleCategoryPermissions");
        }
    }
}
