using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BarberShop.Dominio.Entidade.DTOs
{
    [DebuggerStepThrough]
    public class DataSelect2DTO
    {
        public string? id { get; set; } = default!;
        public string text { get; set; } = default!;

        public IEnumerable<DataSelect2DTO>? children { get; set; } = default!;
        public string element { get; set; } = "HTMLOptionElement";
        public string grpoption { get; set; } = default!;
        public string label { get; set; } = default!;
    }
}
