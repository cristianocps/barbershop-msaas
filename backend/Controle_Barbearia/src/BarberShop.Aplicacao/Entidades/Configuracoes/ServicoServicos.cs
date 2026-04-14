using BarberShop.Dominio.Entidade.Configuracoes;
using BarberShop.Dominio.Entidade.DTOs;
using BarberShop.Dominio.Entidade.Reflection;
using BarberShop.Dominio.Interfaces.Repositorios.Configuracoes;
using BarberShop.Dominio.Interfaces.Servicos.Configuracoes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BarberShop.Aplicacao.Entidades.Configuracoes
{
    public class ServicoServicos : IServicoServicos
    {
        private readonly IServicoRepositorio _servicoRepositorio;
        public ServicoServicos(IServicoRepositorio servicoRepositorio)
        {
            _servicoRepositorio = servicoRepositorio;
        }

        public async Task<long> AlterarServicos(Servico dados)
        {
            return await _servicoRepositorio.AlterarServicos(dados).ConfigureAwait(true);
        }

        public async Task<long> AlterarStatusServicos(long id, int status)
        {
            return await _servicoRepositorio.AlterarStatusServicos(id, status).ConfigureAwait(true);
        }

        public async Task<IEnumerable<DataSelect2DTO>> CarregarComboServicos(string search, int page, int? length = 10)
        {
            return await _servicoRepositorio.CarregarComboServicos(search, page, length).ConfigureAwait(false);
        }

        public async Task<RetornoGridPaginado<Servico>> CarregarGridServicos(DataTableSearch search, int start, int draw, int? length = 10)
        {
            return await _servicoRepositorio.CarregarGridServicos(search, start, draw, length).ConfigureAwait(false);
        }

        public async Task<Servico> Editar(long idItem)
        {
            return await _servicoRepositorio.Editar(idItem).ConfigureAwait(false);
        }

        public void Dispose()
        {
            _servicoRepositorio?.Dispose();
            GC.SuppressFinalize(this);
        }








    }
}
