using BarberShop.Dominio.Entidade.Configuracoes;
using BarberShop.Dominio.Entidade.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BarberShop.Dominio.Interfaces.Servicos.Configuracoes
{
    public interface IEmpresaServicos : IDisposable
    {
        Task<long> AlterarEmpresas(Empresa dados);
        Task<long> AlterarStatusEmpresa(long id, int status);
        Task<IEnumerable<DataSelect2DTO>> CarregarComboStatusEmpresas(string search, int page, int? length = 10);
        Task<RetornoGridPaginado<Empresa>> CarregarGridEmpresas(DataTableSearch search, int start, int draw, int? length = 10);
        Task<Empresa> Editar(long idItem);

    }
}
