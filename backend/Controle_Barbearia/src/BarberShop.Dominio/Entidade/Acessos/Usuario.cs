using BarberShop.Dominio.Entidade.Reflection;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BarberShop.Dominio.Entidade.Acessos
{
    [DebuggerStepThrough]
    [Table("usuarios", Schema = "public")]
    public class Usuario
    {
        public Usuario()
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
        public long? IdEmpresa { get; set; } = default!;

        [DataType(DataType.Text)]
        [MaxLength(15, ErrorMessage = "tamanho máximo 15 caracteres")]
        [Required(ErrorMessage = "obrigatório informar a propriedade: documento", AllowEmptyStrings = false)]
        [Column("documento", Order = 3, TypeName = "varchar(15)")]
        public string Documento { get; set; } = default!;

        [DataType(DataType.Text)]
        [MaxLength(150, ErrorMessage = "tamanho máximo 150 caracteres")]
        [Required(ErrorMessage = "obrigatório informar a propriedade: descricao", AllowEmptyStrings = false)]
        [Column("descricao", Order = 4, TypeName = "varchar(150)")]
        public string Descricao { get; set; } = default!;

        [DataType(DataType.EmailAddress)]
        [MaxLength(150, ErrorMessage = "tamanho máximo 150 caracteres")]
        [Required(ErrorMessage = "obrigatório informar a propriedade: email", AllowEmptyStrings = false)]
        [Column("email", Order = 5, TypeName = "varchar(150)")]
        public string Email { get; set; } = default!;

        [DataType(DataType.Text)]
        [MaxLength(150, ErrorMessage = "tamanho máximo 150 caracteres")]
        [Required(ErrorMessage = "obrigatório informar a propriedade: cidade", AllowEmptyStrings = false)]
        [Column("cidade", Order = 6, TypeName = "varchar(150)")]
        public string? Cidade { get; set; } = default!;


        [DataType(DataType.Text)]
        [MaxLength(150, ErrorMessage = "tamanho máximo 150 caracteres")] // Aumentei pois você concatena email aqui na proc
        [Required(ErrorMessage = "obrigatório informar a propriedade: logon", AllowEmptyStrings = false)]
        [Column("logon", Order = 7, TypeName = "varchar(150)")]
        public string Logon { get; set; } = default!;

        [Category("Security")]
        [PasswordPropertyText(true)]
        [DataType(DataType.Password)]
        [MaxLength(15, ErrorMessage = "tamanho máximo 15 caracteres")]
        [Column("senha", Order = 8, TypeName = "varchar(15)")]
        public string? Senha { get; set; } = default!;

        [DataType(DataType.Text)]
        [MaxLength(50, ErrorMessage = "tamanho máximo 50 caracteres")]
        [Column("idclains", Order = 9, TypeName = "varchar(50)")]
        public string? IdClains { get; set; } = default!;

        [DataType(DataType.DateTime)]
        [DisplayFormat(DataFormatString = "{0:dd/MM/yyyy}", ApplyFormatInEditMode = true, ConvertEmptyStringToNull = true)]
        [Required(ErrorMessage = "obrigatório informar a propriedade: dtcriacao", AllowEmptyStrings = false)]
        [Column("dtcriacao", Order = 10, TypeName = "datetime")]
        public DateTime DtCriacao { get; set; } = DateTime.Now;


        [DataType(DataType.Text)]
        [MaxLength(15, ErrorMessage = "tamanho máximo 15 caracteres")] // Aumentei pois você concatena email aqui na proc
        [Required(ErrorMessage = "obrigatório informar a propriedade: logon", AllowEmptyStrings = false)]
        [Column("telefone", Order = 11, TypeName = "varchar(15)")]
        public string Telefone { get; set; } = default!;

        [Required(ErrorMessage = "obrigatório informar a propriedade: status", AllowEmptyStrings = true)]
        [Column("status", Order = 12, TypeName = "tinyint")]
        public int Status { get; set; } = default!;

        [NotMapped]
        [ScaffoldColumn(false)]
        public string Pefil { get; set; } = default!;


        [NotMapped]
        [ScaffoldColumn(false)]
        public long RecordsTotal { get; set; } = default!;


        [NotMapped]
        [ScaffoldColumn(false)]
        public long RecordsFiltered { get; set; } = default!;

    }
}
