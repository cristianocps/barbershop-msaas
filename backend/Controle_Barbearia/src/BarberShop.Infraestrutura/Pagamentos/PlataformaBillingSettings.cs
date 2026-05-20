namespace BarberShop.Infraestrutura.Pagamentos
{
    public class PlataformaBillingSettings
    {
        public const string SectionName = "PlataformaBilling";
        public string Handle { get; set; } = "";
        public string CheckoutApiUrl { get; set; } = "https://api.checkout.infinitepay.io";
        public string WebhookSecret { get; set; } = "";
        public string RedirectUrlBase { get; set; } = "";
        public string WebhookUrl { get; set; } = "";
        public int MensalidadeCentavos { get; set; } = 9900;
        public int TrialDias { get; set; } = 14;
    }
}
