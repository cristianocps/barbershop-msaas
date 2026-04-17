using System;

namespace BarberShop.Dominio.Entidade.Agendamentos
{
    public class AgendamentoPendenteDTO
    {
        public long Id { get; set; }
        public string Descricao { get; set; } = "";
        public string NomeCliente { get; set; } = "";
        public string Telefone { get; set; } = "";
        public DateTime DtAgendamento { get; set; }
        public string? ComprovantePix { get; set; }
        
        // Novos campos para o alerta premium
        public string NomeProfissional { get; set; } = "";
        public string Servico { get; set; } = "";
    }
}
