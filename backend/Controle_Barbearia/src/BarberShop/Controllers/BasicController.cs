using BarberShop.Dominio.Entidade.DTOs;
using BarberShop.Dominio.Interfaces.Base;
using BarberShop.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Npgsql;
using System.Collections.Generic;
using System.Globalization;
using System.Security.Claims;
using System.Security.Principal;
using System.Text.Json;
using static BarberShop.Dominio.Enuns.IGroupPolicies;
using static BarberShop.Dominio.Enuns.IResponseController;

namespace BarberShop.Controllers
{

    [Authorize]
    public abstract class BasicController : Controller
    {
        public TransferenciaIdentidadeDTO Identidade { get; private set; }
        public bool IsAuthorized { get; private set; }

        public IWebHostEnvironment Environment { get; set; } = default!;
        public IHttpContextAccessor Context { get; set; } = default!;
        public IConfiguration? Configuration { get; set; } = default!;
        public SignInManager<IdentityUser>? SignInManager { get; set; } = default!;
        public UserManager<IdentityUser>? UserManager { get; set; } = default!;
        public RoleManager<IdentityRole>? RoleManager { get; set; } = default!;
        public IPrincipal? Principal { get; set; }
        public IUser? UserIdentity { get; set; }
        public IStoreRoles? StoreRoles { get; set; }
        public Policy NivelAcessoPermitido { get; private set; }

        [NonAction]
        public async Task<JsonResult> ResponseJson(ResponseJsonTypes type, string? mensagem = "", object? data = null, long? recordsTotal = 0)
        {
            var _padrao = type == 0 && string.IsNullOrEmpty(mensagem) ? "Operação realizada com sucesso" : mensagem;
            var _return = new ResponseMethodJson
            {
                JsonTypes = type.ToString().ToLower(culture: CultureInfo.CurrentCulture),
                Mensagem = _padrao ?? "Verifique a mensagem para exibição ao usuário final!!! ERR: 0001",
                Data = data,
                RecordsTotal = recordsTotal
            };
            var _response = Task.FromResult(Json(_return, new JsonSerializerOptions() { PropertyNameCaseInsensitive = true })).ConfigureAwait(false);
            return await _response;
        }

        public BasicController([FromServices] IWebHostEnvironment environment, Policy policy, IHttpContextAccessor context, IConfiguration? configuration,
            SignInManager<IdentityUser> signInManager, UserManager<IdentityUser> userManager, RoleManager<IdentityRole> roleManager, IPrincipal principal, IUser? user, IStoreRoles storeRoles)
        {
            var _rota = "";

            try
            {
                IsAuthorized = false;
                Environment = environment;
                Context = context;
                Configuration = configuration;
                SignInManager = signInManager;
                UserManager = userManager;
                RoleManager = roleManager;
                UserIdentity = user;
                StoreRoles = storeRoles;
                Principal = principal;
                Thread.CurrentPrincipal = principal;

                var cultureInfo = new CultureInfo("pt-BR");
                CultureInfo.DefaultThreadCurrentCulture = cultureInfo;
                CultureInfo.DefaultThreadCurrentUICulture = cultureInfo;

                _rota = context?.HttpContext?.Request?.Path.ToString() ?? "";

                long idUsuarioLogado = default!;
                long idEmpresaLogado = default!;
                long idUsuarioIdentity = default!;

                var httpContextUser = Context.HttpContext?.User;

                // 2. Pegar o E-mail do usuário logado
                var emailUsuario = httpContextUser?.Identity?.Name
                                   ?? httpContextUser?.FindFirst(ClaimTypes.Email)?.Value;
                if (!string.IsNullOrWhiteSpace(emailUsuario) && Configuration != null)
                {
                    var connectionString = Configuration.GetConnectionString("DefaultConnection");
                    using (var connection = new NpgsqlConnection(connectionString))
                    {
                        connection.Open();

                        var _query = "SELECT ret_id, ret_idempresa FROM fn_obter_credenciais(@Email)";

                        using (var command = new NpgsqlCommand(_query, connection))
                        {
                            command.Parameters.AddWithValue("Email", emailUsuario);
                            using (var reader = command.ExecuteReader())
                            {
                                if (reader.Read()) { idUsuarioLogado = reader.GetInt64(0); idEmpresaLogado = reader.GetInt64(1);}
                            }
                        }
                    }
                }

                var _credential = Context.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!string.IsNullOrWhiteSpace(_credential)) long.TryParse(_credential, out idUsuarioIdentity);

                IsAuthorized = storeRoles.IsInPolicy(policy);

                Identidade = Context.HttpContext?.RequestServices.GetRequiredService<TransferenciaIdentidadeDTO>()
                             ?? new TransferenciaIdentidadeDTO();

                Identidade.IdUsuarioLogado = idUsuarioLogado;
                Identidade.IdEmpresaLogado = idEmpresaLogado;
                Identidade.IsAuthorized = IsAuthorized;
                Identidade.RotaController = _rota;
            }
            catch
            {

                Identidade = Context.HttpContext?.RequestServices.GetRequiredService<TransferenciaIdentidadeDTO>()
                             ?? new TransferenciaIdentidadeDTO();

                Identidade.IdEmpresaLogado = 0;
                Identidade.NmUsuarioLogado = "";
                Identidade.IsAuthorized = false;
                Identidade.RotaController = _rota;
            }
        }
    }
}
