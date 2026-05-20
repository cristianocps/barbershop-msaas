using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BarberShop.Dominio.Entidade.Plataforma
{
    [Table("plataforma_cobrancas", Schema = "public")]
    public class PlataformaCobranca
    {
        [Key]
        [Column("id")]
        public long Id { get; set; }

        [Column("idempresa")]
        public long IdEmpresa { get; set; }

        [Column("referencia")]
        public string Referencia { get; set; } = "";

        [Column("order_nsu")]
        public string OrderNsu { get; set; } = "";

        [Column("gateway_link_url")]
        public string? GatewayLinkUrl { get; set; }

        [Column("gateway_status")]
        public string GatewayStatus { get; set; } = "pending";

        [Column("gateway_transaction_nsu")]
        public string? GatewayTransactionNsu { get; set; }

        [Column("valor_centavos")]
        public int ValorCentavos { get; set; }

        [Column("dtcriacao")]
        public DateTime DtCriacao { get; set; }

        [Column("dtpagamento")]
        public DateTime? DtPagamento { get; set; }
    }
}
