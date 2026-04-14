using BarberShop.Dominio.Entidade.Configuracoes;
using BarberShop.Dominio.Entidade.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BarberShop.Dominio.Interfaces.Servicos.Configuracoes
{
    public interface IServicoServicos : IDisposable
    {
        Task<long> AlterarServicos(Servico dados);
        Task<long> AlterarStatusServicos(long id, int status);
        Task<IEnumerable<DataSelect2DTO>> CarregarComboServicos(string search, int page, int? length = 10);
        Task<RetornoGridPaginado<Servico>> CarregarGridServicos(DataTableSearch search, int start, int draw, int? length = 10);
        Task<Servico> Editar(long idItem);
    }
}
