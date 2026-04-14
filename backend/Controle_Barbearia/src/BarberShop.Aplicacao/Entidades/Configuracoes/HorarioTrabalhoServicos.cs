using BarberShop.Dominio.Entidade.Configuracoes;
using BarberShop.Dominio.Entidade.DTOs;
using BarberShop.Dominio.Interfaces.Repositorios.Configuracoes;
using BarberShop.Dominio.Interfaces.Servicos.Configuracoes;
using System;
using System.Threading.Tasks;

namespace BarberShop.Aplicacao.Entidades.Configuracoes
{
    public class HorarioTrabalhoServicos : IHorarioTrabalhoServicos
    {
        private readonly IHorarioTrabalhoRepositorio _horarioTrabalho;

        public HorarioTrabalhoServicos(IHorarioTrabalhoRepositorio repositorio)
        {
            _horarioTrabalho = repositorio;
        }

        public async Task<long> AlterarHorarioTrabalho(HorarioTrabalho dados)
        {
            return await _horarioTrabalho.AlterarHorarioTrabalho(dados);
        }

        public async Task<long> AlterarStatusHorarioTrabalho(long id, int status)
        {
            return await _horarioTrabalho.AlterarStatusHorarioTrabalho(id, status);
        }

        public async Task<RetornoGridPaginado<HorarioTrabalho>> CarregarGridHorariosTrabalho(DataTableSearch search, int start, int draw, int? length = 10)
        {
            return await _horarioTrabalho.CarregarGridHorariosTrabalho(search, start, draw, length);
        }

        public async Task<HorarioTrabalho> Editar(long idItem)
        {
            return await _horarioTrabalho.Editar(idItem);
        }
        
        public async Task<bool> Excluir(long idItem)
        {
            return await _horarioTrabalho.Excluir(idItem);
        }

        public void Dispose()
        {
            _horarioTrabalho?.Dispose();
            GC.SuppressFinalize(this);
        }
    }
}
