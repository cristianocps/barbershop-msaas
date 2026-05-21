using BarberShop.Dominio.Entidade.Reflection;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BarberShop.Dominio.Entidade.Configuracoes
{
    [DebuggerStepThrough]
    [Table("empresas", Schema = "public")]
    public class Empresa
    {
        public Empresa()
        {
            this.SetValuesDefault();
        }


        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Required(ErrorMessage = "obrigatório informar a propriedade: id", AllowEmptyStrings = false)]
        [Column("id", Order = 1, TypeName = "bigint")]
        public long ID { get; set; } = default!;

        [Required(ErrorMessage = "obrigatório informar a propriedade: idusario", AllowEmptyStrings = false)]
        [Column("idusario", Order = 2, TypeName = "bigint")]
        public long IdUsuario { get; set; } = default!;

        [DataType(DataType.Text)]
        [MaxLength(150, ErrorMessage = "tamanho máximo 150 caracteres")]
        [Required(ErrorMessage = "obrigatório informar a propriedade: descricao", AllowEmptyStrings = false)]
        [Column("descricao", Order = 3, TypeName = "varchar(150)")]
        public string Descricao { get; set; } = default!;

        [DataType(DataType.Text)]
        [MaxLength(150, ErrorMessage = "tamanho máximo 150 caracteres")]
        [Required(ErrorMessage = "obrigatório informar a propriedade: cidade", AllowEmptyStrings = false)]
        [Column("cidade", Order = 4, TypeName = "varchar(150)")]
        public string? Cidade { get; set; } = default!;

        [DataType(DataType.DateTime)]
        [DisplayFormat(DataFormatString = "{0:dd/MM/yyyy}", ApplyFormatInEditMode = true, ConvertEmptyStringToNull = true)]
        [Required(ErrorMessage = "obrigatório informar a propriedade: dtcriacao", AllowEmptyStrings = false)]
        [Column("dtcriacao", Order = 5, TypeName = "datetime")]
        public DateTime DtCriacao { get; set; } = DateTime.Now;

        [DataType(DataType.Text)]
        [MaxLength(15, ErrorMessage = "tamanho máximo 15 caracteres")]
        [Required(ErrorMessage = "obrigatório informar a propriedade: logon", AllowEmptyStrings = false)]
        [Column("telefone", Order = 6, TypeName = "varchar(15)")]
        public string Telefone { get; set; } = default!;

        [DataType(DataType.Text)]
        [MaxLength(60, ErrorMessage = "tamanho máximo 60 caracteres")]
        [Required(ErrorMessage = "obrigatório informar a propriedade: endereco", AllowEmptyStrings = false)]
        [Column("endereco", Order = 7, TypeName = "varchar(60)")]
        public string Endereco { get; set; } = default!;

        [DataType(DataType.Text)]      
        //[Required(ErrorMessage = "obrigatório informar a propriedade: logo_data", AllowEmptyStrings = false)]
        [Column("logo_data", Order = 8, TypeName = "text")]
        public string? LogoData { get; set; } = default!;

        [Required(ErrorMessage = "obrigatório informar a propriedade: status", AllowEmptyStrings = true)]
        [Column("status", Order = 9, TypeName = "tinyint")]
        public int Status { get; set; } = default!;

        [DataType(DataType.Text)]
        [MaxLength(100, ErrorMessage = "tamanho máximo 100 caracteres")]
        [Column("slug", Order = 10, TypeName = "varchar(100)")]
        public string? Slug { get; set; }

        [MaxLength(100)]
        [Column("infinitepay_handle", TypeName = "varchar(100)")]
        public string? InfinitepayHandle { get; set; }

        [MaxLength(255)]
        [Column("infinitepay_webhook_secret", TypeName = "varchar(255)")]
        public string? InfinitepayWebhookSecret { get; set; }

        [Column("onboarding_completo", TypeName = "boolean")]
        public bool OnboardingCompleto { get; set; }

        [Column("onboarding_etapas", TypeName = "jsonb")]
        public string? OnboardingEtapas { get; set; }

        [NotMapped]
        [ScaffoldColumn(false)]
        public long RecordsTotal { get; set; } = default!;


        [NotMapped]
        [ScaffoldColumn(false)]
        public long RecordsFiltered { get; set; } = default!;
    }
}
