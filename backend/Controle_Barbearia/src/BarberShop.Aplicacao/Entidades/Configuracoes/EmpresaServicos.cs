using BarberShop.Dominio.Entidade.Acessos;
using BarberShop.Dominio.Entidade.Configuracoes;
using BarberShop.Dominio.Entidade.DTOs;
using BarberShop.Dominio.Interfaces.Repositorios.Acessos;
using BarberShop.Dominio.Interfaces.Repositorios.Configuracoes;
using BarberShop.Dominio.Interfaces.Servicos.Configuracoes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BarberShop.Aplicacao.Entidades.Configuracoes
{
    public class EmpresaServicos : IEmpresaServicos
    {
        private readonly IEmpresaRepositorio _empresaRepositorio;
        public EmpresaServicos(IEmpresaRepositorio empresaRepositorio)
        {
            _empresaRepositorio = empresaRepositorio;
        }

        public async Task<long> AlterarEmpresas(Empresa dados)
        {
            return await _empresaRepositorio.AlterarEmpresas(dados).ConfigureAwait(true);
        }

        public async Task<long> AlterarStatusEmpresa(long id, int status)
        {
            return await _empresaRepositorio.AlterarStatusEmpresa(id, status).ConfigureAwait(true);
        }

        public async Task<IEnumerable<DataSelect2DTO>> CarregarComboStatusEmpresas(string search, int page, int? length = 10)
        {
            return await _empresaRepositorio.CarregarComboStatusEmpresas(search, page, length).ConfigureAwait(false);
        }

        public async Task<RetornoGridPaginado<Empresa>> CarregarGridEmpresas(DataTableSearch search, int start, int draw, int? length = 10)
        {
            return await _empresaRepositorio.CarregarGridEmpresas(search, start, draw, length).ConfigureAwait(false);
        }

        public async Task<Empresa> Editar(long idItem)
        {
            return await _empresaRepositorio.Editar(idItem).ConfigureAwait(false);
        }


        public void Dispose()
        {
            _empresaRepositorio?.Dispose();
            GC.SuppressFinalize(this);
        }
    }
}
