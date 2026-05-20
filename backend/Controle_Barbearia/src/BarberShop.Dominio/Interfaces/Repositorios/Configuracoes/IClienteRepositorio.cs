using BarberShop.Dominio.Entidade.Configuracoes;
using BarberShop.Dominio.Entidade.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BarberShop.Dominio.Interfaces.Repositorios.Configuracoes
{
    public interface IClienteRepositorio : IDisposable
    {
        Task<RetornoGridPaginado<Cliente>> CarregarGridClientes(DataTableSearch search, int start, int draw, int? length = 10);
        Task<IEnumerable<DataSelect2DTO>> CarregarComboStatusClientes(string search, int page, int? length = 10);
        Task<Cliente> Editar(long idItem);
        Task<long> AlterarClientes(Cliente dados);
        Task<long> AlterarStatusCliente(long id, int status);
        Task<IEnumerable<ClienteBuscaDTO>> BuscarClientes(string search, int? limit = 15);
    }
}
