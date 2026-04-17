using System;
using System.Diagnostics;

namespace BarberShop.Dominio.Entidade.Agendamentos
{
    [DebuggerStepThrough]
    public class AgendamentoPendenteDTO
    {
        public long Id { get; set; }
        public string Descricao { get; set; } = string.Empty;
        public string NomeCliente { get; set; } = string.Empty;
        public string Telefone { get; set; } = string.Empty;
        public DateTime DtAgendamento { get; set; }
        public string? ComprovantePix { get; set; }
    }
}
