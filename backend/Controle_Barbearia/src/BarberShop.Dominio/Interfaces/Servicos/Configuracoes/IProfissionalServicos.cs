using BarberShop.Dominio.Entidade.Agendamentos;
using BarberShop.Dominio.Entidade.Configuracoes;
using BarberShop.Dominio.Entidade.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BarberShop.Dominio.Interfaces.Servicos.Configuracoes
{
    public interface IProfissionalServicos : IDisposable
    {
        Task<long> AlterarProfissional(Profissional dados);
        Task<long> AlterarStatusProfissional(long id, int status);
        Task<IEnumerable<DataSelect2DTO>> CarregarComboProfissionais(string search, int page, int? length = 10);
        Task<RetornoGridPaginado<Profissional>> CarregarGridProfissionais(DataTableSearch search, int start, int draw, int? length = 10);
        Task<Profissional> Editar(long idItem);
    }
}
