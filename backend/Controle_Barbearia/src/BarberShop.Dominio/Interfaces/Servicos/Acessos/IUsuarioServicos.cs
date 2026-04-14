using BarberShop.Dominio.Entidade.Acessos;
using BarberShop.Dominio.Entidade.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BarberShop.Dominio.Interfaces.Servicos.Acessos
{
    public interface IUsuarioServicos : IDisposable
    {
        
        Task<IEnumerable<DataSelect2DTO>> CarregarComboUsuarios(string search, int page, int? length = 10);
        Task<RetornoGridPaginado<Usuario>> CarregarGridUsuarios(DataTableSearch search, int start, int draw, int? length = 10);
        Task<string?> ValidarCriacaoUsuario(long idUsuario, string email);
        Task<long> AlterarUsuarios(Usuario dados);
        Task<Usuario> Editar(long idItem);
        Task<long> Excluir(long idItem);
        
    }
}
