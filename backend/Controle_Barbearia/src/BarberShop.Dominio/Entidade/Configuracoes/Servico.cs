using BarberShop.Dominio.Entidade.Reflection;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Diagnostics;

namespace BarberShop.Dominio.Entidade.Configuracoes
{
    [DebuggerStepThrough]
    [Table("servicos", Schema = "public")]
    public class Servico
    {
        public Servico()
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

        [Required(ErrorMessage = "obrigatório informar a propriedade: idusuario", AllowEmptyStrings = true)]
        [Column("idusuario", Order = 3, TypeName = "bigint")]
        public long IdUsuario { get; set; } = default!;

        [DataType(DataType.Text)]
        [MaxLength(150, ErrorMessage = "tamanho máximo 150 caracteres")]
        [Required(ErrorMessage = "obrigatório informar a propriedade: descricao", AllowEmptyStrings = false)]
        [Column("descricao", Order = 4, TypeName = "varchar(150)")]
        public string Descricao { get; set; } = default!;

        [DataType(DataType.Text)]
        [MaxLength(50, ErrorMessage = "tamanho máximo 50 caracteres")]
        [Column("unidade", Order = 5, TypeName = "varchar(50)")]
        public string? Unidade { get; set; } = default!;

        [Required(ErrorMessage = "obrigatório informar a propriedade: valor_unitario", AllowEmptyStrings = false)]
        [Column("valor_unitario", Order = 6, TypeName = "numeric(10,2)")]
        public decimal ValorUnitario { get; set; } = default!;

        [DataType(DataType.DateTime)]
        [DisplayFormat(DataFormatString = "{0:dd/MM/yyyy}", ApplyFormatInEditMode = true, ConvertEmptyStringToNull = true)]
        [Required(ErrorMessage = "obrigatório informar a propriedade: dtcriacao", AllowEmptyStrings = false)]
        [Column("dtcriacao", Order = 7, TypeName = "timestamp with time zone")]
        public DateTime DtCriacao { get; set; } = DateTime.Now;

        [Required(ErrorMessage = "obrigatório informar a propriedade: status", AllowEmptyStrings = true)]
        [Column("status", Order = 8, TypeName = "integer")]
        public int Status { get; set; } = default!;

        [NotMapped]
        [ScaffoldColumn(false)]
        public long RecordsTotal { get; set; } = default!;

        [NotMapped]
        [ScaffoldColumn(false)]
        public long RecordsFiltered { get; set; } = default!;
    }
}