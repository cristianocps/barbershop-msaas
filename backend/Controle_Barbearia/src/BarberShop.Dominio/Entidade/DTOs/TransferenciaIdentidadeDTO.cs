namespace BarberShop.Dominio.Entidade.DTOs
{
    public class TransferenciaIdentidadeDTO
    {

        public long? IdUsuarioLogado { get; set; } = default!;
        public long? IdEmpresaLogado { get; set; } = default!;
        public string NmUsuarioLogado { get; set; } = default!;
        public bool IsAuthorized { get; set; } = default!;
        public string RotaController { get; set; } = default!;
    }
}
