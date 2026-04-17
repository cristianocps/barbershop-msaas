using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BarberShop.Dominio.Entidade.DTOs
{
    [DebuggerStepThrough]
    public class DescriptografarDTO
    {
        public long Id { get; set; } = default!;
        public string Senha { get; set; } = default!;
    }
}
