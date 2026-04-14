using BarberShop.Dominio.Entidade.Reflection;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Diagnostics;

namespace BarberShop.Dominio.Entidade.Configuracoes
{
    [DebuggerStepThrough]
    [Table("profissionais_horarios", Schema = "public")]
    public class HorarioTrabalho
    {
        public HorarioTrabalho()
        {
            this.SetValuesDefault();
        }

        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Required(ErrorMessage = "obrigatório informar a propriedade: id", AllowEmptyStrings = false)]
        [Column("id", Order = 1, TypeName = "interger")]
        public long ID { get; set; } = default!;

        [Required(ErrorMessage = "obrigatório informar a propriedade: idempresa", AllowEmptyStrings = true)]
        [Column("idempresa", Order = 2, TypeName = "interger")]
        public long IdEmpresa { get; set; } = default!;

        [Required(ErrorMessage = "obrigatório informar a propriedade: idprofissional", AllowEmptyStrings = false)]
        [Column("idprofissional", Order = 3, TypeName = "interger")]
        public long IdProfissional { get; set; } = default!;

        [Required(ErrorMessage = "obrigatório informar a propriedade: diasemana", AllowEmptyStrings = false)]
        [Column("dia_semana", Order = 3, TypeName = "interger")]
        public int DiaSemana { get; set; } = default!;

        [DataType(DataType.Time)]
        [Required(ErrorMessage = "obrigatório informar a propriedade: hora_inicio", AllowEmptyStrings = false)]
        [Column("hora_inicio", Order = 7, TypeName = "time without time zone")]
        public TimeSpan HoraInicio { get; set; } = default!;

        [DataType(DataType.Time)]
        [Required(ErrorMessage = "obrigatório informar a propriedade: hora_fim", AllowEmptyStrings = false)]
        [Column("hora_fim", Order = 7, TypeName = "time without time zone")]
        public TimeSpan HoraFim { get; set; } = default!;

        [Required(ErrorMessage = "obrigatório informar a propriedade: duracaominutos", AllowEmptyStrings = false)]
        [Column("duracao_minutos", Order = 3, TypeName = "interger")]
        public int DuracaoMinutos { get; set; } = default!;

        [DataType(DataType.DateTime)]
        [DisplayFormat(DataFormatString = "{0:dd/MM/yyyy}", ApplyFormatInEditMode = true, ConvertEmptyStringToNull = true)]
        [Required(ErrorMessage = "obrigatório informar a propriedade: dtcriacao", AllowEmptyStrings = false)]
        [Column("dtcriacao", Order = 7, TypeName = "timestamp without time zone")]
        public DateTime DtCriacao { get; set; } = default!;

        [Required(ErrorMessage = "obrigatório informar a propriedade: status", AllowEmptyStrings = true)]
        [Column("status", Order = 8, TypeName = "integer")]
        public int Status { get; set; } = default!;

        [NotMapped]
        [ScaffoldColumn(false)]
        public string? NomeProfissional { get; set; } = default!;

        [NotMapped]
        [ScaffoldColumn(false)]
        public long RecordsTotal { get; set; } = default!;

        [NotMapped]
        [ScaffoldColumn(false)]
        public long RecordsFiltered { get; set; } = default!;
    }
}
