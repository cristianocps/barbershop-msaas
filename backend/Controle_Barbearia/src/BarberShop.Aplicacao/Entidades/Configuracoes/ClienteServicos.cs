using BarberShop.Dominio.Entidade.Configuracoes;
using BarberShop.Dominio.Entidade.DTOs;
using BarberShop.Dominio.Interfaces.Repositorios.Configuracoes;
using BarberShop.Dominio.Interfaces.Servicos.Configuracoes;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BarberShop.Aplicacao.Entidades.Configuracoes
{
    public class ClienteServicos : IClienteServicos
    {
        private readonly IClienteRepositorio _clienteRepositorio;
        
        public ClienteServicos(IClienteRepositorio clienteRepositorio)
        {
            _clienteRepositorio = clienteRepositorio;
        }

        public async Task<long> AlterarClientes(Cliente dados)
        {
            return await _clienteRepositorio.AlterarClientes(dados).ConfigureAwait(true);
        }

        public async Task<long> AlterarStatusCliente(long id, int status)
        {
            return await _clienteRepositorio.AlterarStatusCliente(id, status).ConfigureAwait(true);
        }

        public async Task<IEnumerable<DataSelect2DTO>> CarregarComboStatusClientes(string search, int page, int? length = 10)
        {
            return await _clienteRepositorio.CarregarComboStatusClientes(search, page, length).ConfigureAwait(false);
        }

        public async Task<RetornoGridPaginado<Cliente>> CarregarGridClientes(DataTableSearch search, int start, int draw, int? length = 10)
        {
            return await _clienteRepositorio.CarregarGridClientes(search, start, draw, length).ConfigureAwait(false);
        }

        public async Task<Cliente> Editar(long idItem)
        {
            return await _clienteRepositorio.Editar(idItem).ConfigureAwait(false);
        }

        public async Task<IEnumerable<ClienteBuscaDTO>> BuscarClientes(string search, int? limit = 15)
        {
            return await _clienteRepositorio.BuscarClientes(search, limit).ConfigureAwait(false);
        }

        public void Dispose()
        {
            _clienteRepositorio?.Dispose();
            GC.SuppressFinalize(this);
        }
    }
}
