using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BarberShop.Dominio.Entidade.Plataforma
{
    [Table("empresa_assinaturas", Schema = "public")]
    public class EmpresaAssinatura
    {
        [Key]
        [Column("idempresa")]
        public long IdEmpresa { get; set; }

        [Column("status")]
        public string Status { get; set; } = "trial";

        [Column("trial_ends_at")]
        public DateTime TrialEndsAt { get; set; }

        [Column("periodo_inicio")]
        public DateTime? PeriodoInicio { get; set; }

        [Column("periodo_fim")]
        public DateTime? PeriodoFim { get; set; }

        [Column("valor_mensal_centavos")]
        public int ValorMensalCentavos { get; set; }

        [Column("dtultimopagamento")]
        public DateTime? DtUltimoPagamento { get; set; }

        [Column("dtatualizacao")]
        public DateTime DtAtualizacao { get; set; }
    }
}
