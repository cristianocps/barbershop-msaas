using BarberShop.Dominio.Interfaces.Pagamentos;
using Microsoft.Extensions.Options;
using System.Net.Http.Json;
using System.Text.Json.Serialization;

namespace BarberShop.Infraestrutura.Pagamentos
{
    public class InfinitePayCheckoutClient : IInfinitePayCheckoutClient
    {
        private readonly HttpClient _http;
        private readonly InfinitePaySettings _settings;

        public InfinitePayCheckoutClient(HttpClient http, IOptions<InfinitePaySettings> settings)
        {
            _http = http;
            _settings = settings.Value;
        }

        public async Task<string> CriarLinkPagamentoAsync(InfinitePayLinkRequest request, CancellationToken cancellationToken = default)
        {
            var handle = !string.IsNullOrWhiteSpace(request.Handle) ? request.Handle.Trim() : _settings.Handle?.Trim();
            if (string.IsNullOrWhiteSpace(handle))
                throw new InvalidOperationException("Infinite Pay: handle da empresa não configurado.");

            var payload = new
            {
                handle,
                redirect_url = request.RedirectUrl,
                webhook_url = request.WebhookUrl,
                order_nsu = request.OrderNsu,
                items = request.Items.Select(i => new
                {
                    quantity = i.Quantity,
                    price = i.PriceCents,
                    description = i.Description
                })
            };

            var baseUrl = _settings.CheckoutApiUrl.TrimEnd('/');
            var response = await _http.PostAsJsonAsync($"{baseUrl}/links", payload, cancellationToken)
                .ConfigureAwait(false);

            if (!response.IsSuccessStatusCode)
            {
                var err = await response.Content.ReadAsStringAsync(cancellationToken).ConfigureAwait(false);
                throw new InvalidOperationException($"Infinite Pay: falha ao criar link ({(int)response.StatusCode}): {err}");
            }

            var body = await response.Content.ReadFromJsonAsync<InfinitePayLinkResponse>(cancellationToken: cancellationToken)
                .ConfigureAwait(false);

            if (string.IsNullOrWhiteSpace(body?.Url))
                throw new InvalidOperationException("Infinite Pay: resposta sem URL de checkout.");

            return body.Url;
        }

        private sealed class InfinitePayLinkResponse
        {
            [JsonPropertyName("url")]
            public string? Url { get; set; }
        }
    }
}
