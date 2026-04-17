using BarberShop.Dominio.Entidade.Reflection;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BarberShop.Dominio.Entidade.Basico
{
    [DebuggerStepThrough]
    [Table("tipochave", Schema = "public")]
    public class TipoChave
    {
        public TipoChave()
        {
            this.SetValuesDefault();   
        }

        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Required(ErrorMessage = "obrigatório informar a propriedade: id", AllowEmptyStrings = false)]
        [Column("id", Order = 1, TypeName = "bigint")]
        public long ID { get; set; } = default!;

        [Required(ErrorMessage = "obrigatório informar a propriedade: idusuario", AllowEmptyStrings = false)]
        [Column("idusuario", Order = 2, TypeName = "bigint")]
        public long IdUsuario { get; set; } = default!;

        [Required(ErrorMessage = "obrigatório informar a propriedade: idempresa", AllowEmptyStrings = false)]
        [Column("idempresa", Order = 2, TypeName = "bigint")]
        public long IdEmpresa { get; set; } = default!;

        [DataType(DataType.Text)]
        [MaxLength(150, ErrorMessage = "tamanho máximo 150 caracteres")]
        [Required(ErrorMessage = "obrigatório informar a propriedade: descricao", AllowEmptyStrings = false)]
        [Column("descricao", Order = 3, TypeName = "varchar(150)")]
        public string Descricao { get; set; } = default!;

        [DataType(DataType.DateTime)]
        [DisplayFormat(DataFormatString = "{0:dd/MM/yyyy}", ApplyFormatInEditMode = true, ConvertEmptyStringToNull = true)]
        [Required(ErrorMessage = "obrigatório informar a propriedade: dtcriacao", AllowEmptyStrings = false)]
        [Column("dtcriacao", Order = 4, TypeName = "datetime")]
        public DateTime DtCriacao { get; set; } = DateTime.Now;

        [Required(ErrorMessage = "obrigatório informar a propriedade: status", AllowEmptyStrings = true)]
        [Column("status", Order = 5, TypeName = "tinyint")]
        public int Status { get; set; } = default!;

        [NotMapped]
        [ScaffoldColumn(false)]
        public long RecordsTotal { get; set; } = default!;

        [NotMapped]
        [ScaffoldColumn(false)]
        public long RecordsFiltered { get; set; } = default!;


    }
}
