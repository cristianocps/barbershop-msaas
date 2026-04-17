using BarberShop.Dominio.Entidade.Basico;
using BarberShop.Dominio.Entidade.DTOs;
using BarberShop.Dominio.Interfaces.Repositorios.Basico;
using BarberShop.Dominio.Interfaces.Repositorios.Configuracoes;
using BarberShop.Dominio.Interfaces.Servicos.Basico;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BarberShop.Aplicacao.Entidades.Basico
{
    public class DadosBancariosServicos : IDadosBancariosServicos
    {
        private readonly IDadosBancariosRepositorio _dadosBancariosRepositorio;
        public DadosBancariosServicos(IDadosBancariosRepositorio dadosBancariosRepositorio)
        {
            _dadosBancariosRepositorio = dadosBancariosRepositorio;
        }

        public async Task<long> AlterarDadosBancarios(DadosBancarios dados)
        {
            return await _dadosBancariosRepositorio.AlterarDadosBancarios(dados).ConfigureAwait(true);
        }

        public async Task<long> AlterarStatusDadosBancarios(long id, int status)
        {
            return await _dadosBancariosRepositorio.AlterarStatusDadosBancarios(id, status).ConfigureAwait(true);
        }

        public async Task<long> AlterarStatusTipoChavePix(long id, int status)
        {
            return await _dadosBancariosRepositorio.AlterarStatusTipoChavePix(id, status).ConfigureAwait(true);
        }

        public async Task<long> AlterarTipoChavePix(TipoChave dados)
        {
            return await _dadosBancariosRepositorio.AlterarTipoChavePix(dados).ConfigureAwait(true);
        }

        public async Task<IEnumerable<DataSelect2DTO>> CarregarComboTipoChavePix(string search, int page, int? length = 10)
        {
            return await _dadosBancariosRepositorio.CarregarComboTipoChavePix(search, page, length).ConfigureAwait(false);
        }

        public async Task<RetornoGridPaginado<DadosBancarios>> CarregarGridDadosBancarios(DataTableSearch search, int start, int draw, int? length = 10)
        {
            return await _dadosBancariosRepositorio.CarregarGridDadosBancarios(search, start, draw, length).ConfigureAwait(false);
        }

        public async Task<RetornoGridPaginado<TipoChave>> CarregarGridTipoChave(DataTableSearch search, int start, int draw, int? length = 10)
        {
            return await _dadosBancariosRepositorio.CarregarGridTipoChave(search, start, draw, length).ConfigureAwait(false);
        }

        public async Task<DadosBancarios> Editar(long idItem)
        {
            return await _dadosBancariosRepositorio.Editar(idItem).ConfigureAwait(false);
        }

        public async Task<TipoChave> EditarTipoChavePix(long idItem)
        {
            return await _dadosBancariosRepositorio.EditarTipoChavePix(idItem).ConfigureAwait(false);
        }

        public async Task<string> DescriptografarChavePix(long id, string senha)
        {
            return await _dadosBancariosRepositorio.DescriptografarChavePix(id, senha).ConfigureAwait(false);
        }

        public void Dispose()
        {
            _dadosBancariosRepositorio?.Dispose();
            GC.SuppressFinalize(this);
        }

    }
}
