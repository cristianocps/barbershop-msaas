namespace BarberShop.Dominio.Entidade.DTOs
{
    public class ClienteBuscaDTO
    {
        public long ID { get; set; }
        public string Descricao { get; set; } = string.Empty;
        public string? Telefone { get; set; }
        public string? Cpf { get; set; }
        public string Label { get; set; } = string.Empty;
    }
}
