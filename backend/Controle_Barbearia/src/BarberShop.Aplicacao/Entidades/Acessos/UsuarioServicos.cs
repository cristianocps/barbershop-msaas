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
    public class UsuarioServicos : IUsuarioServicos
    {
        private readonly IUsuarioRepositorio _usuarioRepositorio;
        public UsuarioServicos(IUsuarioRepositorio usuarioRepositorio)
        {
            _usuarioRepositorio = usuarioRepositorio;
        }

        public async Task<long> AlterarUsuarios(Usuario dados)
        {
            return await _usuarioRepositorio.AlterarUsuarios(dados).ConfigureAwait(true);
        }

        public async Task<string?> ValidarCriacaoUsuario(long idUsuario, string email)
        {
            return await _usuarioRepositorio.ValidarCriacaoUsuario(idUsuario, email).ConfigureAwait(true);
        }

        public async Task<IEnumerable<DataSelect2DTO>> CarregarComboUsuarios(string search, int page, int? length = 10)
        {
            return await _usuarioRepositorio.CarregarComboUsuarios(search, page, length).ConfigureAwait(false);
        }

        public async Task<RetornoGridPaginado<Usuario>> CarregarGridUsuarios(DataTableSearch search, int start, int draw, int? length = 10)
        {
            return await _usuarioRepositorio.CarregarGridUsuarios(search, start, draw, length).ConfigureAwait(false);
        }

        public async Task<Usuario> Editar(long idItem)
        {
            return await _usuarioRepositorio.Editar(idItem).ConfigureAwait(false);
        }

        public async Task<long> Excluir(long idItem)
        {
            return await _usuarioRepositorio.Excluir(idItem).ConfigureAwait(false);
        }
        public void Dispose()
        {
            _usuarioRepositorio?.Dispose();
            GC.SuppressFinalize(this); ;
        }

       
    }
}
