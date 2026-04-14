using System.Diagnostics;

namespace BarberShop.Models
{
    [DebuggerStepThrough]
    public class ResponseMethodJson
    {
        public string JsonTypes { get; set; } = default!;
        public string Mensagem { get; set; } = default!;
        public object? Data { get; set; }
        public long? RecordsTotal { get; set; }
    }
}
