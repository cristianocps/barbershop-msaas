using BarberShop.Dominio.Entidade.Acessos;
using BarberShop.Dominio.Entidade.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BarberShop.Dominio.Interfaces.Repositorios.Acessos
{
    public interface IPerfilRepositorio : IDisposable
    {
        Task<IEnumerable<DataSelect2DTO>> CarregarComboPerfils(string search, int page, int? length = 10);
        Task<RetornoGridPaginado<Perfil>> CarregarGridPerfils(DataTableSearch search, int start, int draw, int? length = 10);
        Task<Perfil> Editar(long idItem);
    }
}
