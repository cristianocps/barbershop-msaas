using BarberShop.Dominio.Entidade.Reflection.Texto;
using BarberShop.Dominio.Interfaces.Servicos.Plataforma;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json.Serialization;

namespace BarberShop.Controllers
{
    [AllowAnonymous]
    [ApiController]
    [Route("api/webhooks/infinitepay/plataforma")]
    public class PlataformaInfinitePayWebhookController : ControllerBase
    {
        private readonly IPlataformaAssinaturaServicos _assinaturaServicos;

        public PlataformaInfinitePayWebhookController(IPlataformaAssinaturaServicos assinaturaServicos)
        {
            _assinaturaServicos = assinaturaServicos;
        }

        [HttpPost]
        public async Task<IActionResult> Receber([FromBody] InfinitePayWebhookPayload payload)
        {
            if (payload == null || string.IsNullOrWhiteSpace(payload.OrderNsu))
                return BadRequest();

            var secret = Request.Headers["X-Webhook-Secret"].FirstOrDefault()
                ?? Request.Headers["X-Infinitepay-Secret"].FirstOrDefault();

            try
            {
                await _assinaturaServicos.ProcessarWebhookAsync(
                    payload.OrderNsu,
                    payload.TransactionNsu,
                    payload.PaidAmount > 0 ? payload.PaidAmount : payload.Amount,
                    secret).ConfigureAwait(false);
            }
            catch (TratamentoExcecao ex)
            {
                return BadRequest(new { error = ex.Message });
            }

            return Ok();
        }

        public sealed class InfinitePayWebhookPayload
        {
            [JsonPropertyName("order_nsu")]
            public string OrderNsu { get; set; } = "";

            [JsonPropertyName("transaction_nsu")]
            public string? TransactionNsu { get; set; }

            [JsonPropertyName("amount")]
            public int Amount { get; set; }

            [JsonPropertyName("paid_amount")]
            public int PaidAmount { get; set; }
        }
    }
}
