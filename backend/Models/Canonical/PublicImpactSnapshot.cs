using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models.Canonical;

[Table("public_impact_snapshots")]
public sealed class PublicImpactSnapshot
{
    [Key]
    [Column("snapshot_id")]
    public int SnapshotId { get; set; }

    [Column("snapshot_date")]
    public DateTime SnapshotDate { get; set; }

    [Required]
    [MaxLength(120)]
    [Column("headline")]
    public string Headline { get; set; } = string.Empty;

    [Required]
    [Column("summary_text")]
    public string SummaryText { get; set; } = string.Empty;

    [Column("is_published")]
    public bool IsPublished { get; set; }

    [Column("published_at")]
    public DateTime? PublishedAt { get; set; }
}
