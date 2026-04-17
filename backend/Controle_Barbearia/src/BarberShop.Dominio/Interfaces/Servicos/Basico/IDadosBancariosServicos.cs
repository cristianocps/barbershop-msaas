using BarberShop.Dominio.Entidade.Basico;
using BarberShop.Dominio.Entidade.Configuracoes;
using BarberShop.Dominio.Entidade.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BarberShop.Dominio.Interfaces.Servicos.Basico
{
    public interface IDadosBancariosServicos : IDisposable
    {
        Task<long> AlterarDadosBancarios(DadosBancarios dados);
        Task<long> AlterarStatusDadosBancarios(long id, int status);
        Task<long> AlterarStatusTipoChavePix(long id, int status);
        Task<long> AlterarTipoChavePix(TipoChave dados);
        Task<IEnumerable<DataSelect2DTO>> CarregarComboTipoChavePix(string search, int page, int? length = 10);
        Task<RetornoGridPaginado<DadosBancarios>> CarregarGridDadosBancarios(DataTableSearch search, int start, int draw, int? length = 10);
        Task<RetornoGridPaginado<TipoChave>> CarregarGridTipoChave(DataTableSearch search, int start, int draw, int? length = 10);
        Task<DadosBancarios> Editar(long idItem);
        Task<string> DescriptografarChavePix(long id, string senha);
        Task<TipoChave> EditarTipoChavePix(long idItem);
    }
}
