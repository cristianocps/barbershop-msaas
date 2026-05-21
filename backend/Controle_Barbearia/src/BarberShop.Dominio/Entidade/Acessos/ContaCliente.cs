using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Diagnostics;

namespace BarberShop.Dominio.Entidade.Acessos
{
    [DebuggerStepThrough]
    [Table("contas_cliente", Schema = "public")]
    public class ContaCliente
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Column("id", Order = 1, TypeName = "bigint")]
        public long ID { get; set; }

        [Required]
        [MaxLength(50)]
        [Column("idclains", Order = 2, TypeName = "varchar(50)")]
        public string IdClains { get; set; } = default!;

        [Required]
        [MaxLength(150)]
        [Column("email", Order = 3, TypeName = "varchar(150)")]
        public string Email { get; set; } = default!;

        [Required]
        [MaxLength(150)]
        [Column("nome", Order = 4, TypeName = "varchar(150)")]
        public string Nome { get; set; } = default!;

        [MaxLength(15)]
        [Column("telefone", Order = 5, TypeName = "varchar(15)")]
        public string? Telefone { get; set; }

        [Column("dtcriacao", Order = 6, TypeName = "timestamp without time zone")]
        public DateTime DtCriacao { get; set; } = DateTime.UtcNow;

        [Column("status", Order = 7, TypeName = "smallint")]
        public int Status { get; set; } = 1;
    }
}
