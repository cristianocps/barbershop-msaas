using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BarberShop.Dominio.Entidade.Agendamentos
{
    [DebuggerStepThrough]
    public class VitrineItemDTO
    {
        public long IdServico { get; set; } = default!;
        public string NomeServico { get; set; } = "";
        public decimal ValorCobrado { get; set; } = default!;
    }
}
