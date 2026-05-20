using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BarberShop.Dominio.Entidade.Agendamentos
{
    [Table("agendamento_pagamentos", Schema = "public")]
    public class AgendamentoPagamento
    {
        [Key]
        [Column("id")]
        public long ID { get; set; }

        [Column("idempresa")]
        public long IdEmpresa { get; set; }

        [Column("idagendamento")]
        public long IdAgendamento { get; set; }

        [Column("tipo_pagamento")]
        public int TipoPagamento { get; set; }

        [Column("valor")]
        public decimal Valor { get; set; }

        [Column("parcelas")]
        public int? Parcelas { get; set; }

        [Column("gateway")]
        public string Gateway { get; set; } = "manual";

        [Column("gateway_order_nsu")]
        public string? GatewayOrderNsu { get; set; }

        [Column("gateway_transaction_nsu")]
        public string? GatewayTransactionNsu { get; set; }

        [Column("gateway_link_url")]
        public string? GatewayLinkUrl { get; set; }

        [Column("gateway_status")]
        public string GatewayStatus { get; set; } = "pending";

        [Column("comprovante_url")]
        public string? ComprovanteUrl { get; set; }

        [Column("observacao")]
        public string? Observacao { get; set; }

        [Column("dtcriacao")]
        public DateTime DtCriacao { get; set; } = DateTime.UtcNow;

        [Column("dtconfirmacao")]
        public DateTime? DtConfirmacao { get; set; }
    }
}
