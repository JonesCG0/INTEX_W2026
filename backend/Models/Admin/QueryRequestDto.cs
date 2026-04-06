using System.ComponentModel.DataAnnotations;

namespace backend.Models.Admin;

public sealed record QueryRequestDto(
    [Required] string Sql
);
