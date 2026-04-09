using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models.Canonical;

[Table("safehouse_monthly_metrics")]
public sealed class SafehouseMonthlyMetric
{
    [Key]
    [Column("metric_id")]
    public int MetricId { get; set; }

    [Column("safehouse_id")]
    public int SafehouseId { get; set; }

    [Column("month_start")]
    public DateTime? MonthStart { get; set; }

    [Column("active_residents")]
    public int? ActiveResidents { get; set; }

    [Column("avg_education_progress")]
    public decimal? AvgEducationProgress { get; set; }

    [Column("avg_health_score")]
    public decimal? AvgHealthScore { get; set; }
}
