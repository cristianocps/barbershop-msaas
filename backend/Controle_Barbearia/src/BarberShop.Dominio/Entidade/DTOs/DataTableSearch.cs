using System.Diagnostics;

namespace BarberShop.Dominio.Entidade.DTOs
{
    [DebuggerStepThrough]
    public class DataTableSearch
    {
        public string value { get; set; } = default!;
        public string regex { get; set; } = default!;
    }
}
