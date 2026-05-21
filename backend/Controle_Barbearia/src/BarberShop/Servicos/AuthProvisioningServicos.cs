using BarberShop.Dominio.Entidade.Acessos;
using BarberShop.Dominio.Interfaces.Repositorios.Acessos;
using BarberShop.Dominio.Interfaces.Repositorios.Plataforma;
using BarberShop.Dominio.Interfaces.Servicos.Acessos;
using BarberShop.Infraestrutura.Pagamentos;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using static BarberShop.Dominio.Enuns.IGroupPolicies;

namespace BarberShop.Servicos
{
    public class AuthProvisioningServicos : IAuthProvisioningServicos
    {
        private readonly UserManager<IdentityUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly IUsuarioServicos _usuarioServicos;
        private readonly IContaClienteRepositorio _contaClienteRepositorio;
        private readonly IPlataformaAssinaturaRepositorio _assinaturaRepositorio;
        private readonly PlataformaBillingSettings _plataformaBilling;

        public AuthProvisioningServicos(
            UserManager<IdentityUser> userManager,
            RoleManager<IdentityRole> roleManager,
            IUsuarioServicos usuarioServicos,
            IContaClienteRepositorio contaClienteRepositorio,
            IPlataformaAssinaturaRepositorio assinaturaRepositorio,
            IOptions<PlataformaBillingSettings> plataformaBilling)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _usuarioServicos = usuarioServicos;
            _contaClienteRepositorio = contaClienteRepositorio;
            _assinaturaRepositorio = assinaturaRepositorio;
            _plataformaBilling = plataformaBilling.Value;
        }

        public async Task<AuthProvisioningResult> ProvisionAsync(AuthProvisioningRequest request, CancellationToken cancellationToken = default)
        {
            var tipo = NormalizarTipo(request.TipoCadastro);
            var user = await _userManager.FindByEmailAsync(request.Email).ConfigureAwait(false);
            var isNew = user == null;

            if (user == null)
            {
                if (string.IsNullOrWhiteSpace(tipo))
                    return new AuthProvisioningResult { RequiresTipoCadastro = true };

                user = new IdentityUser
                {
                    UserName = request.Email,
                    Email = request.Email,
                    EmailConfirmed = true
                };

                IdentityResult createResult;
                if (!string.IsNullOrEmpty(request.Password))
                    createResult = await _userManager.CreateAsync(user, request.Password).ConfigureAwait(false);
                else
                    createResult = await _userManager.CreateAsync(user).ConfigureAwait(false);

                if (!createResult.Succeeded)
                    throw new InvalidOperationException(string.Join("; ", createResult.Errors.Select(e => e.Description)));

                if (!string.IsNullOrEmpty(request.GoogleSub))
                {
                    var loginInfo = new UserLoginInfo("Google", request.GoogleSub, "Google");
                    await _userManager.AddLoginAsync(user, loginInfo).ConfigureAwait(false);
                }

                await AtribuirRoleAsync(user, tipo).ConfigureAwait(false);
                await CriarRegistroNegocioAsync(user, request, tipo).ConfigureAwait(false);
            }
            else if (!string.IsNullOrEmpty(request.GoogleSub))
            {
                var logins = await _userManager.GetLoginsAsync(user).ConfigureAwait(false);
                if (!logins.Any(l => l.LoginProvider == "Google" && l.ProviderKey == request.GoogleSub))
                    await _userManager.AddLoginAsync(user, new UserLoginInfo("Google", request.GoogleSub, "Google")).ConfigureAwait(false);
            }

            return new AuthProvisioningResult
            {
                UserId = user.Id,
                Email = user.Email ?? request.Email,
                IsNewUser = isNew,
                RequiresTipoCadastro = false
            };
        }

        private static string NormalizarTipo(string? tipo)
        {
            if (string.IsNullOrWhiteSpace(tipo)) return "";
            var t = tipo.Trim();
            if (t.Equals("Cliente", StringComparison.OrdinalIgnoreCase)) return nameof(UserRoles.Cliente);
            if (t.Equals("Barbearia", StringComparison.OrdinalIgnoreCase)) return nameof(UserRoles.Profissional);
            return t;
        }

        private async Task AtribuirRoleAsync(IdentityUser user, string tipoRole)
        {
            var role = await _roleManager.FindByNameAsync(tipoRole).ConfigureAwait(false);
            if (role == null)
                throw new InvalidOperationException($"Perfil {tipoRole} não encontrado.");

            if (!await _userManager.IsInRoleAsync(user, role.Name!).ConfigureAwait(false))
                await _userManager.AddToRoleAsync(user, role.Name!).ConfigureAwait(false);
        }

        private async Task CriarRegistroNegocioAsync(IdentityUser user, AuthProvisioningRequest request, string tipoRole)
        {
            if (tipoRole == nameof(UserRoles.Cliente))
            {
                var nome = string.IsNullOrWhiteSpace(request.Nome) ? request.Email.Split('@')[0] : request.Nome.Trim();
                var telefone = string.IsNullOrWhiteSpace(request.Telefone) ? "" : request.Telefone.Trim();

                var conta = new ContaCliente
                {
                    IdClains = user.Id,
                    Email = request.Email,
                    Nome = nome,
                    Telefone = telefone,
                    Status = 1
                };

                var idConta = await _contaClienteRepositorio.CriarOuAtualizarAsync(conta).ConfigureAwait(false);
                await _contaClienteRepositorio.VincularClientesPorTelefoneOuEmailAsync(idConta, telefone, request.Email).ConfigureAwait(false);
                return;
            }

            var usuarioNegocio = new Usuario
            {
                ID = 0,
                Status = 1,
                Cidade = "Não informada",
                Descricao = string.IsNullOrWhiteSpace(request.Nome) ? "Proprietário" : request.Nome.Trim(),
                Documento = "00000000000",
                DtCriacao = DateTime.Now,
                Email = request.Email,
                Logon = request.Email,
                Telefone = string.IsNullOrWhiteSpace(request.Telefone) ? "00000000000" : request.Telefone.Trim(),
                IdEmpresa = 1,
                IdClains = user.Id,
                Senha = request.Password
            };

            await _usuarioServicos.AlterarUsuarios(usuarioNegocio).ConfigureAwait(false);

            await _assinaturaRepositorio.CriarAssinaturaInicialAsync(
                1,
                _plataformaBilling.TrialDias > 0 ? _plataformaBilling.TrialDias : 14,
                _plataformaBilling.MensalidadeCentavos > 0 ? _plataformaBilling.MensalidadeCentavos : 9900
            ).ConfigureAwait(false);
        }
    }
}
