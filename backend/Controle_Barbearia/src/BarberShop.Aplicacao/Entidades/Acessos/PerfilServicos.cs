using BarberShop.Dominio.Entidade.Acessos;
using BarberShop.Dominio.Entidade.DTOs;
using BarberShop.Dominio.Interfaces.Repositorios.Acessos;
using BarberShop.Dominio.Interfaces.Servicos.Acessos;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BarberShop.Aplicacao.Entidades.Acessos
{
    public class PerfilServicos : IPerfilServicos
    {
        private readonly IPerfilRepositorio _perfilRepositorio;

        public PerfilServicos(IPerfilRepositorio perfilRepositorio)
        {
            _perfilRepositorio = perfilRepositorio;
        }

        public async Task<IEnumerable<DataSelect2DTO>> CarregarComboPerfils(string search, int page, int? length = 10)
        {
            return await _perfilRepositorio.CarregarComboPerfils(search, page, length).ConfigureAwait(false);
        }

        public async Task<RetornoGridPaginado<Perfil>> CarregarGridPerfils(DataTableSearch search, int start, int draw, int? length = 10)
        {
           return await _perfilRepositorio.CarregarGridPerfils(search, start, draw, length).ConfigureAwait(false);
        }

        public async Task<Perfil> Editar(long idItem)
        {
            return await _perfilRepositorio.Editar(idItem).ConfigureAwait(false);
        }

        public void Dispose()
        {
            _perfilRepositorio?.Dispose();
            GC.SuppressFinalize(this);
        }

       
    }
}
