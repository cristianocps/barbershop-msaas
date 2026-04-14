using BarberShop.Dominio.Entidade.Reflection;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BarberShop.Dominio.Entidade.Acessos
{
    [DebuggerStepThrough]
    [Table("perfil", Schema = "public")]
    public class Perfil
    {
        public Perfil()
        {
            this.SetValuesDefault();
        }

        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Required(ErrorMessage = "obrigatório informar a propriedade: id", AllowEmptyStrings = false)]
        [Column("id", Order = 1, TypeName = "bigint")]
        public long ID { get; set; } = default!;

        [Required(ErrorMessage = "obrigatório informar a propriedade: idempresa", AllowEmptyStrings = true)]
        [Column("~idempresa", Order = 2, TypeName = "bigint")]
        public long IdEmpresa { get; set; } = default!;

        [Required(ErrorMessage = "obrigatório informar a propriedade: codigo", AllowEmptyStrings = false)]
        [Column("codigo", Order = 3, TypeName = "smallint")]
        public int Codigo { get; set; } = default!;

        [DataType(DataType.Text)]
        [MaxLength(50, ErrorMessage = "tamanho máximo 50 caracteres")]
        [Required(ErrorMessage = "obrigatório informar a propriedade: idrole", AllowEmptyStrings = true)]
        [Column("idrole", Order = 4, TypeName = "varchar(50)")]
        public string IdRole { get; set; } = default!;

        [DataType(DataType.Text)]
        [MaxLength(50, ErrorMessage = "tamanho máximo 50 caracteres")]
        [Required(ErrorMessage = "obrigatório informar a propriedade: descricao", AllowEmptyStrings = true)]
        [Column("descricao", Order = 5, TypeName = "varchar(50)")]
        public string Descricao { get; set; } = default!;

        [Required(ErrorMessage = "obrigatório informar a propriedade: status", AllowEmptyStrings = true)]
        [Column("status", Order = 6, TypeName = "tinyint")]
        public int Status { get; set; } = default!;


        [NotMapped]
        [ScaffoldColumn(false)]
        public long RecordsTotal { get; set; } = default!;


        [NotMapped]
        [ScaffoldColumn(false)]
        public long RecordsFiltered { get; set; } = default!;
    }
}
