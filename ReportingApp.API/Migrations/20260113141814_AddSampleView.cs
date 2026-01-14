using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ReportingApp.API.Migrations
{
    /// <inheritdoc />
    public partial class AddSampleView : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                CREATE OR ALTER VIEW V_MonthlyReport AS
                SELECT 1 AS Id, 'Laptop' AS Product, 1500.00 AS Price, 'Electronics' AS Category, CAST(GETDATE() AS DATE) AS Date
                UNION ALL SELECT 2, 'Mouse', 25.50, 'Electronics', CAST(GETDATE() AS DATE)
                UNION ALL SELECT 3, 'Desk', 300.00, 'Furniture', CAST(GETDATE() AS DATE)
                UNION ALL SELECT 4, 'Chair', 150.00, 'Furniture', CAST(GETDATE() AS DATE)
                UNION ALL SELECT 5, 'Monitor', 200.00, 'Electronics', CAST(GETDATE() AS DATE)
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
             migrationBuilder.Sql("DROP VIEW IF EXISTS V_MonthlyReport");
        }
    }
}
