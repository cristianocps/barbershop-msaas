namespace BarberShop.Dominio.Entidade.Agendamentos;

public class AgendamentoCalendarioDTO
{
    public long ID { get; set; }
    public long IdProfissional { get; set; }
    public string Descricao { get; set; } = string.Empty;
    public string Telefone { get; set; } = string.Empty;
    public DateTime DtAgendamento { get; set; }
    public int DuracaoMinutos { get; set; } = 30;
    public int Status { get; set; }
    public string NomeProfissional { get; set; } = string.Empty;
    public string CorAgenda { get; set; } = "#3B82F6";
    public decimal ValorTotal { get; set; }
}
