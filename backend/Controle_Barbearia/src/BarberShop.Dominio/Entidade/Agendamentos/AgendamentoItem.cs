using BarberShop.Dominio.Entidade.Reflection;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Diagnostics;

namespace BarberShop.Dominio.Entidade.Agendamentos
{
    [DebuggerStepThrough]
    [Table("agendamento_itens", Schema = "public")]
    public class AgendamentoItem
    {
        public AgendamentoItem()
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

        [Required(ErrorMessage = "obrigatório informar a propriedade: idagendamento", AllowEmptyStrings = true)]
        [Column("idagendamento", Order = 4, TypeName = "bigint")]
        public long IdAgendamento { get; set; } = default!;

        [Required(ErrorMessage = "obrigatório informar a propriedade: idservico", AllowEmptyStrings = true)]
        [Column("idservico", Order = 5, TypeName = "bigint")]
        public long IdServico { get; set; } = default!;

        [Required(ErrorMessage = "obrigatório informar a propriedade: valor_cobrado", AllowEmptyStrings = true)]
        [Column("valor_cobrado", Order = 6, TypeName = "numeric(10,2)")]
        public decimal ValorCobrado { get; set; } = default!;

        [Required(ErrorMessage = "obrigatório informar a propriedade: status", AllowEmptyStrings = true)]
        [Column("status", Order = 7, TypeName = "integer")]
        public int Status { get; set; } = default!;

        [NotMapped]
        [ScaffoldColumn(false)]
        public int DuracaoMinutos { get; set; }

        [NotMapped]
        [ScaffoldColumn(false)]
        public long RecordsTotal { get; set; } = default!;

        [NotMapped]
        [ScaffoldColumn(false)]
        public long RecordsFiltered { get; set; } = default!;
    }
}