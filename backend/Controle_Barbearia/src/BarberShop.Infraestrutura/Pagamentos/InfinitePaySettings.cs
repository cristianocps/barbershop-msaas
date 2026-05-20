namespace BarberShop.Infraestrutura.Pagamentos
{
    public class InfinitePaySettings
    {
        public const string SectionName = "InfinitePay";
        public string Handle { get; set; } = "";
        public string CheckoutApiUrl { get; set; } = "https://api.checkout.infinitepay.io";
        public string WebhookSecret { get; set; } = "";
        public string RedirectUrlBase { get; set; } = "";
        public string WebhookUrl { get; set; } = "";
        public string TapResultUrlBase { get; set; } = "";
        public string AppClientReferrer { get; set; } = "BarberShop";
    }
}
