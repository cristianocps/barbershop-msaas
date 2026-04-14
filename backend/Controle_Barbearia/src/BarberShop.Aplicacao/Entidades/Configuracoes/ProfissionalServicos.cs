using BarberShop.Dominio.Entidade.Configuracoes;
using BarberShop.Dominio.Entidade.DTOs;
using BarberShop.Dominio.Interfaces.Repositorios.Configuracoes;
using BarberShop.Dominio.Interfaces.Servicos.Configuracoes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BarberShop.Aplicacao.Entidades.Configuracoes
{
    public class ProfissionalServicos : IProfissionalServicos
    {
        private readonly IProfissionalRepositorio _profissionalRepositorio;
        public ProfissionalServicos(IProfissionalRepositorio profissionalRepositorio)
        {
            _profissionalRepositorio = profissionalRepositorio;
        }
        public async Task<long> AlterarProfissional(Profissional dados)
        {
            return await _profissionalRepositorio.AlterarProfissional(dados).ConfigureAwait(true);
        }

        public async Task<long> AlterarStatusProfissional(long id, int status)
        {
            return await _profissionalRepositorio.AlterarStatusProfissional(id, status).ConfigureAwait(true);
        }

        public async Task<IEnumerable<DataSelect2DTO>> CarregarComboProfissionais(string search, int page, int? length = 10)
        {
            return await _profissionalRepositorio.CarregarComboProfissionais(search, page, length).ConfigureAwait(false);
        }

        public async Task<RetornoGridPaginado<Profissional>> CarregarGridProfissionais(DataTableSearch search, int start, int draw, int? length = 10)
        {
            return await _profissionalRepositorio.CarregarGridProfissionais(search, start, draw, length).ConfigureAwait(false);
        }

        public async Task<Profissional> Editar(long idItem)
        {
            return await _profissionalRepositorio.Editar(idItem).ConfigureAwait(false);
        }

        public void Dispose()
        {
            _profissionalRepositorio?.Dispose();
            GC.SuppressFinalize(this);
        }
    }
}
