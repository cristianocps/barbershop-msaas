using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BarberShop.Dominio.Entidade.Agendamentos
{
    [DebuggerStepThrough]
    public class VitrineConfirmarDTO
    {
        public long IdEmpresa { get; set; } = default!;
        public long IdProfissional { get; set; } = default!;
        public DateTime DtAgendamento { get; set; } = default!;
        public string NomeCliente { get; set; } = default!;
        public string TelefoneCliente { get; set; } = default!;
        public string Observacao { get; set; } = "";
        public string MensagemWhatsApp { get; set; } = "";
        public List<VitrineItemDTO> Servicos { get; set; } = new List<VitrineItemDTO>();
    }
}
