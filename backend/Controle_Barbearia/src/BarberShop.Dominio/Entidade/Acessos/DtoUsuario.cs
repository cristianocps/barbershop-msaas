using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BarberShop.Dominio.Entidade.Acessos
{
    public class DtoUsuario
    {
        public long ID { get; set; } = default!;
        public long IdEmpresa { get; set; } = default!;
        public string Documento { get; set; } = default!;
        public string Descricao { get; set; } = default!;
        public string Email { get; set; } = default!;
        public string Telefone { get; set; } = default!;
        public string Cidade { get; set; } = default!;
        public string? Senha { get; set; }
        public string? Logon { get; set; }
        public string? IdClains { get; set; } = default!;
        public int Status { get; set; } = default!;
    }
}
