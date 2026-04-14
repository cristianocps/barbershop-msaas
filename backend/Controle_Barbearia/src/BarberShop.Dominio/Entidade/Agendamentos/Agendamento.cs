using BarberShop.Dominio.Entidade.Reflection;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Diagnostics;

namespace BarberShop.Dominio.Entidade.Agendamentos
{
    [DebuggerStepThrough]
    [Table("agendamentos", Schema = "public")]
    public class Agendamento
    {
        public Agendamento()
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

        [Required(ErrorMessage = "obrigatório informar a propriedade: idprofissional", AllowEmptyStrings = true)]
        [Column("idprofissional", Order = 3, TypeName = "bigint")]
        public long IdProfissional { get; set; } = default!;

        [Required(ErrorMessage = "obrigatório informar a propriedade: idusuario", AllowEmptyStrings = true)]
        [Column("idusuario", Order = 4, TypeName = "bigint")]
        public long IdUsuario { get; set; } = default!;

        [Required(ErrorMessage = "obrigatório informar a propriedade: idcliente", AllowEmptyStrings = true)]
        [Column("idcliente", Order = 5, TypeName = "bigint")]
        public long IdCliente { get; set; } = default!;

        [DataType(DataType.Text)]
        [MaxLength(150, ErrorMessage = "tamanho máximo 150 caracteres")]
        [Required(ErrorMessage = "obrigatório informar a propriedade: descricao", AllowEmptyStrings = false)]
        [Column("descricao", Order = 6, TypeName = "varchar(150)")]
        public string Descricao { get; set; } = default!;

        [DataType(DataType.DateTime)]
        [DisplayFormat(DataFormatString = "{0:dd/MM/yyyy HH:mm}", ApplyFormatInEditMode = true, ConvertEmptyStringToNull = true)]
        [Required(ErrorMessage = "obrigatório informar a propriedade: dtagendamento", AllowEmptyStrings = false)]
        [Column("dtagendamento", Order = 7, TypeName = "timestamp with time zone")]
        public DateTime DtAgendamento { get; set; } = default!;

        [DataType(DataType.DateTime)]
        [DisplayFormat(DataFormatString = "{0:dd/MM/yyyy}", ApplyFormatInEditMode = true, ConvertEmptyStringToNull = true)]
        [Required(ErrorMessage = "obrigatório informar a propriedade: dtcriacao", AllowEmptyStrings = false)]
        [Column("dtcriacao", Order = 8, TypeName = "timestamp with time zone")]
        public DateTime DtCriacao { get; set; } = DateTime.Now;

        [DataType(DataType.Text)]
        [MaxLength(15, ErrorMessage = "tamanho máximo 15 caracteres")]
        [Required(ErrorMessage = "obrigatório informar a propriedade: telefone", AllowEmptyStrings = false)]
        [Column("telefone", Order = 9, TypeName = "varchar(15)")]
        public string Telefone { get; set; } = default!;

        [DataType(DataType.Text)]
        [Column("observacao", Order = 10, TypeName = "text")]
        public string? Observacao { get; set; }

        [Required(ErrorMessage = "obrigatório informar a propriedade: status", AllowEmptyStrings = true)]
        [Column("status", Order = 11, TypeName = "integer")]
        public int Status { get; set; } = default!;

        [NotMapped]
        [ScaffoldColumn(false)]
        public long RecordsTotal { get; set; } = default!;

        [NotMapped]
        [ScaffoldColumn(false)]
        public long RecordsFiltered { get; set; } = default!;

        [NotMapped]
        [ScaffoldColumn(false)]
        public decimal ValorTotal { get; set; } = default!;

        [NotMapped]
        [ScaffoldColumn(false)]
        public string NomeProfissional { get; set; } = string.Empty;

        [NotMapped]
        [ScaffoldColumn(false)]
        public IEnumerable<AgendamentoItem> Itens { get; set; } = new List<AgendamentoItem>();
    }
}