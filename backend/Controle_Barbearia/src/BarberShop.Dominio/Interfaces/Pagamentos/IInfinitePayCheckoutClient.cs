namespace BarberShop.Dominio.Interfaces.Pagamentos
{
    public class InfinitePayLinkRequest
    {
        public string Handle { get; set; } = "";
        public string OrderNsu { get; set; } = "";
        public string RedirectUrl { get; set; } = "";
        public string WebhookUrl { get; set; } = "";
        public List<InfinitePayLinkItem> Items { get; set; } = new();
    }

    public class InfinitePayLinkItem
    {
        public int Quantity { get; set; } = 1;
        public int PriceCents { get; set; }
        public string Description { get; set; } = "";
    }

    public interface IInfinitePayCheckoutClient
    {
        Task<string> CriarLinkPagamentoAsync(InfinitePayLinkRequest request, CancellationToken cancellationToken = default);
    }
}
