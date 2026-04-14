using BarberShop.Dominio.Entidade.Reflection;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Diagnostics;

namespace BarberShop.Dominio.Entidade.Configuracoes
{
    [DebuggerStepThrough]
    [Table("clientes", Schema = "public")]
    public class Cliente
    {
        public Cliente()
        {
            this.SetValuesDefault();
        }

        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Required(ErrorMessage = "obrigatório informar a propriedade: id", AllowEmptyStrings = false)]
        [Column("id", Order = 1, TypeName = "bigint")]
        public long ID { get; set; } = default!;

        [Required(ErrorMessage = "obrigatório informar a propriedade: idempresa", AllowEmptyStrings = true)]
        [Column("idempresa", Order = 2, TypeName = "bigint")]
        public long IdEmpresa { get; set; } = default!;

        [Column("idusuario", Order = 3, TypeName = "bigint")]
        public long IdUsuario { get; set; } = default!;

        [DataType(DataType.Text)]
        [MaxLength(150, ErrorMessage = "tamanho máximo 150 caracteres")]
        [Required(ErrorMessage = "obrigatório informar a propriedade: descricao", AllowEmptyStrings = false)]
        [Column("descricao", Order = 4, TypeName = "varchar(150)")]
        public string Descricao { get; set; } = default!;

        [DataType(DataType.Text)]
        [MaxLength(15, ErrorMessage = "tamanho máximo 15 caracteres")]
        [Column("telefone", Order = 5, TypeName = "varchar(15)")]
        public string? Telefone { get; set; }

        [DataType(DataType.Text)]
        [MaxLength(60, ErrorMessage = "tamanho máximo 60 caracteres")]
        [Column("endereco", Order = 6, TypeName = "varchar(60)")]
        public string? Endereco { get; set; }

        [DataType(DataType.DateTime)]
        [DisplayFormat(DataFormatString = "{0:dd/MM/yyyy}", ApplyFormatInEditMode = true, ConvertEmptyStringToNull = true)]
        [Required(ErrorMessage = "obrigatório informar a propriedade: dtcriacao", AllowEmptyStrings = false)]
        [Column("dtcriacao", Order = 7, TypeName = "timestamp without time zone")]
        public DateTime DtCriacao { get; set; } = DateTime.Now;

        [Required(ErrorMessage = "obrigatório informar a propriedade: status", AllowEmptyStrings = true)]
        [Column("status", Order = 8, TypeName = "smallint")]
        public int Status { get; set; } = default!;

        [NotMapped]
        [ScaffoldColumn(false)]
        public long RecordsTotal { get; set; } = default!;

        [NotMapped]
        [ScaffoldColumn(false)]
        public long RecordsFiltered { get; set; } = default!;
    }
}
