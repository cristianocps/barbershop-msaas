using BarberShop.Dominio.Entidade.Reflection.Texto;
using BarberShop.Dominio.Interfaces.Repositorios.Agendamentos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json.Serialization;

namespace BarberShop.Controllers
{
    [AllowAnonymous]
    [ApiController]
    [Route("api/webhooks/infinitepay")]
    public class InfinitePayWebhookController : ControllerBase
    {
        private readonly IAgendamentoRepositorio _agendamentoRepositorio;

        public InfinitePayWebhookController(IAgendamentoRepositorio agendamentoRepositorio)
        {
            _agendamentoRepositorio = agendamentoRepositorio;
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
                await _agendamentoRepositorio.ProcessarWebhookInfinitePayAsync(
                    payload.OrderNsu,
                    payload.TransactionNsu,
                    payload.CaptureMethod,
                    payload.PaidAmount > 0 ? payload.PaidAmount : payload.Amount,
                    payload.ReceiptUrl,
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

            [JsonPropertyName("capture_method")]
            public string? CaptureMethod { get; set; }

            [JsonPropertyName("amount")]
            public int Amount { get; set; }

            [JsonPropertyName("paid_amount")]
            public int PaidAmount { get; set; }

            [JsonPropertyName("receipt_url")]
            public string? ReceiptUrl { get; set; }
        }
    }
}
