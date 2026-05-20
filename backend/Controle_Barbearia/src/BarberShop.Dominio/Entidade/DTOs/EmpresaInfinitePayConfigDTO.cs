namespace BarberShop.Dominio.Entidade.DTOs
{
    public class EmpresaInfinitePayConfigDTO
    {
        public long IdEmpresa { get; set; }
        public string DescricaoEmpresa { get; set; } = "";
        public string Handle { get; set; } = "";
        public string WebhookSecret { get; set; } = "";
    }

    public class SalvarEmpresaInfinitePayConfigDTO
    {
        public string Handle { get; set; } = "";
    }
}
