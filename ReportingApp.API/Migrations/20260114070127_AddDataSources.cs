using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ReportingApp.API.Migrations
{
    /// <inheritdoc />
    public partial class AddDataSources : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "DataSourceId",
                table: "ReportDefinitions",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "DataSources",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ConnectionString = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DataSources", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ReportDefinitions_DataSourceId",
                table: "ReportDefinitions",
                column: "DataSourceId");

            migrationBuilder.AddForeignKey(
                name: "FK_ReportDefinitions_DataSources_DataSourceId",
                table: "ReportDefinitions",
                column: "DataSourceId",
                principalTable: "DataSources",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ReportDefinitions_DataSources_DataSourceId",
                table: "ReportDefinitions");

            migrationBuilder.DropTable(
                name: "DataSources");

            migrationBuilder.DropIndex(
                name: "IX_ReportDefinitions_DataSourceId",
                table: "ReportDefinitions");

            migrationBuilder.DropColumn(
                name: "DataSourceId",
                table: "ReportDefinitions");
        }
    }
}
