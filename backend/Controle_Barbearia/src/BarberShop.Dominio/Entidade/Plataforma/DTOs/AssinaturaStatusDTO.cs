namespace BarberShop.Dominio.Entidade.Plataforma.DTOs
{
    public class AssinaturaStatusDTO
    {
        public long IdEmpresa { get; set; }
        public string Status { get; set; } = "";
        public bool Bloqueado { get; set; }
        public int DiasRestantes { get; set; }
        public DateTime? TrialEndsAt { get; set; }
        public DateTime? PeriodoFim { get; set; }
        public int ValorMensalCentavos { get; set; }
        public DateTime? DtUltimoPagamento { get; set; }
        public string? Mensagem { get; set; }
    }

    public class AssinaturaLinkRetornoDTO
    {
        public string Url { get; set; } = "";
        public string OrderNsu { get; set; } = "";
        public long IdCobranca { get; set; }
    }

    public class PlataformaEmpresaResumoDTO
    {
        public long IdEmpresa { get; set; }
        public string Descricao { get; set; } = "";
        public string? Slug { get; set; }
        public string Status { get; set; } = "";
        public bool Bloqueado { get; set; }
        public DateTime? TrialEndsAt { get; set; }
        public DateTime? PeriodoFim { get; set; }
        public DateTime? DtUltimoPagamento { get; set; }
        public int ValorMensalCentavos { get; set; }
        public int DiasRestantes { get; set; }
    }

    public class PlataformaAssinaturaOverrideDTO
    {
        public string? Status { get; set; }
        public DateTime? TrialEndsAt { get; set; }
        public DateTime? PeriodoFim { get; set; }
        public int? ValorMensalCentavos { get; set; }
    }
}
