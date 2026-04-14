namespace CRM_Vendas.AbstractFactory
{
    public class ValidadorFormulario
    {
        public string Regra { get; set; } = default!;
        public string Mensagem { get; set; } = default!;
        public string Condicao { get; set; } = default!;
    }
}
