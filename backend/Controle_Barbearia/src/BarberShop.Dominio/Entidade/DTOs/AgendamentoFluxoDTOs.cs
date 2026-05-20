namespace BarberShop.Dominio.Entidade.DTOs
{
    public class CancelarAgendamentoDTO
    {
        public string? Motivo { get; set; }
    }

    public class ConcluirAgendamentoDTO
    {
        public int TipoPagamento { get; set; }
        public decimal? Valor { get; set; }
        public int? Parcelas { get; set; }
        public string? ComprovanteUrl { get; set; }
        public string? Observacao { get; set; }
    }

    public class TapCallbackDTO
    {
        public string OrderId { get; set; } = "";
        public string? Nsu { get; set; }
        public string? Aut { get; set; }
        public string? CardBrand { get; set; }
        public string? Warning { get; set; }
        public int TipoPagamento { get; set; } = 6;
        public int? Parcelas { get; set; }
    }

    public class PagamentoLinkRetornoDTO
    {
        public string Url { get; set; } = "";
        public long IdPagamento { get; set; }
        public string GatewayOrderNsu { get; set; } = "";
    }

    public class TapUrlRetornoDTO
    {
        public string TapUrl { get; set; } = "";
        public string GatewayOrderNsu { get; set; } = "";
    }

    public class FinanceiroResumoDTO
    {
        public decimal TotalRecebido { get; set; }
        public decimal TotalPix { get; set; }
        public decimal TotalCartao { get; set; }
        public decimal TotalDinheiro { get; set; }
        public decimal TotalInfinite { get; set; }
        public int QuantidadeLancamentos { get; set; }
    }

    public class FinanceiroLancamentoDTO
    {
        public long IdPagamento { get; set; }
        public long IdAgendamento { get; set; }
        public string Descricao { get; set; } = "";
        public string NomeProfissional { get; set; } = "";
        public DateTime DtAgendamento { get; set; }
        public DateTime? DtConfirmacaoPagamento { get; set; }
        public int TipoPagamento { get; set; }
        public string Gateway { get; set; } = "";
        public decimal Valor { get; set; }
        public int? Parcelas { get; set; }
    }
}
