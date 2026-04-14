using BarberShop.Dominio.Entidade.Agendamentos;
using BarberShop.Dominio.Entidade.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BarberShop.Dominio.Interfaces.Repositorios.Agendamentos
{
    public interface IAgendamentoRepositorio : IDisposable
    {
        Task<long> AlterarAgendamentos(Agendamento dados);
        Task<long> AlterarStatusAgendamento(long id, int status);
        Task<IEnumerable<DataSelect2DTO>> CarregarComboAgendamentos(string search, int page, int? length = 10);
        Task<RetornoGridPaginado<Agendamento>> CarregarGridAgendamentos(DataTableSearch search, int start, int draw, int? length = 10);
        Task<Agendamento> Editar(long idItem);
    }
}
