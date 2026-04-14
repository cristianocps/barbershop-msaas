using BarberShop.Dominio.Entidade.Configuracoes;
using BarberShop.Dominio.Entidade.DTOs;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BarberShop.Dominio.Interfaces.Repositorios.Configuracoes
{
    public interface IHorarioTrabalhoRepositorio : IDisposable
    {
        Task<long> AlterarHorarioTrabalho(HorarioTrabalho dados);
        Task<long> AlterarStatusHorarioTrabalho(long id, int status);
        Task<RetornoGridPaginado<HorarioTrabalho>> CarregarGridHorariosTrabalho(DataTableSearch search, int start, int draw, int? length = 10);
        Task<HorarioTrabalho> Editar(long idItem);
        Task<bool> Excluir(long idItem);
    }
}
