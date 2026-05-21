namespace BarberShop.Dominio.Interfaces.Repositorios.Acessos
{
    public class ClienteAgendamentoDto
    {
        public long Id { get; set; }
        public string EmpresaNome { get; set; } = string.Empty;
        public string? EmpresaSlug { get; set; }
        public string Descricao { get; set; } = string.Empty;
        public DateTime DtAgendamento { get; set; }
        public int Status { get; set; }
        public string? Telefone { get; set; }
    }

    public interface IClientePortalRepositorio
    {
        Task<IEnumerable<ClienteAgendamentoDto>> ListarAgendamentosAsync(long idConta);
        Task<long> ObterIdContaPorIdClainsAsync(string idClains);
    }
}
