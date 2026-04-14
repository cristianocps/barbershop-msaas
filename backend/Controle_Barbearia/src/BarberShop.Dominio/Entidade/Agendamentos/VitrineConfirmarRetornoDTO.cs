using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BarberShop.Dominio.Entidade.Agendamentos
{
    [DebuggerStepThrough]
    public class VitrineConfirmarRetornoDTO
    {
        public long IdAgendamento { get; set; }
        public string NomeProfissional { get; set; } = "";
        public string NomeServicos { get; set; } = ""; // "Corte + Barba"
        public string DataFormatada { get; set; } = ""; // "Sex, 04/04 às 15:00"
        public string WhatsApp { get; set; } = ""; // número da empresa
        public string MensagemWhatsApp { get; set; } = "";
    }
}
