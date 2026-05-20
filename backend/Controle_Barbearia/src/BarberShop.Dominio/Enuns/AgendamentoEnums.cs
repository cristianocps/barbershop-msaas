namespace BarberShop.Dominio.Enuns
{
    public enum AgendamentoStatus
    {
        Pendente = 0,
        Agendado = 1,
        Concluido = 2,
        Cancelado = 3
    }

    public enum TipoPagamento
    {
        PixManual = 1,
        PixInfinite = 2,
        CartaoCredito = 3,
        CartaoDebito = 4,
        Dinheiro = 5,
        InfiniteTap = 6
    }

    public enum GatewayPagamento
    {
        Manual = 0,
        InfinitePayLink = 1,
        InfinitePayTap = 2
    }

    public static class StatusPagamentoGateway
    {
        public const string Pending = "pending";
        public const string Paid = "paid";
        public const string Failed = "failed";
        public const string Cancelled = "cancelled";
    }
}
