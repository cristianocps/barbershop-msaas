namespace BarberShop.Dominio.Interfaces.Servicos.Acessos
{
    public class AuthProvisioningRequest
    {
        public string Email { get; set; } = string.Empty;
        public string? Password { get; set; }
        public string TipoCadastro { get; set; } = "Barbearia";
        public string? Nome { get; set; }
        public string? Telefone { get; set; }
        public string? GoogleSub { get; set; }
    }

    public class AuthProvisioningResult
    {
        public string UserId { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public bool IsNewUser { get; set; }
        public bool RequiresTipoCadastro { get; set; }
    }

    public interface IAuthProvisioningServicos
    {
        Task<AuthProvisioningResult> ProvisionAsync(AuthProvisioningRequest request, CancellationToken cancellationToken = default);
    }
}
